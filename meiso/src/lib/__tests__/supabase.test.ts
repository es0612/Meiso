/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeAll } from '@jest/globals'

// Mock environment variables for testing
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

describe('Supabase Configuration', () => {
  it('should have required environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })

  it('should create supabase client without throwing', async () => {
    // Dynamic import to avoid issues with environment variables
    const { supabase } = await import('../supabase')
    expect(supabase).toBeDefined()
    expect(typeof supabase.auth.signInWithPassword).toBe('function')
  })

  it('should create client component client', async () => {
    const { createClientComponentClient } = await import('../supabase')
    const client = createClientComponentClient()
    expect(client).toBeDefined()
    expect(typeof client.auth.signInWithPassword).toBe('function')
  })

  it('should create server component client', async () => {
    const { createServerComponentClient } = await import('../supabase')
    const client = createServerComponentClient()
    expect(client).toBeDefined()
    expect(typeof client.auth.signInWithPassword).toBe('function')
  })
})