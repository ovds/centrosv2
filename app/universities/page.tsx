"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { createClient } from '@supabase/supabase-js'
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, GraduationCap, Globe, Calendar, MapPin, Bookmark, Plus, Filter } from "lucide-react"

import { 
  fetchUniversities, 
  fetchApplications,
  fetchAllApplications,
  fetchApplicationsByYear,
  createApplication,
  updateApplication
} from "@/lib/db"

import type { University, Application, ApplicationStatus, UserRole } from "@/types/types"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function UniversitiesPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false) // Add loading state for form submission
  const [universities, setUniversities] = useState<University[]>([])
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [filteredAllApplications, setFilteredAllApplications] = useState<Application[]>([])
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [countries, setCountries] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  
  // New state for counselor applications view
  const [selectedApplicationYear, setSelectedApplicationYear] = useState<number>(new Date().getFullYear())
  const [selectedApplicationStatus, setSelectedApplicationStatus] = useState<string>("all")
  const [applicationSearchQuery, setApplicationSearchQuery] = useState<string>("")
  const [isLoadingApplications, setIsLoadingApplications] = useState<boolean>(false)
  const [studentsMap, setStudentsMap] = useState<Map<string, string>>(new Map())
  
  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    uni_name: "",
    program: "",
    application_status: "planning" as ApplicationStatus,
    application_deadline: "",
    submission_date: "",
    result_date: ""
  })
  
  // Tips editor state (for counsellors)
  const [tipEditor, setTipEditor] = useState({
    uni_name: "",
    application_tips: ""
  })
  
  // Dialog states
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [showTipsDialog, setShowTipsDialog] = useState(false)
  const [showUniversityDialog, setShowUniversityDialog] = useState(false)

  // Function to validate application form based on status
  const validateApplicationForm = () => {
    const errors: string[] = [];

    // Basic validation - required fields for all statuses
    if (!applicationForm.uni_name) {
      errors.push("University name is required");
    }
    
    if (!applicationForm.program) {
      errors.push("Program is required");
    }
    
    if (!applicationForm.application_status) {
      errors.push("Application status is required");
    }
    
    // Deadline is required for all applications
    if (!applicationForm.application_deadline) {
      errors.push("Application deadline is required");
    }
    
    // Status-specific validations
    switch (applicationForm.application_status) {
      case "submitted":
      case "interview":
      case "accepted":
      case "rejected":
      case "waitlisted":
      case "deferred":
      case "enrolled":
        // Submission date is required for these statuses
        if (!applicationForm.submission_date) {
          errors.push(`Submission date is required for "${applicationForm.application_status}" status`);
        }
        
        // Submission date cannot be after deadline
        if (applicationForm.submission_date && applicationForm.application_deadline &&
            new Date(applicationForm.submission_date) > new Date(applicationForm.application_deadline)) {
          errors.push("Submission date cannot be after the application deadline");
        }
        break;
    }
    
    // Result date validations
    if (["accepted", "rejected", "waitlisted", "deferred", "enrolled"].includes(applicationForm.application_status)) {
      // Result date is required for these statuses
      if (!applicationForm.result_date) {
        errors.push(`Result date is required for "${applicationForm.application_status}" status`);
      }
      
      // Result date must be after submission date
      if (applicationForm.result_date && applicationForm.submission_date &&
          new Date(applicationForm.result_date) < new Date(applicationForm.submission_date)) {
        errors.push("Result date must be after submission date");
      }
    }
    
    return errors;
  };

  // Fetch user role and data
  useEffect(() => {
    async function fetchUserData() {
      if (!user?.emailAddresses?.[0]?.emailAddress) return
      
      const email = user.emailAddresses[0].emailAddress
      
      try {
        // Fetch user role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .single()
          
        if (userError) {
          console.error("Error fetching user:", userError)
          return
        }
        
        setUserRole(userData.role as UserRole)
        
        // Fetch universities
        const universitiesData = await fetchUniversities()
        // Sort universities by ranking
        const sortedUniversities = universitiesData.sort((a, b) => (a.ranking || 9999) - (b.ranking || 9999))
        setUniversities(sortedUniversities)
        setFilteredUniversities(sortedUniversities)
        
        // Extract unique countries and regions for filters
        const uniqueCountries = Array.from(new Set(universitiesData.map(uni => uni.country))).filter(Boolean)
        const uniqueRegions = Array.from(new Set(universitiesData.map(uni => uni.region))).filter(Boolean) as string[]
        
        setCountries(uniqueCountries as string[])
        setRegions(uniqueRegions)
        
        // If student, fetch their applications
        if (userData.role === 'student') {
          const applicationsData = await fetchApplications(email)
          setApplications(applicationsData)
        }
        
        // If counselor, fetch all applications for the current year
        if (userData.role === 'counsellor') {
          await fetchCounselorApplications(new Date().getFullYear())
          
          // Fetch students map for displaying names
          const { data: studentsData, error: studentsError } = await supabase
            .from('student')
            .select('email, name')
          
          if (!studentsError && studentsData) {
            const studentMap = new Map<string, string>()
            studentsData.forEach(student => {
              studentMap.set(student.email, student.name)
            })
            setStudentsMap(studentMap)
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [user])
  
  // Apply filters and sorting to universities
  useEffect(() => {
    let filtered = [...universities]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(uni => 
        uni.uni_name.toLowerCase().includes(query) || 
        uni.country.toLowerCase().includes(query) ||
        (uni.region && uni.region.toLowerCase().includes(query)) ||
        (uni.description && uni.description.toLowerCase().includes(query)) ||
        (uni.best_ranked_subjects && uni.best_ranked_subjects.toLowerCase().includes(query))
      )
    }
    
    // Apply country filter
    if (selectedCountry !== "all") {
      filtered = filtered.filter(uni => uni.country === selectedCountry)
    }
    
    // Apply region filter
    if (selectedRegion !== "all") {
      filtered = filtered.filter(uni => uni.region === selectedRegion)
    }
    
    // Maintain ranking order
    filtered = filtered.sort((a, b) => (a.ranking || 9999) - (b.ranking || 9999))
    
    setFilteredUniversities(filtered)
  }, [searchQuery, selectedCountry, selectedRegion, universities])
  
  // Track if student has an application for a specific university
  const hasApplicationForUniversity = (uniName: string) => {
    return applications.some(app => app.uni_name === uniName)
  }
  
  // Get student's application for a specific university
  const getApplicationForUniversity = (uniName: string) => {
    return applications.find(app => app.uni_name === uniName)
  }
  
  // Handle application form submission
  const handleApplicationSubmit = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an application.",
        variant: "destructive"
      })
      return
    }
    
    // Validate form fields
    const validationErrors = validateApplicationForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <ul className="list-disc pl-4">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive"
      })
      return
    }
    
    const studentEmail = user.emailAddresses[0].emailAddress
    
    try {
      setIsSubmitting(true) // Set loading state to true
      const newApplication = {
        student_email: studentEmail,
        uni_name: applicationForm.uni_name,
        program: applicationForm.program,
        application_status: applicationForm.application_status,
        application_deadline: applicationForm.application_deadline || null,
        submission_date: applicationForm.submission_date || null,
        result_date: applicationForm.result_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const application = await createApplication(newApplication)
      
      // Update the applications list
      setApplications(prev => [...prev, application])
      
      // Reset form and close dialog
      setApplicationForm({
        uni_name: "",
        program: "",
        application_status: "planning",
        application_deadline: "",
        submission_date: "",
        result_date: ""
      })
      
      setShowApplicationDialog(false)
      
      toast({
        title: "Application Added",
        description: "Your application has been recorded."
      })
    } catch (error) {
      console.error("Error creating application:", error)
      toast({
        title: "Error",
        description: "Failed to save your application. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false) // Set loading state to false
    }
  }
  
  // Handle application update
  const handleApplicationUpdate = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      toast({
        title: "Error",
        description: "You must be logged in to update an application.",
        variant: "destructive"
      })
      return
    }
    
    // Validate form fields
    const validationErrors = validateApplicationForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <ul className="list-disc pl-4">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive"
      })
      return
    }
    
    const existingApplication = getApplicationForUniversity(applicationForm.uni_name)
    if (!existingApplication) {
      // If no existing application, create a new one
      handleApplicationSubmit()
      return
    }
    
    try {
      setIsSubmitting(true) // Set loading state to true
      const updates = {
        program: applicationForm.program,
        application_status: applicationForm.application_status,
        application_deadline: applicationForm.application_deadline || null,
        submission_date: applicationForm.submission_date || null,
        result_date: applicationForm.result_date || null,
        updated_at: new Date().toISOString()
      }
      
      const updatedApplication = await updateApplication(existingApplication.application_id, updates)
      
      // Update the applications list
      setApplications(prev => 
        prev.map(app => app.application_id === existingApplication.application_id ? updatedApplication : app)
      )
      
      // Reset form and close dialog
      setApplicationForm({
        uni_name: "",
        program: "",
        application_status: "planning",
        application_deadline: "",
        submission_date: "",
        result_date: ""
      })
      
      setShowApplicationDialog(false)
      
      toast({
        title: "Application Updated",
        description: "Your application details have been updated."
      })
    } catch (error) {
      console.error("Error updating application:", error)
      toast({
        title: "Error",
        description: "Failed to update your application. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false) // Set loading state to false
    }
  }
  
  // Handle application tips submission (counsellors only)
  const handleTipsSubmit = async () => {
    if (userRole !== 'counsellor') {
      toast({
        title: "Error",
        description: "Only counsellors can add application tips.",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Update university tips
      const { error } = await supabase
        .from('university')
        .update({ 
          application_tips: tipEditor.application_tips,
          updated_at: new Date().toISOString()
        })
        .eq('uni_name', tipEditor.uni_name)
      
      if (error) throw error
      
      // Update local university data
      setUniversities(prev => 
        prev.map(uni => 
          uni.uni_name === tipEditor.uni_name 
            ? { ...uni, application_tips: tipEditor.application_tips } 
            : uni
        )
      )
      
      // Reset form and close dialog
      setTipEditor({
        uni_name: "",
        application_tips: ""
      })
      
      setShowTipsDialog(false)
      
      toast({
        title: "Tips Updated",
        description: "Application tips have been updated successfully."
      })
    } catch (error) {
      console.error("Error updating tips:", error)
      toast({
        title: "Error",
        description: "Failed to update application tips. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Open application dialog with pre-filled university
  const openApplicationDialog = (university: University) => {
    const existingApplication = getApplicationForUniversity(university.uni_name)
    
    if (existingApplication) {
      // Pre-fill with existing application data
      setApplicationForm({
        uni_name: existingApplication.uni_name,
        program: existingApplication.program,
        application_status: existingApplication.application_status,
        application_deadline: existingApplication.application_deadline || "",
        submission_date: existingApplication.submission_date || "",
        result_date: existingApplication.result_date || ""
      })
    } else {
      // New application
      setApplicationForm({
        ...applicationForm,
        uni_name: university.uni_name
      })
    }
    
    setShowApplicationDialog(true)
  }
  
  // Open tips dialog with pre-filled university info
  const openTipsDialog = (university: University) => {
    setTipEditor({
      uni_name: university.uni_name,
      application_tips: university.application_tips || ""
    })
    setShowTipsDialog(true)
  }
  
  // View university details
  const viewUniversityDetails = (university: University) => {
    setSelectedUniversity(university)
    setShowUniversityDialog(true)
  }
  
  // Get status badge color
  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
      case 'planning': return 'bg-gray-500'
      case 'in_progress': return 'bg-blue-500'
      case 'submitted': return 'bg-yellow-500'
      case 'interview': return 'bg-purple-500'
      case 'accepted': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      case 'waitlisted': return 'bg-orange-500'
      case 'deferred': return 'bg-indigo-500'
      case 'enrolled': return 'bg-emerald-500'
      default: return 'bg-gray-500'
    }
  }
  
  // Fetch applications for counselor based on selected year
  const fetchCounselorApplications = async (year: number) => {
    try {
      setIsLoadingApplications(true)
      const applicationsData = await fetchApplicationsByYear(year)
      setAllApplications(applicationsData)
      setFilteredAllApplications(applicationsData)
      setIsLoadingApplications(false)
    } catch (error) {
      console.error("Error fetching applications:", error)
      setIsLoadingApplications(false)
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Filter all applications for counselor view
  useEffect(() => {
    if (!allApplications.length) return
    
    let filtered = [...allApplications]
    
    // Filter by application status
    if (selectedApplicationStatus !== "all") {
      filtered = filtered.filter(app => app.application_status === selectedApplicationStatus)
    }
    
    // Filter by search query across university name, program, and student email
    if (applicationSearchQuery) {
      const query = applicationSearchQuery.toLowerCase()
      filtered = filtered.filter(app => 
        app.uni_name.toLowerCase().includes(query) || 
        app.program.toLowerCase().includes(query) || 
        app.student_email.toLowerCase().includes(query) ||
        (studentsMap.get(app.student_email)?.toLowerCase() || "").includes(query)
      )
    }
    
    // Sort by updated_at date (most recently updated first)
    filtered = filtered.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    
    setFilteredAllApplications(filtered)
  }, [allApplications, selectedApplicationStatus, applicationSearchQuery, studentsMap])
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <div className="flex items-center space-x-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <GraduationCap className="h-8 w-8 text-primary" />
          </motion.div>
          <span className="text-xl">Loading universities...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Universities</h1>
            <p className="text-muted-foreground">
              Browse universities, view details, and manage your applications
            </p>
          </div>
          
          {userRole === 'student' && (
            <Button className="mt-4 md:mt-0" onClick={() => setShowApplicationDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          )}
        </div>
        
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Search and Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search universities..."
                    className="pl-8 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="universities" className="space-y-4">
            <TabsList>
              <TabsTrigger value="universities">Universities</TabsTrigger>
              {userRole === 'student' && (
                <TabsTrigger value="my-applications">My Applications</TabsTrigger>
              )}
              {userRole === 'counsellor' && (
                <TabsTrigger value="all-applications">All Applications</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="universities" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ranking</TableHead>
                      <TableHead>University</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUniversities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          No universities found matching your search criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUniversities.map((university) => (
                        <TableRow key={university.uni_name}>
                          <TableCell className="font-medium">{university.ranking ? `#${university.ranking}` : "—"}</TableCell>
                          <TableCell>{university.uni_name}</TableCell>
                          <TableCell>{university.country}</TableCell>
                          <TableCell>{university.region || "—"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewUniversityDetails(university)}
                              >
                                View Details
                              </Button>
                              
                              {userRole === 'student' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openApplicationDialog(university)}
                                >
                                  {hasApplicationForUniversity(university.uni_name) 
                                    ? "Update Application" 
                                    : "Add Application"}
                                </Button>
                              )}
                              
                              {userRole === 'counsellor' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openTipsDialog(university)}
                                >
                                  Add Tips
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {userRole === 'student' && (
              <TabsContent value="my-applications" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>University</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Result Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            You haven't added any applications yet. Add your first application by clicking on a university and selecting "Add Application".
                          </TableCell>
                        </TableRow>
                      ) : (
                        applications.map((application) => (
                          <TableRow key={application.application_id}>
                            <TableCell className="font-medium">{application.uni_name}</TableCell>
                            <TableCell>{application.program}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(application.application_status)}`}>
                                {application.application_status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{application.application_deadline ? new Date(application.application_deadline).toLocaleDateString() : "—"}</TableCell>
                            <TableCell>{application.submission_date ? new Date(application.submission_date).toLocaleDateString() : "—"}</TableCell>
                            <TableCell>{application.result_date ? new Date(application.result_date).toLocaleDateString() : "—"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            )}
            {userRole === 'counsellor' && (
              <TabsContent value="all-applications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Filter Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-4">
                      <div className="md:col-span-2 relative">
                        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search by student, university, or program..."
                          className="pl-8 h-10"
                          value={applicationSearchQuery}
                          onChange={(e) => setApplicationSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Select
                          value={selectedApplicationStatus}
                          onValueChange={setSelectedApplicationStatus}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="waitlisted">Waitlisted</SelectItem>
                            <SelectItem value="deferred">Deferred</SelectItem>
                            <SelectItem value="enrolled">Enrolled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Select
                          value={selectedApplicationYear.toString()}
                          onValueChange={(value) => {
                            const year = parseInt(value);
                            setSelectedApplicationYear(year);
                            fetchCounselorApplications(year);
                          }}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(5)].map((_, i) => {
                              const year = new Date().getFullYear() - 2 + i;
                              return (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>University</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Result Date</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingApplications ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
                            <div className="flex justify-center items-center space-x-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <GraduationCap className="h-5 w-5 text-primary" />
                              </motion.div>
                              <span>Loading applications...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredAllApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
                            No applications found matching your search criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAllApplications.map((application) => (
                          <TableRow key={application.application_id}>
                            <TableCell className="font-medium">
                              {studentsMap.get(application.student_email) || application.student_email}
                            </TableCell>
                            <TableCell>{application.uni_name}</TableCell>
                            <TableCell>{application.program}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(application.application_status)}`}>
                                {application.application_status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{application.application_deadline ? new Date(application.application_deadline).toLocaleDateString() : "—"}</TableCell>
                            <TableCell>{application.submission_date ? new Date(application.submission_date).toLocaleDateString() : "—"}</TableCell>
                            <TableCell>{application.result_date ? new Date(application.result_date).toLocaleDateString() : "—"}</TableCell>
                            <TableCell>{new Date(application.updated_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredAllApplications.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredAllApplications.length} {filteredAllApplications.length === 1 ? 'application' : 'applications'} from {selectedApplicationYear}
                    </div>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        {/* University Details Dialog */}
        <Dialog open={showUniversityDialog} onOpenChange={setShowUniversityDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedUniversity && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedUniversity.uni_name}</DialogTitle>
                  <DialogDescription>
                    <div className="flex items-center space-x-2 mt-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUniversity.country}{selectedUniversity.region ? `, ${selectedUniversity.region}` : ''}</span>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  {selectedUniversity.logo_url && (
                    <div className="flex justify-center">
                      <img 
                        src={selectedUniversity.logo_url} 
                        alt={`${selectedUniversity.uni_name} logo`}
                        className="h-32 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">University Information</h3>
                      <div className="space-y-3">
                        {selectedUniversity.ranking && (
                          <div className="flex items-start">
                            <Badge className="mt-0.5 mr-2" variant="outline">
                              Ranking
                            </Badge>
                            <p>#{selectedUniversity.ranking}</p>
                          </div>
                        )}
                        
                        {selectedUniversity.found_year && (
                          <div className="flex items-start">
                            <Badge className="mt-0.5 mr-2" variant="outline">
                              Founded
                            </Badge>
                            <p>{selectedUniversity.found_year}</p>
                          </div>
                        )}
                        
                        {selectedUniversity.website && (
                          <div className="flex items-start">
                            <Badge className="mt-0.5 mr-2" variant="outline">
                              Website
                            </Badge>
                            <a 
                              href={selectedUniversity.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {selectedUniversity.website}
                            </a>
                          </div>
                        )}
                        
                        {selectedUniversity.address && (
                          <div className="flex items-start">
                            <Badge className="mt-0.5 mr-2" variant="outline">
                              <MapPin className="h-3 w-3 mr-1" />
                              Address
                            </Badge>
                            <p>{selectedUniversity.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedUniversity.application_tips && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Application Tips</h3>
                      <div className="p-4 bg-muted rounded-md">
                        <p>{selectedUniversity.application_tips}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setShowUniversityDialog(false)}>
                      Close
                    </Button>
                    
                    {userRole === 'student' && (
                      <Button onClick={() => {
                        setShowUniversityDialog(false)
                        openApplicationDialog(selectedUniversity)
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        {hasApplicationForUniversity(selectedUniversity.uni_name) 
                          ? "Update Application Details" 
                          : "Add Application"}
                      </Button>
                    )}
                    
                    {userRole === 'counsellor' && (
                      <Button onClick={() => {
                        setShowUniversityDialog(false)
                        openTipsDialog(selectedUniversity)
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Application Tips
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Application Form Dialog */}
        <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {hasApplicationForUniversity(applicationForm.uni_name) 
                  ? "Update Application Details" 
                  : "Add Application"}
              </DialogTitle>
              <DialogDescription>
                Track your university application progress
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="uni-name" className="text-right">
                  University <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={applicationForm.uni_name}
                  onValueChange={(value) => setApplicationForm({...applicationForm, uni_name: value})}
                >
                  <SelectTrigger id="uni-name" className={cn("col-span-3", !applicationForm.uni_name && "border-destructive")}>
                    <SelectValue placeholder="Select a university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map(uni => (
                      <SelectItem key={uni.uni_name} value={uni.uni_name}>
                        {uni.uni_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="program" className="text-right">
                  Program <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="program"
                  className={cn("col-span-3", !applicationForm.program && "border-destructive")}
                  value={applicationForm.program}
                  onChange={(e) => setApplicationForm({...applicationForm, program: e.target.value})}
                  placeholder="e.g. Computer Science, Medicine"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={applicationForm.application_status}
                  onValueChange={(value) => setApplicationForm({...applicationForm, application_status: value as ApplicationStatus})}
                >
                  <SelectTrigger id="status" className={cn("col-span-3", !applicationForm.application_status && "border-destructive")}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    <SelectItem value="deferred">Deferred</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">
                  Deadline <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  className={cn("col-span-3", !applicationForm.application_deadline && "border-destructive")}
                  value={applicationForm.application_deadline}
                  onChange={(e) => setApplicationForm({...applicationForm, application_deadline: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="submission" className="text-right">
                  Submission Date
                  {["submitted", "interview", "accepted", "rejected", "waitlisted", "deferred", "enrolled"].includes(applicationForm.application_status) && 
                    <span className="text-destructive"> *</span>}
                </Label>
                <Input
                  id="submission"
                  type="date"
                  className={cn(
                    "col-span-3",
                    ["submitted", "interview", "accepted", "rejected", "waitlisted", "deferred", "enrolled"].includes(applicationForm.application_status) && 
                      !applicationForm.submission_date && "border-destructive"
                  )}
                  value={applicationForm.submission_date}
                  onChange={(e) => setApplicationForm({...applicationForm, submission_date: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="result" className="text-right">
                  Result Date
                  {["accepted", "rejected", "waitlisted", "deferred", "enrolled"].includes(applicationForm.application_status) && 
                    <span className="text-destructive"> *</span>}
                </Label>
                <Input
                  id="result"
                  type="date"
                  className={cn(
                    "col-span-3",
                    ["accepted", "rejected", "waitlisted", "deferred", "enrolled"].includes(applicationForm.application_status) && 
                      !applicationForm.result_date && "border-destructive"
                  )}
                  value={applicationForm.result_date}
                  onChange={(e) => setApplicationForm({...applicationForm, result_date: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplicationDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={hasApplicationForUniversity(applicationForm.uni_name) ? handleApplicationUpdate : handleApplicationSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : hasApplicationForUniversity(applicationForm.uni_name) ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Application Tips Dialog (for counsellors) */}
        {userRole === 'counsellor' && (
          <Dialog open={showTipsDialog} onOpenChange={setShowTipsDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Application Tips</DialogTitle>
                <DialogDescription>
                  Provide tips for students applying to {tipEditor.uni_name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tips" className="text-right">
                    Application Tips
                  </Label>
                  <Textarea
                    id="tips"
                    className="col-span-3"
                    rows={10}
                    value={tipEditor.application_tips}
                    onChange={(e) => setTipEditor({...tipEditor, application_tips: e.target.value})}
                    placeholder="Provide helpful tips for students applying to this university..."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTipsDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTipsSubmit}>
                  Save Tips
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>
    </div>
  )
}