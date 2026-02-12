import { router } from 'react-query-kit'
import { supabase } from '../supabase'

export interface AuthState {
  user: any | null
  loading: boolean
}

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
}

// Helper function for login
export async function signIn(input: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })
  if (error) throw error
  return data
}

// Helper function for signup
export async function signUp(input: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  })
  if (error) throw error
  return data
}

// Helper function for logout
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current user
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const authApi = router(['auth'], {
  getCurrentUser: router.query({
    fetcher: () => getCurrentUser(),
  }),
  signIn: router.mutation({
    mutationFn: (input: SignInInput) => signIn(input),
  }),
  signUp: router.mutation({
    mutationFn: (input: SignUpInput) => signUp(input),
  }),
  signOut: router.mutation({
    mutationFn: () => signOut(),
  }),
})
