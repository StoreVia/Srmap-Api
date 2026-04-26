import "dotenv/config";
import crypto from "node:crypto";
import http from "node:http";
import jwt from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";

const port = Number(process.env.PORT || 8080);
const accessSecret = "uS7z0oxYv7mZdf7iFzGdk1fElAcMPZFV5Lh-MJrRSKc=";

if (!accessSecret) {
  throw new Error("Missing ACCESS_SECRET");
}

const waitingQueue = [];
const activeChats = new Map();
const users = new Map();
const skippedMap = new Map();

const server = http.createServer((req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        waiting: waitingQueue.length,
        activeConnections: users.size,
        activeChats: activeChats.size / 2,
      }),
    );
    return;
  }

  if (req.url === "/admin/queue") {
    const queueDetails = waitingQueue
      .map((userId) => {
        const user = users.get(userId);
        if (!user) return null;
        return { userId, username: user.username };
      })
      .filter(Boolean);

    const activeDetails = [];
    const seen = new Set();
    for (const [userId, partnerId] of activeChats.entries()) {
      if (seen.has(userId)) continue;
      seen.add(userId);
      seen.add(partnerId);
      const user = users.get(userId);
      const partner = users.get(partnerId);
      if (user && partner) {
        activeDetails.push({
          user1: { userId, username: user.username },
          user2: { userId: partnerId, username: partner.username },
        });
      }
    }

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, queue: queueDetails, activeChats: activeDetails }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: false, message: "Not found" }));
});

const wss = new WebSocketServer({ server, path: "/ws" });

const send = (ws, message) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  try {
    ws.send(JSON.stringify(message));
  } catch {}
};

const removeFromQueue = (userId) => {
  const index = waitingQueue.indexOf(userId);
  if (index !== -1) waitingQueue.splice(index, 1);
};

const getNextWaitingUser = (excludeId) => {
  const skippedByExclude = skippedMap.get(excludeId);
  const requeued = new Set();

  while (waitingQueue.length > 0) {
    const candidateId = waitingQueue.shift();

    if (!candidateId || candidateId === excludeId) continue;

    const candidate = users.get(candidateId);
    if (!candidate || candidate.ws.readyState !== WebSocket.OPEN) continue;
    if (activeChats.has(candidateId)) continue;

    const skippedByCandidate = skippedMap.get(candidateId);
    const mutuallySkipped =
      (skippedByExclude && skippedByExclude.has(candidateId)) ||
      (skippedByCandidate && skippedByCandidate.has(excludeId));

    if (mutuallySkipped) {
      if (requeued.has(candidateId)) {
        waitingQueue.unshift(candidateId);
        break;
      }
      requeued.add(candidateId);
      waitingQueue.push(candidateId);
      continue;
    }

    return candidateId;
  }

  return null;
};

const sendQueuePosition = (userId) => {
  const user = users.get(userId);
  if (!user) return;
  const position = waitingQueue.indexOf(userId);
  if (position === -1) return;
  send(user.ws, { type: "waiting", payload: { position: position + 1 } });
};

const notifyQueuePositions = () => {
  waitingQueue.forEach((userId) => sendQueuePosition(userId));
};

const broadcastQueueToAdmins = () => {
  const queueDetails = waitingQueue
    .map((userId) => {
      const user = users.get(userId);
      if (!user) return null;
      return { userId, username: user.username };
    })
    .filter(Boolean);

  const activeDetails = [];
  const seen = new Set();
  for (const [userId, partnerId] of activeChats.entries()) {
    if (seen.has(userId)) continue;
    seen.add(userId);
    seen.add(partnerId);
    const user = users.get(userId);
    const partner = users.get(partnerId);
    if (user && partner) {
      activeDetails.push({
        user1: { userId, username: user.username },
        user2: { userId: partnerId, username: partner.username },
      });
    }
  }

  for (const [, user] of users.entries()) {
    if (!user.isAdmin) continue;
    send(user.ws, { type: "admin_queue_update", payload: { queue: queueDetails, activeChats: activeDetails } });
  }
};

