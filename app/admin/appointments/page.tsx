"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, X, Search, Calendar as CalendarIcon } from "lucide-react"
import { useAdminAuth } from "@/context/admin-auth-context"
import { useToast } from "@/hooks/use-toast"
import AdminCalendar, { Appointment } from "@/components/admin/admin-calendar"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

export default function AdminAppointmentsPage() {
  const { counsellor } = useAdminAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Simulate loading appointments (in a real app, this would be an API call)
  useEffect(() => {
    if (counsellor) {
      // Mock appointments data
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          title: "Academic Counselling",
          studentName: "John Lee",
          studentEmail: "john.lee@student.nushigh.edu.sg",
          studentId: "S1234567A",
          day: new Date(),
          startHour: 9,
          startMinute: 0,
          endHour: 10,
          endMinute: 0,
          counsellorId: counsellor.id,
          counsellorName: counsellor.name,
          type: "Academic Counselling",
          notes: "Need help with university applications",
          status: "confirmed"
        },
        {
          id: 2,
          title: "Career Guidance",
          studentName: "Sarah Wong",
          studentEmail: "sarah.wong@student.nushigh.edu.sg",
          studentId: "S7654321B",
          day: new Date(),
          startHour: 14,
          startMinute: 30,
          endHour: 15,
          endMinute: 30,
          counsellorId: counsellor.id,
          counsellorName: counsellor.name,
          type: "Career Guidance",
          notes: "Want to discuss career options in healthcare",
          status: "pending"
        },
        {
          id: 3,
          title: "University Application",
          studentName: "Michael Tan",
          studentEmail: "michael.tan@student.nushigh.edu.sg",
          studentId: "S2468135C",
          day: (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
          })(),
          startHour: 10,
          startMinute: 0,
          endHour: 11,
          endMinute: 0,
          counsellorId: counsellor.id,
          counsellorName: counsellor.name,
          type: "Academic Counselling",
          notes: "Need advice on my personal statement",
          status: "pending"
        },
        {
          id: 4,
          title: "Interview Preparation",
          studentName: "Emily Chen",
          studentEmail: "emily.chen@student.nushigh.edu.sg",
          studentId: "S1357924D",
          day: (() => {
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            return dayAfterTomorrow;
          })(),
          startHour: 15,
          startMinute: 0,
          endHour: 16,
          endMinute: 30,
          counsellorId: counsellor.id,
          counsellorName: counsellor.name,
          type: "Career Guidance",
          notes: "Preparing for scholarship interview next week",
          status: "pending"
        }
      ];

      setAppointments(mockAppointments);
    }
  }, [counsellor]);

  // Confirm an appointment
  const handleConfirmAppointment = (id: number, notes: string) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === id 
          ? { 
              ...appointment, 
              status: 'confirmed', 
              counsellorNotes: notes 
            } 
          : appointment
      )
    );

    toast({
      title: "Appointment Confirmed",
      description: "The student has been notified of the confirmation",
    });
  };

  // Cancel an appointment
  const handleCancelAppointment = (id: number, reason: string) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === id 
          ? { 
              ...appointment, 
              status: 'cancelled', 
              counsellorNotes: reason 
            } 
          : appointment
      )
    );

    toast({
      title: "Appointment Cancelled",
      description: "The student has been notified of the cancellation",
      variant: "destructive"
    });
  };

  // Filter appointments based on tab and search query
  const filteredAppointments = appointments
    .filter(appointment => {
      // First filter by tab
      if (activeTab === "all") return appointment.status !== "cancelled";
      if (activeTab === "pending") return appointment.status === "pending";
      if (activeTab === "confirmed") return appointment.status === "confirmed";
      if (activeTab === "cancelled") return appointment.status === "cancelled";
      return true;
    })
    .filter(appointment => {
      // Then filter by search query if it exists
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        appointment.studentName.toLowerCase().includes(query) ||
        appointment.studentEmail?.toLowerCase().includes(query) ||
        appointment.studentId?.toLowerCase().includes(query) ||
        appointment.title.toLowerCase().includes(query) ||
        appointment.type.toLowerCase().includes(query) ||
        (appointment.notes && appointment.notes.toLowerCase().includes(query))
      );
    })
    // Sort by date (most recent first)
    .sort((a, b) => {
      // First compare by day
      const dateComparison = new Date(b.day).getTime() - new Date(a.day).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      // If same day, compare by start time
      return (b.startHour * 60 + b.startMinute) - (a.startHour * 60 + a.startMinute);
    });

  // Count appointments by status
  const pendingCount = appointments.filter(a => a.status === "pending").length;
  const confirmedCount = appointments.filter(a => a.status === "confirmed").length;
  const cancelledCount = appointments.filter(a => a.status === "cancelled").length;

  // Format appointment time for display
  const formatAppointmentTime = (appointment: Appointment) => {
    const startTime = `${appointment.startHour.toString().padStart(2, '0')}:${appointment.startMinute.toString().padStart(2, '0')}`;
    const endTime = `${appointment.endHour.toString().padStart(2, '0')}:${appointment.endMinute.toString().padStart(2, '0')}`;
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">My Appointments</h1>
        
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-3 mb-8"
        >
          <Card>
            <CardContent className="flex items-center py-6">
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-4">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h2 className="text-3xl font-bold">{pendingCount}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center py-6">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <h2 className="text-3xl font-bold">{confirmedCount}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center py-6">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <h2 className="text-3xl font-bold">{cancelledCount}</h2>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <TabsList>
                <TabsTrigger value="all">All Appointments</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              
              <div className="relative mt-4 sm:mt-0 w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search appointments..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {activeTab !== "cancelled" ? (
              <TabsContent value={activeTab} className="space-y-4">
                <div className="h-[600px] overflow-auto">
                  <AdminCalendar 
                    appointments={filteredAppointments}
                    onConfirmAppointment={handleConfirmAppointment}
                    onCancelAppointment={handleCancelAppointment}
                  />
                </div>
              </TabsContent>
            ) : (
              <TabsContent value="cancelled" className="space-y-4">
                {filteredAppointments.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <X className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-xl font-medium text-center">No cancelled appointments found</p>
                      <p className="text-muted-foreground text-center mt-1">
                        Cancelled appointments will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <Card key={appointment.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="bg-red-100 dark:bg-red-900/30 p-4 md:p-6 md:w-1/4 flex flex-col justify-center">
                              <p className="font-medium text-red-600 dark:text-red-400">
                                {format(new Date(appointment.day), "EEEE")}
                              </p>
                              <p className="text-2xl font-bold">
                                {format(new Date(appointment.day), "d MMM yyyy")}
                              </p>
                              <p className="mt-1 font-medium">
                                {formatAppointmentTime(appointment)}
                              </p>
                            </div>
                            <div className="p-4 md:p-6 md:w-3/4">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div>
                                  <h3 className="text-lg font-bold">{appointment.title}</h3>
                                  <p className="text-muted-foreground">{appointment.type}</p>
                                </div>
                                <div className="mt-2 md:mt-0">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                    Cancelled
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 grid gap-2">
                                <p><span className="font-medium">Student:</span> {appointment.studentName}</p>
                                <p><span className="font-medium">Email:</span> {appointment.studentEmail}</p>
                                <p><span className="font-medium">ID:</span> {appointment.studentId}</p>
                                {appointment.notes && (
                                  <p><span className="font-medium">Notes:</span> {appointment.notes}</p>
                                )}
                                {appointment.counsellorNotes && (
                                  <p><span className="font-medium">Cancellation reason:</span> {appointment.counsellorNotes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}