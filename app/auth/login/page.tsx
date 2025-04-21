"use client"

import { RedirectToSignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <RedirectToSignIn redirectUrl="/dashboard" />
  )
}