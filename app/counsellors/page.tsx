"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, Clock, Phone, Info } from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import type { Counsellor, UserRole } from '@/types/types'

export default function CounsellorsPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
        
        const { data, error } = await supabase.from('counsellor').select('*')
        
        if (error) {
          throw error
        }
        
        setCounsellors(data || [])
      } catch (err) {
        console.error('Error fetching counsellors:', err)
        setError('Failed to load counsellors data')
      } finally {
        setLoading(false)
      }
    }

    fetchCounsellors()
  }, [])

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return
      
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
        
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.emailAddresses[0].emailAddress)
          .single()
        
        if (error) {
          console.error('Error fetching user role:', error)
          return
        }
        
        setUserRole(data.role as UserRole)
      } catch (err) {
        console.error('Error in fetchUserRole:', err)
      }
    }
    
    fetchUserRole()
  }, [user])
  
  // Handle booking a session with a specific counsellor
  const handleBookSession = (counsellorEmail: string) => {
    router.push(`/appointments?counsellor=${counsellorEmail}`)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Our Counsellors</h1>
        
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {!loading && !error && counsellors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No counsellors found.</p>
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {counsellors.map((counsellor, index) => (
            <motion.div
              key={counsellor.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{counsellor.name}</CardTitle>
                  <CardDescription>{counsellor.title || 'Counsellor'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    {counsellor.bio && (
                      <p className="text-sm text-muted-foreground">{counsellor.bio}</p>
                    )}
                    <div className="space-y-2">
                      {counsellor.office_hours && (
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4" />
                          {counsellor.office_hours}
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4" />
                        {counsellor.email}
                      </div>
                      {counsellor.house && (
                        <div className="flex items-center text-sm">
                          <Info className="mr-2 h-4 w-4" />
                          House: {counsellor.house}
                        </div>
                      )}
                    </div>
                    
                    {/* Only show Book Session button to students */}
                    {userRole === 'student' && (
                      <Button 
                        className="w-full" 
                        onClick={() => handleBookSession(counsellor.email)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Session
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}