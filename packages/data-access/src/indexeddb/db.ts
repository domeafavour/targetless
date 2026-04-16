import type { EventEntity, EventRecord } from "@targetless/domain";

const DB_NAME = "event-tracker-state";
const DB_VERSION = 2;
export const DB_EVENTS_STORE = "events";
export const DB_RECORDS_STORE = "records";

type State = {
  events: EventEntity[];
  records: EventRecord[];
};

let dbPromise: Promise<IDBDatabase> | null = null;

export type StoreMap = Record<string, IDBObjectStore>;

export async function readState(): Promise<State> {
  try {
    const persisted = await readPersistedCollections();
    if (persisted) return persisted;
  } catch {
    // IndexedDB may be unavailable (private browsing, restricted storage, etc.)
  }
  return { events: [], records: [] };
}

export async function runTransaction<T>(
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

export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

export function deleteRecordsByEvent(
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
      reject(cursorRequest.error ?? new Error("Failed to iterate records"));
  });
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export { generateId };

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
      if (eventsLoaded && recordsLoaded) resolve({ events, records });
    };

    const eventsRequest = eventsStore.getAll();
    eventsRequest.onsuccess = () => {
      events = (eventsRequest.result ?? []) as EventEntity[];
      eventsLoaded = true;
      finishIfReady();
    };
    eventsRequest.onerror = () =>
      reject(eventsRequest.error ?? new Error("Failed to read events from IndexedDB"));

    const recordsRequest = recordsStore.getAll();
    recordsRequest.onsuccess = () => {
      records = (recordsRequest.result ?? []) as EventRecord[];
      recordsLoaded = true;
      finishIfReady();
    };
    recordsRequest.onerror = () =>
      reject(recordsRequest.error ?? new Error("Failed to read records from IndexedDB"));

    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Failed to read state from IndexedDB"));
  });
}
