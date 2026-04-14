import {
  createIndexedDbEventsRepository,
  createSupabaseEventsRepository,
  isLoggedIn,
} from "@targetless/data-access";
import type {
  CompleteEventInput,
  CompleteRecordInput,
  CreateEventInput,
  CreateRecordInput,
  EventDetail,
  EventWithCurrentRecord,
  EventsStats,
  ListEventsParams,
  UpdateEventTitleInput,
} from "@targetless/domain";
import { router } from "react-query-kit";
import { supabase } from "../env";

const localRepository = createIndexedDbEventsRepository();
const remoteRepository = createSupabaseEventsRepository(supabase);

async function resolveRepository() {
  const loggedIn = await isLoggedIn(supabase);
  return loggedIn ? remoteRepository : localRepository;
}

export const eventsApi = router(["events"], {
  list: router.query({
    fetcher: async (
      params?: ListEventsParams,
    ): Promise<EventWithCurrentRecord[]> => {
      const repository = await resolveRepository();
      return repository.list(params);
    },
  }),
  stats: router.query({
    fetcher: async (): Promise<EventsStats> => {
      const repository = await resolveRepository();
      return repository.getStats();
    },
  }),
  detail: router.query({
    fetcher: async ({ eventId }: { eventId: string }): Promise<EventDetail> => {
      const repository = await resolveRepository();
      return repository.getById(eventId);
    },
  }),
  create: router.mutation({
    mutationFn: async (input: CreateEventInput) => {
      const repository = await resolveRepository();
      return repository.create(input);
    },
  }),
  complete: router.mutation({
    mutationFn: async (input: CompleteEventInput) => {
      const repository = await resolveRepository();
      return repository.completeEvent(input);
    },
  }),
  completeRecord: router.mutation({
    mutationFn: async (input: CompleteRecordInput) => {
      const repository = await resolveRepository();
      return repository.completeRecord(input);
    },
  }),
  createRecord: router.mutation({
    mutationFn: async (input: CreateRecordInput) => {
      const repository = await resolveRepository();
      return repository.createRecord(input);
    },
  }),
  delete: router.mutation({
    mutationFn: async (eventId: string) => {
      const repository = await resolveRepository();
      return repository.delete(eventId);
    },
  }),
  updateTitle: router.mutation({
    mutationFn: async (input: UpdateEventTitleInput) => {
      const repository = await resolveRepository();
      return repository.updateTitle(input);
    },
  }),
});
