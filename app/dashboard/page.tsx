"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Users, BookOpen } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { UserRole, StudentGender } from "@/types/types"
import { format } from "date-fns"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function DashboardPage() {
  const stats = [
    {
      title: "Upcoming Appointments",
      value: "3",
      description: "Next: Career Guidance (Tomorrow, 2 PM)",
      icon: Calendar,
    },
    {
      title: "Forum Activity",
      value: "12",
      description: "New responses in your threads",
      icon: MessageSquare,
    },
    {
      title: "Available Counsellors",
      value: "5",
      description: "Online and ready to help",
      icon: Users,
    },
    {
      title: "Resources",
      value: "28",
      description: "New materials this week",
      icon: BookOpen,
    },
  ]

  const { user } = useUser()
  const [userName, setUserName] = useState<string>(user?.fullName || "Student")
  const [isNewUser, setIsNewUser] = useState<boolean>(false)
  const [onboardingStep, setOnboardingStep] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  
  // User form states
  const [userForm, setUserForm] = useState({
    name: user?.fullName || "",
    role: "student" as UserRole
  })

  // Student form states
  const [studentForm, setStudentForm] = useState({
    class: "",
    graduation_year: new Date().getFullYear() + 4,
    date_of_birth: null as Date | null,
    gender: "prefer_not_to_say" as StudentGender,
    contact_number: "",
    address: "",
    parent_name: "",
    parent_email: "",
    parent_contact: "",
    profile_picture_url: user?.imageUrl || "",
    bio: "",
    interests: ""
  })

  // Counsellor form states
  const [counsellorForm, setCounsellorForm] = useState({
    title: "",
    specialization: "",
    bio: "",
    experience_years: 0,
    qualifications: "",
    office_location: "",
    contact_number: "",
    office_hours: "",
    profile_picture_url: user?.imageUrl || "",
    availability_schedule: {}
  })

  // Check if user exists in database when component mounts
  useEffect(() => {
    async function checkUserExists() {
      if (!user?.id) return;
      
      try {
        // Check if user exists in our database
        const { data, error } = await supabase
          .from('users')
          .select('user_id')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code === 'PGRST116') {
          // User doesn't exist, start onboarding
          setIsNewUser(true);
          setOnboardingStep(1);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking user:", error);
        setLoading(false);
      }
    }
    
    checkUserExists();
  }, [user]);

  // Handle user role and name form submission
  const handleUserFormSubmit = async () => {
    try {
      // Create user in database
      const { error } = await supabase.from('users').insert({
        user_id: user?.id,
        email: user?.emailAddresses?.[0]?.emailAddress || '',
        password_hash: '', // Auth is handled by Clerk
        role: userForm.role,
        is_active: true,
        email_verified: user?.emailAddresses?.[0]?.verification?.status === 'verified',
        reset_token: null,
        reset_token_expires: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      });

      if (error) throw error;
      
      // Move to next step based on role
      if (userForm.role === 'student') {
        setOnboardingStep(2);
      } else if (userForm.role === 'counsellor') {
        setOnboardingStep(3);
      } else {
        // Admin or other roles
        setOnboardingStep(0);
        setIsNewUser(false);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Handle student form submission
  const handleStudentFormSubmit = async () => {
    try {
      // Create student in database
      const { error } = await supabase.from('student').insert({
        user_id: user?.id || '',
        name: userForm.name,
        class: studentForm.class,
        graduation_year: studentForm.graduation_year,
        date_of_birth: studentForm.date_of_birth ? format(studentForm.date_of_birth, 'yyyy-MM-dd') : null,
        gender: studentForm.gender,
        contact_number: studentForm.contact_number,
        address: studentForm.address,
        parent_name: studentForm.parent_name,
        parent_email: studentForm.parent_email,
        parent_contact: studentForm.parent_contact,
        profile_picture_url: studentForm.profile_picture_url,
        bio: studentForm.bio,
        interests: studentForm.interests,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      
      // Complete onboarding
      setOnboardingStep(0);
      setIsNewUser(false);
      setUserName(userForm.name);
    } catch (error) {
      console.error("Error creating student profile:", error);
    }
  };

  // Handle counsellor form submission
  const handleCounsellorFormSubmit = async () => {
    try {
      // Create counsellor in database
      const { error } = await supabase.from('counsellor').insert({
        user_id: user?.id || '',
        name: userForm.name,
        title: counsellorForm.title,
        specialization: counsellorForm.specialization,
        bio: counsellorForm.bio,
        experience_years: counsellorForm.experience_years,
        qualifications: counsellorForm.qualifications,
        office_location: counsellorForm.office_location,
        contact_number: counsellorForm.contact_number,
        office_hours: counsellorForm.office_hours,
        profile_picture_url: counsellorForm.profile_picture_url,
        availability_schedule: counsellorForm.availability_schedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      
      // Complete onboarding
      setOnboardingStep(0);
      setIsNewUser(false);
      setUserName(userForm.name);
    } catch (error) {
      console.error("Error creating counsellor profile:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User onboarding dialog */}
      <Dialog open={isNewUser} onOpenChange={setIsNewUser}>
        <DialogContent className="sm:max-w-[600px]">
          {onboardingStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle>Welcome to Centros! Let's get you set up</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select 
                    onValueChange={(value) => setUserForm({...userForm, role: value as UserRole})}
                    defaultValue={userForm.role}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="counsellor">Counsellor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUserFormSubmit}>Continue</Button>
              </DialogFooter>
            </>
          )}
          
          {onboardingStep === 2 && (
            <>
              <DialogHeader>
                <DialogTitle>Student Information</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class" className="text-right">
                    Class
                  </Label>
                  <Input
                    id="class"
                    className="col-span-3"
                    value={studentForm.class}
                    onChange={(e) => setStudentForm({...studentForm, class: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="graduation_year" className="text-right">
                    Graduation Year
                  </Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    className="col-span-3"
                    value={studentForm.graduation_year}
                    onChange={(e) => setStudentForm({...studentForm, graduation_year: parseInt(e.target.value, 10)})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date_of_birth" className="text-right">
                    Date of Birth
                  </Label>
                    <div className="col-span-3">
                    <DatePicker
                      date={studentForm.date_of_birth}
                      onSelect={(date: Date | null) => setStudentForm({...studentForm, date_of_birth: date})}
                    />
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">
                    Gender
                  </Label>
                  <Select 
                    onValueChange={(value) => setStudentForm({...studentForm, gender: value as StudentGender})}
                    defaultValue={studentForm.gender}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact_number" className="text-right">
                    Contact Number
                  </Label>
                  <Input
                    id="contact_number"
                    className="col-span-3"
                    value={studentForm.contact_number}
                    onChange={(e) => setStudentForm({...studentForm, contact_number: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    className="col-span-3"
                    value={studentForm.address}
                    onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent_name" className="text-right">
                    Parent Name
                  </Label>
                  <Input
                    id="parent_name"
                    className="col-span-3"
                    value={studentForm.parent_name}
                    onChange={(e) => setStudentForm({...studentForm, parent_name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent_email" className="text-right">
                    Parent Email
                  </Label>
                  <Input
                    id="parent_email"
                    className="col-span-3"
                    value={studentForm.parent_email}
                    onChange={(e) => setStudentForm({...studentForm, parent_email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent_contact" className="text-right">
                    Parent Contact
                  </Label>
                  <Input
                    id="parent_contact"
                    className="col-span-3"
                    value={studentForm.parent_contact}
                    onChange={(e) => setStudentForm({...studentForm, parent_contact: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bio" className="text-right">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    className="col-span-3"
                    value={studentForm.bio}
                    onChange={(e) => setStudentForm({...studentForm, bio: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="interests" className="text-right">
                    Interests
                  </Label>
                  <Textarea
                    id="interests"
                    className="col-span-3"
                    value={studentForm.interests}
                    onChange={(e) => setStudentForm({...studentForm, interests: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleStudentFormSubmit}>Submit</Button>
              </DialogFooter>
            </>
          )}
          
          {onboardingStep === 3 && (
            <>
              <DialogHeader>
                <DialogTitle>Counsellor Information</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    className="col-span-3"
                    value={counsellorForm.title}
                    onChange={(e) => setCounsellorForm({...counsellorForm, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="specialization" className="text-right">
                    Specialization
                  </Label>
                  <Input
                    id="specialization"
                    className="col-span-3"
                    value={counsellorForm.specialization}
                    onChange={(e) => setCounsellorForm({...counsellorForm, specialization: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bio" className="text-right">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    className="col-span-3"
                    value={counsellorForm.bio}
                    onChange={(e) => setCounsellorForm({...counsellorForm, bio: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="experience_years" className="text-right">
                    Years of Experience
                  </Label>
                  <Input
                    id="experience_years"
                    type="number"
                    className="col-span-3"
                    value={counsellorForm.experience_years}
                    onChange={(e) => setCounsellorForm({...counsellorForm, experience_years: parseInt(e.target.value, 10)})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="qualifications" className="text-right">
                    Qualifications
                  </Label>
                  <Textarea
                    id="qualifications"
                    className="col-span-3"
                    value={counsellorForm.qualifications}
                    onChange={(e) => setCounsellorForm({...counsellorForm, qualifications: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="office_location" className="text-right">
                    Office Location
                  </Label>
                  <Input
                    id="office_location"
                    className="col-span-3"
                    value={counsellorForm.office_location}
                    onChange={(e) => setCounsellorForm({...counsellorForm, office_location: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact_number" className="text-right">
                    Contact Number
                  </Label>
                  <Input
                    id="contact_number"
                    className="col-span-3"
                    value={counsellorForm.contact_number}
                    onChange={(e) => setCounsellorForm({...counsellorForm, contact_number: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="office_hours" className="text-right">
                    Office Hours
                  </Label>
                  <Textarea
                    id="office_hours"
                    className="col-span-3"
                    value={counsellorForm.office_hours}
                    onChange={(e) => setCounsellorForm({...counsellorForm, office_hours: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCounsellorFormSubmit}>Submit</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Welcome back, { userName }</h1>
        
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
      </motion.div>
    </div>
  )
}