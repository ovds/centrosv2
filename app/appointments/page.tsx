"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, Users, GraduationCap, ArrowRight, Loader2 } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import WeeklyCalendar from "@/components/appointments/WeeklyCalendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createClient } from '@supabase/supabase-js'
import { useUser } from "@clerk/nextjs"
import AdminCalendar from "@/components/admin/admin-calendar"
import { useToast } from "@/hooks/use-toast"
import { 
  fetchAllCounsellors, 
  fetchAppointmentsForCounsellor,
  fetchAppointmentsForStudent,
  updateAppointmentStatus,
  createAppointment,
  deleteAppointment
} from "@/lib/db"
import type { Appointment as AppointmentType, Counsellor, UserRole, AppointmentStatus } from "@/types/types"

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Interface for student view appointments
interface StudentAppointment {
    id: string; // Changed from number to string for UUID
    title: string;
    day: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    counselorId: string;
    counselorName: string;
    type: string;
    notes: string;
    status?: AppointmentStatus;
}

// Interface for counsellor view appointments
interface CounsellorAppointment {
    id: string; // Changed from number to string for UUID
    title: string;
    studentName: string;
    studentEmail?: string;
    studentId?: string;
    day: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    counsellorId: string;
    counsellorName: string;
    type: string;
    notes: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    counsellorNotes?: string;
}

