import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "@targetless/core";

import type { Database } from "../supabase.types";

export function createSupabaseAuthRepository(
  supabase: SupabaseClient<Database>,
): AuthRepository {
  return {
    async signIn(input) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (error) throw error;
      return data;
    },
    async signUp(input) {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
      });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    async getCurrentUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    async isLoggedIn() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return !!session;
    },
  };
}
