"use client";
import { jwtDecode } from "jwt-decode";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Camera, CameraOff, LoaderCircle, Mic, MicOff, Send, Square, SkipForward, Unplug, ShieldCheck, Users, RefreshCw } from "lucide-react";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type SignalPayload = {
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

type ChatEvent =
  | { type: "auth"; payload: { token: string } }
  | { type: "find_partner" }
  | { type: "next" }
  | { type: "stop" }
  | { type: "message"; payload: { text: string } }
  | { type: "signal"; payload: SignalPayload }
  | { type: "admin_connect_user"; payload: { targetUserId: string } };

type QueueUser = { userId: string; username: string };
type ActiveChatPair = {
  user1: QueueUser;
  user2: QueueUser;
};

type ServerEvent =
  | { type: "auth_success"; payload: { userId: string; username: string; isAdmin: boolean } }
  | { type: "waiting"; payload: { position: number } }
  | { type: "matched"; payload: { partnerId: string; initiator: boolean } }
  | { type: "message"; payload: { id: string; text: string; sender: "partner"; timestamp: string } }
  | { type: "partner_disconnected" }
  | { type: "stopped" }
  | { type: "signal"; payload: SignalPayload }
  | { type: "admin_queue_update"; payload: { queue: QueueUser[]; activeChats: ActiveChatPair[] } }
  | { type: "error"; payload: { message: string } };

type MessageItem = {
  id: string;
  sender: "self" | "partner" | "system";
  text: string;
  timestamp: string;
};

type DecodedToken = {
  username?: string;
  exp?: number;
  admin?: boolean;
};

const wsUrl = "ws://0.0.0.0:8080/ws";

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:free.expressturn.com:3478",
      username: "000000002090072895",
      credential: "CWpMOv/s4q750luzkAFyMKtWrTM=",
    },
    {
      urls: "turn:free.expressturn.com:3478?transport=tcp",
      username: "000000002090072895",
      credential: "CWpMOv/s4q750luzkAFyMKtWrTM=",
    },
    {
      urls: "turns:free.expressturn.com:5349",
      username: "000000002090072895",
      credential: "CWpMOv/s4q750luzkAFyMKtWrTM=",
    },
  ],
};

const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const systemMsg = (text: string): MessageItem => ({
  id: `sys-${uid()}`,
  sender: "system",
  text,
  timestamp: new Date().toISOString(),
});

