"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { signIn as serverSignIn, signUp as serverSignUp, signOut as serverSignOut } from '@/app/actions/authentication/auth'
import useOrgStore from '@/app/stores/UseOrgStore'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{
    error: string | null
    success: boolean
  }>
  signUp: (email: string, password: string) => Promise<{
    error: string | null
    success: boolean
  }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { setOrganization } = useOrgStore()

  useEffect(() => {
    // Get session and user on mount
    const getInitialSession = async () => {
      setIsLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Set organization in Zustand store when user is loaded
      if (user?.user_metadata?.organization) {
        setOrganization(user.user_metadata.organization)
      } else {
        // Fallback for users without organization metadata
        setOrganization('DearCare')
      }
      
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user || null)
        
        // Update organization when auth state changes
        if (session?.user?.user_metadata?.organization) {
          setOrganization(session.user.user_metadata.organization)
        } else if (event === 'SIGNED_OUT') {
          setOrganization(null)
        } else if (session?.user && event === 'SIGNED_IN') {
          // Fallback for users without organization metadata
          setOrganization('DearCare')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, setOrganization])

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    
    try {
      const result = await serverSignIn(formData)
      
      // If sign in successful, refresh session to get updated user data
      if (result.success) {
        await supabase.auth.refreshSession()
      }
      
      return result
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return { error: errorMessage, success: false }
    }
  }

  const signUp = async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    try {
      return await serverSignUp(formData)
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return { error: errorMessage, success: false }
    }
  }

  const signOut = async () => {
    await serverSignOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}