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
import { normaliseNote } from "@targetless/domain";
import type { EventsRepository } from "../repositories/events-repository.ts";
import type { SupabaseClient } from "./client.ts";
import { getSessionUser } from "./auth.ts";
import { mapEvent, mapRecord } from "./mappers.ts";
import type { Database } from "./supabase-types.ts";

export function createSupabaseEventsRepository(
  supabase: SupabaseClient,
): EventsRepository {
  async function list(params?: ListEventsParams): Promise<EventWithCurrentRecord[]> {
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

    const dbSortField =
      params?.sortField === "updatedAt" ? "updated_at" : "created_at";
    const ascending = params?.sortOrder === "asc";
    const { data } = await query
      .order(dbSortField, { ascending })
      .throwOnError();

    return (data ?? []).map(mapEvent);
  }

  async function getStats(): Promise<EventsStats> {
    const user = await getSessionUser(supabase);
    const { data } = await supabase
      .from("events")
      .select("completed")
      .eq("creator_id", user.id)
      .throwOnError();

    const total = data.length;
    const completed = data.filter((e) => e.completed).length;
    return { total, active: total - completed, completed };
  }

  async function getById(eventId: string): Promise<EventDetail> {
    const user = await getSessionUser(supabase);
    const eventRes = await supabase
      .from("events")
      .select("*,current_record:records!events_current_record_id_fkey(*)")
      .eq("id", +eventId)
      .eq("creator_id", user.id)
      .single()
      .throwOnError();

    const recordsRes = await supabase
      .from("records")
      .select("*")
      .eq("event_id", +eventId)
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false })
      .throwOnError();

    return {
      ...mapEvent(eventRes.data),
      records: recordsRes.data.map(mapRecord),
    };
  }

  async function create(input: CreateEventInput): Promise<EventWithCurrentRecord> {
    const user = await getSessionUser(supabase);
    const newEvent = await supabase
      .from("events")
      .insert({ creator_id: user.id, title: input.title })
      .select()
      .single()
      .throwOnError();

    const initialRecord = await supabase
      .from("records")
      .insert({ event_id: newEvent.data.id, creator_id: user.id, count: input.count })
      .select()
      .single()
      .throwOnError();

    await supabase
      .from("events")
      .update({ current_record_id: initialRecord.data.id })
      .eq("id", newEvent.data.id)
      .eq("creator_id", user.id)
      .throwOnError();

    return {
      id: newEvent.data.id + "",
      completed: false,
      createdAt: newEvent.data.created_at,
      updatedAt: newEvent.data.updated_at,
      title: newEvent.data.title ?? "",
      currentRecordId: initialRecord.data.id + "",
      currentRecord: mapRecord(initialRecord.data),
    };
  }

  async function completeEvent(input: CompleteEventInput): Promise<EventWithCurrentRecord> {
    const user = await getSessionUser(supabase);
    await supabase
      .from("events")
      .update({ completed: true, updated_at: new Date().toISOString() })
      .eq("id", +input.eventId)
      .eq("creator_id", user.id)
      .throwOnError();
    return getById(input.eventId) as Promise<EventWithCurrentRecord>;
  }

  async function completeRecord(input: CompleteRecordInput): Promise<EventWithCurrentRecord> {
    const user = await getSessionUser(supabase);
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

    const note = normaliseNote(input.note);
    const recordUpdate: Database["public"]["Tables"]["records"]["Update"] = {
      completed: true,
      updated_at: new Date().toISOString(),
    };
    if (note) recordUpdate.note = note;

    await supabase
      .from("records")
      .update(recordUpdate)
      .eq("creator_id", user.id)
      .eq("id", +event.data.current_record_id)
      .throwOnError();

    if (input.createNext) {
      if (typeof input.nextCount === "undefined") {
        throw new Error("nextCount must be provided when createNext is true");
      }
      await createRecord({ eventId: input.eventId, count: input.nextCount });
    }

    return getById(input.eventId) as Promise<EventWithCurrentRecord>;
  }

  async function createRecord(input: CreateRecordInput): Promise<EventWithCurrentRecord> {
    const user = await getSessionUser(supabase);
    const note = normaliseNote(input.note);
    const now = new Date().toISOString();

    const newRecord = await supabase
      .from("records")
      .insert({
        event_id: +input.eventId,
        count: input.count,
        note: note ?? undefined,
        creator_id: user.id,
        created_at: now,
      })
      .select()
      .single()
      .throwOnError();

    await supabase
      .from("events")
      .update({ current_record_id: newRecord.data.id, updated_at: now })
      .eq("creator_id", user.id)
      .eq("id", +input.eventId)
      .throwOnError();

    return getById(input.eventId) as Promise<EventWithCurrentRecord>;
  }

  async function updateTitle(input: UpdateEventTitleInput): Promise<EventWithCurrentRecord> {
    const user = await getSessionUser(supabase);
    const title = input.title.trim();
    if (!title) throw new Error("Title is required");

    await supabase
      .from("events")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", +input.eventId)
      .eq("creator_id", user.id)
      .throwOnError();

    return getById(input.eventId) as Promise<EventWithCurrentRecord>;
  }

  async function deleteEvent(eventId: string): Promise<void> {
    const user = await getSessionUser(supabase);
    await supabase
      .from("events")
      .delete()
      .eq("id", +eventId)
      .eq("creator_id", user.id)
      .throwOnError();
  }

  return { list, getStats, getById, create, completeEvent, completeRecord, createRecord, updateTitle, delete: deleteEvent };
}