const matchOrQueueUser = (userId) => {
  removeFromQueue(userId);
  const user = users.get(userId);
  if (!user) return;

  const partnerId = getNextWaitingUser(userId);

  if (partnerId) {
    const partner = users.get(partnerId);
    if (!partner) {
      send(user.ws, { type: "error", payload: { message: "Partner became unavailable" } });
      return;
    }

    activeChats.set(userId, partnerId);
    activeChats.set(partnerId, userId);

    skippedMap.delete(userId);
    skippedMap.delete(partnerId);

    send(user.ws, { type: "matched", payload: { partnerId, initiator: true } });
    send(partner.ws, { type: "matched", payload: { partnerId: userId, initiator: false } });
    notifyQueuePositions();
    broadcastQueueToAdmins();
    return;
  }

  waitingQueue.push(userId);
  sendQueuePosition(userId);
  notifyQueuePositions();
  broadcastQueueToAdmins();
};

const detachPartner = (userId, reason = "partner_disconnected") => {
  const partnerId = activeChats.get(userId);
  if (!partnerId) return null;

  activeChats.delete(userId);
  activeChats.delete(partnerId);

  const partner = users.get(partnerId);
  if (partner) {
    send(partner.ws, { type: reason });
  }

  return partnerId;
};

const cleanupUser = (userId) => {
  if (!userId) return;
  removeFromQueue(userId);
  detachPartner(userId, "partner_disconnected");
  skippedMap.delete(userId);
  users.delete(userId);
  notifyQueuePositions();
  broadcastQueueToAdmins();
};

const authenticateToken = (token) => {
  const payload = jwt.verify(token, accessSecret);
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid token payload");
  }
  if (!payload.username) {
    throw new Error("Token is missing username");
  }
  return payload;
};

