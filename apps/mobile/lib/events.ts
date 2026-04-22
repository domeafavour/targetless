import { createSupabaseEventsRepository } from "@targetless/data-access";
import type {
  CompleteEventInput,
  CompleteRecordInput,
  CreateEventInput,
  CreateRecordInput,
  ListEventsParams,
  UpdateEventTitleInput,
} from "@targetless/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseConfigErrorMessage, hasSupabaseConfig } from "./env";
import { requireSupabaseClient } from "./supabase";

export const eventQueryKeys = {
  all: ["events"] as const,
  list: (params: ListEventsParams) => ["events", "list", params] as const,
  stats: ["events", "stats"] as const,
  detail: (eventId: string) => ["events", "detail", eventId] as const,
};

function getRepository() {
  if (!hasSupabaseConfig) {
    throw new Error(getSupabaseConfigErrorMessage());
  }
  return createSupabaseEventsRepository(requireSupabaseClient());
}

export function useEventsListQuery(params: ListEventsParams, enabled = true) {
  return useQuery({
    queryKey: eventQueryKeys.list(params),
    queryFn: () => getRepository().list(params),
    enabled: enabled && hasSupabaseConfig,
  });
}

export function useEventStatsQuery(enabled = true) {
  return useQuery({
    queryKey: eventQueryKeys.stats,
    queryFn: () => getRepository().getStats(),
    enabled: enabled && hasSupabaseConfig,
  });
}

export function useEventDetailQuery(eventId: string, enabled = true) {
  return useQuery({
    queryKey: eventQueryKeys.detail(eventId),
    queryFn: () => getRepository().getById(eventId),
    enabled: enabled && !!eventId && hasSupabaseConfig,
  });
}

export function useCreateEventMutation() {
  return useMutation({
    mutationFn: (input: CreateEventInput) => getRepository().create(input),
  });
}

export function useCompleteEventMutation() {
  return useMutation({
    mutationFn: (input: CompleteEventInput) =>
      getRepository().completeEvent(input),
  });
}

export function useCompleteRecordMutation() {
  return useMutation({
    mutationFn: (input: CompleteRecordInput) =>
      getRepository().completeRecord(input),
  });
}

export function useCreateRecordMutation() {
  return useMutation({
    mutationFn: (input: CreateRecordInput) => getRepository().createRecord(input),
  });
}

export function useUpdateTitleMutation() {
  return useMutation({
    mutationFn: (input: UpdateEventTitleInput) =>
      getRepository().updateTitle(input),
  });
}

export function useDeleteEventMutation() {
  return useMutation({
    mutationFn: (eventId: string) => getRepository().delete(eventId),
  });
}

export function useInvalidateEventQueries() {
  const queryClient = useQueryClient();
  return async (eventId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.stats }),
      eventId
        ? queryClient.invalidateQueries({
            queryKey: eventQueryKeys.detail(eventId),
          })
        : Promise.resolve(),
    ]);
  };
}
