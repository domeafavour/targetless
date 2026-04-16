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

/**
 * Repository contract for all event and record persistence operations.
 * Both the Supabase and IndexedDB adapters implement this interface.
 */
export interface EventsRepository {
  list(params?: ListEventsParams): Promise<EventWithCurrentRecord[]>;
  getStats(): Promise<EventsStats>;
  getById(eventId: string): Promise<EventDetail>;
  create(input: CreateEventInput): Promise<EventWithCurrentRecord>;
  completeEvent(input: CompleteEventInput): Promise<EventWithCurrentRecord>;
  completeRecord(input: CompleteRecordInput): Promise<EventWithCurrentRecord>;
  createRecord(input: CreateRecordInput): Promise<EventWithCurrentRecord>;
  updateTitle(input: UpdateEventTitleInput): Promise<EventWithCurrentRecord>;
  delete(eventId: string): Promise<void>;
}
