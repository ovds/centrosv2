"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  MessageCircle, 
  ThumbsUp, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  User,
  EyeIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  incrementViewCount,
  createReply,
  deleteReply,
  deleteDiscussion 
} from "@/lib/db"
import { useForumAuth } from "@/hooks/use-forum-auth"
import { Discussion, DiscussionReply } from "@/types/types"

interface DiscussionDetailClientProps {
  initialDiscussion?: Discussion
  initialReplies?: DiscussionReply[]
}

export default function DiscussionDetailClient({ 
  initialDiscussion, 
  initialReplies = [] 
}: DiscussionDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { 
    isLoading: authLoading, 
    userEmail, 
    userName,
    userRole,
    isAuthor,
    canDelete
  } = useForumAuth()
  
  const [discussion, setDiscussion] = useState<Discussion | undefined>(initialDiscussion)
  const [replies, setReplies] = useState<DiscussionReply[]>(initialReplies)
  const [newReply, setNewReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})
  const [isDeletingDiscussion, setIsDeletingDiscussion] = useState(false)

  // Increment view count on page load
  useEffect(() => {
    if (discussion?.discussion_id) {
      incrementViewCount(discussion.discussion_id).catch(error => {
        console.error("Error incrementing view count:", error)
      })
    }
  }, [discussion?.discussion_id])

  if (!discussion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Discussion not found</h1>
          <p className="text-muted-foreground mb-6">
            The discussion you're looking for might have been removed or doesn't exist.
          </p>
          <Button onClick={() => router.push("/forum")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Button>
        </motion.div>
      </div>
    )
  }

  const handleAddReply = async () => {
    if (!newReply.trim() || !userEmail) return
    
    try {
      setIsSubmitting(true)
      
      // Create reply in database
      const reply = await createReply({
        discussion_id: discussion.discussion_id,
        content: newReply,
        author_email: userEmail,
        author_type: userRole || 'student',
        parent_reply_id: null,
        is_solution: false
      })
      
      // Add reply to local state with author name
      setReplies([...replies, {
        ...reply,
      }])
      
      // Clear form
      setNewReply("")
      
      toast({
        title: "Reply Added",
        description: "Your reply has been posted successfully.",
      })
      
    } catch (error) {
      console.error("Error posting reply:", error)
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply? This action cannot be undone.")) {
      return
    }
    
    try {
      setIsDeleting(prev => ({ ...prev, [replyId]: true }))
      
      // Delete reply from database
      await deleteReply(replyId)
      
      // Remove reply from local state
      setReplies(replies.filter(reply => reply.reply_id !== replyId))
      
      toast({
        title: "Reply Deleted",
        description: "The reply has been deleted successfully.",
      })
      
    } catch (error) {
      console.error("Error deleting reply:", error)
      toast({
        title: "Error",
        description: "Failed to delete reply. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(prev => ({ ...prev, [replyId]: false }))
    }
  }
  
  const handleDeleteDiscussion = async () => {
    if (!confirm("Are you sure you want to delete this discussion and all its replies? This action cannot be undone.")) {
      return
    }
    
    try {
      setIsDeletingDiscussion(true)
      
      // Delete discussion from database
      await deleteDiscussion(discussion.discussion_id)
      
      toast({
        title: "Discussion Deleted",
        description: "The discussion has been deleted successfully.",
      })
      
      // Navigate back to forum
      router.push("/forum")
      
    } catch (error) {
      console.error("Error deleting discussion:", error)
      toast({
        title: "Error",
        description: "Failed to delete discussion. Please try again.",
        variant: "destructive"
      })
      setIsDeletingDiscussion(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    // Parse the date from the input string
    const date = new Date(dateString)
    
    
    const sgtDateStr = date.toLocaleString('en-SG')
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

  // Get initials for avatar
  const getInitials = (email: string) => {
    if (!email) return 'U'
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => router.push("/forum")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forum
        </Button>
        
        <Card className={`mb-8 ${isAuthor(discussion.author_email) ? 'border-primary/40' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  {discussion.title}
                  {isAuthor(discussion.author_email) && (
                    <span className="ml-2 text-xs bg-primary/10 rounded px-2 py-0.5 text-primary">
                      Your Post
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Posted by {discussion.author_email.split('@')[0]} • {formatDate(discussion.created_at)}
                </p>
              </div>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {discussion.forum_category_name.charAt(0).toUpperCase() + discussion.forum_category_name.slice(1)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{discussion.content}</p>
            <div className="flex items-center space-x-4 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MessageCircle className="mr-1 h-4 w-4" />
                {replies.length} replies
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
                onClick={handleDeleteDiscussion}
                disabled={isDeletingDiscussion}
              >
                {isDeletingDiscussion ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Discussion
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Replies section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Replies</h2>
          {replies.length > 0 ? (
            <div className="space-y-6">
              {replies.map((reply) => (
                <motion.div
                  key={reply.reply_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className={isAuthor(reply.author_email) ? 'border-primary/40' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(reply.author_email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium flex items-center">
                              {reply.author_email.split('@')[0]}
                              {isAuthor(reply.author_email) && (
                                <span className="ml-2 text-xs bg-primary/10 rounded px-2 py-0.5 text-primary">
                                  You
                                </span>
                              )}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm whitespace-pre-wrap">{reply.content}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <div></div> {/* Spacer */}
                            {canDelete(reply.author_email) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteReply(reply.reply_id)}
                                disabled={isDeleting[reply.reply_id]}
                              >
                                {isDeleting[reply.reply_id] ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                )}
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
            </div>
          )}
          <Separator className="my-6" />
          {/* Add reply form */}
          <div className="space-y-4">
            <h3 className="font-medium">Add a reply</h3>
            <Textarea
              placeholder="Write your reply..."
              className="min-h-[120px]"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              disabled={isSubmitting || !userEmail}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddReply}
                disabled={isSubmitting || !newReply.trim() || !userEmail}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Post Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}