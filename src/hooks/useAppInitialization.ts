import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://localhost:8000',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

interface InitializationState {
  isInitialized: boolean
  isInitializing: boolean
  error: string | null
  adminCreated: boolean
}

const SHOP_CONFIG = {
  adminEmail: 'admin@laptop-repair-shop.local',
  adminPassword: 'AdminPass123!',
  adminName: 'Shop Manager',
  adminRole: 'shop_owner'
}

export function useAppInitialization() {
  const [state, setState] = useState<InitializationState>({
    isInitialized: false,
    isInitializing: false,
    error: null,
    adminCreated: false
  })

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 5
    const retryDelay = 3000 // 3 seconds

    const initializeApp = async () => {
      if (state.isInitializing || state.isInitialized) return

      setState(prev => ({ ...prev, isInitializing: true, error: null }))

      // Wait a bit for services to be fully ready
      if (retryCount === 0) {
        console.log('🔧 Waiting for services to be ready...')
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds on first try
      }

      try {
        console.log('🔧 Initializing Laptop Repair Shop...')

        // Check if admin user already exists by trying to sign in
        const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
          email: SHOP_CONFIG.adminEmail,
          password: SHOP_CONFIG.adminPassword
        })

        if (existingUser?.user && !signInError) {
          console.log('✅ Admin user already exists')

          // Sign out the auto-login attempt
          await supabase.auth.signOut()

          if (isMounted) {
            setState(prev => ({
              ...prev,
              isInitialized: true,
              isInitializing: false,
              adminCreated: true
            }))
          }
          return
        }

        // Admin doesn't exist, create it
        console.log('👤 Creating shop owner admin account...')

        const { data: newUser, error: signUpError } = await supabase.auth.signUp({
          email: SHOP_CONFIG.adminEmail,
          password: SHOP_CONFIG.adminPassword,
          options: {
            data: {
              full_name: SHOP_CONFIG.adminName,
              role: SHOP_CONFIG.adminRole
            }
          }
        })

        if (signUpError) {
          // Check if it's because user already exists
          if (signUpError.message.includes('already registered')) {
            console.log('✅ Admin user already exists (signup indicated)')
            if (isMounted) {
              setState(prev => ({
                ...prev,
                isInitialized: true,
                isInitializing: false,
                adminCreated: true
              }))
            }
            return
          }
          throw signUpError
        }

        if (newUser?.user) {
          console.log('✅ Shop owner admin account created successfully!')
          console.log('📧 Email:', SHOP_CONFIG.adminEmail)
          console.log('🔑 Password:', SHOP_CONFIG.adminPassword)

          // Sign out the auto-created user
          await supabase.auth.signOut()
        }

        if (isMounted) {
          setState(prev => ({
            ...prev,
            isInitialized: true,
            isInitializing: false,
            adminCreated: true
          }))
        }

      } catch (error: any) {
        console.error('❌ App initialization failed:', error)

        // Retry on 503 errors or network issues
        const shouldRetry = (
          error.message?.includes('503') ||
          error.message?.includes('Service Temporarily Unavailable') ||
          error.message?.includes('Failed to fetch') ||
          error.name?.includes('AuthRetryableFetchError')
        ) && retryCount < maxRetries

        if (shouldRetry && isMounted) {
          retryCount++
          console.log(`🔄 Retrying initialization (${retryCount}/${maxRetries}) in ${retryDelay/1000} seconds...`)
          setTimeout(() => {
            if (isMounted) {
              setState(prev => ({ ...prev, isInitializing: false }))
              initializeApp()
            }
          }, retryDelay)
        } else if (isMounted) {
          setState(prev => ({
            ...prev,
            isInitializing: false,
            error: retryCount >= maxRetries
              ? `Failed to connect to services after ${maxRetries} attempts. Please wait a moment and refresh the page.`
              : error.message || 'Failed to initialize app'
          }))
        }
      }
    }

    initializeApp()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    ...state,
    adminCredentials: state.adminCreated ? {
      email: SHOP_CONFIG.adminEmail,
      password: SHOP_CONFIG.adminPassword,
      name: SHOP_CONFIG.adminName,
      role: SHOP_CONFIG.adminRole
    } : null
  }
}