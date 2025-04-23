"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar, GraduationCap, ClipboardList
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WeeklyScheduler, WeeklySchedule } from "@/components/ui/weekly-scheduler"
import { MultiSelectHouses } from "@/components/ui/multi-select-houses"
import {
  UserRole,
  StudentGender,
  HouseType,
  Appointment,
  Discussion,
  DiscussionReply,
  Application,
  Resource
} from "@/types/types"
import { format, parseISO } from "date-fns"

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
  
  // Data state variables
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [discussionReplies, setDiscussionReplies] = useState<DiscussionReply[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [newResourcesCount, setNewResourcesCount] = useState<number>(0)
  const [studentRequests, setStudentRequests] = useState<number>(0)
  const [pendingApprovals, setPendingApprovals] = useState<number>(0)
  const [officeHours, setOfficeHours] = useState<string>("")
  
  // Add state for validation errors
  const [formErrors, setFormErrors] = useState<{
    date_of_birth?: string;
  }>({})

  // Function to validate date format (YYYY-MM-DD)
  const validateDateOfBirth = (dob: string): boolean => {
    // Check if empty (which is allowed)
    if (!dob) return true;
    
    // Check format using regex (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
      setFormErrors({...formErrors, date_of_birth: "Date must be in YYYY-MM-DD format"});
      return false;
    }
    
    // Parse the date parts
    const [year, month, day] = dob.split('-').map(Number);
    
    // Check if it's a valid date
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year || 
      date.getMonth() !== month - 1 || 
      date.getDate() !== day
    ) {
      setFormErrors({...formErrors, date_of_birth: "Invalid date"});
      return false;
    }
    
    // Check if date is in the past
    const today = new Date();
    if (date > today) {
      setFormErrors({...formErrors, date_of_birth: "Date cannot be in the future"});
      return false;
    }
    
    // Check if student is at least 10 years old
    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 10);
    if (date > minAge) {
      setFormErrors({...formErrors, date_of_birth: "Student must be at least 10 years old"});
      return false;
    }
    
    // Check if student is not unreasonably old (e.g., over 100)
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 100);
    if (date < maxAge) {
      setFormErrors({...formErrors, date_of_birth: "Please enter a valid birth date"});
      return false;
    }
    
    // All checks passed
    setFormErrors({...formErrors, date_of_birth: undefined});
    return true;
  };

  // User form states
  const [userForm, setUserForm] = useState({
    role: "student" as UserRole
  })

  // Student form states
  const [studentForm, setStudentForm] = useState({
    class: "",
    house: "fibonacci" as HouseType,
    graduation_year: new Date().getFullYear() + 4,
    date_of_birth: "" as string,
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
              
              // Fetch student-specific data
              fetchStudentData(email);
            }
          } else if (data.role === 'counsellor') {
            const { data: counsellorData } = await supabase
              .from('counsellor')
              .select('name, office_hours')
              .eq('email', email)
              .single();
              
            if (counsellorData) {
              setUserName(counsellorData.name);
              setOfficeHours(counsellorData.office_hours || '');
              
              // Fetch counsellor-specific data
              fetchCounsellorData(email);
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
  
  // Fetch data for student dashboard
  const fetchStudentData = async (email: string) => {
    try {
      // Fetch upcoming appointments for the student
      const today = new Date();
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointment')
        .select('*, counsellor:counsellor_email(name)')
        .eq('student_email', email)
        .eq('status', 'confirmed')
        .gte('start_time', today.toISOString())
        .order('start_time', { ascending: true })
        .limit(5);
      
      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
      } else {
        setAppointments(appointmentsData as Appointment[]);
        setUpcomingAppointments(appointmentsData as Appointment[]);
      }
      
      // Fetch forum activity
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('discussion')
        .select('*')
        .eq('author_email', email);
      
      if (discussionsError) {
        console.error("Error fetching discussions:", discussionsError);
      } else {
        setDiscussions(discussionsData as Discussion[]);
      }
      
      // Fetch replies to student's discussions
      let totalNewReplies = 0;
      if (discussionsData && discussionsData.length > 0) {
        const discussionIds = discussionsData.map((d: Discussion) => d.discussion_id);
        
        const { data: repliesData, error: repliesError } = await supabase
          .from('discussion_reply')
          .select('*')
          .in('discussion_id', discussionIds)
          .neq('author_email', email); // Exclude student's own replies
        
        if (repliesError) {
          console.error("Error fetching replies:", repliesError);
        } else {
          setDiscussionReplies(repliesData as DiscussionReply[]);
          totalNewReplies = repliesData?.length || 0;
        }
      }
      
      // Fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('application')
        .select('*')
        .eq('student_email', email);
      
      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError);
      } else {
        setApplications(applicationsData as Application[]);
      }
      
      // Fetch new resources (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resource')
        .select('*')
        .eq('is_private', false)
        .gte('created_at', oneWeekAgo.toISOString());
      
      if (resourcesError) {
        console.error("Error fetching resources:", resourcesError);
      } else {
        setResources(resourcesData as Resource[]);
        setNewResourcesCount(resourcesData?.length || 0);
      }
      
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };
  
  // Fetch data for counsellor dashboard
  const fetchCounsellorData = async (email: string) => {
    try {
      // Fetch today's appointments
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      today.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);
      
      const { data: todaysAppointmentsData, error: appointmentsError } = await supabase
        .from('appointment')
        .select('*, student:student_email(name)')
        .eq('counsellor_email', email)
        .eq('status', 'confirmed')
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: true });
      
      if (appointmentsError) {
        console.error("Error fetching today's appointments:", appointmentsError);
      } else {
        setTodaysAppointments(todaysAppointmentsData as Appointment[]);
      }
      
      // Fetch appointment requests (status: 'requested')
      const { data: requestedAppointmentsData, error: requestsError } = await supabase
        .from('appointment')
        .select('count')
        .eq('counsellor_email', email)
        .eq('status', 'requested');
      
      if (requestsError) {
        console.error("Error fetching appointment requests:", requestsError);
      } else {
        const pendingCount = Number(requestedAppointmentsData[0]?.count) || 0;
        setStudentRequests(pendingCount);
        setPendingApprovals(pendingCount);
      }

      // Ensure pendingCount is defined

      // Fetch forum questions with no replies
      const { data: unansweredPostsData, error: forumError } = await supabase
        .from('discussion')
        .select('discussion_id')
        .not('discussion_id', 'in', supabase
          .from('discussion_reply')
          .select('discussion_id')
        );
      
      if (forumError) {
        console.error("Error fetching unanswered forum questions:", forumError);
      } else {
      }
    } catch (error) {
      console.error("Error fetching counsellor data:", error);
    }
  };

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

    // Validate date of birth
    if (!validateDateOfBirth(studentForm.date_of_birth)) {
      return;
    }
    
    try {
      // Create student in database
      const { error } = await supabase.from('student').insert({
        email: email,
        name: name,
        class: studentForm.class,
        house: studentForm.house,
        graduation_year: studentForm.graduation_year,
        date_of_birth: studentForm.date_of_birth || null,
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
                    <Input
                      id="date_of_birth"
                      type="text"
                      className="col-span-3"
                      value={studentForm.date_of_birth}
                      onChange={(e) => setStudentForm({...studentForm, date_of_birth: e.target.value})}
                      placeholder="YYYY-MM-DD"
                    />
                    {formErrors.date_of_birth && (
                      <p className="col-span-4 text-red-500 text-sm text-right">
                        {formErrors.date_of_birth}
                      </p>
                    )}
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
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.appointment_id} className="p-3 border rounded-lg">
                        <div className="font-medium">{appointment.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {format(parseISO(appointment.start_time), 'MMMM d, h:mm a')} - {' '}
                          {format(parseISO(appointment.end_time), 'h:mm a')}
                        </div>
                        <div className="text-sm">
                          Counsellor: {(appointment as any).counsellor?.name || 'Unknown'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No upcoming appointments
                    </div>
                  )}
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <a href="/appointments">Schedule New Appointment</a>
                </Button>
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
                  {applications.length > 0 ? (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">College Applications</span>
                          <span className="text-sm font-medium">
                            {Math.round((applications.filter(a => 
                              ['submitted', 'interview', 'accepted', 'rejected', 'waitlisted', 'deferred', 'enrolled']
                              .includes(a.application_status)).length / Math.max(applications.length, 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.round((applications.filter(a => 
                                ['submitted', 'interview', 'accepted', 'rejected', 'waitlisted', 'deferred', 'enrolled']
                                .includes(a.application_status)).length / Math.max(applications.length, 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Applications in Progress</span>
                          <span className="text-sm font-medium">
                            {Math.round((applications.filter(a => 
                              ['planning', 'in_progress'].includes(a.application_status)).length / Math.max(applications.length, 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.round((applications.filter(a => 
                                ['planning', 'in_progress'].includes(a.application_status)).length / Math.max(applications.length, 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Acceptances</span>
                          <span className="text-sm font-medium">
                            {Math.round((applications.filter(a => 
                              ['accepted', 'enrolled'].includes(a.application_status)).length / Math.max(applications.length, 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.round((applications.filter(a => 
                                ['accepted', 'enrolled'].includes(a.application_status)).length / Math.max(applications.length, 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No applications yet
                    </div>
                  )}
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <a href="/profile">Manage Applications</a>
                </Button>
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
                  {todaysAppointments.length > 0 ? (
                    todaysAppointments.map((appointment) => (
                      <div key={appointment.appointment_id} className="p-3 border rounded-lg">
                        <div className="font-medium">{(appointment as any).student?.name || 'Student'}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {format(parseISO(appointment.start_time), 'h:mm a')} - {' '}
                          {format(parseISO(appointment.end_time), 'h:mm a')} • {appointment.title}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No appointments scheduled for today
                    </div>
                  )}
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <a href="/appointments">View Full Schedule</a>
                </Button>
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
                {studentRequests > 0 ? (
                  <div className="text-center py-6">
                    <p className="text-2xl font-bold mb-2">{studentRequests}</p>
                    <p className="text-muted-foreground">
                      pending student {studentRequests === 1 ? 'request' : 'requests'} to review
                    </p>
                    <Button className="mt-4" asChild>
                      <a href="/appointments">View Requests</a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No pending requests
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  )
}