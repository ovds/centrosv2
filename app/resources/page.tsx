"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Video, Download, Search } from "lucide-react"

export default function ResourcesPage() {
  const resources = {
    guides: [
      {
        title: "University Application Guide 2025",
        description: "Complete guide to applying to top universities",
        type: "PDF",
        size: "2.4 MB",
        date: "Updated Mar 2024"
      },
      {
        title: "Interview Preparation Handbook",
        description: "Tips and strategies for university interviews",
        type: "PDF",
        size: "1.8 MB",
        date: "Updated Feb 2024"
      }
    ],
    videos: [
      {
        title: "Career Planning Workshop",
        description: "Recording of our latest career planning session",
        duration: "45 mins",
        date: "Mar 15, 2024"
      },
      {
        title: "Study Skills Masterclass",
        description: "Learn effective study techniques",
        duration: "60 mins",
        date: "Mar 10, 2024"
      }
    ]
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
          <h1 className="text-4xl font-bold mb-4 md:mb-0">Resource Library</h1>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-8 w-full md:w-[300px]" />
          </div>
        </div>

        <Tabs defaultValue="guides" className="space-y-6">
          <TabsList>
            <TabsTrigger value="guides" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center">
              <Video className="mr-2 h-4 w-4" />
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="space-y-4">
            {resources.guides.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>{guide.title}</CardTitle>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-4">{guide.type}</span>
                      <span className="mr-4">{guide.size}</span>
                      <span>{guide.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            {resources.videos.map((video, index) => (
              <motion.div
                key={video.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Video className="h-5 w-5 text-primary" />
                        <CardTitle>{video.title}</CardTitle>
                      </div>
                      <Button variant="outline" size="sm">Watch Now</Button>
                    </div>
                    <CardDescription>{video.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-4">Duration: {video.duration}</span>
                      <span>{video.date}</span>
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