'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from '@/types/types'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface ForumAuthState {
  isLoading: boolean
  isAuthenticated: boolean
  userRole: UserRole | null
  userEmail: string | null
  userName: string | null
  canModerate: boolean
}

export function useForumAuth() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [authState, setAuthState] = useState<ForumAuthState>({
    isLoading: true,
    isAuthenticated: false,
    userRole: null,
    userEmail: null,
    userName: null,
    canModerate: false
  })

  useEffect(() => {
    async function fetchUserRole() {
      if (!isLoaded || !isSignedIn || !user?.emailAddresses?.[0]?.emailAddress) {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          userRole: null,
          userEmail: null,
          userName: null,
          canModerate: false
        })
        return
      }

      const email = user.emailAddresses[0].emailAddress
      
      try {
        // Fetch user role from database
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .single()
        
        if (error) {
          console.error('Error fetching user role:', error)
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            userRole: null,
            userEmail: email,
            userName: user.fullName || 'User',
            canModerate: false
          })
          return
        }
        
        // Counsellors and admins can moderate the forum
        const canModerate = data.role === 'counsellor' || data.role === 'admin'
        
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          userRole: data.role as UserRole,
          userEmail: email,
          userName: user.fullName || 'User',
          canModerate
        })
      } catch (error) {
        console.error('Error in authentication check:', error)
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          userRole: null,
          userEmail: email,
          userName: user.fullName || 'User',
          canModerate: false
        })
      }
    }

    fetchUserRole()
  }, [isLoaded, isSignedIn, user])

  // Check if current user is the author of a post/reply
  const isAuthor = (authorEmail: string) => {
    return authorEmail === authState.userEmail
  }

  // Check if user can delete a post/reply
  // Counsellors and admins can delete any content, students can only delete their own
  const canDelete = (authorEmail: string) => {
    return authState.canModerate || isAuthor(authorEmail)
  }

  return {
    ...authState,
    isAuthor,
    canDelete
  }
}
