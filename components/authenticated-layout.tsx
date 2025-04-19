"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/layout/site-header"
import { useAuth } from "@/context/auth-context"

export default function AuthenticatedLayout({
                                                children,
                                            }: {
    children: React.ReactNode
}) {
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // If not authenticated, redirect to login
        if (!isAuthenticated) {
            router.push("/auth/login")
            return
        }
        
        // If authenticated as a counsellor, redirect to admin dashboard
        // This ensures counsellors don't end up in the student interface
        if (user?.role === 'counsellor') {
            router.push("/admin/dashboard")
        }
    }, [isAuthenticated, router, user])

    // If authentication is still being determined, show a blank page
    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
        </div>
    )
}