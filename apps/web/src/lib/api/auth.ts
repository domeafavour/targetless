import { createSupabaseAuthRepository } from "@targetless/adapters-web";
import { createAuthUsecases } from "@targetless/core";
import { router } from "react-query-kit";

import { supabase } from "../supabase";

export interface AuthState {
  user: unknown | null;
  loading: boolean;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
}

const authUsecases = createAuthUsecases(createSupabaseAuthRepository(supabase));

export async function signIn(input: SignInInput) {
  return authUsecases.signIn(input);
}

export async function signUp(input: SignUpInput) {
  return authUsecases.signUp(input);
}

export async function signOut() {
  return authUsecases.signOut();
}

export async function getCurrentUser() {
  return authUsecases.getCurrentUser();
}

export async function isLoggedIn() {
  return authUsecases.isLoggedIn();
}

export const authApi = router(["auth"], {
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
});
