import type {
  EventWithCurrentRecord,
  EventDetail,
  EventsStats,
  ListEventsParams,
  CreateEventInput,
  CompleteEventInput,
  CreateRecordInput,
  CompleteRecordInput,
  UpdateEventTitleInput,
  EventEntity,
  EventRecord,
} from "@targetless/domain";
import {
  attachCurrentRecord,
  filterEvents,
  sortEvents,
  validateTitle,
  validateCount,
  normaliseNote,
} from "@targetless/domain";
import type { EventsRepository } from "../repositories/events-repository.ts";
import {
  DB_EVENTS_STORE,
  DB_RECORDS_STORE,
  readState,
  runTransaction,
  requestToPromise,
  deleteRecordsByEvent,
  generateId,
} from "./db.ts";

export function createIndexedDbEventsRepository(): EventsRepository {
  return {
    async list(params?: ListEventsParams): Promise<EventWithCurrentRecord[]> {
      const snapshot = await readState();
      const filtered = filterEvents(snapshot.events, params?.filter);
      const sorted = sortEvents(
        filtered,
        params?.sortField ?? "createdAt",
        params?.sortOrder ?? "desc",
      );
      return sorted.map((event) => attachCurrentRecord(event, snapshot.records));
    },

    async getStats(): Promise<EventsStats> {
      const snapshot = await readState();
      const total = snapshot.events.length;
      const completed = snapshot.events.filter((e) => e.completed).length;
      const active = total - completed;
      return { total, active, completed };
    },

    async getById(eventId: string): Promise<EventDetail> {
      const snapshot = await readState();
      const event = snapshot.events.find((item) => item.id === eventId);
      if (!event) {
        throw new Error("Event not found");
      }
      const records = snapshot.records
        .filter((record) => record.eventId === eventId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      return {
        ...attachCurrentRecord(event, snapshot.records),
        records,
      };
    },

    async create(input: CreateEventInput): Promise<EventWithCurrentRecord> {
      const title = validateTitle(input.title);
      const count = validateCount(input.count);
      const now = new Date().toISOString();
      const eventId = generateId();
      const recordId = generateId();

      const event: EventEntity = {
        id: eventId,
        title,
        createdAt: now,
        updatedAt: now,
        currentRecordId: recordId,
        completed: false,
      };
      const record: EventRecord = {
        id: recordId,
        eventId,
        createdAt: now,
        updatedAt: now,
        count,
        completed: false,
      };

      await runTransaction(
        [DB_EVENTS_STORE, DB_RECORDS_STORE],
        "readwrite",
        (stores) => {
          stores[DB_EVENTS_STORE].put(event);
          stores[DB_RECORDS_STORE].put(record);
        },
      );

      return attachCurrentRecord(event, [record]);
    },

    async completeEvent(
      input: CompleteEventInput,
    ): Promise<EventWithCurrentRecord> {
      const event = await runTransaction(
        [DB_EVENTS_STORE, DB_RECORDS_STORE],
        "readwrite",
        async (stores) => {
          const eventsStore = stores[DB_EVENTS_STORE];
          const existingEvent =
            (await requestToPromise<EventEntity | undefined>(
              eventsStore.get(input.eventId),
            )) ?? null;
          if (!existingEvent) throw new Error("Event not found");
          const now = new Date().toISOString();
          const updatedEvent: EventEntity = {
            ...existingEvent,
            updatedAt: now,
            completed: true,
          };
          eventsStore.put(updatedEvent);
          return updatedEvent;
        },
      );
      return attachCurrentRecord(event, []);
    },

    async completeRecord(
      input: CompleteRecordInput,
    ): Promise<EventWithCurrentRecord> {
      const { event, currentRecord } = await runTransaction(
        [DB_EVENTS_STORE, DB_RECORDS_STORE],
        "readwrite",
        async (stores) => {
          const eventsStore = stores[DB_EVENTS_STORE];
          const recordsStore = stores[DB_RECORDS_STORE];

          const existingEvent =
            (await requestToPromise<EventEntity | undefined>(
              eventsStore.get(input.eventId),
            )) ?? null;
          if (!existingEvent) throw new Error("Event not found");
          if (!existingEvent.currentRecordId)
            throw new Error("There is no active record to complete");

          const existingRecord =
            (await requestToPromise<EventRecord | undefined>(
              recordsStore.get(existingEvent.currentRecordId),
            )) ?? null;
          if (!existingRecord)
            throw new Error("Current record could not be located");

          const now = new Date().toISOString();
          const note = normaliseNote(input.note) ?? existingRecord.note ?? null;
          const completedRecord: EventRecord = {
            ...existingRecord,
            completed: true,
            updatedAt: now,
            note,
          };
          recordsStore.put(completedRecord);

          let nextCurrentRecordId: string | null = null;
          let nextRecord: EventRecord | null = null;
          if (input.createNext) {
            const nextCount = Number.isFinite(input.nextCount)
              ? Number(input.nextCount)
              : 0;
            nextRecord = {
              id: generateId(),
              eventId: existingEvent.id,
              createdAt: now,
              updatedAt: now,
              count: nextCount,
              completed: false,
            };
            recordsStore.put(nextRecord);
            nextCurrentRecordId = nextRecord.id;
          }

          const updatedEvent: EventEntity = {
            ...existingEvent,
            updatedAt: now,
            currentRecordId: nextCurrentRecordId,
          };
          eventsStore.put(updatedEvent);
          return { event: updatedEvent, currentRecord: nextRecord };
        },
      );
      return attachCurrentRecord(event, currentRecord ? [currentRecord] : []);
    },

    async createRecord(
      input: CreateRecordInput,
    ): Promise<EventWithCurrentRecord> {
      const count = validateCount(input.count);
      const note = normaliseNote(input.note);

      const { event, record } = await runTransaction(
        [DB_EVENTS_STORE, DB_RECORDS_STORE],
        "readwrite",
        async (stores) => {
          const eventsStore = stores[DB_EVENTS_STORE];
          const recordsStore = stores[DB_RECORDS_STORE];

          const existingEvent =
            (await requestToPromise<EventEntity | undefined>(
              eventsStore.get(input.eventId),
            )) ?? null;
          if (!existingEvent) throw new Error("Event not found");
          if (existingEvent.currentRecordId)
            throw new Error("There is already an active record");

          const now = new Date().toISOString();
          const newRecord: EventRecord = {
            id: generateId(),
            eventId: existingEvent.id,
            createdAt: now,
            updatedAt: now,
            count,
            completed: false,
            note: note || null,
          };
          recordsStore.put(newRecord);

          const updatedEvent: EventEntity = {
            ...existingEvent,
            updatedAt: now,
            currentRecordId: newRecord.id,
          };
          eventsStore.put(updatedEvent);
          return { event: updatedEvent, record: newRecord };
        },
      );
      return attachCurrentRecord(event, [record]);
    },

    async updateTitle(
      input: UpdateEventTitleInput,
    ): Promise<EventWithCurrentRecord> {
      const title = validateTitle(input.title);

      const { event, currentRecord } = await runTransaction(
        [DB_EVENTS_STORE, DB_RECORDS_STORE],
        "readwrite",
        async (stores) => {
          const eventsStore = stores[DB_EVENTS_STORE];
          const recordsStore = stores[DB_RECORDS_STORE];

          const existingEvent =
            (await requestToPromise<EventEntity | undefined>(
              eventsStore.get(input.eventId),
            )) ?? null;
          if (!existingEvent) throw new Error("Event not found");

          const now = new Date().toISOString();
          const updatedEvent: EventEntity = {
            ...existingEvent,
            title,
            updatedAt: now,
          };
          eventsStore.put(updatedEvent);

          const record = existingEvent.currentRecordId
            ? ((await requestToPromise<EventRecord | undefined>(
                recordsStore.get(existingEvent.currentRecordId),
              )) ?? null)
            : null;

          return { event: updatedEvent, currentRecord: record };
        },
      );
      return attachCurrentRecord(event, currentRecord ? [currentRecord] : []);
    },

    async delete(eventId: string): Promise<void> {
      await runTransaction(
        [DB_EVENTS_STORE, DB_RECORDS_STORE],
        "readwrite",
        async (stores) => {
          const eventsStore = stores[DB_EVENTS_STORE];
          const recordsStore = stores[DB_RECORDS_STORE];

          const existingEvent =
            (await requestToPromise<EventEntity | undefined>(
              eventsStore.get(eventId),
            )) ?? null;
          if (!existingEvent) throw new Error("Event not found");

          eventsStore.delete(eventId);
          await deleteRecordsByEvent(recordsStore, eventId);
        },
      );
    },
  };
}