export default function OmeglePage() {
  const { profile, ready } = useLocalStorageContext();

  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const partnerIdRef = useRef<string | null>(null);
  const autoSearchRef = useRef(false);
  const socketReadyRef = useRef(false);

  const [socketState, setSocketState] = useState<"idle" | "connecting" | "ready" | "closed">("idle");
  const [matchState, setMatchState] = useState<"idle" | "waiting" | "matched">("idle");
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([
    systemMsg("Connecting... auto-search will start shortly."),
  ]);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [localVideoReady, setLocalVideoReady] = useState(false);
  const [remoteVideoReady, setRemoteVideoReady] = useState(false);
  const [userStopped, setUserStopped] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRandomMode, setAdminRandomMode] = useState(false);
  const [adminQueue, setAdminQueue] = useState<QueueUser[]>([]);
  const [adminActiveChats, setAdminActiveChats] = useState<ActiveChatPair[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const token = profile.accessToken;

  const username = useMemo(() => {
    if (!token) return "";
    try {
      return jwtDecode<DecodedToken>(token).username ?? "";
    } catch {
      return "";
    }
  }, [token]);

  const tokenExpired = useMemo(() => {
    if (!token) return true;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.exp) return false;
      return decoded.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }, [token]);

  const pushMessage = (msg: MessageItem) => setMessages((prev) => [...prev, msg]);

  const sendEvent = (event: ChatEvent) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(event));
    return true;
  };

  const attachLocal = (stream: MediaStream | null) => {
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  };

  const attachRemote = (stream: MediaStream | null) => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
  };

  const cleanupPeer = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    remoteStreamRef.current = null;
    attachRemote(null);
    setRemoteVideoReady(false);
  };

  const ensureLocalStream = async () => {
    if (localStreamRef.current) {
      attachLocal(localStreamRef.current);
      return localStreamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      stream.getVideoTracks().forEach((t) => { t.enabled = cameraEnabled; });
      stream.getAudioTracks().forEach((t) => { t.enabled = micEnabled; });
      localStreamRef.current = stream;
      attachLocal(stream);
      setLocalVideoReady(true);
      setMediaError("");
      return stream;
    } catch {
      setMediaError("Camera or mic access blocked — text chat still works.");
      return null;
    }
  };

  const createPeerConnection = async (nextPartnerId: string, initiator: boolean) => {
    cleanupPeer();
    partnerIdRef.current = nextPartnerId;

    const pc = new RTCPeerConnection(rtcConfig);
    const remoteStream = new MediaStream();
    peerConnectionRef.current = pc;
    remoteStreamRef.current = remoteStream;
    attachRemote(remoteStream);

    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
      setRemoteVideoReady(true);
    };

    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      sendEvent({ type: "signal", payload: { candidate: e.candidate.toJSON() } });
    };

    const local = await ensureLocalStream();
    local?.getTracks().forEach((t) => pc.addTrack(t, local));

    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendEvent({ type: "signal", payload: { description: offer } });
    }
  };

  const handleSignal = async (payload: SignalPayload) => {
    const pid = partnerIdRef.current;
    if (!pid) return;
    if (!peerConnectionRef.current) await createPeerConnection(pid, false);
    const pc = peerConnectionRef.current;
    if (!pc) return;
    if (payload.description) {
      await pc.setRemoteDescription(new RTCSessionDescription(payload.description));
      if (payload.description.type === "offer") {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendEvent({ type: "signal", payload: { description: answer } });
      }
    }
    if (payload.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
    }
  };

  const resetChat = () => {
    partnerIdRef.current = null;
    cleanupPeer();
  };

  const triggerSearch = async () => {
    await ensureLocalStream();
    sendEvent({ type: "find_partner" });
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    attachLocal(localStreamRef.current);
  }, []);

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      cleanupPeer();
    };
  }, []);

  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = cameraEnabled; });
  }, [cameraEnabled]);

  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = micEnabled; });
  }, [micEnabled]);

  useEffect(() => {
    if (!ready) return;
    if (!token || tokenExpired) {
      setError("Login token is missing or expired — please log in again.");
      return;
    }

    setError("");
    setSocketState("connecting");

    let destroyed = false;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      if (destroyed) return;
      ws.send(JSON.stringify({ type: "auth", payload: { token } } satisfies ChatEvent));
    };

    ws.onmessage = async (e) => {
      if (destroyed) return;
      try {
        const data = JSON.parse(e.data) as ServerEvent;

        if (data.type === "auth_success") {
          setSocketState("ready");
          socketReadyRef.current = true;
          setIsAdmin(data.payload.isAdmin);

          if (!userStopped && !data.payload.isAdmin) {
            autoSearchRef.current = true;
            setMessages([systemMsg("Auto-searching for a stranger...")]);
            await triggerSearch();
          } else if (data.payload.isAdmin) {
            setMessages([systemMsg("Admin mode active. Use the admin panel to connect to users, or enable random mode.")]);
          }
          return;
        }

        if (data.type === "admin_queue_update") {
          setAdminQueue(data.payload.queue);
          setAdminActiveChats(data.payload.activeChats);
          return;
        }

        if (data.type === "waiting") {
          resetChat();
          setMatchState("waiting");
          setQueuePosition(data.payload.position);
          setMessages((prev) => {
            const txt = `Searching for a stranger... Queue position: ${data.payload.position}.`;
            const last = prev[prev.length - 1];
            if (last?.text.startsWith("Searching")) return [...prev.slice(0, -1), systemMsg(txt)];
            return [...prev, systemMsg(txt)];
          });
          return;
        }

        if (data.type === "matched") {
          setMatchState("matched");
          setQueuePosition(null);
          partnerIdRef.current = data.payload.partnerId;
          pushMessage(systemMsg("You're connected — say hello!"));
          await createPeerConnection(data.payload.partnerId, data.payload.initiator);
          return;
        }

        if (data.type === "message") {
          pushMessage({ id: data.payload.id, sender: "partner", text: data.payload.text, timestamp: data.payload.timestamp });
          return;
        }

        if (data.type === "signal") { await handleSignal(data.payload); return; }

        if (data.type === "stopped") {
          setMatchState("idle");
          setQueuePosition(null);
          autoSearchRef.current = false;
          resetChat();
          return;
        }

        if (data.type === "partner_disconnected") {
          setMatchState("idle");
          setQueuePosition(null);
          resetChat();
          pushMessage(systemMsg("Stranger disconnected."));
          if (autoSearchRef.current) {
            pushMessage(systemMsg("Auto-searching for next stranger..."));
            await triggerSearch();
          }
          return;
        }

        if (data.type === "error") setError(data.payload.message);
      } catch {
        setError("Received an invalid response from the server.");
      }
    };

    ws.onerror = () => {
      if (destroyed) return;
      setError("Could not reach the chat server.");
    };
    ws.onclose = () => {
      if (destroyed) return;
      setSocketState("closed");
      setMatchState("idle");
      setQueuePosition(null);
      socketReadyRef.current = false;
      resetChat();
    };

    return () => {
      destroyed = true;
      socketRef.current = null;
      ws.close();
    };
  }, [ready, token, tokenExpired]);

  const startMatching = async () => {
    setError("");
    setUserStopped(false);
    autoSearchRef.current = true;
    if (matchState === "waiting") return;
    await triggerSearch();
  };

  const stopMatching = () => {
    setError("");
    setUserStopped(true);
    autoSearchRef.current = false;
    sendEvent({ type: "stop" });
    resetChat();
    setMatchState("idle");
    setQueuePosition(null);
    pushMessage(systemMsg("You stopped the search."));
  };

  const skipPartner = async () => {
    setError("");
    autoSearchRef.current = true;
    sendEvent({ type: "next" });
  };

  const sendMessage = () => {
    const clean = message.trim();
    if (!clean || matchState !== "matched") return;
    if (!sendEvent({ type: "message", payload: { text: clean } })) {
      setError("Message failed — socket disconnected.");
      return;
    }
    pushMessage({ id: `self-${uid()}`, sender: "self", text: clean, timestamp: new Date().toISOString() });
    setMessage("");
  };

  const toggleCamera = async () => {
    if (!localStreamRef.current) await ensureLocalStream();
    setCameraEnabled((v) => !v);
  };

  const toggleMic = async () => {
    if (!localStreamRef.current) await ensureLocalStream();
    setMicEnabled((v) => !v);
  };

  const adminConnectToUser = (targetUserId: string) => {
    sendEvent({ type: "admin_connect_user", payload: { targetUserId } });
    setShowAdminPanel(false);
    pushMessage(systemMsg(`Admin connecting to user...`));
  };

  const isConnected = socketState === "ready";
  const isLive = matchState === "matched";
  const isWaiting = matchState === "waiting";
  const isSearching = isWaiting || (isLive && autoSearchRef.current);

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem-40px)] flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <div className="flex flex-col border-b border-border md:border-b-0 md:border-r md:w-[52%] h-[45vh] md:h-full">
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">SRMAP Omegle</span>
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  socketState === "ready"
                    ? "bg-green-500"
                    : socketState === "connecting"
                    ? "animate-pulse bg-yellow-400"
                    : "bg-red-500"
                }`}
              />
              {isWaiting && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <LoaderCircle className="h-3 w-3 animate-spin" />
                  {queuePosition ? `#${queuePosition}` : "Searching..."}
                </span>
              )}
              {isLive && (
                <Badge className="h-4 bg-green-500/10 px-1.5 text-[10px] font-medium text-green-600 hover:bg-green-500/10">
                  ● Live
                </Badge>
              )}
              {isAdmin && (
                <Badge className="h-4 bg-purple-500/10 px-1.5 text-[10px] font-medium text-purple-600 hover:bg-purple-500/10">
                  <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel((v) => !v)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-purple-600 hover:bg-purple-500/10 transition-colors"
                >
                  <Users className="h-3 w-3" />
                  Panel {adminQueue.length > 0 && `(${adminQueue.length})`}
                </button>
              )}
              <span className="text-xs text-muted-foreground">{username || "Student"}</span>
            </div>
          </div>

          {isAdmin && showAdminPanel && (
            <div className="shrink-0 border-b border-border bg-card overflow-y-auto max-h-64">
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Admin Panel
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAdminRandomMode((v) => {
                          const next = !v;
                          if (!next) {
                            sendEvent({ type: "stop" });
                            resetChat();
                            setMatchState("idle");
                            setQueuePosition(null);
                            autoSearchRef.current = false;
                          }
                          return next;
                        });
                      }}
                      className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        adminRandomMode
                          ? "bg-green-500/10 text-green-600"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                      title={adminRandomMode ? "Switch back to admin-select mode" : "Enable random stranger matching"}
                    >
                      <SkipForward className="h-2.5 w-2.5" />
                      {adminRandomMode ? "Random on" : "Random off"}
                    </button>
                    <button
                      onClick={() => {
                        const ws = socketRef.current;
                        if (ws && ws.readyState === WebSocket.OPEN) {
                          ws.send(JSON.stringify({ type: "auth", payload: { token } }));
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      title="Refresh"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                    Waiting Queue ({adminQueue.length})
                  </p>
                  {adminQueue.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground/50 italic">No users waiting</p>
                  ) : (
                    <div className="space-y-1">
                      {adminQueue.map((u, i) => (
                        <div
                          key={u.userId}
                          className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground/60 w-4">#{i + 1}</span>
                            <span className="text-xs font-medium text-foreground">{u.username}</span>
                            <span className="text-[10px] text-muted-foreground/50 font-mono truncate max-w-[80px]">
                              {u.userId.slice(0, 8)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adminConnectToUser(u.userId)}
                            className="h-6 px-2 text-[10px] text-purple-600 border-purple-200 hover:bg-purple-50"
                          >
                            Connect
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                    Active Chats ({adminActiveChats.length})
                  </p>
                  {adminActiveChats.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground/50 italic">No active chats</p>
                  ) : (
                    <div className="space-y-1">
                      {adminActiveChats.map((pair, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-md bg-green-500/5 border border-green-500/10 px-2.5 py-1.5"
                        >
                          <span className="text-[10px] text-green-600">●</span>
                          <span className="text-xs text-foreground">{pair.user1.username}</span>
                          <span className="text-[10px] text-muted-foreground">↔</span>
                          <span className="text-xs text-foreground">{pair.user2.username}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(error || mediaError) && (
            <div
              className={`flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs ${
                error
                  ? "bg-destructive/10 text-destructive"
                  : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
              }`}
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span className="flex-1 truncate">{error || mediaError}</span>
              {error && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex shrink-0 items-center gap-1 underline underline-offset-2 opacity-70 hover:opacity-100"
                >
                  <Unplug className="h-3 w-3" />
                  Reconnect
                </button>
              )}
            </div>
          )}

          {/* Remote video — stranger */}
          <div className="relative flex-[62%] overflow-hidden bg-zinc-950 min-h-0">
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" />
            <div className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
              Stranger
            </div>
            {!remoteVideoReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
                {isLive ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin text-white/40" />
                    <span className="text-xs text-white/40">Connecting video...</span>
                  </>
                ) : isWaiting ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin text-white/40" />
                    <span className="text-xs text-white/40">Finding a stranger...</span>
                  </>
                ) : (
                  <span className="text-xs text-white/25">Stranger's video will appear here</span>
                )}
              </div>
            )}
          </div>

          {/* Local video — self */}
          <div className="relative flex-[38%] overflow-hidden border-t border-border bg-zinc-900 min-h-0">
            <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-contain" />
            <div className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
              You
            </div>

            {!localVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <span className="text-xs text-white/30">Camera starts when connected</span>
              </div>
            )}
            {!cameraEnabled && localVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <span className="text-xs text-white/50">Camera off</span>
              </div>
            )}

            {/* Camera & Mic controls — large, centered at bottom */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
              {/* Mic toggle */}
              <button
                onClick={toggleMic}
                title={micEnabled ? "Mute microphone" : "Unmute microphone"}
                className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm shadow-lg transition-all active:scale-95 ${
                  micEnabled
                    ? "bg-white/15 text-white hover:bg-white/25"
                    : "bg-red-500/80 text-white hover:bg-red-500"
                }`}
              >
                {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>

              {/* Camera toggle */}
              <button
                onClick={toggleCamera}
                title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm shadow-lg transition-all active:scale-95 ${
                  cameraEnabled
                    ? "bg-white/15 text-white hover:bg-white/25"
                    : "bg-red-500/80 text-white hover:bg-red-500"
                }`}
              >
                {cameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
              </button>
            </div>

            {/* Status indicators top-right */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {!micEnabled && (
                <div className="flex items-center gap-1 rounded-full bg-red-500/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  <MicOff className="h-2.5 w-2.5" />
                  Muted
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col h-[55vh] md:h-full">
          <div className="min-h-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-3">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`flex ${
                      item.sender === "self"
                        ? "justify-end"
                        : item.sender === "system"
                        ? "justify-center"
                        : "justify-start"
                    }`}
                  >
                    {item.sender === "system" ? (
                      <div className="text-center text-[11px] italic text-muted-foreground/60">
                        {item.text}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                          item.sender === "self"
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-muted text-foreground"
                        }`}
                      >
                        <div>{item.text}</div>
                        <div className="mt-0.5 text-[10px] opacity-50">{formatClock(item.timestamp)}</div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </div>

          <div className="shrink-0 space-y-2 border-t border-border bg-card p-3">
            <div className="flex gap-2">
              <Input
                animated={false}
                placeholder={isLive ? "Type a message..." : "Match first to chat"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                disabled={!isLive}
                className="h-9 flex-1 text-base"
              />
              <Button size="icon" className="h-9 w-9 shrink-0" onClick={sendMessage} disabled={!isLive || !message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              {isSearching || isLive ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={stopMatching}
                  disabled={!isConnected}
                  className="h-8 flex-1"
                >
                  <Square className="mr-1.5 h-3.5 w-3.5" />
                  Stop
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={startMatching}
                  disabled={!isConnected || (isAdmin && !adminRandomMode)}
                  className="h-8 flex-1"
                  title={isAdmin && !adminRandomMode ? "Enable random mode in the admin panel" : undefined}
                >
                  {isWaiting ? (
                    <><LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />Searching</>
                  ) : (
                    <>Start Chat</>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={skipPartner}
                disabled={!isConnected || matchState === "idle"}
                className="h-8 flex-1"
              >
                <SkipForward className="mr-1.5 h-3.5 w-3.5" />
                Next
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.location.reload()}
                title="Reconnect"
                className="h-8 w-8 shrink-0 text-muted-foreground"
              >
                <Unplug className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}