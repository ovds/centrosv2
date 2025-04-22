"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Clock,
  ClipboardList
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { YearMonthDatePicker } from "@/components/ui/year-month-date-picker"
import { WeeklyScheduler, WeeklySchedule } from "@/components/ui/weekly-scheduler"
import { MultiSelectHouses } from "@/components/ui/multi-select-houses"
import { UserRole, StudentGender, HouseType } from "@/types/types"
import { format } from "date-fns"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Default weekly schedule for counselors
const DEFAULT_SCHEDULE: WeeklySchedule = {
  Monday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Friday: { enabled: true, slots: [{ start: "09:00", end: "17:00", available: true }] },
  Saturday: { enabled: false, slots: [{ start: "09:00", end: "13:00", available: true }] },
  Sunday: { enabled: false, slots: [] }
}

export default function DashboardPage() {
  const { user } = useUser()
  const [userName, setUserName] = useState<string>(user?.fullName || "Student")
  const [isNewUser, setIsNewUser] = useState<boolean>(false)
  const [onboardingStep, setOnboardingStep] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  
  // User form states
  const [userForm, setUserForm] = useState({
    role: "student" as UserRole
  })

  // Student form states
  const [studentForm, setStudentForm] = useState({
    class: "",
    house: "fibonacci" as HouseType,
    graduation_year: new Date().getFullYear() + 4,
    date_of_birth: null as Date | null,
    gender: "prefer_not_to_say" as StudentGender,
    bio: ""
  })

  // Counsellor form states
  const [counsellorForm, setCounsellorForm] = useState({
    title: "",
    houses: [] as HouseType[], // Changed from house to houses (array)
    bio: "",
    office_hours: "",
    availability_schedule: DEFAULT_SCHEDULE
  })

  // Student dashboard stats
  const studentStats = [
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
      title: "Applications",
      value: "5",
      description: "2 pending, 3 submitted",
      icon: FileText,
    },
    {
      title: "Resources",
      value: "28",
      description: "New materials this week",
      icon: BookOpen,
    },
  ]

  // Counsellor dashboard stats
  const counsellorStats = [
    {
      title: "Today's Appointments",
      value: "4",
      description: "Next: John Doe (2 PM)",
      icon: Calendar,
    },
    {
      title: "Student Requests",
      value: "7",
      description: "3 pending approvals",
      icon: Users,
    },
    {
      title: "Forum Questions",
      value: "9",
      description: "4 awaiting your response",
      icon: MessageSquare,
    },
    {
      title: "Office Hours",
      value: "2:00-5:00 PM",
      description: "Today's availability",
      icon: Clock,
    },
  ]

  // Check if user exists in database when component mounts
  useEffect(() => {
    async function checkUserExists() {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;
      
      const email = user.emailAddresses[0].emailAddress;
      
      try {
        // Check if user exists in our database
        const { data, error } = await supabase
          .from('users')
          .select('email, role')
          .eq('email', email)
          .single();
        
        if (error && error.code === 'PGRST116') {
          // User doesn't exist, start onboarding
          setIsNewUser(true);
          setOnboardingStep(1);
        } else if (data) {
          // User exists, set their role
          setUserRole(data.role as UserRole);
          
          // Get user profile data based on role
          if (data.role === 'student') {
            const { data: studentData } = await supabase
              .from('student')
              .select('name')
              .eq('email', email)
              .single();
              
            if (studentData) {
              setUserName(studentData.name);
            }
          } else if (data.role === 'counsellor') {
            const { data: counsellorData } = await supabase
              .from('counsellor')
              .select('name')
              .eq('email', email)
              .single();
              
            if (counsellorData) {
              setUserName(counsellorData.name);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking user:", error);
        setLoading(false);
      }
    }
    
    checkUserExists();
  }, [user]);

  // Handle user role selection
  const handleUserFormSubmit = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;
    
    const email = user.emailAddresses[0].emailAddress;
    
    try {
      // Create user in database
      const { error } = await supabase.from('users').insert({
        email: email,
        role: userForm.role,
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
    if (!user?.emailAddresses?.[0]?.emailAddress || !user?.fullName) return;
    
    const email = user.emailAddresses[0].emailAddress;
    const name = user.fullName;
    
    try {
      // Create student in database
      const { error } = await supabase.from('student').insert({
        email: email,
        name: name,
        class: studentForm.class,
        house: studentForm.house,
        graduation_year: studentForm.graduation_year,
        date_of_birth: studentForm.date_of_birth ? format(studentForm.date_of_birth, 'yyyy-MM-dd') : null,
        gender: studentForm.gender,
        bio: studentForm.bio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      
      // Complete onboarding
      setOnboardingStep(0);
      setIsNewUser(false);
      setUserRole('student');
      setUserName(name);
    } catch (error) {
      console.error("Error creating student profile:", error);
    }
  };

  // Handle counsellor form submission
  const handleCounsellorFormSubmit = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress || !user?.fullName) return;
    
    const email = user.emailAddresses[0].emailAddress;
    const name = user.fullName;
    
    // Generate the office_hours string from the availability_schedule
    let officeHoursText = "";
    Object.entries(counsellorForm.availability_schedule).forEach(([day, schedule]) => {
      if (schedule.enabled && schedule.slots.length > 0) {
        officeHoursText += `${day}: `;
        schedule.slots.forEach((slot, index) => {
          officeHoursText += `${slot.start}-${slot.end}`;
          if (index < schedule.slots.length - 1) {
            officeHoursText += ", ";
          }
        });
        officeHoursText += "\n";
      }
    });
    
    try {
      // Create counsellor in database
      const { error } = await supabase.from('counsellor').insert({
        email: email,
        name: name,
        title: counsellorForm.title,
        house: counsellorForm.houses[0], // Updated to houses array
        bio: counsellorForm.bio,
        office_hours: officeHoursText.trim(),
        availability_schedule: counsellorForm.availability_schedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      
      // Complete onboarding
      setOnboardingStep(0);
      setIsNewUser(false);
      setUserRole('counsellor');
      setUserName(name);
    } catch (error) {
      console.error("Error creating counsellor profile:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If onboarding is happening or we don't know the user role yet, only show onboarding dialog
  if (isNewUser || !userRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
        <Dialog open={isNewUser} onOpenChange={setIsNewUser}>
          <DialogContent className="sm:max-w-[600px]">
            {onboardingStep === 1 && (
              <>
                <DialogHeader>
                  <DialogTitle>Welcome to Centros! Let's get you set up</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {user?.fullName && (
                    <div className="text-center">
                      <p className="text-lg">Hello, {user.fullName}!</p>
                      <p className="text-muted-foreground mt-2">Please select your role to continue</p>
                    </div>
                  )}
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
                    <Label htmlFor="house" className="text-right">
                      House
                    </Label>
                    <Select 
                      onValueChange={(value) => setStudentForm({...studentForm, house: value as HouseType})}
                      defaultValue={studentForm.house}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select house" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fibonacci">Fibonacci</SelectItem>
                        <SelectItem value="fleming">Fleming</SelectItem>
                        <SelectItem value="faraday">Faraday</SelectItem>
                        <SelectItem value="nobel">Nobel</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <YearMonthDatePicker
                        date={studentForm.date_of_birth}
                        onSelect={(date) => setStudentForm({...studentForm, date_of_birth: date})}
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
                    <Label htmlFor="bio" className="text-right">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      className="col-span-3"
                      value={studentForm.bio}
                      onChange={(e) => setStudentForm({...studentForm, bio: e.target.value})}
                      placeholder="Tell us a bit about yourself"
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
                <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      className="col-span-3"
                      value={counsellorForm.title}
                      onChange={(e) => setCounsellorForm({...counsellorForm, title: e.target.value})}
                      placeholder="e.g. Career Counsellor"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="houses" className="text-right">
                      Houses
                    </Label>
                    <div className="col-span-3">
                      <MultiSelectHouses
                        houses={counsellorForm.houses}
                        onChange={(houses) => setCounsellorForm({...counsellorForm, houses})}
                        placeholder="Select houses you work with"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        You can select multiple houses
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="bio" className="text-right pt-2">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      className="col-span-3"
                      value={counsellorForm.bio}
                      onChange={(e) => setCounsellorForm({...counsellorForm, bio: e.target.value})}
                      placeholder="Share your expertise and experience"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                      Availability
                    </Label>
                    <div className="col-span-3">
                      <p className="text-sm text-muted-foreground mb-2">Set your weekly availability schedule</p>
                      <WeeklyScheduler 
                        value={counsellorForm.availability_schedule}
                        onChange={(schedule) => 
                          setCounsellorForm({...counsellorForm, availability_schedule: schedule})
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCounsellorFormSubmit}>Submit</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Choose which stats to display based on user role
  const stats = userRole === 'student' ? studentStats : counsellorStats;

  // Main dashboard content (only shown after onboarding is complete)
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Welcome back, {userName}</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
        
        {/* Student-specific content */}
        {userRole === 'student' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Career Guidance</div>
                    <div className="text-sm text-muted-foreground mt-1">Tomorrow, 2:00 PM - 3:00 PM</div>
                    <div className="text-sm">Counsellor: Dr. Sarah Johnson</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Application Review</div>
                    <div className="text-sm text-muted-foreground mt-1">April 25, 10:00 AM - 11:00 AM</div>
                    <div className="text-sm">Counsellor: Mr. Robert Chen</div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">Schedule New Appointment</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Academic Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">College Applications</span>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Personal Essay</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Scholarship Applications</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">View All Tasks</Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Counsellor-specific content */}
        {userRole === 'counsellor' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-muted-foreground mt-1">2:00 PM - 3:00 PM • Career Guidance</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Emma Smith</div>
                    <div className="text-sm text-muted-foreground mt-1">3:15 PM - 4:15 PM • College Applications</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Michael Johnson</div>
                    <div className="text-sm text-muted-foreground mt-1">4:30 PM - 5:30 PM • Scholarship Review</div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">View Full Schedule</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Student Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">Alex Wilson</div>
                      <div className="text-sm text-muted-foreground">Essay Review Request</div>
                    </div>
                    <Button size="sm">Respond</Button>
                  </div>
                  <div className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">Sophia Garcia</div>
                      <div className="text-sm text-muted-foreground">Interview Preparation</div>
                    </div>
                    <Button size="sm">Respond</Button>
                  </div>
                  <div className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">Noah Thompson</div>
                      <div className="text-sm text-muted-foreground">Application Question</div>
                    </div>
                    <Button size="sm">Respond</Button>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">View All Requests</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  )
}