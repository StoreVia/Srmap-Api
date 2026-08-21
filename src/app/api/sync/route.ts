import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";

const ALLOWED_SYNC_KEYS = [
  "theme",
  "showSidebar",
  "timeTableViewMode",
  "attendanceSortOption",
  "sidebarTutorialDone",
  "mobileNavigationLayout",
  "startupPage",
] as const;

type SyncedSettingsKey = typeof ALLOWED_SYNC_KEYS[number];

function filterAllowedSettings(rawSettings: Record<string, any>): Partial<Record<SyncedSettingsKey, any>> {
  const filtered: Partial<Record<SyncedSettingsKey, any>> = {};
  if (!rawSettings || typeof rawSettings !== "object") return filtered;

  for (const key of ALLOWED_SYNC_KEYS) {
    if (key in rawSettings && rawSettings[key] !== undefined) {
      filtered[key] = rawSettings[key];
    }
  }
  return filtered;
}

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const username = auth.payload.username;
    const initDb = await useMongo();
    const db = initDb.db("college_db");
    const userCol = db.collection("users");
    const notifCol = db.collection("notifications");

    const existingUser = await userCol.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    const dbSettings = filterAllowedSettings(existingUser?.settings || {});

    const notifications = await notifCol
      .find({}, { projection: { _id: 0, notificationBy: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      notifications,
      settings: dbSettings,
    });
  } catch (err) {
    console.error("Error in GET /api/sync:", err);
    return errorResponse(undefined, {}, 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const username = auth.payload.username;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const incomingSettings = filterAllowedSettings(body.settings || body);

    const initDb = await useMongo();
    const db = initDb.db("college_db");
    const userCol = db.collection("users");
    const notifCol = db.collection("notifications");

    const existingUser = await userCol.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    const currentDbSettings = existingUser?.settings || {};
    const finalSettings = { ...currentDbSettings, ...incomingSettings };

    if (Object.keys(incomingSettings).length > 0) {
      await userCol.updateOne(
        { username: existingUser?.username || username },
        { $set: { settings: finalSettings } },
        { upsert: true }
      );
    }

    const filteredFinal = filterAllowedSettings(finalSettings);

    const notifications = await notifCol
      .find({}, { projection: { _id: 0, notificationBy: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      notifications,
      settings: filteredFinal,
    });
  } catch (err) {
    console.error("Error in POST /api/sync:", err);
    return errorResponse(undefined, {}, 500);
  }
}