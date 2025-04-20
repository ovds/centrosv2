"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase, getCurrentUser, signOut, registerUser, resetPassword, updateUserProfile } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Session } from "@supabase/supabase-js"
import { UserProfile } from "@/types/supabase"

type AuthContextType = {
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  signInWithAzure: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  const { toast } = useToast()

  // Load auth state on mount and set up listener for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsAuthenticated(!!session)
      if (session) {
        // Get user profile
        loadUserProfile()
      }
      setIsLoading(false)
    })

    // Set up auth listener
    const { data: { subscription }} = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setIsAuthenticated(!!session)
      
      if (session) {
        await loadUserProfile()
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Load user profile data
  const loadUserProfile = async () => {
    try {
      const userData = await getCurrentUser()
      if (userData) {
        setUser(userData)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  // Login function with Supabase Auth
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Registration function with Supabase Auth
  const register = async (name: string, email: string, password: string, role: string = 'student') => {
    try {
      setIsLoading(true)
      
      // Validate role (default to student if invalid)
      const validRole = ['student', 'counsellor', 'admin'].includes(role) ? role : 'student';
      
      // Register user with Supabase Auth
      const { success, error, userId } = await registerUser(
        email, 
        password, 
        validRole as 'student' | 'counsellor' | 'admin',
        { name }
      );
      
      if (!success) {
        return { success: false, error: error || 'Registration failed' }
      }
      
      // Show email verification message
      toast({
        title: "Verification email sent",
        description: "Please check your email to verify your account"
      })
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    await signOut()
    setUser(null)
    setIsLoading(false)
    router.push('/auth/login')
  }
  
  // Reset password
  const resetPasswordFn = async (email: string) => {
    try {
      const { success, error } = await resetPassword(email);
      
      if (!success) {
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // Update user profile
  const updateProfileFn = async (data: Partial<UserProfile>) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    
    try {
      // Update profile in database
      const { success, error } = await updateUserProfile(
        user.id,
        user.role,
        data
      );
      
      if (!success) {
        return { success: false, error };
      }
      
      // Update local state
      setUser({ ...user, ...data })
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Sign in with Azure (OAuth)
  const signInWithAzure = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email',
        },
      })
      if (error) {
        toast({
          title: 'Azure sign-in failed',
          description: error.message,
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Azure sign-in failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      session,
      isLoading,
      login, 
      register, 
      logout,
      resetPassword: resetPasswordFn,
      updateProfile: updateProfileFn,
      signInWithAzure
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}