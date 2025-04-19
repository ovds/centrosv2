"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Menu, Search, Settings, User, LogOut } from "lucide-react"
import { useSupabaseAdminAuth } from "@/context/supabase-admin-auth-context"
import { cn } from "@/lib/utils"

export function AdminHeader() {
  const { counsellor, logout } = useSupabaseAdminAuth()
  const pathname = usePathname()

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
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
                <Link href="/admin/dashboard" className="flex items-center py-4">
                  <span className="font-bold text-xl">Counsellor Portal</span>
                </Link>
                <div className="flex flex-col space-y-3 mt-2">
                  <Link 
                    href="/admin/dashboard" 
                    className={cn(
                      "flex items-center text-sm font-medium px-2 py-1.5 rounded-md hover:bg-accent",
                      pathname === "/admin/dashboard" ? "bg-accent" : ""
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/admin/appointments" 
                    className={cn(
                      "flex items-center text-sm font-medium px-2 py-1.5 rounded-md hover:bg-accent",
                      pathname === "/admin/appointments" ? "bg-accent" : ""
                    )}
                  >
                    My Appointments
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 flex items-center justify-between">
          <div className="hidden md:flex md:items-center">
            <Link href="/admin/dashboard" className="mr-6 font-bold text-lg">
              Counsellor Portal
            </Link>
            <nav className="flex items-center space-x-4 lg:space-x-6">
              <Link
                href="/admin/dashboard"
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/admin/dashboard" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/appointments"
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/admin/appointments" ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                My Appointments
              </Link>
            </nav>
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
            {counsellor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {counsellor.profile_picture_url ? (
                        <AvatarImage src={counsellor.profile_picture_url} alt={counsellor.name} />
                      ) : null}
                      <AvatarFallback>{getInitials(counsellor.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{counsellor.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {counsellor.email}
                      </p>
                      <p className="text-xs italic text-muted-foreground">
                        {counsellor.title || counsellor.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}