import {
  getCurrentUser,
  isLoggedIn,
  signIn,
  signOut,
  signUp,
} from "@targetless/data-access";
import { router } from "react-query-kit";
import { supabase } from "../env";

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
}

export const authApi = router(["auth"], {
  getCurrentUser: router.query({
    fetcher: () => getCurrentUser(supabase),
  }),
  isLoggedIn: router.query({
    fetcher: () => isLoggedIn(supabase),
  }),
  signIn: router.mutation({
    mutationFn: ({ email, password }: SignInInput) =>
      signIn(supabase, email, password),
  }),
  signUp: router.mutation({
    mutationFn: ({ email, password }: SignUpInput) =>
      signUp(supabase, email, password),
  }),
  signOut: router.mutation({
    mutationFn: () => signOut(supabase),
  }),
});
