export type EventRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  count: number;
  eventId: string;
  completed: boolean;
};

export type EventEntity = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  currentRecordId: string | null;
  completed: boolean;
};

export type EventWithCurrentRecord = EventEntity & {
  currentRecord: EventRecord | null;
};

export type EventDetail = EventWithCurrentRecord & {
  records: EventRecord[];
};

export type CreateEventInput = {
  title: string;
  count: number;
};

export type CompleteEventInput = {
  eventId: string;
};

export type CompleteRecordInput = {
  eventId: string;
  createNext: boolean;
  nextCount?: number;
};

export type CreateRecordInput = {
  eventId: string;
  count: number;
};

type State = {
  events: EventEntity[];
  records: EventRecord[];
};

const DB_NAME = "event-tracker-state";
const DB_VERSION = 2;
const DB_EVENTS_STORE = "events";
const DB_RECORDS_STORE = "records";

let dbPromise: Promise<IDBDatabase> | null = null;

export async function listEvents(): Promise<EventWithCurrentRecord[]> {
  const snapshot = await readState();
  const orderedEvents = [...snapshot.events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return orderedEvents.map((event) =>
    attachCurrentRecord(event, snapshot.records),
  );
}

export async function getEvent(eventId: string): Promise<EventDetail> {
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
}

export async function createEvent(
  input: CreateEventInput,
): Promise<EventWithCurrentRecord> {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const parsedCount = Number(input.count);
  if (!Number.isFinite(parsedCount) || parsedCount < 0) {
    throw new Error("Count must be a non-negative number");
  }

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
    count: parsedCount,
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
}

export async function completeEvent(
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
      if (!existingEvent) {
        throw new Error("Event not found");
      }

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
}

export async function createRecord(
  input: CreateRecordInput,
): Promise<EventWithCurrentRecord> {
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
      if (!existingEvent) {
        throw new Error("Event not found");
      }

      if (existingEvent.currentRecordId) {
        throw new Error("There is already an active record");
      }

      const parsedCount = Number(input.count);
      if (!Number.isFinite(parsedCount) || parsedCount < 0) {
        throw new Error("Count must be a non-negative number");
      }

      const now = new Date().toISOString();
      const newRecord: EventRecord = {
        id: generateId(),
        eventId: existingEvent.id,
        createdAt: now,
        updatedAt: now,
        count: parsedCount,
        completed: false,
      };
      recordsStore.put(newRecord);

      const updatedEvent: EventEntity = {
        ...existingEvent,
        updatedAt: now,
        currentRecordId: newRecord.id,
      };
      eventsStore.put(updatedEvent);

      return {
        event: updatedEvent,
        record: newRecord,
      };
    },
  );

  return attachCurrentRecord(event, [record]);
}

export async function completeRecord(
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
      if (!existingEvent) {
        throw new Error("Event not found");
      }

      if (!existingEvent.currentRecordId) {
        throw new Error("There is no active record to complete");
      }

      const existingRecord =
        (await requestToPromise<EventRecord | undefined>(
          recordsStore.get(existingEvent.currentRecordId),
        )) ?? null;
      if (!existingRecord) {
        throw new Error("Current record could not be located");
      }

      const now = new Date().toISOString();
      const completedRecord: EventRecord = {
        ...existingRecord,
        completed: true,
        updatedAt: now,
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

      return {
        event: updatedEvent,
        currentRecord: nextRecord,
      };
    },
  );

  return attachCurrentRecord(event, currentRecord ? [currentRecord] : []);
}

export async function deleteEvent(eventId: string): Promise<void> {
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
      if (!existingEvent) {
        throw new Error("Event not found");
      }

      eventsStore.delete(eventId);
      await deleteRecordsByEvent(recordsStore, eventId);
    },
  );
}

function attachCurrentRecord(
  event: EventEntity,
  records: EventRecord[],
): EventWithCurrentRecord {
  const currentRecord = event.currentRecordId
    ? (records.find((record) => record.id === event.currentRecordId) ?? null)
    : null;
  return {
    ...event,
    currentRecord,
  };
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

async function readState(): Promise<State> {
  const persisted = await readPersistedCollections();
  if (persisted) {
    return persisted;
  }

  return {
    events: [],
    records: [],
  };
}

async function getDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    throw new Error("IndexedDB is unavailable");
  }

  if (!dbPromise) {
    dbPromise = openDatabase();
  }

  try {
    return await dbPromise;
  } catch (error) {
    dbPromise = null;
    throw error;
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_EVENTS_STORE)) {
        db.createObjectStore(DB_EVENTS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(DB_RECORDS_STORE)) {
        db.createObjectStore(DB_RECORDS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

async function readPersistedCollections(): Promise<State | null> {
  const db = await getDatabase();
  if (
    !db.objectStoreNames.contains(DB_EVENTS_STORE) ||
    !db.objectStoreNames.contains(DB_RECORDS_STORE)
  ) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [DB_EVENTS_STORE, DB_RECORDS_STORE],
      "readonly",
    );

    const eventsStore = transaction.objectStore(DB_EVENTS_STORE);
    const recordsStore = transaction.objectStore(DB_RECORDS_STORE);

    let eventsLoaded = false;
    let recordsLoaded = false;
    let events: EventEntity[] = [];
    let records: EventRecord[] = [];

    const finishIfReady = () => {
      if (eventsLoaded && recordsLoaded) {
        resolve({ events, records });
      }
    };

    const eventsRequest = eventsStore.getAll();
    eventsRequest.onsuccess = () => {
      events = (eventsRequest.result ?? []) as EventEntity[];
      eventsLoaded = true;
      finishIfReady();
    };
    eventsRequest.onerror = () =>
      reject(
        eventsRequest.error ??
          new Error("Failed to read events from IndexedDB"),
      );

    const recordsRequest = recordsStore.getAll();
    recordsRequest.onsuccess = () => {
      records = (recordsRequest.result ?? []) as EventRecord[];
      recordsLoaded = true;
      finishIfReady();
    };
    recordsRequest.onerror = () =>
      reject(
        recordsRequest.error ??
          new Error("Failed to read records from IndexedDB"),
      );

    transaction.onerror = () =>
      reject(
        transaction.error ?? new Error("Failed to read state from IndexedDB"),
      );
  });
}

type StoreMap = Record<string, IDBObjectStore>;

async function runTransaction<T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  executor: (stores: StoreMap) => T | Promise<T>,
): Promise<T> {
  const db = await getDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeNames, mode);
    const stores = storeNames.reduce<StoreMap>((acc, name) => {
      acc[name] = transaction.objectStore(name);
      return acc;
    }, {} as StoreMap);

    let result: T | Promise<T>;
    try {
      result = executor(stores);
    } catch (error) {
      transaction.abort();
      reject(error as Error);
      return;
    }

    transaction.oncomplete = async () => {
      try {
        resolve(await result);
      } catch (error) {
        reject(error as Error);
      }
    };
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function deleteRecordsByEvent(
  recordsStore: IDBObjectStore,
  eventId: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cursorRequest = recordsStore.openCursor();
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) {
        resolve();
        return;
      }
      const record = cursor.value as EventRecord;
      if (record.eventId === eventId) {
        cursor.delete();
      }
      cursor.continue();
    };
    cursorRequest.onerror = () =>
      reject(cursorRequest.error ?? new Error("Failed to delete records"));
  });
}
