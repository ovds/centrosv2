"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { useSupabaseAdminAuth } from "@/context/supabase-admin-auth-context"
import { motion } from "framer-motion"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useSupabaseAdminAuth()
  const router = useRouter()

  useEffect(() => {
    // If not loading and not authenticated, redirect to admin login
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAuthenticated, isLoading, router])
  
  // Additional check to ensure we stay in the admin area
  useEffect(() => {
    // If authenticated and the path isn't in the admin area (might happen due to global redirects)
    if (isAuthenticated && !router.pathname?.startsWith('/admin')) {
      router.push("/admin/dashboard")
    }
  }, [isAuthenticated, router])

  // If still loading or not authenticated, show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <AdminHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}