wss.on("connection", (ws) => {
  const connectionId = crypto.randomUUID();
  let authenticated = false;

  const authTimeout = setTimeout(() => {
    if (!authenticated) {
      send(ws, { type: "error", payload: { message: "Authentication timeout" } });
      ws.close(4001, "Authentication timeout");
    }
  }, 10000);

  ws.on("message", (rawData) => {
    let message;
    try {
      message = JSON.parse(rawData.toString());
    } catch {
      send(ws, { type: "error", payload: { message: "Invalid JSON payload" } });
      return;
    }

    if (!authenticated) {
      if (message.type !== "auth" || !message.payload?.token) {
        send(ws, { type: "error", payload: { message: "Authenticate first" } });
        return;
      }

      try {
        const payload = authenticateToken(message.payload.token);
        authenticated = true;
        clearTimeout(authTimeout);

        const isAdmin = payload.admin === true;

        for (const [existingId, existingUser] of users.entries()) {
          if (existingUser.username === payload.username && existingId !== connectionId) {
            removeFromQueue(existingId);
            detachPartner(existingId, "partner_disconnected");
            skippedMap.delete(existingId);
            try { existingUser.ws.close(4000, "Replaced by new connection"); } catch {}
            users.delete(existingId);
            break;
          }
        }

        users.set(connectionId, {
          id: connectionId,
          username: payload.username,
          isAdmin,
          exp: typeof payload.exp === "number" ? payload.exp : null,
          ws,
        });

        send(ws, {
          type: "auth_success",
          payload: { userId: connectionId, username: payload.username, isAdmin },
        });

        if (isAdmin) {
          broadcastQueueToAdmins();
        }
      } catch (error) {
        send(ws, {
          type: "error",
          payload: { message: error instanceof Error ? error.message : "Unauthorized" },
        });
        ws.close(4003, "Unauthorized");
      }

      return;
    }

    const currentUser = users.get(connectionId);
    if (!currentUser) {
      send(ws, { type: "error", payload: { message: "User session not found" } });
      return;
    }

    if (message.type === "admin_connect_user" && currentUser.isAdmin) {
      const targetUserId = message.payload?.targetUserId;
      if (!targetUserId) {
        send(ws, { type: "error", payload: { message: "Missing targetUserId" } });
        return;
      }

      const targetUser = users.get(targetUserId);
      if (!targetUser) {
        send(ws, { type: "error", payload: { message: "Target user not found" } });
        return;
      }

      if (activeChats.has(connectionId)) {
        const oldPartnerId = activeChats.get(connectionId);
        activeChats.delete(connectionId);
        activeChats.delete(oldPartnerId);
        const oldPartner = users.get(oldPartnerId);
        if (oldPartner) send(oldPartner.ws, { type: "partner_disconnected" });
      }

      if (activeChats.has(targetUserId)) {
        const oldPartnerId = activeChats.get(targetUserId);
        activeChats.delete(targetUserId);
        activeChats.delete(oldPartnerId);
        const oldPartner = users.get(oldPartnerId);
        if (oldPartner) send(oldPartner.ws, { type: "partner_disconnected" });
      }

      removeFromQueue(connectionId);
      removeFromQueue(targetUserId);

      activeChats.set(connectionId, targetUserId);
      activeChats.set(targetUserId, connectionId);

      send(ws, { type: "matched", payload: { partnerId: targetUserId, initiator: true } });
      send(targetUser.ws, { type: "matched", payload: { partnerId: connectionId, initiator: false } });

      notifyQueuePositions();
      broadcastQueueToAdmins();
      return;
    }

    if (message.type === "find_partner") {
      if (activeChats.has(connectionId)) {
        send(ws, { type: "error", payload: { message: "You are already in a chat" } });
        return;
      }
      if (waitingQueue.includes(connectionId)) {
        sendQueuePosition(connectionId);
        return;
      }
      matchOrQueueUser(connectionId);
      return;
    }

    if (message.type === "message") {
      const partnerId = activeChats.get(connectionId);
      if (!partnerId) {
        send(ws, { type: "error", payload: { message: "You are not in an active chat" } });
        return;
      }

      const text = typeof message.payload?.text === "string" ? message.payload.text.trim() : "";
      if (!text) {
        send(ws, { type: "error", payload: { message: "Message cannot be empty" } });
        return;
      }

      if (text.length > 1000) {
        send(ws, { type: "error", payload: { message: "Message is too long" } });
        return;
      }

      const partner = users.get(partnerId);
      if (!partner) {
        detachPartner(connectionId, "partner_disconnected");
        send(ws, { type: "partner_disconnected" });
        return;
      }

      send(partner.ws, {
        type: "message",
        payload: {
          id: crypto.randomUUID(),
          text,
          sender: "partner",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    if (message.type === "next") {
      removeFromQueue(connectionId);
      const partnerId = activeChats.get(connectionId);

      if (partnerId) {
        if (!skippedMap.has(connectionId)) skippedMap.set(connectionId, new Set());
        skippedMap.get(connectionId).add(partnerId);

        activeChats.delete(connectionId);
        activeChats.delete(partnerId);

        const partner = users.get(partnerId);
        if (partner) send(partner.ws, { type: "partner_disconnected" });
      }

      matchOrQueueUser(connectionId);
      broadcastQueueToAdmins();
      return;
    }

    if (message.type === "stop") {
      removeFromQueue(connectionId);
      const partnerId = activeChats.get(connectionId);

      if (partnerId) {
        activeChats.delete(connectionId);
        activeChats.delete(partnerId);
        const partner = users.get(partnerId);
        if (partner) send(partner.ws, { type: "partner_disconnected" });
      }

      send(ws, { type: "stopped" });
      broadcastQueueToAdmins();
      return;
    }

    if (message.type === "signal") {
      const partnerId = activeChats.get(connectionId);
      if (!partnerId) {
        send(ws, { type: "error", payload: { message: "No active chat available for signaling" } });
        return;
      }

      const partner = users.get(partnerId);
      if (!partner) {
        send(ws, { type: "partner_disconnected" });
        return;
      }

      send(partner.ws, { type: "signal", payload: message.payload });
      return;
    }

    send(ws, { type: "error", payload: { message: "Unsupported event type" } });
  });

  ws.on("close", () => {
    clearTimeout(authTimeout);
    cleanupUser(connectionId);
  });

  ws.on("error", () => {
    clearTimeout(authTimeout);
    cleanupUser(connectionId);
  });
});

setInterval(() => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  for (const [userId, user] of users.entries()) {
    if (!user.exp || user.exp > nowInSeconds) continue;
    send(user.ws, { type: "error", payload: { message: "Token expired" } });
    user.ws.close(4004, "Token expired");
    cleanupUser(userId);
  }
}, 60000);

setInterval(() => {
  for (const [userId, user] of users.entries()) {
    if (user.ws.readyState === WebSocket.CLOSED || user.ws.readyState === WebSocket.CLOSING) {
      cleanupUser(userId);
    }
  }
  for (let i = waitingQueue.length - 1; i >= 0; i--) {
    const uid = waitingQueue[i];
    const u = users.get(uid);
    if (!u || u.ws.readyState !== WebSocket.OPEN) {
      waitingQueue.splice(i, 1);
    }
  }
}, 15000);

server.listen(port, "0.0.0.0", () => {
  console.log(`Omegle realtime server listening on port ${port}`);
});