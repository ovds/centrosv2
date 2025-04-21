"use client"

import { SiteHeader } from "@/components/layout/site-header"
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs"

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <SignedIn>
                <div className="relative flex min-h-screen flex-col">
                    <SiteHeader />
                    <main className="flex-1">{children}</main>
                </div>
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    )
}