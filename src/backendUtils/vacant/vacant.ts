import { stat } from "fs/promises"
import { resolve } from "path"
import { DateTime } from "luxon"
import { generateEmptyClassrooms } from "@/backendUtils/vacant/generate"

declare global {
    var _vacantLastRun: DateTime | undefined
    var _vacantRunning: Promise<void> | undefined
}

const ZONE = "Asia/Kolkata"

function todayCutoff() {
    return DateTime.now().setZone(ZONE).set({
        hour: 1,
        minute: 0,
        second: 0,
        millisecond: 0
    })
}

async function jsonExists(path: string) {
    try {
        await stat(path)
        return true
    } catch {
        return false
    }
}

export async function ensureVacantFresh() {
    const now = DateTime.now().setZone(ZONE)
    const cutoff = todayCutoff()
    const path = resolve("src/jsons/empty_classrooms.json")

    if (!(await jsonExists(path))) {
        await generateEmptyClassrooms()
        global._vacantLastRun = DateTime.now().setZone(ZONE)
        return
    }

    if (now < cutoff) return

    if (global._vacantLastRun && global._vacantLastRun >= cutoff) return

    if (global._vacantRunning) {
        await global._vacantRunning
        return
    }

    global._vacantRunning = (async () => {
        try {
            const file = await stat(path)
            const fileTime = DateTime.fromJSDate(file.mtime).setZone(ZONE)
            if (fileTime >= cutoff) {
                global._vacantLastRun = fileTime
                return
            }

            await generateEmptyClassrooms()
            global._vacantLastRun = DateTime.now().setZone(ZONE)
        } finally {
            global._vacantRunning = undefined
        }
    })()

    await global._vacantRunning
}