"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, Users, GraduationCap, ArrowRight } from "lucide-react"
import { useState } from "react"
import WeeklyCalendar from "@/components/appointments/WeeklyCalendar"

export default function AppointmentsPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <h1 className="text-4xl font-bold mb-4 md:mb-0">Appointments</h1>
                    <Button>
                        View My Appointments <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <Card>
                        <CardContent className="flex items-center py-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                <CalendarClock className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Available Slots</p>
                                <h2 className="text-3xl font-bold">24</h2>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center py-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Available Counselors</p>
                                <h2 className="text-3xl font-bold">5</h2>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center py-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Your Appointments</p>
                                <h2 className="text-3xl font-bold">3</h2>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-card rounded-lg border shadow-sm p-4 md:p-6"
                >
                    <h2 className="text-2xl font-semibold mb-6">Book an Appointment</h2>
                    <div className="text-sm text-muted-foreground mb-6">
                        <p>Click and drag on the calendar to create a new appointment. Click on existing appointments to view details.</p>
                    </div>
                    <div className="h-[700px]">
                        <WeeklyCalendar />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}