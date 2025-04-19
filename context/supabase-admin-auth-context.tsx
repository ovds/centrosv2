"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Session, User, AuthError } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"
import { Database } from "@/types/supabase"

interface Counsellor {
  id: string
  name: string
  email: string
  role: string
  title?: string
  specialization?: string
  profile_picture_url?: string
}

type SupabaseAdminAuthContextType = {
  user: User | null
  counsellor: Counsellor | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const SupabaseAdminAuthContext = createContext<SupabaseAdminAuthContextType | undefined>(undefined)

export function SupabaseAdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [counsellor, setCounsellor] = useState<Counsellor | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get session from Supabase
    const getSession = async () => {
      setIsLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error.message)
          return
        }
        
        if (session) {
          setSession(session)
          setUser(session.user)
          setIsAuthenticated(true)
          
          // Fetch counsellor data
          await fetchCounsellorData(session.user.id)
        }
      } catch (error) {
        console.error("Unexpected error during getSession:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsAuthenticated(!!session)
        
        if (session?.user) {
          await fetchCounsellorData(session.user.id)
        } else {
          setCounsellor(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch counsellor data from the database
  const fetchCounsellorData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Counsellor')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error("Error fetching counsellor data:", error.message)
        return
      }

      if (data) {
        // Get user email from auth.users
        const { data: userData } = await supabase.auth.getUser(userId)
        
        const counsellorData: Counsellor = {
          id: data.user_id,
          name: data.name,
          email: userData?.user?.email || '',
          role: data.title || 'Counsellor',
          title: data.title,
          specialization: data.specialization,
          profile_picture_url: data.profile_picture_url
        }
        
        setCounsellor(counsellorData)
      }
    } catch (error) {
      console.error("Unexpected error fetching counsellor data:", error)
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        })
        return false
      }

      if (data.user) {
        // Check if the user is a counsellor
        const { data: counsellorData, error: counsellorError } = await supabase
          .from('Counsellor')
          .select('*')
          .eq('user_id', data.user.id)
          .single()

        if (counsellorError || !counsellorData) {
          // User is not a counsellor
          await supabase.auth.signOut()
          toast({
            title: "Access denied",
            description: "You do not have counsellor privileges",
            variant: "destructive"
          })
          return false
        }

        // User is a counsellor
        const counsellorInfo: Counsellor = {
          id: counsellorData.user_id,
          name: counsellorData.name,
          email: data.user.email || '',
          role: counsellorData.title || 'Counsellor',
          title: counsellorData.title,
          specialization: counsellorData.specialization,
          profile_picture_url: counsellorData.profile_picture_url
        }

        setUser(data.user)
        setSession(data.session)
        setCounsellor(counsellorInfo)
        setIsAuthenticated(true)
        
        return true
      }
      
      return false
    } catch (error) {
      console.error("Unexpected error during login:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setCounsellor(null)
      setIsAuthenticated(false)
      router.push("/admin/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <SupabaseAdminAuthContext.Provider
      value={{
        user,
        counsellor,
        session,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </SupabaseAdminAuthContext.Provider>
  )
}

// Custom hook to use Supabase admin auth context
export function useSupabaseAdminAuth() {
  const context = useContext(SupabaseAdminAuthContext)
  if (context === undefined) {
    throw new Error("useSupabaseAdminAuth must be used within a SupabaseAdminAuthProvider")
  }
  return context
}