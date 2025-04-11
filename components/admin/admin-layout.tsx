"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { useAdminAuth } from "@/context/admin-auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    // If not authenticated, redirect to admin login
    if (!isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAuthenticated, router])

  // If authentication is still being determined, show a blank page
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <AdminHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}