import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { resolve } from "path"
import { PARAMETERS } from "@/fullStackUtils/utils/messages"
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions"
import ROOM_TYPES from "./maps/roomTypes"
import { ensureVacantFresh } from "@/backendUtils/vacant/vacant"

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req)
  if (auth instanceof NextResponse) return auth

  await ensureVacantFresh()

  try {
    const filePath = resolve("src/jsons/empty_classrooms.json")
    const raw = await readFile(filePath, "utf-8")
    const vacantData = JSON.parse(raw)

    const { searchParams } = new URL(req.url)
    const block = searchParams.get("block")
    const day = searchParams.get("day")
    const slot = searchParams.get("slot")

    if (!block || !day || !slot) {
      return errorResponse(PARAMETERS)
    }

    const blockData = vacantData[block]
    if (!blockData) {
      return NextResponse.json({ success: false, error: "Block Not Found!" }, { status: 404 })
    }

    const dayData = blockData[day]
    if (!dayData) {
      return NextResponse.json({ success: false, error: "Day Not Found!" }, { status: 404 })
    }

    const slotData = dayData[slot]
    if (!slotData) {
      return NextResponse.json({ success: false, error: "Slot Not Found!" }, { status: 404 })
    }

    const enriched = Object.fromEntries(
      Object.entries(slotData).map(([floor, rooms]: any) => [
        floor,
        rooms.map((room: string) => ({
          room,
          type: ROOM_TYPES[room] || "unknown"
        }))
      ])
    )

    return NextResponse.json({
      success: true,
      data: enriched
    })
  } catch (err) {
    console.error("Error From /api/vacant:", err)
    return errorResponse(undefined, {}, 500)
  }
}