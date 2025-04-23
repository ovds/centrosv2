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
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createDiscussion } from "@/lib/db"
import { Discussion, ForumCategory, UserRole } from "@/types/types"

// Form interface for creating a new discussion
interface NewDiscussionForm {
  title: string
  categoryId: string
  content: string
}

interface CreatePostDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreatePost: (post: Discussion) => void
  categories: ForumCategory[]
  userEmail: string
  userRole: UserRole
}

export function CreatePostDialog({ 
  isOpen, 
  onClose, 
  onCreatePost,
  categories,
  userEmail,
  userRole
}: CreatePostDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<NewDiscussionForm>({
    title: "",
    categoryId: categories.length > 1 ? categories[1].forum_category_name : "", // Skip "All" category
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title || !form.content || !form.categoryId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (!userEmail) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a post",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      // Create discussion in the database
      const newDiscussion = await createDiscussion({
        title: form.title,
        content: form.content,
        author_email: userEmail,
        author_type: userRole,
        forum_category_name: form.categoryId,
        is_pinned: false,
        is_closed: false
      })
      
      // Pass new discussion to parent component
      onCreatePost(newDiscussion)
      
      // Reset form
      setForm({
        title: "",
        categoryId: categories.length > 1 ? categories[1].forum_category_name : "",
        content: ""
      })
      
      // Close dialog
      onClose()
    } catch (error) {
      console.error("Error creating discussion:", error)
      toast({
        title: "Error",
        description: "Failed to create discussion. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
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
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select 
              value={form.categoryId} 
              onValueChange={handleCategoryChange}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(category => category.forum_category_name !== "all") // Exclude "All" from selection options
                  .map(category => (
                    <SelectItem 
                      key={category.forum_category_name} 
                      value={category.forum_category_name}
                    >
                      {category.forum_category_name}
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
              disabled={isSubmitting}
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Post Discussion"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}