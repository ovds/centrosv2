"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import WeeklyCalendar from "@/components/appointments/WeeklyCalendar"

export default function AppointmentsPage() {
  const [selectedCounselor, setSelectedCounselor] = useState("")
  const [selectedSessionType, setSelectedSessionType] = useState("")

  return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8">Book an Appointment</h1>

          <div className="grid gap-6 md:grid-cols-[300px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Options</CardTitle>
                <CardDescription>Choose your preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Counsellor</label>
                  <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a counsellor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Dr. Sarah Chen</SelectItem>
                      <SelectItem value="2">Mr. David Tan</SelectItem>
                      <SelectItem value="3">Ms. Rachel Wong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Type</label>
                  <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic Counselling</SelectItem>
                      <SelectItem value="career">Career Guidance</SelectItem>
                      <SelectItem value="personal">Personal Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full mt-6">Book Selected Time Slot</Button>
              </CardContent>
            </Card>

            <div className="h-[700px]">
              <WeeklyCalendar />
            </div>
          </div>
        </motion.div>
      </div>
  )
}