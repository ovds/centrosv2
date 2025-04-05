"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Plus, Search, ThumbsUp, MessageCircle } from "lucide-react"
import Link from "next/link"
import { discussionsData } from "./data"
import { Discussion } from "./types"
import { CreatePostDialog } from "@/app/forum/components/create-post-dialog"

export default function ForumPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>(discussionsData)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredDiscussions = discussions.filter(discussion => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = activeTab === "all" || 
      discussion.category.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const handleNewDiscussion = (newDiscussion: Discussion) => {
    setDiscussions([newDiscussion, ...discussions]);
    setIsCreateDialogOpen(false);
  };

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
            <TabsTrigger value="all">All Topics</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="career">Career</TabsTrigger>
            <TabsTrigger value="study groups">Study Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredDiscussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/forum/${discussion.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                            {discussion.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Posted by {discussion.author} • {discussion.date}
                          </CardDescription>
                        </div>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {discussion.category}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{discussion.preview}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {discussion.replies.length} replies
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {discussion.likes} likes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </TabsContent>
          
          <TabsContent value="academic" className="space-y-4">
            {filteredDiscussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/forum/${discussion.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                            {discussion.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Posted by {discussion.author} • {discussion.date}
                          </CardDescription>
                        </div>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {discussion.category}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{discussion.preview}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {discussion.replies.length} replies
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {discussion.likes} likes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </TabsContent>
          
          <TabsContent value="career" className="space-y-4">
            {filteredDiscussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/forum/${discussion.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                            {discussion.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Posted by {discussion.author} • {discussion.date}
                          </CardDescription>
                        </div>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {discussion.category}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{discussion.preview}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {discussion.replies.length} replies
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {discussion.likes} likes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </TabsContent>
          
          <TabsContent value="study groups" className="space-y-4">
            {filteredDiscussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/forum/${discussion.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                            {discussion.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Posted by {discussion.author} • {discussion.date}
                          </CardDescription>
                        </div>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {discussion.category}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{discussion.preview}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {discussion.replies.length} replies
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {discussion.likes} likes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
      
      <CreatePostDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)}
        onCreatePost={handleNewDiscussion}
      />
    </div>
  )
}