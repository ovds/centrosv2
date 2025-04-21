"use client"

import { useRouter } from "next/navigation"
import { 
  UserButton,
  useUser,
  SignedIn,
  SignOutButton
} from "@clerk/nextjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function UserNav() {
  const router = useRouter()
  const { user } = useUser()

  return (
    <SignedIn>
      <UserButton
        userProfileMode="navigation"
        userProfileUrl="/profile"
        appearance={{
          elements: {
            userButtonAvatarBox: "h-8 w-8"
          }
        }}
      />
    </SignedIn>
  )
}