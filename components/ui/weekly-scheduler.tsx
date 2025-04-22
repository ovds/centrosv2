import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface TimeSlot {
  start: string
  end: string
  available: boolean
}

interface DaySchedule {
  enabled: boolean
  slots: TimeSlot[]
}

export type WeeklySchedule = {
  Monday: DaySchedule
  Tuesday: DaySchedule
  Wednesday: DaySchedule
  Thursday: DaySchedule
  Friday: DaySchedule
  Saturday: DaySchedule
  Sunday: DaySchedule
}

interface WeeklySchedulerProps {
  value: WeeklySchedule
  onChange: (schedule: WeeklySchedule) => void
}

const DEFAULT_SCHEDULE: WeeklySchedule = {
  Monday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Friday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Saturday: { enabled: false, slots: [{ start: "09:00", end: "13:00", available: true }] },
  Sunday: { enabled: false, slots: [] }
}

// Generate time options in 30 min intervals
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, "0")
  const minute = i % 2 === 0 ? "00" : "30"
  return `${hour}:${minute}`
})

export function WeeklyScheduler({ value = DEFAULT_SCHEDULE, onChange }: WeeklySchedulerProps) {
  // Initialize with default schedule if value is empty
  const schedule = React.useMemo(() => {
    if (Object.keys(value).length === 0) {
      return DEFAULT_SCHEDULE
    }
    return value
  }, [value])
  
  const handleDayToggle = (day: keyof WeeklySchedule) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: !schedule[day].enabled
      }
    }
    onChange(newSchedule)
  }
  
  const handleAddTimeSlot = (day: keyof WeeklySchedule) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: [
          ...schedule[day].slots,
          { start: "09:00", end: "17:00", available: true }
        ]
      }
    }
    onChange(newSchedule)
  }
  
  const handleRemoveTimeSlot = (day: keyof WeeklySchedule, index: number) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: schedule[day].slots.filter((_, i) => i !== index)
      }
    }
    onChange(newSchedule)
  }
  
  const handleTimeChange = (
    day: keyof WeeklySchedule,
    index: number,
    field: keyof TimeSlot,
    value: string | boolean
  ) => {
    const newSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: schedule[day].slots.map((slot, i) => {
          if (i === index) {
            return { ...slot, [field]: value }
          }
          return slot
        })
      }
    }
    onChange(newSchedule)
  }
  
  return (
    <div className="space-y-4">
      {(Object.keys(schedule) as Array<keyof WeeklySchedule>).map((day) => (
        <Card key={day}>
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">{day}</CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor={`${day}-toggle`}>Enable</Label>
              <Switch
                id={`${day}-toggle`}
                checked={schedule[day].enabled}
                onCheckedChange={() => handleDayToggle(day)}
              />
            </div>
          </CardHeader>
          {schedule[day].enabled && (
            <CardContent className="p-4 pt-0">
              {schedule[day].slots.length === 0 ? (
                <div className="text-center py-2 text-muted-foreground">
                  No time slots added
                </div>
              ) : (
                schedule[day].slots.map((slot, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-2 mb-2"
                  >
                    <Select
                      value={slot.start}
                      onValueChange={(value) => handleTimeChange(day, index, "start", value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>to</span>
                    <Select
                      value={slot.end}
                      onValueChange={(value) => handleTimeChange(day, index, "end", value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="End" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveTimeSlot(day, index)}
                    >
                      ×
                    </Button>
                  </div>
                ))
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => handleAddTimeSlot(day)}
              >
                Add Time Slot
              </Button>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}