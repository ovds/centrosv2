"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, Clock, Phone } from "lucide-react"
import Image from "next/image"

export default function CounsellorsPage() {
  const counsellors = [
    {
      name: "Dr. Sarah Chen",
      role: "Senior Academic Counsellor",
      specialization: "University Admissions, Career Planning",
      availability: "Mon-Fri, 9 AM - 5 PM",
      email: "sarah.chen@nushigh.edu.sg",
      phone: "+65 6123 4567",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      name: "Mr. David Tan",
      role: "Career Guidance Counsellor",
      specialization: "Industry Insights, Interview Preparation",
      availability: "Tue-Thu, 10 AM - 6 PM",
      email: "david.tan@nushigh.edu.sg",
      phone: "+65 6123 4568",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      name: "Ms. Rachel Wong",
      role: "Student Development Counsellor",
      specialization: "Personal Growth, Mental Wellness",
      availability: "Mon-Fri, 8:30 AM - 4:30 PM",
      email: "rachel.wong@nushigh.edu.sg",
      phone: "+65 6123 4569",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&auto=format&fit=crop"
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
        <h1 className="text-4xl font-bold mb-8">Our Counsellors</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {counsellors.map((counsellor, index) => (
            <motion.div
              key={counsellor.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={counsellor.image}
                    alt={counsellor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{counsellor.name}</CardTitle>
                  <CardDescription>{counsellor.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{counsellor.specialization}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4" />
                        {counsellor.availability}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4" />
                        {counsellor.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4" />
                        {counsellor.phone}
                      </div>
                    </div>
                    <Button className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Session
                    </Button>
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