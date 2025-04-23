"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Video,
  Download,
  Search,
  Plus,
  File,
  ExternalLink,
  X, Database,
  Calendar,
  Clock,
  LayoutGrid,
  List,
  Tag
} from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateUUID } from '@/lib/utils'
import { toast } from "@/hooks/use-toast"
import type { Resource, ResourceCategory } from '@/types/types'

export default function ResourcesPage() {
  const { user } = useUser()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [allResources, setAllResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFilters, setSelectedFilters] = useState<{
    types: string[],
    isPrivate: boolean,
    dateRange: "all" | "today" | "week" | "month" | "year"
  }>({
    types: [],
    isPrivate: false,
    dateRange: "all"
  })
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  
  // Form state for resource upload
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    resource_category_name: "",
    resource_type: "document" as "document" | "video" | "link",
    file: null as File | null,
    external_url: "",
    is_private: false
  })
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  // Check user role on component mount
  useEffect(() => {
    async function getUserRole() {
      if (!user?.emailAddresses?.[0]?.emailAddress) return
      
      const email = user.emailAddresses[0].emailAddress
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .single()
          
        if (error) {
          console.error("Error fetching user role:", error)
          return
        }
        
        setUserRole(data?.role || null)
      } catch (error) {
        console.error("Error checking user role:", error)
      }
    }
    
    getUserRole()
  }, [user])

  // Fetch resource categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('resource_category')
          .select('*')
          
        if (error) throw error
        
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching resource categories:", error)
        setError("Failed to load resource categories")
      }
    }
    
    fetchCategories()
  }, [])

  // Fetch all resources initially
  useEffect(() => {
    async function fetchAllResources() {
      setIsLoading(true)
      setError(null)
      
      try {
        let query = supabase.from('resource').select('*')
        
        // Only show private resources to counsellors
        if (userRole !== 'counsellor') {
          query = query.eq('is_private', false)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        setAllResources(data || [])
        setResources(data || [])
      } catch (error) {
        console.error("Error fetching resources:", error)
        setError("Failed to load resources")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userRole !== null) {
      fetchAllResources()
    }
  }, [userRole])

  // Filter resources when category changes
  useEffect(() => {
    if (selectedCategory === "all") {
      setResources(allResources)
    } else {
      const filtered = allResources.filter(
        resource => resource.resource_category_name === selectedCategory
      )
      setResources(filtered)
    }
  }, [selectedCategory, allResources])

  // Apply additional filters
  const applyFilters = (resources: Resource[]) => {
    return resources.filter(resource => {
      // Filter by type
      if (selectedFilters.types.length > 0 && 
          !selectedFilters.types.includes(resource.resource_type)) {
        return false
      }
      
      // Filter by privacy
      if (selectedFilters.isPrivate !== null && 
          resource.is_private !== selectedFilters.isPrivate) {
        return false
      }
      
      // Filter by date range
      if (selectedFilters.dateRange !== "all") {
        const resourceDate = new Date(resource.created_at)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        if (selectedFilters.dateRange === "today" && 
            resourceDate < today) {
          return false
        }
        
        if (selectedFilters.dateRange === "week") {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          if (resourceDate < weekAgo) return false
        }
        
        if (selectedFilters.dateRange === "month") {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          if (resourceDate < monthAgo) return false
        }
        
        if (selectedFilters.dateRange === "year") {
          const yearAgo = new Date()
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          if (resourceDate < yearAgo) return false
        }
      }
      
      return true
    })
  }

  // Filter resources by search query and other filters
  const filteredResources = applyFilters(resources).filter(resource => 
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResourceForm({
        ...resourceForm,
        file: e.target.files[0]
      })
    }
  }

  // Toggle filter type selection
  const toggleFilterType = (type: string) => {
    setSelectedFilters(prev => {
      const types = prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
      return { ...prev, types }
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedFilters({
      types: [],
      isPrivate: false,
      dateRange: "all"
    })
  }

  // Handle resource upload
  const handleResourceUpload = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return
    
    setIsFileUploading(true)
    
    try {
      const email = user.emailAddresses[0].emailAddress
      const resourceId = generateUUID()
      let fileUrl = null
      
      // Upload file to storage if provided
      if (resourceForm.file && resourceForm.resource_type === "document") {
        const fileName = `${resourceId}-${resourceForm.file.name}`
        const { data: fileData, error: fileError } = await supabase.storage
          .from('resource-files')
          .upload(fileName, resourceForm.file)
          
        if (fileError) throw fileError
        
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('resource-files')
          .getPublicUrl(fileName)
          
        fileUrl = publicUrl
      }
      
      // Create resource in the database
      const newResource = {
        resource_id: resourceId,
        title: resourceForm.title,
        description: resourceForm.description,
        file_url: fileUrl,
        external_url: resourceForm.resource_type === "link" ? resourceForm.external_url : null,
        resource_type: resourceForm.resource_type,
        resource_category_name: resourceForm.resource_category_name,
        uploaded_by: email,
        is_private: resourceForm.is_private,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase.from('resource').insert(newResource)
      
      if (error) throw error
      
      // Update local state
      setAllResources(prev => [...prev, newResource as Resource])
      
      // Close dialog and reset form
      setIsUploadDialogOpen(false)
      setResourceForm({
        title: "",
        description: "",
        resource_category_name: categories[0]?.resource_category_name || "",
        resource_type: "document",
        file: null,
        external_url: "",
        is_private: false
      })
      
      toast({
        title: "Resource uploaded",
        description: "Your resource has been successfully uploaded."
      })
    } catch (error) {
      console.error("Error uploading resource:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resource. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsFileUploading(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  // Get count of resources by category
  const getResourceCountByCategory = (categoryName: string) => {
    if (categoryName === "all") return allResources.length
    return allResources.filter(r => r.resource_category_name === categoryName).length
  }

  // Get icon for resource type
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <File className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "link":
        return <ExternalLink className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Resource Library</h1>
            <p className="text-muted-foreground mt-2">
              Access educational materials, guides, and resources
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search resources..." 
                className="pl-8 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {userRole === 'counsellor' && (
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar with Filters */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Filters</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetFilters}
                  disabled={
                    selectedFilters.types.length === 0 && 
                    selectedFilters.isPrivate === null && 
                    selectedFilters.dateRange === "all"
                  }
                >
                  Reset
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Resource Types Filter */}
                <div>
                  <Label className="font-medium mb-3 block">Resource Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-document" 
                        checked={selectedFilters.types.includes("document")}
                        onCheckedChange={() => toggleFilterType("document")}
                      />
                      <Label htmlFor="filter-document" className="flex items-center">
                        <File className="h-4 w-4 mr-2 text-muted-foreground" />
                        Documents
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-video" 
                        checked={selectedFilters.types.includes("video")}
                        onCheckedChange={() => toggleFilterType("video")}
                      />
                      <Label htmlFor="filter-video" className="flex items-center">
                        <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                        Videos
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-link" 
                        checked={selectedFilters.types.includes("link")}
                        onCheckedChange={() => toggleFilterType("link")}
                      />
                      <Label htmlFor="filter-link" className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                        External Links
                      </Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Date Range Filter */}
                <div>
                  <Label className="font-medium mb-3 block">Date Added</Label>
                  <Select
                    value={selectedFilters.dateRange}
                    onValueChange={(value: "all" | "today" | "week" | "month" | "year") => 
                      setSelectedFilters(prev => ({ ...prev, dateRange: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {userRole === 'counsellor' && (
                  <>
                    <Separator />
                    {/* Privacy Filter */}
                    <div>
                      <Label className="font-medium mb-3 block">Privacy</Label>
                      <Select
                        value={selectedFilters.isPrivate === null 
                          ? "all" 
                          : selectedFilters.isPrivate 
                            ? "private" 
                            : "public"}
                        onValueChange={(value) => {
                          let isPrivate = false;
                          if (value === "private") isPrivate = true
                          if (value === "public") isPrivate = false
                          setSelectedFilters(prev => ({ ...prev, isPrivate }))
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select privacy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Resources</SelectItem>
                          <SelectItem value="private">Private Only</SelectItem>
                          <SelectItem value="public">Public Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                <Separator />
                
                {/* Category Selection */}
                <div>
                  <Label className="font-medium mb-3 block">Categories</Label>
                  <div className="space-y-1">
                    <div 
                      className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-accent ${selectedCategory === "all" ? "bg-accent" : ""}`}
                      onClick={() => setSelectedCategory("all")}
                    >
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>All Resources</span>
                      </div>
                      <Badge variant="outline">{getResourceCountByCategory("all")}</Badge>
                    </div>
                    
                    {categories.map((category) => (
                      <div 
                        key={category.resource_category_name}
                        className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-accent ${selectedCategory === category.resource_category_name ? "bg-accent" : ""}`}
                        onClick={() => setSelectedCategory(category.resource_category_name)}
                      >
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{category.resource_category_name}</span>
                        </div>
                        <Badge variant="outline">{getResourceCountByCategory(category.resource_category_name)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* View Selector */}
            <div className="mt-4 bg-card rounded-lg border shadow-sm p-4">
              <Label className="font-medium mb-3 block">View Mode</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant={viewMode === "grid" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex-1"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex-1"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="bg-card border rounded-lg shadow-sm p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No resources found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? "No resources match your search criteria" 
                    : "There are no resources available in this category"}
                </p>
                {userRole === 'counsellor' && (
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Resource
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground">
                    Showing <span className="font-medium">{filteredResources.length}</span> {filteredResources.length === 1 ? 'resource' : 'resources'}
                  </p>
                  <div className="hidden md:flex items-center">
                    <Button 
                      variant={viewMode === "grid" ? "default" : "outline"} 
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="mr-2"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === "list" ? "default" : "outline"} 
                      size="icon"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              
                {/* Grid View */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources.map((resource, index) => (
                      <motion.div
                        key={resource.resource_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <Card className="h-full flex flex-col">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-md ${
                                  resource.resource_type === "document" 
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                                    : resource.resource_type === "video"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                      : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                }`}>
                                  {getResourceTypeIcon(resource.resource_type)}
                                </div>
                                <div>
                                  <CardTitle className="text-md line-clamp-2">{resource.title}</CardTitle>
                                </div>
                              </div>
                              {resource.is_private && (
                                <Badge variant="secondary">Private</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3 flex-grow">
                            <CardDescription className="line-clamp-3">{resource.description}</CardDescription>
                          </CardContent>
                          <CardFooter className="pt-0 flex flex-col items-start">
                            <div className="flex items-center text-xs text-muted-foreground mb-3 w-full">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(resource.created_at)}</span>
                            </div>
                            <div className="w-full">
                              {resource.resource_type === "document" && resource.file_url && (
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                  <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </a>
                                </Button>
                              )}
                              {resource.resource_type === "link" && resource.external_url && (
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                  <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Link
                                  </a>
                                </Button>
                              )}
                              {resource.resource_type === "video" && resource.external_url && (
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                  <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                    <Video className="mr-2 h-4 w-4" />
                                    Watch Video
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // List View
                  <div className="space-y-4">
                    {filteredResources.map((resource, index) => (
                      <motion.div
                        key={resource.resource_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <Card>
                          <div className="flex items-start p-4 gap-4">
                            <div className={`p-3 rounded-md self-start ${
                              resource.resource_type === "document" 
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                                : resource.resource_type === "video"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            }`}>
                              {getResourceTypeIcon(resource.resource_type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium">{resource.title}</h3>
                                <div className="flex items-center gap-2">
                                  {resource.is_private && (
                                    <Badge variant="secondary">Private</Badge>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col md:flex-row md:items-center text-xs text-muted-foreground gap-2 md:gap-4">
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{formatDate(resource.created_at)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Tag className="h-3 w-3 mr-1" />
                                    <span>{categories.find(c => c.resource_category_name === resource.resource_category_name)?.resource_category_name || resource.resource_category_name}</span>
                                  </div>
                                </div>
                                
                                <div>
                                  {resource.resource_type === "document" && resource.file_url && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                      </a>
                                    </Button>
                                  )}
                                  {resource.resource_type === "link" && resource.external_url && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open Link
                                      </a>
                                    </Button>
                                  )}
                                  {resource.resource_type === "video" && resource.external_url && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                        <Video className="mr-2 h-4 w-4" />
                                        Watch Video
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Resource Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload New Resource</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select
                value={resourceForm.resource_category_name}
                onValueChange={(value) => setResourceForm({...resourceForm, resource_category_name: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.resource_category_name} value={category.resource_category_name}>
                      {category.resource_category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                value={resourceForm.resource_type}
                onValueChange={(value: "document" | "video" | "link") => {
                  setResourceForm({
                    ...resourceForm,
                    resource_type: value,
                    file: null,
                    external_url: ""
                  })
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {resourceForm.resource_type === "document" ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">File</Label>
                <div className="col-span-3">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="col-span-3"
                  />
                  {resourceForm.file && (
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{resourceForm.file.name} ({formatFileSize(resourceForm.file.size)})</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setResourceForm({...resourceForm, file: null})}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (resourceForm.resource_type === "video" || resourceForm.resource_type === "link") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="external_url" className="text-right">URL</Label>
                <Input
                  id="external_url"
                  value={resourceForm.external_url}
                  onChange={(e) => setResourceForm({...resourceForm, external_url: e.target.value})}
                  className="col-span-3"
                  placeholder={`Enter ${resourceForm.resource_type === "video" ? "video" : "resource"} URL`}
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea
                id="description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4 flex items-center justify-end space-x-2">
                <Label htmlFor="is_private" className="text-right mr-2">Private Resource</Label>
                <input
                  type="checkbox"
                  id="is_private"
                  checked={resourceForm.is_private}
                  onChange={(e) => setResourceForm({...resourceForm, is_private: e.target.checked})}
                  className="h-4 w-4"
                />
                <span className="text-xs text-muted-foreground block ml-2">
                  Private resources are only visible to counsellors
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResourceUpload}
              disabled={
                isFileUploading || 
                !resourceForm.title || 
                !resourceForm.resource_category_name ||
                (resourceForm.resource_type === "document" && !resourceForm.file) ||
                ((resourceForm.resource_type === "video" || resourceForm.resource_type === "link") && !resourceForm.external_url)
              }
            >
              {isFileUploading ? "Uploading..." : "Upload Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}