import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Sign in anonymously for guest users
   */
  static async signInAnonymously() {
    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Get current session
   */
  static async getSession() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    return data.session
  }

  /**
   * Get current user
   */
  static async getUser() {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      throw new Error(error.message)
    }

    return data.user
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Update password
   */
  static async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Convert anonymous user to permanent account
   */
  static async convertAnonymousUser(email: string, password: string, displayName?: string) {
    const { error } = await supabase.auth.updateUser({
      email,
      password,
      data: {
        display_name: displayName
      }
    })

    if (error) {
      throw new Error(error.message)
    }
  }
}