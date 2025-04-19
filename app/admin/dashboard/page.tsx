"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Users, ArrowRight, Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSupabaseAdminAuth } from "@/context/supabase-admin-auth-context"
import { getCounsellorAppointments, Appointment } from "@/lib/appointment-service"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardPage() {
  const { counsellor } = useSupabaseAdminAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch counsellor's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (counsellor) {
        setLoading(true)
        try {
          const appointments = await getCounsellorAppointments(counsellor.id)
          setAppointments(appointments)
        } catch (error) {
          console.error("Error fetching appointments:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchAppointments()
  }, [counsellor])

  // Calculate stats
  const pendingCount = appointments.filter(a => a.status === "requested").length
  const confirmedCount = appointments.filter(a => a.status === "confirmed").length
  const totalStudentsCount = [...new Set(appointments.map(a => a.studentId))].length
  const upcomingCount = appointments.filter(a => 
    a.status === "confirmed" && new Date(a.day) >= new Date()
  ).length

  // Get recent appointments (next few upcoming ones)
  const recentAppointments = appointments
    .filter(a => a.status === "requested" || (a.status === "confirmed" && new Date(a.day) >= new Date()))
    .sort((a, b) => {
      const dateA = new Date(a.day).getTime()
      const dateB = new Date(b.day).getTime()
      return dateA - dateB
    })
    .slice(0, 4)

  const stats = [
    {
      title: "Upcoming Appointments",
      value: upcomingCount.toString(),
      description: recentAppointments.length > 0 
        ? `Next: ${recentAppointments[0].title} (${format(new Date(recentAppointments[0].day), "MMM d")})`
        : "No upcoming appointments",
      icon: Calendar,
    },
    {
      title: "Pending Confirmations",
      value: pendingCount.toString(),
      description: "Require your approval",
      icon: Clock,
    },
    {
      title: "Students Assisted",
      value: totalStudentsCount.toString(),
      description: "Total unique students",
      icon: Users,
    },
    {
      title: "Confirmed Sessions",
      value: confirmedCount.toString(),
      description: "Successfully scheduled",
      icon: CheckCircle,
    },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-2">
          {loading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <>Welcome, {counsellor?.name.split(' ')[0] || 'Counsellor'}</>
          )}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {loading ? (
            <Skeleton className="h-6 w-72" />
          ) : (
            <>{counsellor?.title || counsellor?.role || 'Counsellor'}</>
          )}
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            // Skeleton loaders for stats
            Array(4).fill(0).map((_, index) => (
              <Card key={`skeleton-${index}`} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Skeleton className="h-4 w-32" />
                  </CardTitle>
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-8 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Appointments</h2>
            <Button onClick={() => router.push('/admin/appointments')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {loading ? (
            // Skeleton loaders for appointments
            <div className="grid gap-4">
              {Array(3).fill(0).map((_, index) => (
                <Card key={`appointment-skeleton-${index}`} className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentAppointments.length > 0 ? (
            <div className="grid gap-4">
              {recentAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}>
                        {appointment.status === 'confirmed' ? (
                          <CheckCircle className={`h-5 w-5 text-green-600 dark:text-green-400`} />
                        ) : (
                          <Clock className={`h-5 w-5 text-yellow-600 dark:text-yellow-400`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{appointment.studentName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {format(new Date(appointment.day), "MMM d, yyyy")}
                        {" "}
                        {`${appointment.startHour}:${appointment.startMinute === 0 ? '00' : appointment.startMinute}`}
                      </p>
                      <p className={`text-sm ${
                        appointment.status === 'confirmed' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-medium text-center">No upcoming appointments</p>
                <p className="text-muted-foreground text-center mt-1">
                  You have no pending or upcoming appointments at the moment
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}