"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Plus, Search, ThumbsUp, MessageCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { Discussion, ForumCategory } from "@/types/types"
import { CreatePostDialog } from "@/app/forum/components/create-post-dialog"
import { fetchForumCategories } from "@/lib/db"

// Mock data until connected to backend
const mockCategories: ForumCategory[] = [
  {
    category_id: "all",
    name: "All Topics",
    description: "All forum discussions",
    icon: null,
    display_order: 0,
    is_private: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    category_id: "academic",
    name: "Academic",
    description: "Academic discussions",
    icon: null,
    display_order: 1,
    is_private: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    category_id: "career",
    name: "Career",
    description: "Career related discussions",
    icon: null,
    display_order: 2,
    is_private: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    category_id: "study-groups",
    name: "Study Groups",
    description: "Study group discussions",
    icon: null,
    display_order: 3,
    is_private: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock discussions data
const mockDiscussions: Discussion[] = [
  {
    discussion_id: "1",
    title: "Tips for University Applications",
    content: "Hi everyone, I'm preparing my university applications and would like to share some tips I've learned along the way. First, start early! Applications can take much longer than you expect. Second, get multiple people to review your personal statement. Third, research each university thoroughly to tailor your application. Fourth, don't forget to highlight extracurricular activities that show your character. Hope this helps!",
    author_id: "user1",
    author_type: "student",
    category_id: "academic",
    is_pinned: false,
    is_closed: false,
    is_anonymous: false,
    view_count: 120,
    created_at: "2025-04-19T14:00:00Z",
    updated_at: "2025-04-19T14:00:00Z"
  },
  {
    discussion_id: "2",
    title: "Study Group for IB Physics",
    content: "Looking to form a study group for IB Physics. We can meet twice a week to review concepts, solve problems together, and prepare for the exams. I find mechanics and thermodynamics particularly challenging, so would love to collaborate with others. Let me know if you're interested!",
    author_id: "user2",
    author_type: "student",
    category_id: "study-groups",
    is_pinned: false,
    is_closed: false,
    is_anonymous: false,
    view_count: 75,
    created_at: "2025-04-16T09:00:00Z",
    updated_at: "2025-04-16T09:00:00Z"
  },
  {
    discussion_id: "3",
    title: "Career Fair Experience Sharing",
    content: "Just attended the annual career fair and wanted to share my experience. The event was well-organized with representatives from over 50 companies across different industries. I found that companies were particularly interested in students who had done relevant projects or internships. I managed to schedule three interviews for summer internships! Make sure to bring plenty of resumes and practice your elevator pitch beforehand.",
    author_id: "user3",
    author_type: "student",
    category_id: "career",
    is_pinned: true,
    is_closed: false,
    is_anonymous: false,
    view_count: 210,
    created_at: "2025-04-20T11:00:00Z",
    updated_at: "2025-04-20T11:00:00Z"
  }
]

// Helper interfaces for UI
interface DiscussionWithAuthor extends Discussion {
  authorName: string;
  formattedDate: string;
  replyCount: number;
  likeCount: number;
  preview: string;
}

export default function ForumPage() {
  const [discussions, setDiscussions] = useState<DiscussionWithAuthor[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch categories and discussions
  useEffect(() => {
    // Fetch categories from db.ts
    
    fetchForumCategories()
      .then(data => {
        setCategories([mockCategories[0], ...data]) // Add "All Topics" category
        setActiveTab(mockCategories[0].category_id) // Set default active tab to "All Topics"
        console.log("Categories fetched:", data)  
      })
      .catch(error => {
        console.error("Error fetching categories:", error)
      });
    
    // Process discussions to add UI-specific properties
    const processedDiscussions = mockDiscussions.map(discussion => ({
      ...discussion,
      authorName: getAuthorName(discussion.author_id, discussion.author_type),
      formattedDate: formatDate(discussion.created_at),
      replyCount: Math.floor(Math.random() * 10), // Mock data
      likeCount: Math.floor(Math.random() * 50), // Mock data
      preview: discussion.content.substring(0, 100) + (discussion.content.length > 100 ? "..." : "")
    }));
    
    setDiscussions(processedDiscussions);
    setIsLoading(false);
  }, []);

  // Helper function to get author name (would fetch from user data in real app)
  const getAuthorName = (authorId: string, authorType: string) => {
    const names = {
      "user1": "Sarah L.",
      "user2": "David W.",
      "user3": "Rachel T."
    };
    return names[authorId as keyof typeof names] || "Anonymous User";
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredDiscussions = discussions.filter(discussion => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = activeTab === "all" || 
      discussion.category_id === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  const handleNewDiscussion = (newDiscussion: DiscussionWithAuthor) => {
    setDiscussions([newDiscussion, ...discussions]);
    setIsCreateDialogOpen(false);
  };

  // Get category name from id
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.category_id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Get icon for category
  const getCategoryIcon = (categoryId: string) => {
    switch(categoryId) {
      case 'academic':
        return <Calendar className="h-4 w-4" />;
      case 'career':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]">Loading discussions...</div>;
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
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category.category_id} value={category.category_id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredDiscussions.length > 0 ? (
              filteredDiscussions.map((discussion, index) => (
                <motion.div
                  key={discussion.discussion_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/forum/${discussion.discussion_id}`}>
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              {discussion.is_pinned && <MessageSquare className="mr-2 h-5 w-5 text-primary" />}
                              {discussion.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Posted by {discussion.authorName} • {discussion.formattedDate}
                            </CardDescription>
                          </div>
                          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {getCategoryName(discussion.category_id)}
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
                            <ThumbsUp className="mr-1 h-4 w-4" />
                            {discussion.likeCount} likes
                          </div>
                          <div className="flex items-center">
                            <Search className="mr-1 h-4 w-4" />
                            {discussion.view_count} views
                          </div>
                        </div>
                      </CardContent>
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
      />
    </div>
  )
}