export default function AppointmentsPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [counsellors, setCounsellors] = useState<{ id: string; name: string; }[]>([]);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedCounsellorId, setSelectedCounsellorId] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<StudentAppointment[]>([]);
    const [counsellorAppointments, setCounsellorAppointments] = useState<CounsellorAppointment[]>([]);
    const [myAppointmentsCount, setMyAppointmentsCount] = useState(0);

    // Fetch user role and data
    useEffect(() => {
        async function fetchUserData() {
            if (!user?.emailAddresses?.[0]?.emailAddress) return;

            const email = user.emailAddresses[0].emailAddress;
            
            try {
                // Fetch user role from database
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('email', email)
                    .single();

                if (userError) {
                    console.error("Error fetching user:", userError);
                    setIsLoading(false);
                    return;
                }

                setUserRole(userData.role as UserRole);
                
                // Fetch counsellors for dropdown
                const fetchedCounsellors = await fetchAllCounsellors();
                const mappedCounsellors = fetchedCounsellors.map(counsellor => ({
                    id: counsellor.email,
                    name: counsellor.name
                }));
                setCounsellors(mappedCounsellors);

                // Fetch appointments based on user role
                if (userData.role === 'student') {
                    // For students, fetch their appointments
                    const appointmentsData = await fetchAppointmentsForStudent(email);
                    
                    if (appointmentsData) {
                        // Transform appointments for student view
                        const transformedAppointments = appointmentsData.map(appointment => {
                            // Find counsellor details
                            const counsellor = fetchedCounsellors.find(c => c.email === appointment.counsellor_email);
                            
                            // Parse date and time
                            const startDate = new Date(appointment.start_time);
                            const endDate = new Date(appointment.end_time);
                            
                            return {
                                id: appointment.appointment_id, // Using UUID directly
                                title: appointment.title,
                                day: startDate,
                                startHour: startDate.getHours(),
                                startMinute: startDate.getMinutes(),
                                endHour: endDate.getHours(),
                                endMinute: endDate.getMinutes(),
                                counselorId: appointment.counsellor_email,
                                counselorName: counsellor?.name || 'Unknown Counsellor',
                                type: appointment.description || 'General Appointment',
                                notes: appointment.student_notes || '',
                                status: appointment.status
                            };
                        });
                        
                        setAppointments(transformedAppointments);
                        setMyAppointmentsCount(transformedAppointments.length);
                    }
                } else if (userData.role === 'counsellor') {
                    // For counsellors, fetch their appointments
                    const appointmentsData = await fetchAppointmentsForCounsellor(email);
                    
                    // Transform appointments for counsellor view
                    const transformedAppointments = await Promise.all(appointmentsData.map(async (appointment) => {
                        // Get student details
                        const { data: studentData } = await supabase
                            .from('student')
                            .select('name')
                            .eq('email', appointment.student_email)
                            .single();
                        
                        // Parse date and time
                        const startDate = new Date(appointment.start_time);
                        const endDate = new Date(appointment.end_time);
                        
                        return {
                            id: appointment.appointment_id, // Using UUID directly
                            title: appointment.title,
                            studentName: studentData?.name || 'Unknown Student',
                            studentEmail: appointment.student_email,
                            day: startDate,
                            startHour: startDate.getHours(),
                            startMinute: startDate.getMinutes(),
                            endHour: endDate.getHours(),
                            endMinute: endDate.getMinutes(),
                            counsellorId: appointment.counsellor_email,
                            counsellorName: fetchedCounsellors.find(c => c.email === appointment.counsellor_email)?.name || 'Unknown Counsellor',
                            type: appointment.description || 'General Appointment',
                            notes: appointment.student_notes || '',
                            status: appointment.status === 'requested'
                                ? 'pending'
                                : appointment.status === 'confirmed'
                                ? 'confirmed'
                                : 'cancelled' as 'pending' | 'confirmed' | 'cancelled',
                            counsellorNotes: appointment.counsellor_notes || undefined
                        };
                    }));
                    
                    setCounsellorAppointments(transformedAppointments);
                    setMyAppointmentsCount(transformedAppointments.length);
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, [user]);

    const filteredAppointments = useMemo(() => {
        if (!selectedCounsellorId) {
            return [];
        }
        return appointments.filter(appt => appt.counselorId === selectedCounsellorId);
    }, [appointments, selectedCounsellorId]);

    const handleSaveAppointment = async (newAppointment: StudentAppointment) => {
        try {
            if (!user?.emailAddresses?.[0]?.emailAddress) {
                toast({
                    title: "Error",
                    description: "You must be logged in to book an appointment.",
                    variant: "destructive"
                });
                return;
            }

            const studentEmail = user.emailAddresses[0].emailAddress;
            const startTime = new Date(newAppointment.day);
            startTime.setHours(newAppointment.startHour, newAppointment.startMinute);
            
            const endTime = new Date(newAppointment.day);
            endTime.setHours(newAppointment.endHour, newAppointment.endMinute);
            
            // Create appointment in database
            const appointment = await createAppointment({
                student_email: studentEmail,
                counsellor_email: newAppointment.counselorId,
                title: newAppointment.title,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                description: newAppointment.type,
                status: 'requested',
                student_notes: newAppointment.notes
            });
            
            // Update local state with UUID from created appointment
            setAppointments(prev => [...prev, { 
                ...newAppointment, 
                id: appointment.appointment_id // Using the UUID returned from the database
            }]);
            setMyAppointmentsCount(prev => prev + 1);
            
            toast({
                title: "Appointment Requested",
                description: "Your appointment has been requested and is waiting for confirmation.",
            });
            
        } catch (error) {
            console.error("Error saving appointment:", error);
            toast({
                title: "Error",
                description: "Failed to save appointment.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteAppointment = async (id: string) => { // Changed from number to string
        try {
            // Delete from database using UUID directly
            await deleteAppointment(id);
            
            // Update local state
            setAppointments(prev => prev.filter(appt => appt.id !== id));
            setMyAppointmentsCount(prev => prev - 1);
            
            toast({
                title: "Appointment Deleted",
                description: "Your appointment has been cancelled.",
            });
        } catch (error) {
            console.error("Error deleting appointment:", error);
            toast({
                title: "Error",
                description: "Failed to delete appointment.",
                variant: "destructive"
            });
        }
    };
    
    const handleConfirmAppointment = async (id: string, notes: string) => { // Changed from number to string
        try {
            await updateAppointmentStatus(id, 'confirmed', notes);
            
            // Update the local state
            setCounsellorAppointments(prevAppointments => 
                prevAppointments.map(appointment => 
                    appointment.id === id 
                        ? { ...appointment, status: 'confirmed', counsellorNotes: notes } 
                        : appointment
                )
            );
            
            toast({
                title: "Appointment Confirmed",
                description: "The appointment has been confirmed.",
            });
        } catch (error) {
            console.error("Error confirming appointment:", error);
            toast({
                title: "Error",
                description: "Failed to confirm appointment.",
                variant: "destructive"
            });
        }
    };
    
    const handleCancelAppointment = async (id: string, reason: string) => { // Changed from number to string
        try {
            await updateAppointmentStatus(id, 'cancelled', undefined, reason);
            
            // Update the local state
            setCounsellorAppointments(prevAppointments => 
                prevAppointments.map(appointment => 
                    appointment.id === id 
                        ? { ...appointment, status: 'cancelled', counsellorNotes: `Cancelled: ${reason}` } 
                        : appointment
                )
            );
            
            toast({
                title: "Appointment Cancelled",
                description: "The appointment has been cancelled.",
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            toast({
                title: "Error",
                description: "Failed to cancel appointment.",
                variant: "destructive"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading appointment data...</p>
                </div>
            </div>
        );
    }

    // Render counsellor view
    if (userRole === 'counsellor') {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-7xl mx-auto"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <h1 className="text-4xl font-bold mb-4 md:mb-0">Manage Appointments</h1>
                    </div>

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
                                    <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                                    <h2 className="text-3xl font-bold">{counsellorAppointments.length}</h2>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center py-6">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending Appointments</p>
                                    <h2 className="text-3xl font-bold">{counsellorAppointments.filter(a => a.status === 'pending').length}</h2>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center py-6">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                    <GraduationCap className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Confirmed Appointments</p>
                                    <h2 className="text-3xl font-bold">{counsellorAppointments.filter(a => a.status === 'confirmed').length}</h2>
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
                        <h2 className="text-2xl font-semibold mb-6">Appointment Calendar</h2>
                        <div className="h-[700px]">
                            <AdminCalendar
                                appointments={counsellorAppointments}
                                onConfirmAppointment={handleConfirmAppointment}
                                onCancelAppointment={handleCancelAppointment}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // Default to student view
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
                    <Button disabled={appointments.length === 0}>
                        View My Appointments <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

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
                                <p className="text-sm font-medium text-muted-foreground">Available Counsellors</p>
                                <h2 className="text-3xl font-bold">{counsellors.length}</h2>
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
                                <h2 className="text-3xl font-bold">{myAppointmentsCount}</h2>
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
                            <Label htmlFor="counsellor-select">Select Counsellor</Label>
                            <Select
                                value={selectedCounsellorId ?? ""}
                                onValueChange={(value) => setSelectedCounsellorId(value || null)}
                            >
                                <SelectTrigger id="counsellor-select">
                                    <SelectValue placeholder="Select a counsellor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {counsellors.map(counsellor => (
                                        <SelectItem key={counsellor.id} value={counsellor.id}>
                                            {counsellor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-6">
                        {!selectedCounsellorId ? (
                           <p className="text-orange-600">Please select a counsellor to view their available slots and book an appointment.</p>
                        ) : (
                           <p>Click and drag on the calendar to create a new appointment for {counsellors.find(c => c.id === selectedCounsellorId)?.name}. Click on existing appointments to view details.</p>
                        )}
                    </div>
                    <div className="h-[700px]">
                         <WeeklyCalendar
                            selectedCounselorId={selectedCounsellorId}
                            appointments={filteredAppointments}
                            counselors={counsellors}
                            onSaveAppointment={handleSaveAppointment}
                            onDeleteAppointment={handleDeleteAppointment}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}