"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, Users, Clock, ArrowRight, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import AppointmentCalendar from "@/components/appointments/AppointmentCalendar"
import { AppointmentDetails } from "@/components/appointments/AppointmentDetails"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Types
export interface Counsellor {
  id: string
  name: string
  email: string
  avatar_url?: string
  specialization: string
  availability: string
}

export interface Appointment {
  id: number
  title: string
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled'
  student_id: string
  student_name: string
  counsellor_id: string
  counsellor_name: string
  date: Date
  start_time: string
  end_time: string
  type: string
  notes?: string
  student_feedback?: string
  counsellor_notes?: string
  created_at: Date
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [counsellors, setCounsellors] = useState<Counsellor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedCounsellor, setSelectedCounsellor] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedTab, setSelectedTab] = useState<string>("upcoming")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Fetch counsellors
  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url, specialization, availability')
          .eq('role', 'counsellor')
        
        if (error) throw error
        
        if (data) {
          setCounsellors(data as Counsellor[])
          // Auto-select first counsellor if none selected
          if (data.length > 0 && !selectedCounsellor) {
            setSelectedCounsellor(data[0].id)
          }
        }
      } catch (error: any) {
        console.error('Error fetching counsellors:', error.message)
        toast({
          title: "Error",
          description: "Failed to load counsellors",
          variant: "destructive"
        })
      }
    }

    fetchCounsellors()
  }, [toast, selectedCounsellor])

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return
      
      setLoading(true)
      
      try {
        let query = supabase
          .from('appointments')
          .select('*')
        
        // If user is a student, only fetch their appointments
        if (user.role === 'student') {
          query = query.eq('student_id', user.id)
        }
        // If user is a counsellor, only fetch their appointments
        else if (user.role === 'counsellor') {
          query = query.eq('counsellor_id', user.id)
        }
        
        const { data, error } = await query.order('date', { ascending: true })
        
        if (error) throw error
        
        if (data) {
          // Convert string dates to Date objects
          const formattedAppointments = data.map(apt => ({
            ...apt,
            date: new Date(apt.date),
            created_at: new Date(apt.created_at)
          }))
          
          setAppointments(formattedAppointments as Appointment[])
        }
      } catch (error: any) {
        console.error('Error fetching appointments:', error.message)
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user, toast])

  // Handle saving appointment
  const handleSaveAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at'>) => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            ...appointment,
            student_id: user.id,
            student_name: user.name,
            status: 'requested',
            created_at: new Date().toISOString()
          }
        ])
        .select()
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Appointment requested successfully",
      })
      
      // Refresh appointments
      const { data: updatedAppointments, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('student_id', user.id)
        .order('date', { ascending: true })
      
      if (fetchError) throw fetchError
      
      if (updatedAppointments) {
        // Convert string dates to Date objects
        const formattedAppointments = updatedAppointments.map(apt => ({
          ...apt,
          date: new Date(apt.date),
          created_at: new Date(apt.created_at)
        }))
        
        setAppointments(formattedAppointments as Appointment[])
      }
      
    } catch (error: any) {
      console.error('Error saving appointment:', error.message)
      toast({
        title: "Error",
        description: "Failed to request appointment",
        variant: "destructive"
      })
    }
  }

  // Handle cancelling appointment
  const handleCancelAppointment = async (id: number) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id ? { ...apt, status: 'cancelled' } : apt
        )
      )
      
      // Close details modal if the cancelled appointment is selected
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(null)
      }
      
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      })
      
    } catch (error: any) {
      console.error('Error cancelling appointment:', error.message)
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      })
    }
  }

  // Handle submitting feedback
  const handleSubmitFeedback = async (id: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ student_feedback: feedback })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id ? { ...apt, student_feedback: feedback } : apt
        )
      )
      
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      })
      
    } catch (error: any) {
      console.error('Error submitting feedback:', error.message)
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      })
    }
  }

  // Filter appointments based on tab and status
  const getFilteredAppointments = () => {
    const now = new Date()
    
    return appointments.filter(apt => {
      // First filter by tab (upcoming/past)
      const isUpcoming = new Date(apt.date) >= now || 
        (new Date(apt.date).toDateString() === now.toDateString() && 
         apt.start_time > now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
      
      if (selectedTab === 'upcoming' && !isUpcoming) return false
      if (selectedTab === 'past' && isUpcoming) return false
      
      // Then filter by status if a specific status is selected
      if (filterStatus !== 'all' && apt.status !== filterStatus) return false
      
      return true
    })
  }

  // Stats counts
  const upcomingCount = appointments.filter(apt => {
    const now = new Date()
    const isUpcoming = new Date(apt.date) >= now || 
      (new Date(apt.date).toDateString() === now.toDateString() && 
       apt.start_time > now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
    return isUpcoming && apt.status !== 'cancelled'
  }).length

  const completedCount = appointments.filter(apt => apt.status === 'completed').length
  const pendingCount = appointments.filter(apt => apt.status === 'requested').length

  const filteredAppointments = getFilteredAppointments()

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
          <Button asChild>
            <a href="#appointment-calendar">
              Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
            </a>
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
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <h2 className="text-3xl font-bold">{upcomingCount}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center py-6">
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-4">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Confirmation</p>
                <h2 className="text-3xl font-bold">{pendingCount}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center py-6">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <h2 className="text-3xl font-bold">{completedCount}</h2>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appointment List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-semibold mb-4 sm:mb-0">My Appointments</h2>
            
            <div className="flex items-center space-x-2">
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('requested')}>
                      Requested
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('confirmed')}>
                      Confirmed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                      Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('cancelled')}>
                      Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-medium text-center">No appointments found</p>
                <p className="text-muted-foreground text-center mt-1">
                  {selectedTab === 'upcoming' 
                    ? "You don't have any upcoming appointments" 
                    : "You don't have any past appointments"}
                </p>
                <Button className="mt-6" asChild>
                  <a href="#appointment-calendar">Book an Appointment</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className={`p-4 md:p-6 md:w-1/4 flex flex-col justify-center ${
                        appointment.status === 'confirmed' ? 'bg-primary/10' :
                        appointment.status === 'requested' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        appointment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <p className="font-medium">
                          {format(new Date(appointment.date), "EEEE")}
                        </p>
                        <p className="text-2xl font-bold">
                          {format(new Date(appointment.date), "d MMM yyyy")}
                        </p>
                        <p className="mt-1 font-medium">
                          {appointment.start_time} - {appointment.end_time}
                        </p>
                      </div>
                      <div className="p-4 md:p-6 md:w-3/4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{appointment.title}</h3>
                            <p className="text-muted-foreground">{appointment.type}</p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                              appointment.status === 'requested' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p><span className="font-medium">Counsellor:</span> {appointment.counsellor_name}</p>
                          {appointment.notes && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              <span className="font-medium">Notes:</span> {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Appointment Booking Calendar */}
        <motion.div
          id="appointment-calendar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card rounded-lg border shadow-sm p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold">Book an Appointment</h2>
            <div className="w-full sm:w-64">
              <Select
                value={selectedCounsellor || ""}
                onValueChange={(value) => setSelectedCounsellor(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a counsellor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Counsellors</SelectLabel>
                    {counsellors.map(counsellor => (
                      <SelectItem key={counsellor.id} value={counsellor.id}>
                        {counsellor.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-6">
            {!selectedCounsellor ? (
              <p className="text-orange-600">Please select a counsellor to view their available slots and book an appointment.</p>
            ) : (
              <p>Select a date and time to book an appointment with {counsellors.find(c => c.id === selectedCounsellor)?.name}.</p>
            )}
          </div>
          
          <div className="h-[700px] overflow-auto">
            <AppointmentCalendar
              counsellor={counsellors.find(c => c.id === selectedCounsellor)}
              appointments={appointments.filter(apt => apt.counsellor_id === selectedCounsellor)}
              onSaveAppointment={handleSaveAppointment}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onCancel={handleCancelAppointment}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}
    </div>
  )
}
