"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert"
import { AlertCircle, LockKeyhole } from "lucide-react"
import { useSupabaseAdminAuth } from "@/context/supabase-admin-auth-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const { login, signInWithMicrosoft, isLoading, isAuthenticated } = useSupabaseAdminAuth()

  const router = useRouter()
  // If already authenticated, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, router])
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage("Please fill in all fields")
      return
    }

    try {
      const { success, error } = await login(email, password)

      if (!success) {
        setErrorMessage(error || "Invalid email or password")
        return
      }

      toast({
        title: "Success",
        description: "You have been logged in to the Counsellor Portal",
      })

      // Ensure redirection to admin dashboard after login
      router.push("/admin/dashboard")
    } catch (error: any) {
      setErrorMessage("An unexpected error occurred")
      console.error("Login error:", error)
    }
  }

  const handleMicrosoftLogin = async () => {
    try {
      await signInWithMicrosoft()
      
      // We won't manually redirect here as the auth state change will trigger navigation
      // In the auth context's useEffect hook that watches for authentication changes
    } catch (error: any) {
      setErrorMessage("Microsoft login failed. Please try again.")
      console.error("Microsoft login error:", error)
    } 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-[380px]">
          <form onSubmit={handleSubmit}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LockKeyhole className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Counsellor Login</CardTitle>
              <CardDescription>
                Sign in to access the Counsellor Portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="counsellor@nushigh.edu.sg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                className="w-full" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <Button
                className="w-full"
                type="button"
                variant="outline"
                onClick={handleMicrosoftLogin}
                disabled={isLoading}
              >
                Sign in with Microsoft
              </Button>
              <div className="text-xs text-center text-muted-foreground">
                For testing purposes, ensure you have a counsellor account in the Supabase database
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}