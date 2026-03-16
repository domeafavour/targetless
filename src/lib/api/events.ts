import { router } from "react-query-kit";

import {
  completeEvent,
  completeRecord,
  createEvent,
  createRecord,
  deleteEvent,
  EventDetail,
  EventRecord,
  EventsFilter,
  EventsSortField,
  EventsSortOrder,
  EventWithCurrentRecord,
  getEvent,
  getEventsStats,
  listEvents,
  updateEventTitle,
  type CompleteEventInput,
  type CompleteRecordInput,
  type CreateEventInput,
  type CreateRecordInput,
  type EventsStats,
  type UpdateEventTitleInput,
} from "@/lib/event-store";
import { supabase } from "../supabase";
import { isLoggedIn } from "./auth";
import { Database } from "./supabase.types";

export type ListEventsParams = {
  filter?: EventsFilter;
  sortField?: EventsSortField;
  sortOrder?: EventsSortOrder;
};

function transformEventRecord(
  e: Database["public"]["Tables"]["records"]["Row"],
): EventRecord {
  return {
    id: e.id + "",
    completed: !!e.completed,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    eventId: e.event_id + "",
    count: e.count ?? 0,
    note: e.note,
  };
}

async function getSessionUser() {
  const session = await supabase.auth.getSession();
  if (session.error) {
    throw session.error;
  }
  if (!session.data.session) {
    throw new Error("No active session");
  }
  return session.data.session.user;
}

async function fetchListApi(params?: ListEventsParams) {
  const user = await getSessionUser();
  let query = supabase
    .from("events")
    .select("*,current_record:records!events_current_record_id_fkey(*)")
    .eq("creator_id", user.id);

  // Apply filter
  if (params?.filter === "active") {
    query = query.eq("completed", false);
  } else if (params?.filter === "completed") {
    query = query.eq("completed", true);
  }
  // "total" or undefined means no filter

  const dbSortField = params?.sortField === "updatedAt" ? "updated_at" : "created_at";
  const ascending = params?.sortOrder === "asc";
  const { data } = await query
    .order(dbSortField, { ascending })
    .throwOnError();

  const list: EventWithCurrentRecord[] = data.map((e) => {
    return {
      id: e.id + "",
      completed: !!e.completed,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
      title: e.title ?? "",
      currentRecord: e.current_record
        ? transformEventRecord(e.current_record)
        : null,
      currentRecordId: e.current_record_id ? e.current_record_id + "" : null,
    };
  });
  return list;
}

async function fetchDetailApi(eventId: string | number) {
  const user = await getSessionUser();
  const event = await supabase
    .from("events")
    .select("*,current_record:records!events_current_record_id_fkey(*)")
    .eq("id", +eventId)
    .eq("creator_id", user.id)
    .single()
    .throwOnError();

  const records = await supabase
    .from("records")
    .select("*")
    .eq("event_id", +eventId)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })
    .throwOnError();

  const detail: EventDetail = {
    id: event.data.id + "",
    completed: !!event.data.completed,
    createdAt: event.data.created_at,
    updatedAt: event.data.updated_at,
    title: event.data.title ?? "",
    currentRecord: event.data.current_record
      ? transformEventRecord(event.data.current_record)
      : null,
    currentRecordId: event.data.current_record_id
      ? event.data.current_record_id + ""
      : null,
    records: records.data.map(transformEventRecord),
  };
  return detail;
}

async function createEventApi(input: CreateEventInput) {
  // get session user
  const user = await getSessionUser();
  const newEvent = await supabase
    .from("events")
    .insert({
      creator_id: user.id,
      title: input.title,
    })
    .eq("creator_id", user.id)
    .select()
    .single()
    .throwOnError();

  const initialRecord = await supabase
    .from("records")
    .insert({
      event_id: newEvent.data.id,
      creator_id: user.id,
      count: input.count,
    })
    .eq("creator_id", user.id)
    .select()
    .single()
    .throwOnError();

  // update event's current_record_id
  await supabase
    .from("events")
    .update({ current_record_id: initialRecord.data.id })
    .eq("id", newEvent.data.id)
    .eq("creator_id", user.id)
    .throwOnError();
}

async function createEventRecordApi(input: CreateRecordInput) {
  const user = await getSessionUser();
  const note = input.note?.trim() ?? "";
  const newRecord = await supabase
    .from("records")
    .insert({
      event_id: +input.eventId,
      count: input.count,
      note: note || null,
      creator_id: user.id,
    })
    .eq("creator_id", user.id)
    .select()
    .single()
    .throwOnError();
  await supabase
    .from("events")
    .update({
      current_record_id: newRecord.data.id,
      updated_at: new Date().toISOString(),
    })
    .eq("creator_id", user.id)
    .eq("id", +input.eventId)
    .throwOnError();
}

