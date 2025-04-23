import { getDiscussionWithReplies } from "@/lib/db"
import { Discussion, DiscussionReply } from "@/types/types"
import DiscussionDetailClient from "@/app/forum/[slug]/DiscussionDetailClient"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for server component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Get discussions for static paths
export async function generateStaticParams() {
  try {
    const { data } = await supabase
      .from('discussion')
      .select('discussion_id')
      .limit(10) // Limit to recent discussions
    
    return (data || []).map((discussion) => ({
      slug: discussion.discussion_id,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

interface PageProps {
  params: { slug: string }
}

export default async function DiscussionDetailPage({ params }: PageProps) {
  let discussion: Discussion | undefined
  let replies: DiscussionReply[] = []
  
  try {
    // Fetch discussion and replies
    const data = await getDiscussionWithReplies(params.slug)
    discussion = data.discussion
    replies = data.replies
  } catch (error) {
    console.error("Error fetching discussion:", error)
    // Will show not found state in the client component
  }
  
  return <DiscussionDetailClient initialDiscussion={discussion} initialReplies={replies} />
}