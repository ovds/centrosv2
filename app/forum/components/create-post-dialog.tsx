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
import { Discussion, ForumCategory, UserRole } from "@/types/types"

// Form interface for creating a new discussion
interface NewDiscussionForm {
  title: string
  categoryId: string
  content: string
}

// Extension of the Discussion interface with UI fields
interface DiscussionWithAuthor extends Discussion {
  authorName: string
  formattedDate: string
  replyCount: number
  likeCount: number
  preview: string
}

interface CreatePostDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreatePost: (post: DiscussionWithAuthor) => void
  categories: ForumCategory[]
}

export function CreatePostDialog({ 
  isOpen, 
  onClose, 
  onCreatePost,
  categories 
}: CreatePostDialogProps) {
  const [form, setForm] = useState<NewDiscussionForm>({
    title: "",
    categoryId: categories.length > 0 ? categories[1].category_id : "", // Skip "All" category
    content: ""
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setForm((prev) => ({ ...prev, categoryId: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title || !form.content) return

    const now = new Date().toISOString()
    
    // Create a new discussion object
    const newDiscussion: DiscussionWithAuthor = {
      discussion_id: uuidv4(),
      title: form.title,
      content: form.content,
      author_id: "current-user", // In a real app, this would come from auth
      author_type: "student" as UserRole, // In a real app, this would come from auth
      category_id: form.categoryId,
      is_pinned: false,
      is_closed: false,
      is_anonymous: false,
      view_count: 0,
      created_at: now,
      updated_at: now,
      // UI-specific fields
      authorName: "Current User",
      formattedDate: "Just now",
      replyCount: 0,
      likeCount: 0,
      preview: form.content.substring(0, 100) + (form.content.length > 100 ? "..." : "")
    }
    
    onCreatePost(newDiscussion)
    
    // Reset form
    setForm({
      title: "",
      categoryId: categories.length > 0 ? categories[1].category_id : "",
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
              value={form.categoryId} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(category => category.category_id !== "all") // Exclude "All" from selection options
                  .map(category => (
                    <SelectItem 
                      key={category.category_id} 
                      value={category.category_id}
                    >
                      {category.name}
                    </SelectItem>
                  ))
                }
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