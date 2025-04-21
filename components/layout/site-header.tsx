"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/layout/user-nav"
import { MainNav } from "@/components/layout/main-nav"
import { Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <SignedIn>
          <div className="mr-4 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="px-2">
                  <Link href="/dashboard" className="flex items-center py-4">
                    <span className="font-bold text-xl">NUS High</span>
                  </Link>
                  <div className="flex flex-col space-y-3 mt-2">
                    <Link href="/dashboard" className="flex items-center text-sm font-medium px-2 py-1.5 rounded-md hover:bg-accent">
                      Dashboard
                    </Link>
                    <Link href="/appointments" className="flex items-center text-sm font-medium px-2 py-1.5 rounded-md hover:bg-accent">
                      Appointments
                    </Link>
                    <Link href="/resources" className="flex items-center text-sm font-medium px-2 py-1.5 rounded-md hover:bg-accent">
                      Resources
                    </Link>
                    <Link href="/forum" className="flex items-center text-sm font-medium px-2 py-1.5 rounded-md hover:bg-accent">
                      Forum
                    </Link>
                    <Link href="/counsellors" className="flex items-center text-sm font-medium px-2 py-1.5 rounded-md hover:bg-accent">
                      Counsellors
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 flex items-center justify-between">
            <div className="hidden md:flex md:items-center">
              <MainNav />
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search..."
                    className="pl-8 w-[200px] lg:w-[250px]"
                />
              </div>
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </SignedIn>

        <SignedOut>
          <div className="flex-1 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl">NUS High</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign Up</Button>
              </SignUpButton>
            </div>
          </div>
        </SignedOut>
      </div>
    </header>
  )
}