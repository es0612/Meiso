'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { AuthState } from '@/lib/auth'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signInAnonymously: () => Promise<void>
  signOut: () => Promise<void>
  convertAnonymousUser: (email: string, password: string, displayName?: string) => Promise<void>
  isAnonymous: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()
  
  const isAnonymous = auth.user?.is_anonymous ?? false

  const contextValue: AuthContextType = {
    ...auth,
    isAnonymous
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Export individual hooks for convenience
export function useUser(): User | null {
  const { user } = useAuthContext()
  return user
}

export function useSession(): Session | null {
  const { session } = useAuthContext()
  return session
}

export function useAuthLoading(): boolean {
  const { loading } = useAuthContext()
  return loading
}