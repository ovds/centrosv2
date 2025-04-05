import { discussionsData } from "../data"
import { Discussion } from "../types"
import DiscussionDetailClient from "@/app/forum/[slug]/DiscussionDetailClient"

// This function is needed for static site generation with dynamic routes
export function generateStaticParams() {
  return discussionsData.map((discussion) => ({
    slug: discussion.slug,
  }))
}

interface PageProps {
  params: { slug: string }
}

export default function DiscussionDetailPage({ params }: PageProps) {
  const discussion = discussionsData.find((d) => d.slug === params.slug)
  return <DiscussionDetailClient initialDiscussion={discussion} />
} 