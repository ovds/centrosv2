"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Plus, Search, ThumbsUp, MessageCircle, Calendar, Loader2, Trash2, Pin, EyeIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Discussion, ForumCategory } from "@/types/types"
import { CreatePostDialog } from "@/app/forum/components/create-post-dialog"
import { 
  fetchForumCategories, 
  fetchDiscussions, 
  fetchReplies,
  deleteDiscussion 
} from "@/lib/db"
import { useForumAuth } from "@/hooks/use-forum-auth"
import { createClient } from '@supabase/supabase-js'

// Helper interfaces for UI
interface DiscussionWithAuthor extends Discussion {
  authorName: string;
  formattedDate: string;
  replyCount: number;
  preview: string;
}

export default function ForumPage() {
  const { toast } = useToast()
  const { 
    isLoading: authLoading, 
    isAuthenticated, 
    userRole,
    userEmail,
    userName,
    canModerate,
    canDelete
  } = useForumAuth()
  
  const [discussions, setDiscussions] = useState<DiscussionWithAuthor[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})

  // Fetch categories and discussions
  useEffect(() => {
    async function fetchForumData() {
      try {
        // Fetch categories
        const categoriesData = await fetchForumCategories()
        setCategories(categoriesData)
        
        // Fetch all discussions initially
        const discussionsData = await fetchDiscussions()
        
        // Get reply counts for each discussion
        const discussionsWithDetails = await Promise.all(
          discussionsData.map(async (discussion) => {
            const replies = await fetchReplies(discussion.discussion_id)
            
            // Get author name - In a real app, you would fetch this from a users table
            let authorName = "Anonymous"
            if (discussion.author_email) {
              try {
                const email = discussion.author_email
                // Fetch author details based on email
                const supabase = createClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                )
                const { data } = await supabase
                  .from(discussion.author_type === 'student' ? 'student' : 'counsellor')
                  .select('name')
                  .eq('email', email)
                  .single()
                
                if (data) {
                  authorName = data.name
                } else {
                  // Fall back to email display if name not found
                  authorName = email.split('@')[0]
                }
              } catch (error) {
                console.error('Error fetching author details:', error)
              }
            }
            
            return {
              ...discussion,
              authorName,
              formattedDate: formatDate(discussion.created_at),
              replyCount: replies.length,
              preview: discussion.content.substring(0, 160) + (discussion.content.length > 160 ? "..." : "")
            }
          })
        )
        
        setDiscussions(discussionsWithDetails)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching forum data:", error)
        toast({
          title: "Error",
          description: "Failed to load forum data. Please try again.",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }
    
    fetchForumData()
  }, [toast])

  // Helper function to format date
  const formatDate = (dateString: string) => {
    // Parse the date from the input string
    const date = new Date(dateString)
    
    // Format the date in Singapore timezone
    const options: Intl.DateTimeFormatOptions = { 
      timeZone: 'Asia/Singapore',
      hour: '2-digit', 
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }
    
    const sgtDateStr = date.toLocaleString('en-US', options)
    const sgtDate = new Date(date.getTime() + (8 * 60 * 60 * 1000)) // Add 8 hours for display comparison
    
    // For relative time calculation
    const now = new Date()
    const sgtNow = new Date(now.getTime()) // Add 8 hours for comparison
    
    const diffMs = sgtNow.getTime() - sgtDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    if (diffHours < 48) return 'Yesterday'
    
    return sgtDateStr
  }

  const filteredDiscussions = discussions.filter(discussion => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by category
    const matchesCategory = activeTab === "all" || 
      discussion.forum_category_name === activeTab
    
    return matchesSearch && matchesCategory
  })

  const handleNewDiscussion = (newDiscussion: Discussion) => {
    // Create a full DiscussionWithAuthor object
    const discussionWithDetails: DiscussionWithAuthor = {
      ...newDiscussion,
      authorName: userName || "You",
      formattedDate: "Just now",
      replyCount: 0,
      preview: newDiscussion.content.substring(0, 160) + (newDiscussion.content.length > 160 ? "..." : "")
    }
    
    setDiscussions([discussionWithDetails, ...discussions])
    setIsCreateDialogOpen(false)
    
    toast({
      title: "Discussion Created",
      description: "Your discussion has been posted successfully.",
    })
  }

  // Handle discussion deletion
  const handleDeleteDiscussion = async (discussionId: string, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to discussion detail page
    e.stopPropagation() // Stop event bubbling
    
    if (confirm("Are you sure you want to delete this discussion? This action cannot be undone.")) {
      try {
        setIsDeleting(prev => ({ ...prev, [discussionId]: true }))
        
        await deleteDiscussion(discussionId)
        
        setDiscussions(discussions.filter(d => d.discussion_id !== discussionId))
        
        toast({
          title: "Discussion Deleted",
          description: "The discussion has been deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting discussion:", error)
        toast({
          title: "Error",
          description: "Failed to delete discussion. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsDeleting(prev => ({ ...prev, [discussionId]: false }))
      }
    }
  }

  // Get category name from id
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.forum_category_name === categoryId)
    return category ? category.forum_category_name : "Uncategorized"
  }

  // Get icon for category
  const getCategoryIcon = (categoryId: string) => {
    switch(categoryId) {
      case 'academic':
        return <Calendar className="h-4 w-4" />
      case 'career':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading forum content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-4xl font-bold mb-4 md:mb-0">Discussion Forum</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search discussions..." 
                className="pl-8 w-full md:w-[300px]" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              className="flex items-center"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Discussion
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue="all" 
          className="space-y-6"
          onValueChange={setActiveTab}
        >
          <TabsList className="flex-wrap">
            {categories.map((category) => (
              <TabsTrigger key={category.forum_category_name} value={category.forum_category_name}>
                {category.forum_category_name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredDiscussions.length > 0 ? (
              filteredDiscussions.map((discussion, index) => (
                <motion.div
                  key={discussion.discussion_id} // Ensure discussion_id is used as the key
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/forum/${discussion.discussion_id}`}>
                    <Card className={`hover:shadow-lg transition-shadow duration-200 ${discussion.author_email === userEmail ? 'border-primary/40' : ''}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              {discussion.is_pinned && <Pin className="mr-2 h-4 w-4 text-primary" />}
                              {discussion.title}
                              {discussion.author_email === userEmail && (
                                <span className="ml-2 text-xs bg-primary/10 rounded px-2 py-0.5 text-primary">
                                  Your Post
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Posted by {discussion.authorName} • {discussion.formattedDate}
                            </CardDescription>
                          </div>
                          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {getCategoryName(discussion.forum_category_name)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{discussion.preview}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MessageCircle className="mr-1 h-4 w-4" />
                            {discussion.replyCount} replies
                          </div>
                          <div className="flex items-center">
                            <EyeIcon className="mr-1 h-4 w-4" />
                            {discussion.view_count} views
                          </div>
                        </div>
                      </CardContent>
                      {canDelete(discussion.author_email) && (
                        <CardFooter className="pt-0 flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={(e) => handleDeleteDiscussion(discussion.discussion_id, e)}
                            disabled={isDeleting[discussion.discussion_id]}
                          >
                            {isDeleting[discussion.discussion_id] ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center p-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No discussions found. Be the first to create one!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
      
      <CreatePostDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)}
        onCreatePost={handleNewDiscussion}
        categories={categories}
        userEmail={userEmail || ''}
        userRole={userRole || 'student'}
      />
    </div>
  )
}