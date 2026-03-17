import { DateTime } from "luxon";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const initDb = await useMongo();
    const db = initDb.db("college_db");

    const usersDb = db.collection("users1");
    const blockedDb = db.collection("blocked");
    const notificationsDb = db.collection("notifications");
    const settingsDb = db.collection("settings");

    const feedbackCountDoc = await settingsDb.findOne({ id: "feedback" });
    const appSettingsDoc = await settingsDb.findOne({ id: "app-settings" });

    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const formattedDate = nowIST.toFormat("yyyy-MM-dd");
    const startOfDay = nowIST.startOf("day").toJSDate();
    const endOfDay = nowIST.endOf("day").toJSDate();

    const todayCount = await usersDb.countDocuments({
      session_time: { $gte: formattedDate }
    });

    const todayRegisteredCount = await usersDb.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const totalCount = await usersDb.countDocuments();

    const blockedUsers = await blockedDb.find({}).sort({ blockedAt: -1 }).toArray();
    const notifications = await notificationsDb.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      counts: {
        today: todayCount,
        total: totalCount,
        todayRegistered: todayRegisteredCount,
        feedback: feedbackCountDoc?.count ?? 0
      },
      settings: {
        feedbackEnabled: appSettingsDoc?.feedback ?? false
      },
      blockedUsers,
      notifications
    });
  } catch (err) {
    console.log("Error From /api/admin/details:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}