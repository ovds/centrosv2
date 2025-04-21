import { discussionsData } from "../data"
import { Discussion } from "@/types/types"
import DiscussionDetailClient from "@/app/forum/[slug]/DiscussionDetailClient"

// This function is needed for static site generation with dynamic routes
export function generateStaticParams() {
  return discussionsData.map((discussion) => ({
    slug: discussion.discussion_id,
  }))
}

interface PageProps {
  params: { slug: string }
}

export default function DiscussionDetailPage({ params }: PageProps) {
  const discussion = discussionsData.find((d) => d.discussion_id === params.slug)
  return <DiscussionDetailClient initialDiscussion={discussion} />
}