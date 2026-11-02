import { isIP } from "node:net";
import { useMongo } from "@/lib/database/useMongo";

type CaptchaSettings = {
  _id: "settings";
  enabled: boolean;
  updatedAt?: Date;
  updatedBy?: string;
};

type CaptchaIpRecord = {
  _id: string;
  ip: string;
  requests: number;
  deniedRequests: number;
  blocked: boolean;
  blockedAt?: Date;
  blockedBy?: string;
  firstRequestedAt: Date;
  lastRequestedAt: Date;
};

type CaptchaDocument = {
  _id: string;
  enabled?: boolean;
  updatedAt?: Date;
  updatedBy?: string;
  ip?: string;
  requests?: number;
  deniedRequests?: number;
  blocked?: boolean;
  blockedAt?: Date;
  blockedBy?: string;
  firstRequestedAt?: Date;
  lastRequestedAt?: Date;
};

async function getCollection() {
  return (await useMongo()).db("college_db").collection<CaptchaDocument>("acptcha");
}

async function getSettings() {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: "settings" },
    { $setOnInsert: { enabled: true } },
    { upsert: true },
  );
  const settings = await collection.findOne({ _id: "settings" });
  return { _id: "settings", enabled: settings?.enabled !== false } as CaptchaSettings;
}

export function getCaptchaClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = realIp || forwardedIp || "";
  return isIP(candidate) ? candidate : "unknown";
}

export async function recordCaptchaRequest(ip: string) {
  const collection = await getCollection();
  const settings = await getSettings();
  const existing = await collection.findOne({ _id: ip });
  const denied = !settings.enabled || Boolean(existing?.blocked);
  const now = new Date();
  const increment: Record<string, number> = { requests: 1 };
  if (denied) increment.deniedRequests = 1;
  await collection.updateOne(
    { _id: ip },
    {
      $inc: increment,
      $set: { ip, lastRequestedAt: now },
      $setOnInsert: { firstRequestedAt: now, blocked: false },
    },
    { upsert: true },
  );
  return { enabled: settings.enabled, blocked: Boolean(existing?.blocked) };
}

export async function getCaptchaAdminData() {
  const collection = await getCollection();
  const settings = await getSettings();
  const [summary] = await collection
    .aggregate<{ requests: number; deniedRequests: number; uniqueIps: number }>([
      { $match: { _id: { $ne: "settings" } } },
      {
        $group: {
          _id: null,
          requests: { $sum: "$requests" },
          deniedRequests: { $sum: "$deniedRequests" },
          uniqueIps: { $sum: 1 },
        },
      },
    ])
    .toArray();
  const ips = (await collection
    .find({ _id: { $ne: "settings" } })
    .sort({ lastRequestedAt: -1 })
    .limit(200)
    .toArray()) as CaptchaDocument[] as CaptchaIpRecord[];
  return {
    enabled: settings.enabled,
    requests: summary?.requests ?? 0,
    deniedRequests: summary?.deniedRequests ?? 0,
    uniqueIps: summary?.uniqueIps ?? 0,
    ips: ips.map(({ _id, ...record }) => ({
      ip: record.ip ?? _id,
      requests: record.requests ?? 0,
      deniedRequests: record.deniedRequests ?? 0,
      blocked: record.blocked ?? false,
      blockedAt: record.blockedAt,
      blockedBy: record.blockedBy,
      firstRequestedAt: record.firstRequestedAt ?? record.lastRequestedAt ?? new Date(0),
      lastRequestedAt: record.lastRequestedAt ?? record.firstRequestedAt ?? new Date(0),
    })),
  };
}

export async function setCaptchaEnabled(enabled: boolean, admin: string) {
  const collection = await getCollection();
  const now = new Date();
  await collection.updateOne(
    { _id: "settings" },
    { $set: { enabled, updatedAt: now, updatedBy: admin } },
    { upsert: true },
  );
  return { enabled };
}

export async function setCaptchaIpBlocked(ip: string, blocked: boolean, admin: string) {
  if (!isIP(ip)) return false;
  const collection = await getCollection();
  const now = new Date();
  await collection.updateOne(
    { _id: ip },
    {
      $set: blocked
        ? { ip, blocked: true, blockedAt: now, blockedBy: admin }
        : { ip, blocked: false },
      $setOnInsert: { requests: 0, deniedRequests: 0, firstRequestedAt: now, lastRequestedAt: now },
      ...(blocked ? {} : { $unset: { blockedAt: "", blockedBy: "" } }),
    },
    { upsert: true },
  );
  return true;
}
