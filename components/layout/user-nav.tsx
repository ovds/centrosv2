"use client"

import { useRouter } from "next/navigation"
import { 
  UserButton,
  useUser,
  SignedIn,
} from "@clerk/nextjs"

export function UserNav() {

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