"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"

interface Counsellor {
  id: string
  name: string
  email: string
  role: string
}

type AdminAuthContextType = {
  isAuthenticated: boolean
  counsellor: Counsellor | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signInWithAzure: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [counsellor, setCounsellor] = useState<Counsellor | null>(null)

  // Load auth state on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("adminIsAuthenticated")
    if (storedAuth === "true") {
      setIsAuthenticated(true)
      
      // Retrieve counsellor data from localStorage
      const storedCounsellor = localStorage.getItem("adminCounsellor")
      if (storedCounsellor) {
        setCounsellor(JSON.parse(storedCounsellor))
      }
    }
  }, [])

  // Mock counsellors data - in a real app, this would come from a database
  const counsellors = [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      email: "sarah.chen@nushigh.edu.sg",
      password: "password123", // In a real app, passwords would be hashed
      role: "Senior Academic Counsellor"
    },
    {
      id: "2",
      name: "Mr. David Tan",
      email: "david.tan@nushigh.edu.sg",
      password: "password123",
      role: "Career Guidance Counsellor"
    },
    {
      id: "3",
      name: "Ms. Rachel Wong",
      email: "rachel.wong@nushigh.edu.sg",
      password: "password123",
      role: "Personal Development Counsellor"
    }
  ]

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call
    const foundCounsellor = counsellors.find(c => c.email === email && c.password === password)
    
    if (foundCounsellor) {
      const { password, ...counsellorWithoutPassword } = foundCounsellor
      
      setIsAuthenticated(true)
      setCounsellor(counsellorWithoutPassword)
      
      localStorage.setItem("adminIsAuthenticated", "true")
      localStorage.setItem("adminCounsellor", JSON.stringify(counsellorWithoutPassword))
      
      return true
    }
    
    return false
  }

  // Logout function
  const logout = () => {
    setIsAuthenticated(false)
    setCounsellor(null)
    localStorage.removeItem("adminIsAuthenticated")
    localStorage.removeItem("adminCounsellor")
  }

  // Azure OAuth sign-in for admin
  const signInWithAzure = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: { scopes: "email" },
      })
    } catch (error) {
      // Optionally handle error with toast
      console.error("Azure sign-in failed", error)
    }
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, counsellor, login, logout, signInWithAzure }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// Custom hook to use admin auth context
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}