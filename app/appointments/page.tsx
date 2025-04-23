"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, Users, GraduationCap, ArrowRight, Loader2 } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
  deleteAppointment,
  fetchAllStudents
} from "@/lib/db"
import type { Appointment as AppointmentType, Counsellor, UserRole, AppointmentStatus, Student } from "@/types/types"

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Helper to convert a Date or ISO string to Singapore time (GMT+8)
function toSingaporeDate(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    // Convert to Singapore time by adding 8 hours to UTC
    return new Date(d.getTime() + 8 * 60 * 60 * 1000);
}

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

// Interface for counsellor view appointments (renamed to avoid type clash)
export interface CounsellorAppointment {
    id: string; // Changed from number to string for UUID
    title: string;
    student_email?: string;
    day: Date;
    start_hour: number;
    start_minute: number;
    end_hour: number;
    end_minute: number;
    counsellor_email: string;
    type: string;
    description: string;
    counsellor_notes?: string;
    student_notes?: string;
    status: 'requested' | 'confirmed' | 'cancelled';
}

export default function AppointmentsPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedCounsellorId, setSelectedCounsellorId] = useState<string | null>(null);
    const [selectedCounsellorName, setSelectedCounsellorName] = useState<string>("");
    const [appointments, setAppointments] = useState<StudentAppointment[]>([]);
    const [counsellorAppointments, setCounsellorAppointments] = useState<CounsellorAppointment[]>([]);
    const [myAppointmentsCount, setMyAppointmentsCount] = useState(0);

    // Fetch all appointments for display in calendar
    const [allCounsellorAppointments, setAllCounsellorAppointments] = useState<StudentAppointment[]>([]);

    // Get counsellor from URL parameters
    useEffect(() => {
        const counsellorParam = searchParams.get('counsellor');
        if (counsellorParam) {
            setSelectedCounsellorId(counsellorParam);
        }
    }, [searchParams]);

    // Update counsellor name when ID changes or counsellors are loaded
    useEffect(() => {
        if (selectedCounsellorId && counsellors.length > 0) {
            const counsellor = counsellors.find(c => c.email === selectedCounsellorId);
            if (counsellor) {
                setSelectedCounsellorName(counsellor.name);
            }
        }
    }, [selectedCounsellorId, counsellors]);

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
                setCounsellors(fetchedCounsellors);


                const fetchedStudents = await fetchAllStudents();
                setStudents(fetchedStudents);

                // Fetch appointments based on user role
                if (userData.role === 'student') {
                    // For students, fetch their appointments
                    const appointmentsData = await fetchAppointmentsForStudent(email);
                    
                    if (appointmentsData) {
                        // Transform appointments for student view
                        const transformedAppointments = appointmentsData.map(appointment => {
                            // Find counsellor details
                            const counsellor = fetchedCounsellors.find(c => c.email === appointment.counsellor_email);
                            
                            // Parse date and time in Singapore time
                            const startDate = toSingaporeDate(appointment.start_time);
                            const endDate = toSingaporeDate(appointment.end_time);
                            
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
                        
                        console.log("Fetched appointments (raw):", appointmentsData);
                        setAppointments(transformedAppointments);
                        setMyAppointmentsCount(transformedAppointments.length);
                        console.log("Transformed appointments (SGT):", transformedAppointments);
                    }
                    
                    // Fetch all counsellor appointments to show as unavailable slots
                    const { data: allAppointmentsData, error: allApptsError } = await supabase
                        .from('appointment')
                        .select('*')
                        .or('status.eq.confirmed,status.eq.requested');
                    
                    if (allApptsError) {
                        console.error("Error fetching all appointments:", allApptsError);
                    } else if (allAppointmentsData) {
                        // Transform appointments to show as unavailable slots (anonymized)
                        const transformedAllAppointments = allAppointmentsData.map(appointment => {
                            // Find counsellor details
                            const counsellor = fetchedCounsellors.find(c => c.email === appointment.counsellor_email);
                            
                            // Parse date and time in Singapore time
                            const startDate = toSingaporeDate(appointment.start_time);
                            const endDate = toSingaporeDate(appointment.end_time);
                            
                            return {
                                id: appointment.appointment_id,
                                title: "Unavailable", // Generic title to maintain privacy
                                day: startDate,
                                startHour: startDate.getHours(),
                                startMinute: startDate.getMinutes(),
                                endHour: endDate.getHours(),
                                endMinute: endDate.getMinutes(),
                                counselorId: appointment.counsellor_email,
                                counselorName: counsellor?.name || 'Counsellor',
                                type: "Booked", // Generic type
                                notes: "",
                                status: "unavailable" as AppointmentStatus // Special status for calendar display
                            };
                        });
                        
                        setAllCounsellorAppointments(transformedAllAppointments);
                    }
                    
                } else if (userData.role === 'counsellor') {
                    // For counsellors, fetch their appointments
                    const appointmentsData = await fetchAppointmentsForCounsellor(email);
                    console.log("Counsellor Appointments Data:", appointmentsData);
                    
                    // Transform appointments for counsellor view
                    const transformedAppointments = await Promise.all(appointmentsData.map(async (appointment) => {
                        
                        // Parse date and time
                        const startDate = toSingaporeDate(appointment.start_time);
                        const endDate = toSingaporeDate(appointment.end_time);
                        
                        return {
                            id: appointment.appointment_id, // Using UUID directly
                            title: appointment.title,
                            student_email: appointment.student_email,
                            day: startDate,
                            start_hour: startDate.getHours(),
                            start_minute: startDate.getMinutes(),
                            end_hour: endDate.getHours(),
                            end_minute: endDate.getMinutes(),
                            counsellor_email: appointment.counsellor_email,
                            type: appointment.description || 'General Appointment',
                            description: appointment.description || '',
                            counsellor_notes: appointment.counsellor_notes || undefined,
                            student_notes: appointment.student_notes || '',
                            status: appointment.status as 'requested' | 'confirmed' | 'cancelled'
                        };
                    }));
                                        
                    setCounsellorAppointments(transformedAppointments);
                    setMyAppointmentsCount(transformedAppointments.length);

                    console.log("Transformed counsellor appointments (SGT):", transformedAppointments);
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, [user]);

    // When filtering appointments in student view, combine the student's own appointments
    // with anonymized slots from other counsellors
    const filteredAppointments = useMemo(() => {
        if (userRole !== 'student') {
            return appointments;
        }
        
        // For students: if no counsellor is selected, show only their own appointments
        if (!selectedCounsellorId) {
            return appointments;
        }

        // When a counsellor is selected, show student's own appointments plus all booked slots for that counsellor
        const filteredOwnAppointments = appointments.filter(appt => 
            appt.counselorId === selectedCounsellorId
        );
        
        const filteredCounsellorSlots = allCounsellorAppointments.filter(appt => 
            appt.counselorId === selectedCounsellorId
        );
        
        // Combine the lists, removing duplicates by appointment ID
        const combinedAppointments = [...filteredOwnAppointments];
        
        // Add counsellor's booked slots if not already in student's appointments
        filteredCounsellorSlots.forEach(slot => {
            if (!combinedAppointments.some(appt => appt.id === slot.id)) {
                combinedAppointments.push(slot);
            }
        });
        
        return combinedAppointments;
    }, [appointments, allCounsellorAppointments, selectedCounsellorId, userRole]);

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
            
            // Create appointment in database with explicit timezone handling
            const startTime = new Date(newAppointment.day);
            startTime.setHours(newAppointment.startHour, newAppointment.startMinute, 0, 0);
            
            const endTime = new Date(newAppointment.day);
            endTime.setHours(newAppointment.endHour, newAppointment.endMinute, 0, 0);
            
            // If the counselorId is empty but we have a selected counselor in the UI, use that
            const counsellorEmail = newAppointment.counselorId || selectedCounsellorId || '';
            
            // Find the counselor name to display in toast
            const counsellorName = counsellors.find(c => c.email === counsellorEmail)?.name || 'Unknown';
            
            console.log("Start time before DB insert:", startTime.toISOString());
            console.log("End time before DB insert:", endTime.toISOString());
            console.log("Booking with counselor:", counsellorEmail);
            
            const appointment = await createAppointment({
                student_email: studentEmail,
                counsellor_email: counsellorEmail,
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
                id: appointment.appointment_id, // Using the UUID returned from the database
                counselorId: counsellorEmail, // Ensure counselorId is set correctly
                counselorName: counsellorName // Set the counselor name
            }]);
            setMyAppointmentsCount(prev => prev + 1);
            
            toast({
                title: "Appointment Requested",
                description: `Your appointment with ${counsellorName} has been requested and is waiting for confirmation.`,
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
                                    <h2 className="text-3xl font-bold">{counsellorAppointments.filter(a => a.status === 'requested').length}</h2>
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
                            students={students}
                            counselors={counsellors}
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
                                onValueChange={(value) => setSelectedCounsellorId(value === "" ? null : value)}
                            >
                                <SelectTrigger id="counsellor-select">
                                    <SelectValue placeholder="Select a counsellor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {counsellors.map(counsellor => (
                                        <SelectItem key={counsellor.email} value={counsellor.email}>
                                            {counsellor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-6">
                        <p>Select a counsellor first, then click and drag on the calendar to create a new appointment. Gray slots indicate times already booked.</p>
                    </div>
                    
                    {!selectedCounsellorId ? (
                        <div className="p-8 text-center bg-muted rounded-md">
                            <h3 className="text-lg font-medium mb-2">Please Select a Counsellor</h3>
                            <p className="text-muted-foreground">You need to select a counsellor to view their availability and book an appointment.</p>
                        </div>
                    ) : (
                        <div className="h-[700px]">
                            <WeeklyCalendar
                                selectedCounselorId={selectedCounsellorId}
                                appointments={filteredAppointments}
                                counselors={counsellors}
                                onSaveAppointment={handleSaveAppointment}
                                onDeleteAppointment={handleDeleteAppointment}
                            />
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}