async function completeEventApi(input: CompleteEventInput) {
  const user = await getSessionUser();
  await supabase
    .from("events")
    .update({ completed: true })
    .eq("id", +input.eventId)
    .eq("creator_id", user.id)
    .throwOnError();
}

async function completeRecordApi(input: CompleteRecordInput) {
  const user = await getSessionUser();
  const note = input.note?.trim() ?? "";
  const event = await supabase
    .from("events")
    .select()
    .eq("id", +input.eventId)
    .eq("creator_id", user.id)
    .single()
    .throwOnError();
  if (!event.data.current_record_id) {
    throw new Error("No current record to complete");
  }
  const recordUpdate: Database["public"]["Tables"]["records"]["Update"] = {
    completed: true,
  };
  if (note) {
    recordUpdate.note = note;
  }

  await supabase
    .from("records")
    .update(recordUpdate)
    .eq("creator_id", user.id)
    .eq("id", +event.data.current_record_id)
    .throwOnError();
  if (!input.createNext) {
    return;
  }
  if (typeof input.nextCount === "undefined") {
    throw new Error("Next count must be provided when createNext is true");
  }
  return await createEventRecordApi({
    eventId: input.eventId,
    count: input.nextCount,
  });
}

async function updateEventTitleApi(input: UpdateEventTitleInput) {
  const user = await getSessionUser();
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }
  await supabase
    .from("events")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", +input.eventId)
    .eq("creator_id", user.id)
    .throwOnError();
}

async function deleteEventApi(eventId: string | number) {
  const user = await getSessionUser();
  await supabase
    .from("events")
    .delete()
    .eq("id", +eventId)
    .eq("creator_id", user.id)
    .throwOnError();
}

async function apiOr<T extends () => Promise<any>>(
  api: T,
  local: T,
): Promise<Awaited<ReturnType<T>>> {
  try {
    const loggedIn = await isLoggedIn();
    if (loggedIn) {
      return await api();
    }
    return await local();
  } catch (error) {
    return await local();
  }
}

async function fetchStatsApi(): Promise<EventsStats> {
  const user = await getSessionUser();
  const { data } = await supabase
    .from("events")
    .select("completed")
    .eq("creator_id", user.id)
    .throwOnError();

  const total = data.length;
  const completed = data.filter((e) => e.completed).length;
  const active = total - completed;

  return { total, active, completed };
}

export const eventsApi = router(["events"], {
  list: router.query({
    fetcher: async (params?: ListEventsParams) =>
      apiOr(
        () => fetchListApi(params),
        () => listEvents(params),
      ),
  }),
  stats: router.query({
    fetcher: async () =>
      apiOr(
        () => fetchStatsApi(),
        () => getEventsStats(),
      ),
  }),
  detail: router.query({
    fetcher: async ({ eventId }: { eventId: string }) =>
      apiOr(
        () => fetchDetailApi(eventId),
        () => getEvent(eventId),
      ),
  }),
  create: router.mutation({
    mutationFn: async (input: CreateEventInput) => {
      return apiOr(
        () => createEventApi(input),
        () => createEvent(input) as any,
      );
    },
  }),
  complete: router.mutation({
    mutationFn: async (input: CompleteEventInput) => {
      return apiOr(
        () => completeEventApi(input),
        () => completeEvent(input) as any,
      );
    },
  }),
  completeRecord: router.mutation({
    mutationFn: async (input: CompleteRecordInput) => {
      return apiOr(
        () => completeRecordApi(input),
        () => completeRecord(input) as any,
      );
    },
  }),
  createRecord: router.mutation({
    mutationFn: async (input: CreateRecordInput) => {
      return apiOr(
        () => createEventRecordApi(input),
        () => createRecord(input) as any,
      );
    },
  }),
  delete: router.mutation({
    mutationFn: async (eventId: string) => {
      return apiOr(
        () => deleteEventApi(eventId),
        () => deleteEvent(eventId),
      );
    },
  }),
  updateTitle: router.mutation({
    mutationFn: async (input: UpdateEventTitleInput) => {
      return apiOr(
        () => updateEventTitleApi(input),
        () => updateEventTitle(input) as any,
      );
    },
  }),
});
