"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MessageCircle, ThumbsUp } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Discussion, DiscussionReply, UserRole } from "@/types/types"
import { getAuthorName, repliesData } from "../data"

interface DiscussionDetailClientProps {
  initialDiscussion?: Discussion
}

interface DiscussionWithReplies extends Discussion {
  replies: DiscussionReply[]
}

export default function DiscussionDetailClient({ initialDiscussion }: DiscussionDetailClientProps) {
  const router = useRouter()
  const [newReply, setNewReply] = useState("")
  const [discussion, setDiscussion] = useState<DiscussionWithReplies | undefined>(
    initialDiscussion ? {
      ...initialDiscussion,
      replies: repliesData[initialDiscussion.discussion_id] || []
    } : undefined
  )
  const [replyLikes, setReplyLikes] = useState<Record<string, number>>({})
  const [postLikes, setPostLikes] = useState(0)

  // Initialize reply likes
  useEffect(() => {
    if (discussion) {
      const initialLikes: Record<string, number> = {};
      discussion.replies.forEach(reply => {
        initialLikes[reply.reply_id] = 0;
      });
      setReplyLikes(initialLikes);
    }
  }, [discussion]);

  if (!discussion) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Discussion not found</h1>
        <Button onClick={() => router.push("/forum")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forum
        </Button>
      </div>
    )
  }

  const handleAddReply = () => {
    if (!newReply.trim()) return
    
    const now = new Date().toISOString();
    const reply: DiscussionReply = {
      reply_id: uuidv4(),
      discussion_id: discussion.discussion_id,
      content: newReply,
      author_id: "current-user", // In a real app, this would come from auth
      author_type: "student" as UserRole, // In a real app, this would come from auth
      parent_reply_id: null,
      is_anonymous: false,
      is_solution: false,
      created_at: now,
      updated_at: now
    }

    const updatedDiscussion = {
      ...discussion,
      replies: [...discussion.replies, reply]
    }

    // Update reply likes state
    setReplyLikes(prev => ({
      ...prev,
      [reply.reply_id]: 0
    }));

    setDiscussion(updatedDiscussion)
    setNewReply("")
  }

  const handleLikeReply = (replyId: string) => {
    setReplyLikes(prev => ({
      ...prev,
      [replyId]: (prev[replyId] || 0) + 1
    }));
  }

  const handleLikePost = () => {
    setPostLikes(prev => prev + 1);
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{discussion.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Posted by {getAuthorName(discussion.author_id)} • {formatDate(discussion.created_at)}
                </p>
              </div>
              {/* Get category name from category_id */}
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {discussion.category_id.charAt(0).toUpperCase() + discussion.category_id.slice(1)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{discussion.content}</p>
            <div className="flex items-center space-x-4 mt-6 text-sm text-muted-foreground">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleLikePost}
              >
                <ThumbsUp className="h-4 w-4" />
                {postLikes} likes
              </Button>
              <div className="flex items-center">
                <MessageCircle className="mr-1 h-4 w-4" />
                {discussion.replies.length} replies
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Replies section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Replies</h2>
          {discussion.replies.length > 0 ? (
            <div className="space-y-6">
              {discussion.replies.map((reply) => (
                <motion.div
                  key={reply.reply_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {getAuthorName(reply.author_id).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">
                              {reply.is_anonymous ? "Anonymous" : getAuthorName(reply.author_id)}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm">{reply.content}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-xs"
                            onClick={() => handleLikeReply(reply.reply_id)}
                          >
                            <ThumbsUp className="mr-1 h-3.5 w-3.5" />
                            {replyLikes[reply.reply_id] || 0} likes
                          </Button>
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
            />
            <div className="flex justify-end">
              <Button onClick={handleAddReply}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Post Reply
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}