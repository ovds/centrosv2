"use client"

import { RedirectToSignUp } from "@clerk/nextjs"

export default function RegisterPage() {
  return (
    <RedirectToSignUp redirectUrl="/dashboard" />
  )
}