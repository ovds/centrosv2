"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { v4 as uuidv4 } from "uuid" 
import { Discussion, NewDiscussionForm } from "../types"

interface CreatePostDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreatePost: (post: Discussion) => void
}

export function CreatePostDialog({ isOpen, onClose, onCreatePost }: CreatePostDialogProps) {
  const [form, setForm] = useState<NewDiscussionForm>({
    title: "",
    category: "Academic",
    content: ""
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setForm((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title || !form.content) return

    // Create a slug from the title
    const slug = form.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
    
    // Create a new discussion object
    const newDiscussion: Discussion = {
      id: uuidv4(),
      slug,
      title: form.title,
      content: form.content,
      author: "Current User", // In a real app, this would come from auth
      date: "Just now",
      category: form.category as Discussion["category"],
      likes: 0,
      replies: [],
      preview: form.content.substring(0, 100) + (form.content.length > 100 ? "..." : "")
    }
    
    onCreatePost(newDiscussion)
    
    // Reset form
    setForm({
      title: "",
      category: "Academic",
      content: ""
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Discussion</DialogTitle>
          <DialogDescription>
            Share your question, idea, or experience with the community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Give your discussion a descriptive title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select 
              value={form.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Career">Career</SelectItem>
                <SelectItem value="Study Groups">Study Groups</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Share your thoughts, questions, or ideas..."
              className="min-h-[200px]"
              required
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Post Discussion</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 