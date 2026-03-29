import {
  createFallbackEventsRepository,
  createIndexedDbEventsRepository,
  createSupabaseAuthRepository,
  createSupabaseEventsRepository,
} from "@targetless/adapters-web";
import { createEventsUsecases } from "@targetless/core";
import type {
  CompleteEventInput,
  CompleteRecordInput,
  CreateEventInput,
  CreateRecordInput,
  EventsFilter,
  EventsSortField,
  EventsSortOrder,
  EventsStats,
  ListEventsParams,
  UpdateEventTitleInput,
} from "@targetless/domain";
import { router } from "react-query-kit";

import { supabase } from "../supabase";

export type { EventsFilter, EventsSortField, EventsSortOrder };
export type { ListEventsParams };

const authRepository = createSupabaseAuthRepository(supabase);
const eventsRepository = createFallbackEventsRepository({
  remote: createSupabaseEventsRepository(supabase),
  local: createIndexedDbEventsRepository(),
  isLoggedIn: () => authRepository.isLoggedIn(),
});
const eventsUsecases = createEventsUsecases(eventsRepository);

export const eventsApi = router(["events"], {
  list: router.query({
    fetcher: async (params?: ListEventsParams) => eventsUsecases.list(params),
  }),
  stats: router.query({
    fetcher: async (): Promise<EventsStats> => eventsUsecases.stats(),
  }),
  detail: router.query({
    fetcher: async ({ eventId }: { eventId: string }) => eventsUsecases.detail(eventId),
  }),
  create: router.mutation({
    mutationFn: async (input: CreateEventInput) => eventsUsecases.create(input),
  }),
  complete: router.mutation({
    mutationFn: async (input: CompleteEventInput) => eventsUsecases.complete(input),
  }),
  completeRecord: router.mutation({
    mutationFn: async (input: CompleteRecordInput) => eventsUsecases.completeRecord(input),
  }),
  createRecord: router.mutation({
    mutationFn: async (input: CreateRecordInput) => eventsUsecases.createRecord(input),
  }),
  delete: router.mutation({
    mutationFn: async (eventId: string) => eventsUsecases.delete(eventId),
  }),
  updateTitle: router.mutation({
    mutationFn: async (input: UpdateEventTitleInput) => eventsUsecases.updateTitle(input),
  }),
});
