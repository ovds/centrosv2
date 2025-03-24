"use client"

import { motion } from "framer-motion"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function AppointmentsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Book an Appointment</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>Choose your preferred appointment date</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
              <CardDescription>Select a convenient time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Counsellor</label>
                <Select>
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
                <label className="text-sm font-medium">Time Slot</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">9:00 AM</SelectItem>
                    <SelectItem value="2">10:00 AM</SelectItem>
                    <SelectItem value="3">11:00 AM</SelectItem>
                    <SelectItem value="4">2:00 PM</SelectItem>
                    <SelectItem value="5">3:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Type</label>
                <Select>
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
              
              <Button className="w-full mt-6">Book Appointment</Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}