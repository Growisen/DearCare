"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { signIn as serverSignIn, signUp as serverSignUp, signOut as serverSignOut } from '@/app/actions/auth'

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

  useEffect(() => {
    // Get session and user on mount
    const getInitialSession = async () => {
      setIsLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user || null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    
    try {
      return await serverSignIn(formData)
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