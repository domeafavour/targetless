import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventsRepository } from "@targetless/core";
import type {
  CompleteEventInput,
  CompleteRecordInput,
  CreateEventInput,
  CreateRecordInput,
  EventDetail,
  EventRecord,
  EventWithCurrentRecord,
  EventsStats,
  ListEventsParams,
  UpdateEventTitleInput,
} from "@targetless/domain";
import { normalizeOptionalNote, normalizeTitle } from "@targetless/domain";

import type { Database } from "../supabase.types";

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

async function getSessionUser(supabase: SupabaseClient<Database>) {
  const session = await supabase.auth.getSession();
  if (session.error) {
    throw session.error;
  }
  if (!session.data.session) {
    throw new Error("No active session");
  }
  return session.data.session.user;
}

export function createSupabaseEventsRepository(
  supabase: SupabaseClient<Database>,
): EventsRepository {
  return {
    listEvents: (params?: ListEventsParams) => fetchListApi(supabase, params),
    getEventsStats: () => fetchStatsApi(supabase),
    getEvent: (eventId: string) => fetchDetailApi(supabase, eventId),
    createEvent: (input: CreateEventInput) => createEventApi(supabase, input),
    completeEvent: (input: CompleteEventInput) => completeEventApi(supabase, input),
    completeRecord: (input: CompleteRecordInput) => completeRecordApi(supabase, input),
    createRecord: (input: CreateRecordInput) => createEventRecordApi(supabase, input),
    deleteEvent: (eventId: string) => deleteEventApi(supabase, eventId),
    updateEventTitle: (input: UpdateEventTitleInput) => updateEventTitleApi(supabase, input),
  };
}

async function fetchListApi(
  supabase: SupabaseClient<Database>,
  params?: ListEventsParams,
): Promise<EventWithCurrentRecord[]> {
  const user = await getSessionUser(supabase);
  let query = supabase
    .from("events")
    .select("*,current_record:records!events_current_record_id_fkey(*)")
    .eq("creator_id", user.id);

  if (params?.filter === "active") {
    query = query.eq("completed", false);
  } else if (params?.filter === "completed") {
    query = query.eq("completed", true);
  }

  const dbSortField = params?.sortField === "updatedAt" ? "updated_at" : "created_at";
  const ascending = params?.sortOrder === "asc";
  const { data } = await query.order(dbSortField, { ascending }).throwOnError();

  return data.map((e) => {
    return {
      id: e.id + "",
      completed: !!e.completed,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
      title: e.title ?? "",
      currentRecord: e.current_record ? transformEventRecord(e.current_record) : null,
      currentRecordId: e.current_record_id ? e.current_record_id + "" : null,
    };
  });
}

async function fetchDetailApi(
  supabase: SupabaseClient<Database>,
  eventId: string | number,
): Promise<EventDetail> {
  const user = await getSessionUser(supabase);
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

  return {
    id: event.data.id + "",
    completed: !!event.data.completed,
    createdAt: event.data.created_at,
    updatedAt: event.data.updated_at,
    title: event.data.title ?? "",
    currentRecord: event.data.current_record ? transformEventRecord(event.data.current_record) : null,
    currentRecordId: event.data.current_record_id ? event.data.current_record_id + "" : null,
    records: records.data.map(transformEventRecord),
  };
}

async function createEventApi(
  supabase: SupabaseClient<Database>,
  input: CreateEventInput,
): Promise<EventWithCurrentRecord> {
  const user = await getSessionUser(supabase);
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

  await supabase
    .from("events")
    .update({ current_record_id: initialRecord.data.id })
    .eq("id", newEvent.data.id)
    .eq("creator_id", user.id)
    .throwOnError();

  return fetchEventWithCurrentRecord(supabase, String(newEvent.data.id), user.id);
}

async function createEventRecordApi(
  supabase: SupabaseClient<Database>,
  input: CreateRecordInput,
): Promise<EventWithCurrentRecord> {
  const user = await getSessionUser(supabase);
  const note = normalizeOptionalNote(input.note);
  const now = new Date().toISOString();
  const newRecord = await supabase
    .from("records")
    .insert({
      event_id: +input.eventId,
      count: input.count,
      note,
      creator_id: user.id,
      created_at: now,
    })
    .eq("creator_id", user.id)
    .select()
    .single()
    .throwOnError();

  await supabase
    .from("events")
    .update({
      current_record_id: newRecord.data.id,
      updated_at: now,
    })
    .eq("creator_id", user.id)
    .eq("id", +input.eventId)
    .throwOnError();

  return fetchEventWithCurrentRecord(supabase, input.eventId, user.id);
}

async function completeEventApi(
  supabase: SupabaseClient<Database>,
  input: CompleteEventInput,
): Promise<EventWithCurrentRecord> {
  const user = await getSessionUser(supabase);
  await supabase
    .from("events")
    .update({ completed: true, updated_at: new Date().toISOString() })
    .eq("id", +input.eventId)
    .eq("creator_id", user.id)
    .throwOnError();

  return fetchEventWithCurrentRecord(supabase, input.eventId, user.id);
}

async function completeRecordApi(
  supabase: SupabaseClient<Database>,
  input: CompleteRecordInput,
): Promise<EventWithCurrentRecord> {
  const user = await getSessionUser(supabase);
  const note = normalizeOptionalNote(input.note);
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
    updated_at: new Date().toISOString(),
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

  if (input.createNext && typeof input.nextCount === "undefined") {
    throw new Error("Next count must be provided when createNext is true");
  }

  if (input.createNext) {
    await createEventRecordApi(supabase, {
      eventId: input.eventId,
      count: input.nextCount!,
    });
  }

  return fetchEventWithCurrentRecord(supabase, input.eventId, user.id);
}

async function updateEventTitleApi(
  supabase: SupabaseClient<Database>,
  input: UpdateEventTitleInput,
): Promise<EventWithCurrentRecord> {
  const user = await getSessionUser(supabase);
  const title = normalizeTitle(input.title);
  if (!title) {
    throw new Error("Title is required");
  }
  await supabase
    .from("events")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", +input.eventId)
    .eq("creator_id", user.id)
    .throwOnError();

  return fetchEventWithCurrentRecord(supabase, input.eventId, user.id);
}

async function deleteEventApi(
  supabase: SupabaseClient<Database>,
  eventId: string | number,
): Promise<void> {
  const user = await getSessionUser(supabase);
  await supabase
    .from("events")
    .delete()
    .eq("id", +eventId)
    .eq("creator_id", user.id)
    .throwOnError();
}

async function fetchStatsApi(supabase: SupabaseClient<Database>): Promise<EventsStats> {
  const user = await getSessionUser(supabase);
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

async function fetchEventWithCurrentRecord(
  supabase: SupabaseClient<Database>,
  eventId: string,
  userId: string,
): Promise<EventWithCurrentRecord> {
  const event = await supabase
    .from("events")
    .select("*,current_record:records!events_current_record_id_fkey(*)")
    .eq("id", +eventId)
    .eq("creator_id", userId)
    .single()
    .throwOnError();

  return {
    id: event.data.id + "",
    completed: !!event.data.completed,
    createdAt: event.data.created_at,
    updatedAt: event.data.updated_at,
    title: event.data.title ?? "",
    currentRecord: event.data.current_record ? transformEventRecord(event.data.current_record) : null,
    currentRecordId: event.data.current_record_id ? event.data.current_record_id + "" : null,
  };
}
