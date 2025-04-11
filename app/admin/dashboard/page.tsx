"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Users, ArrowRight, Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/context/admin-auth-context"

export default function AdminDashboardPage() {
  const { counsellor } = useAdminAuth()
  const router = useRouter()

  const stats = [
    {
      title: "Upcoming Appointments",
      value: "5",
      description: "Next: Career Guidance (Today, 2 PM)",
      icon: Calendar,
    },
    {
      title: "Pending Confirmations",
      value: "3",
      description: "Require your approval",
      icon: Clock,
    },
    {
      title: "Students Assisted",
      value: "28",
      description: "This month",
      icon: Users,
    },
    {
      title: "Messages",
      value: "12",
      description: "Unread student inquiries",
      icon: MessageSquare,
    },
  ]

  const recentAppointments = [
    {
      id: 1,
      student: "John Lee",
      date: "Today, 2:00 PM",
      type: "Career Guidance",
      status: "Confirmed"
    },
    {
      id: 2,
      student: "Sarah Wong",
      date: "Today, 4:30 PM",
      type: "Academic Planning",
      status: "Pending"
    },
    {
      id: 3,
      student: "Michael Tan",
      date: "Tomorrow, 10:00 AM",
      type: "University Application",
      status: "Confirmed"
    },
    {
      id: 4,
      student: "Emily Chen",
      date: "Tomorrow, 3:00 PM",
      type: "Interview Preparation",
      status: "Pending"
    }
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-2">Welcome, {counsellor?.name.split(' ')[1] || 'Counsellor'}</h1>
        <p className="text-lg text-muted-foreground mb-8">{counsellor?.role || 'Counsellor'}</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
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
          ))}
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
          
          <div className="grid gap-4">
            {recentAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      appointment.status === 'Confirmed' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      {appointment.status === 'Confirmed' ? (
                        <CheckCircle className={`h-5 w-5 text-green-600 dark:text-green-400`} />
                      ) : (
                        <Clock className={`h-5 w-5 text-yellow-600 dark:text-yellow-400`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.student}</p>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appointment.date}</p>
                    <p className={`text-sm ${
                      appointment.status === 'Confirmed' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {appointment.status}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}