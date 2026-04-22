import {
  getCurrentUser,
  isLoggedIn,
  signIn,
  signOut,
  signUp,
} from "@targetless/data-access";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { hasSupabaseConfig, getSupabaseConfigErrorMessage } from "./env";
import { requireSupabaseClient } from "./supabase";

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
}

export const authQueryKeys = {
  status: ["auth", "status"] as const,
  user: ["auth", "user"] as const,
};

export function useAuthStatusQuery() {
  return useQuery({
    queryKey: authQueryKeys.status,
    queryFn: () => {
      if (!hasSupabaseConfig) {
        return false;
      }
      return isLoggedIn(requireSupabaseClient());
    },
  });
}

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: () => getCurrentUser(requireSupabaseClient()),
    enabled: enabled && hasSupabaseConfig,
  });
}

export function useSignInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: SignInInput) => {
      if (!hasSupabaseConfig) {
        throw new Error(getSupabaseConfigErrorMessage());
      }
      return signIn(requireSupabaseClient(), email, password);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: authQueryKeys.status }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.user }),
      ]);
    },
  });
}

export function useSignUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: SignUpInput) => {
      if (!hasSupabaseConfig) {
        throw new Error(getSupabaseConfigErrorMessage());
      }
      return signUp(requireSupabaseClient(), email, password);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: authQueryKeys.status }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.user }),
      ]);
    },
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!hasSupabaseConfig) {
        throw new Error(getSupabaseConfigErrorMessage());
      }
      return signOut(requireSupabaseClient());
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: authQueryKeys.status }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.user }),
      ]);
      queryClient.removeQueries({ queryKey: ["events"] });
    },
  });
}
