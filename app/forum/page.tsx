"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Plus, Search, ThumbsUp, MessageCircle } from "lucide-react"

export default function ForumPage() {
  const discussions = [
    {
      title: "Tips for University Applications",
      author: "Sarah L.",
      date: "2 hours ago",
      category: "Academic",
      replies: 15,
      likes: 23,
      preview: "Hi everyone, I'm preparing my university applications and would like to share some tips..."
    },
    {
      title: "Study Group for IB Physics",
      author: "David W.",
      date: "5 hours ago",
      category: "Study Groups",
      replies: 8,
      likes: 12,
      preview: "Looking to form a study group for IB Physics. We can meet twice a week..."
    },
    {
      title: "Career Fair Experience Sharing",
      author: "Rachel T.",
      date: "1 day ago",
      category: "Career",
      replies: 20,
      likes: 45,
      preview: "Just attended the annual career fair and wanted to share my experience..."
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-4xl font-bold mb-4 md:mb-0">Discussion Forum</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search discussions..." className="pl-8 w-full md:w-[300px]" />
            </div>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Discussion
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Topics</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="career">Career</TabsTrigger>
            <TabsTrigger value="groups">Study Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {discussions.map((discussion, index) => (
              <motion.div
                key={discussion.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
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
                        {discussion.replies} replies
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        {discussion.likes} likes
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}