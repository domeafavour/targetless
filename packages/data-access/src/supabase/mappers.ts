import type { EventEntity, EventRecord, EventWithCurrentRecord } from "@targetless/domain";
import { attachCurrentRecord } from "@targetless/domain";
import type { Database } from "./supabase-types.ts";

type DbEventRow = Database["public"]["Tables"]["events"]["Row"] & {
  current_record: Database["public"]["Tables"]["records"]["Row"] | null;
};

type DbRecordRow = Database["public"]["Tables"]["records"]["Row"];

export function mapRecord(row: DbRecordRow): EventRecord {
  return {
    id: row.id + "",
    completed: !!row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    eventId: row.event_id + "",
    count: row.count ?? 0,
    note: row.note,
  };
}

export function mapEvent(row: DbEventRow): EventWithCurrentRecord {
  const entity: EventEntity = {
    id: row.id + "",
    completed: !!row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title ?? "",
    currentRecordId: row.current_record_id ? row.current_record_id + "" : null,
  };
  const records = row.current_record ? [mapRecord(row.current_record)] : [];
  return attachCurrentRecord(entity, records);
}
