'use client'

import { useState, useEffect } from 'react'
import { AuthService, type AuthState } from '@/lib/auth'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signInAnonymously: () => Promise<void>
  signOut: () => Promise<void>
  convertAnonymousUser: (email: string, password: string, displayName?: string) => Promise<void>
} {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    AuthService.getSession().then((session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await AuthService.signIn(email, password)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    try {
      await AuthService.signUp(email, password, displayName)
    } finally {
      setLoading(false)
    }
  }

  const signInAnonymously = async () => {
    setLoading(true)
    try {
      await AuthService.signInAnonymously()
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
    } finally {
      setLoading(false)
    }
  }

  const convertAnonymousUser = async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    try {
      await AuthService.convertAnonymousUser(email, password, displayName)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInAnonymously,
    signOut,
    convertAnonymousUser
  }
}