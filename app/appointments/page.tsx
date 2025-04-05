"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, Users, GraduationCap, ArrowRight } from "lucide-react"
import { useState, useMemo } from "react"
import WeeklyCalendar, { Appointment } from "@/components/appointments/WeeklyCalendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Counselor {
    id: string;
    name: string;
}

const counselors: Counselor[] = [
    { id: '1', name: 'Dr. Sarah Chen' },
    { id: '2', name: 'Mr. David Tan' },
    { id: '3', name: 'Ms. Rachel Wong' }
];

const initialAppointments: Appointment[] = [
    {
        id: 1,
        title: 'Student Counseling',
        day: new Date(2025, 2, 4),
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 0,
        counselorId: '1',
        counselorName: 'Dr. Sarah Chen',
        type: 'Academic Counselling',
        notes: 'Discuss university application strategy'
    },
    {
        id: 2,
        title: 'Career Planning',
        day: new Date(2025, 2, 4),
        startHour: 11,
        startMinute: 30,
        endHour: 12,
        endMinute: 30,
        counselorId: '2',
        counselorName: 'Mr. David Tan',
        type: 'Career Guidance',
        notes: 'Resume review and interview preparation'
    },
    {
        id: 3,
        title: 'Personal Development',
        day: new Date(),
        startHour: 11,
        startMinute: 0,
        endHour: 13,
        endMinute: 0,
        counselorId: '3',
        counselorName: 'Ms. Rachel Wong',
        type: 'Personal Development',
        notes: 'Long session spanning multiple time slots'
    },
    {
        id: 4,
        title: 'Academic Planning',
        day: new Date(),
        startHour: 9,
        startMinute: 0,
        endHour: 11,
        endMinute: 0,
        counselorId: '1',
        counselorName: 'Dr. Sarah Chen',
        type: 'Academic Counselling',
        notes: 'Another multi-slot event'
    }
];

export default function AppointmentsPage() {
    const [allAppointments, setAllAppointments] = useState<Appointment[]>(initialAppointments);
    const [selectedCounselorId, setSelectedCounselorId] = useState<string | null>(null);

    const filteredAppointments = useMemo(() => {
        if (!selectedCounselorId) {
            return [];
        }
        return allAppointments.filter(appt => appt.counselorId === selectedCounselorId);
    }, [allAppointments, selectedCounselorId]);

    const handleSaveAppointment = (newAppointment: Appointment) => {
        setAllAppointments(prev => [...prev, { ...newAppointment, id: Math.max(0, ...prev.map(a => a.id)) + 1 }]);
    };

    const handleDeleteAppointment = (id: number) => {
        setAllAppointments(prev => prev.filter(appt => appt.id !== id));
    };

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
                                <h2 className="text-3xl font-bold">{counselors.length}</h2>
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
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                        <h2 className="text-2xl font-semibold">Book an Appointment</h2>
                        <div className="grid gap-2 w-full sm:w-64">
                            <Label htmlFor="counselor-select">Select Counselor</Label>
                            <Select
                                value={selectedCounselorId ?? ""}
                                onValueChange={(value) => setSelectedCounselorId(value || null)}
                            >
                                <SelectTrigger id="counselor-select">
                                    <SelectValue placeholder="Select a counselor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {counselors.map(counselor => (
                                        <SelectItem key={counselor.id} value={counselor.id}>
                                            {counselor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-6">
                        {!selectedCounselorId ? (
                           <p className="text-orange-600">Please select a counselor to view their available slots and book an appointment.</p>
                        ) : (
                           <p>Click and drag on the calendar to create a new appointment for {counselors.find(c => c.id === selectedCounselorId)?.name}. Click on existing appointments to view details.</p>
                        )}
                    </div>
                    <div className="h-[700px]">
                         <WeeklyCalendar
                            selectedCounselorId={selectedCounselorId}
                            appointments={filteredAppointments}
                            counselors={counselors}
                            onSaveAppointment={handleSaveAppointment}
                            onDeleteAppointment={handleDeleteAppointment}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}