"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Session, User, AuthError } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

interface Counsellor {
  id: string
  user_id: string
  name: string
  email: string
  role: string
  title?: string
  specialization?: string
  office_location?: string
  contact_number?: string
  office_hours?: string
  profile_picture_url?: string
  availability_schedule?: any
}

type SupabaseAdminAuthContextType = {
  user: User | null
  counsellor: Counsellor | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  signInWithMicrosoft: () => Promise<void>
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

  // Fetch or create counsellor data from the database
  const fetchCounsellorData = async (userId: string) => {
    try {
      // First, check if user exists in Users table
      const { data: existingUser, error: userError } = await supabase
        .from('Users')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Get user data from auth
      const { data: authData } = await supabase.auth.getUser(userId)
      const user = authData?.user
      
      if (!existingUser && user) {
        // Create user record in Users table
        const { error: createUserError } = await supabase
          .from('Users')
          .insert({
            user_id: userId,
            email: user.email || '',
            password_hash: '**********', // Placeholder
            role: 'counsellor',
            is_active: true,
            email_verified: user.email_confirmed_at ? true : false
          })
        
        if (createUserError) {
          console.error("Error creating user record:", createUserError)
          return
        }
      }
      
      // Now check if counsellor record exists
      const { data: counsellorRecord, error } = await supabase
        .from('Counsellor')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is the 'not found' error code
        console.error("Error fetching counsellor data:", error.message)
        return
      }

      if (counsellorRecord) {
        // Counsellor exists, set the data
        const counsellorData: Counsellor = {
          id: counsellorRecord.user_id,
          user_id: counsellorRecord.user_id,
          name: counsellorRecord.name,
          email: user?.email || '',
          role: counsellorRecord.title || 'Counsellor',
          title: counsellorRecord.title,
          specialization: counsellorRecord.specialization,
          office_location: counsellorRecord.office_location,
          contact_number: counsellorRecord.contact_number,
          office_hours: counsellorRecord.office_hours,
          profile_picture_url: counsellorRecord.profile_picture_url,
          availability_schedule: counsellorRecord.availability_schedule
        }
        
        setCounsellor(counsellorData)
      } else if (user) {
        // Create a new counsellor record
        const nameFromAuth = user.user_metadata?.name || 
                            user.user_metadata?.full_name || 
                            user.email?.split('@')[0] || 
                            'Counsellor'

        const { data: newCounsellor, error: createError } = await supabase
          .from('Counsellor')
          .insert({
            user_id: userId,
            name: nameFromAuth,
            title: 'Counsellor',
            profile_picture_url: user.user_metadata?.avatar_url || null
          })
          .select()
          .single()

        if (createError) {
          console.error("Error creating counsellor record:", createError)
          return
        }

        // Set the newly created counsellor data
        if (newCounsellor) {
          const counsellorData: Counsellor = {
            id: newCounsellor.user_id,
            user_id: newCounsellor.user_id,
            name: newCounsellor.name,
            email: user.email || '',
            role: newCounsellor.title || 'Counsellor',
            title: newCounsellor.title,
            specialization: newCounsellor.specialization,
            office_location: newCounsellor.office_location,
            contact_number: newCounsellor.contact_number,
            office_hours: newCounsellor.office_hours,
            profile_picture_url: newCounsellor.profile_picture_url,
            availability_schedule: newCounsellor.availability_schedule
          }
          
          setCounsellor(counsellorData)
          
          toast({
            title: "Account Created",
            description: "Your counsellor account has been successfully created.",
          })
        } else {
          // Something went wrong, log them out
          await logout()
          toast({
            title: "Account Creation Failed",
            description: "Unable to create your counsellor account.",
            variant: "destructive"
          })
        }
      } else {
        // No user data, log them out
        await logout()
        toast({
          title: "Authentication Error",
          description: "Unable to retrieve your account information.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Unexpected error handling counsellor data:", error)
      
      // On error, log out for safety
      await logout()
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Check if user exists in the Users table first
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        
        // If user doesn't exist in Users table, create them
        if (userError) {
          // Create user in Users table
          const { error: createUserError } = await supabase
            .from('Users')
            .insert({
              user_id: data.user.id,
              email: email,
              password_hash: '**********', // Placeholder, actual password is handled by Supabase Auth
              role: 'counsellor',
              is_active: true,
              email_verified: true // They're signed in, so we can mark as verified
            })
          
          if (createUserError) {
            console.error('Error creating user record:', createUserError)
            await supabase.auth.signOut()
            return { success: false, error: "Failed to set up user account" }
          }
        }

        // Check if the user is a counsellor
        const { data: counsellorData, error: counsellorError } = await supabase
          .from('Counsellor')
          .select('*')
          .eq('user_id', data.user.id)
          .single()

        if (counsellorError || !counsellorData) {
          // User is not in Counsellor table yet, create a record
          const nameFromAuth = data.user.user_metadata?.name || data.user.user_metadata?.full_name || 'Counsellor';
          const { error: createCounsellorError } = await supabase
            .from('Counsellor')
            .insert({
              user_id: data.user.id,
              name: nameFromAuth,
              title: 'Counsellor',
              profile_picture_url: data.user.user_metadata?.avatar_url || null
            })
          
          if (createCounsellorError) {
            console.error('Error creating counsellor record:', createCounsellorError)
            await supabase.auth.signOut()
            return { 
              success: false, 
              error: "Failed to create counsellor account" 
            }
          }
          
          // Fetch the newly created counsellor data
          const { data: newCounsellorData } = await supabase
            .from('Counsellor')
            .select('*')
            .eq('user_id', data.user.id)
            .single()
            
          if (newCounsellorData) {
            // Set the counsellor data
            const { data: userData } = await supabase.auth.getUser(data.user.id)
            
            const counsellorData: Counsellor = {
              id: newCounsellorData.user_id,
              user_id: newCounsellorData.user_id,
              name: newCounsellorData.name,
              email: userData?.user?.email || email,
              role: newCounsellorData.title || 'Counsellor',
              title: newCounsellorData.title,
              specialization: newCounsellorData.specialization,
              office_location: newCounsellorData.office_location,
              contact_number: newCounsellorData.contact_number,
              office_hours: newCounsellorData.office_hours,
              profile_picture_url: newCounsellorData.profile_picture_url,
              availability_schedule: newCounsellorData.availability_schedule
            }
            
            setCounsellor(counsellorData)
          }
        }

        return { success: true }
      }
      
      return { success: false, error: "Login failed" }
    } catch (error: any) {
      console.error("Login error:", error)
      return { success: false, error: error.message || "An unexpected error occurred" }
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

  // Microsoft OAuth sign-in with account creation
  const signInWithMicrosoft = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: { 
          scopes: "email user.read profile",
          queryParams: {
            // Restrict to school domain if needed
            // domain_hint: 'nushigh.edu.sg',
            prompt: 'login'
          },
          redirectTo: `${window.location.origin}/admin/dashboard`
        },
      })
      
      if (error) {
        toast({
          title: "Microsoft login failed",
          description: error.message,
          variant: "destructive"
        })
      }
      
      // Microsoft OAuth callback will create the account via onAuthStateChange
      // which triggers our fetchCounsellorData function that handles account creation
      
    } catch (error: any) {
      toast({
        title: "Microsoft login failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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
        signInWithMicrosoft,
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