"use client"
import React, { useEffect, useState } from "react"
import API from "@/components/client/api/AxiosClient"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { DoorClosed } from "lucide-react"

type RoomItem = { room: string; type: string }
type VacantResult = Record<string, RoomItem[]>

const BLOCKS = ["C"]
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const SLOTS = ["09:00-09:50", "10:00-10:50", "11:00-11:50", "12:00-12:50", "01:00-01:50", "02:00-02:50", "03:00-03:50", "04:00-04:50"]

export default function VacantPage() {
  const [block, setBlock] = useState("C")
  const [day, setDay] = useState("Monday")
  const [slot, setSlot] = useState(SLOTS[0])
  const [data, setData] = useState<VacantResult>({})
  const [activeFloor, setActiveFloor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    API.get(`/vacant?block=${block}&day=${day}&slot=${slot}`)
      .then(res => {
        if (res.data.success) {
          const newData: VacantResult = res.data.data
          const floors = Object.keys(newData)
          setData(newData)
          setActiveFloor(prev => (prev && floors.includes(prev) ? prev : floors[0] ?? null))
        } else {
          setData({})
          setActiveFloor(null)
        }
      })
      .catch(() => {
        setError("Unable to fetch vacant classrooms")
        setData({})
        setActiveFloor(null)
      })
      .finally(() => setLoading(false))
  }, [block, day, slot])

  const floors = Object.keys(data)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={block} onValueChange={setBlock}>
          <SelectTrigger><SelectValue placeholder="Select Block" /></SelectTrigger>
          <SelectContent><SelectGroup>{BLOCKS.map(b => <SelectItem key={b} value={b}>{b} Block</SelectItem>)}</SelectGroup></SelectContent>
        </Select>

        <Select value={day} onValueChange={setDay}>
          <SelectTrigger><SelectValue placeholder="Select Day" /></SelectTrigger>
          <SelectContent><SelectGroup>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>

        <Select value={slot} onValueChange={setSlot}>
          <SelectTrigger><SelectValue placeholder="Select Slot" /></SelectTrigger>
          <SelectContent><SelectGroup>{SLOTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : floors.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg text-gray-500">
          <DoorClosed className="h-10 w-10 mb-2 opacity-50" />
          <p>No empty classrooms found</p>
        </div>
      ) : (
        <Tabs value={activeFloor ?? undefined} onValueChange={setActiveFloor}>
          <TabsList className="mb-4 w-full flex overflow-x-auto no-scrollbar justify-start md:justify-center px-1">
            {floors.map(floor => (
              <TabsTrigger key={floor} value={floor} className="flex-shrink-0 min-w-[72px] md:min-w-[96px]">
                {floor} Floor
              </TabsTrigger>
            ))}
          </TabsList>

          {floors.map(floor => (
            <TabsContent key={floor} value={floor}>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {data[floor]?.map(item => (
                    <Card key={item.room} className="text-center hover:shadow-md transition">
                      <CardHeader>
                        <CardTitle>{block} {item.room}</CardTitle>
                        <CardDescription className="capitalize">{item.type}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Card className="border-red-300 bg-red-50/60 dark:bg-red-900/20">
        <CardContent className="py-3 text-sm text-red-800 dark:text-red-300">
          This feature relies on the availability and volume of collected timetables. therefore, 100% accuracy cannot be guaranteed.
        </CardContent>
      </Card>
    </div>
  )
}