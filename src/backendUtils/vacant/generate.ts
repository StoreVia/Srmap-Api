import { MongoClient } from "mongodb"
import re2 from "re2"
import { writeFile, mkdir } from "fs/promises"
import { dirname, resolve } from "path"

export async function generateEmptyClassrooms() {
    const start = Date.now()
    console.log("🟡 [Vacant] Generation started")

    const uri = process.env.MONGO_URI!
    const client = new MongoClient(uri)

    const SLOTS = [
        "09:00-09:50", "10:00-10:50", "11:00-11:50", "12:00-12:50",
        "01:00-01:50", "02:00-02:50", "03:00-03:50", "04:00-04:50"
    ]

    const BLOCK_ROOMS = {
        C: {
            2: ["201", "202", "203", "204", "205", "206", "207", "208", "209", "211", "212"],
            3: ["301", "302", "303", "304", "305", "306", "307", "308", "309", "311", "312"],
            4: ["401", "402", "403", "404", "405", "406", "407", "408", "409", "411", "412"],
            5: ["501", "502", "503", "504", "505", "506", "507", "508", "509", "510", "511", "512"],
            6: ["601", "602", "603", "606", "607", "608", "609", "610"],
            7: ["702", "703", "704", "705", "706", "707"],
            8: ["801", "802", "803", "805", "806", "807", "808", "809"],
            9: ["901", "902", "903", "904", "905", "906", "907", "908", "909", "910", "911", "912"],
            10: ["1002", "1003", "1004", "1005", "1006", "1007", "1008", "1009", "1010", "1011", "1012"]
        }
    }

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const roomRegex = /\(\s*([A-Z])\s*(\d+)\s*\)/

    try {
        console.log("🟡 [Vacant] Connecting to MongoDB")
        await client.connect()

        const db = client.db("college_db")
        const collection = db.collection("empty_classes")

        const timetables = await collection
            .find({}, { projection: { "data.timetable": 1 } })
            .toArray()

        console.log(`🟢 [Vacant] Read ${timetables.length} timetable documents`)

        const occupied: any = {}

        for (const doc of timetables) {
            const timetable = doc.data?.timetable
            if (!Array.isArray(timetable)) continue
            for (const day of timetable) {
                for (let slot = 0; slot < day.subjects.length; slot++) {
                    const subject = day.subjects[slot]
                    if (!subject) continue
                    const match = subject.match(roomRegex)
                    if (!match) continue
                    const block = match[1]
                    const room = match[2]
                    occupied[block] ??= {}
                    occupied[block][day.day] ??= {}
                    occupied[block][day.day][slot] ??= new Set()
                    occupied[block][day.day][slot].add(room)
                }
            }
        }

        console.log("🟢 [Vacant] Timetable parsing completed")

        const result: any = {}

        Object.entries(BLOCK_ROOMS).forEach(([block, floors]: any) => {
            result[block] = {}
            DAYS.forEach(day => {
                result[block][day] = {}
                SLOTS.forEach((slotTime, slotIndex) => {
                    const slotData: any = {}
                    Object.entries(floors).forEach(([floor, rooms]: any) => {
                        slotData[`${floor}th`] = rooms.filter(
                            (room: string) => !occupied[block]?.[day]?.[slotIndex]?.has(room)
                        )
                    })
                    result[block][day][slotTime] = slotData
                })
            })
        })

        console.log("🟢 [Vacant] Empty classroom matrix generated")

        const out = resolve("src/jsons/empty_classrooms.json")
        await mkdir(dirname(out), { recursive: true })
        await writeFile(out, JSON.stringify(result, null, 2))

        console.log(`🟢 [Vacant] File written to ${out}`)
    } catch (err) {
        console.error("🔴 [Vacant] Generation failed", err)
        throw err
    } finally {
        await client.close()
        const duration = ((Date.now() - start) / 1000).toFixed(2)
        console.log(`✅ [Vacant] Generation finished in ${duration}s`)
    }
}