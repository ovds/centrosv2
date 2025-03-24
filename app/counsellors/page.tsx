"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, Clock, Phone } from "lucide-react"
import Image from "next/image"

export default function CounsellorsPage() {
  const counsellors = [
    {
      name: "Mr Allan",
      role: "Senior Academic Counsellor",
      specialization: "University Admissions, Career Planning",
      availability: "Mon-Fri, 9 AM - 5 PM",
      email: "allan@nushigh.edu.sg",
      phone: "+65 6123 4567",
      image: "h"
    },
    {
      name: "Mr. West",
      role: "Career Guidance Counsellor",
      specialization: "Industry Insights, Interview Preparation",
      availability: "Tue-Thu, 10 AM - 6 PM",
      email: "west@nushigh.edu.sg",
      phone: "+65 6123 4568",
      image: "h"
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