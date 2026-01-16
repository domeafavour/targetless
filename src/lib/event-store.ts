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
  createNext: boolean;
  nextCount?: number;
};

type State = {
  events: EventEntity[];
  records: EventRecord[];
};

const STORAGE_KEY = "event-tracker-state-v1";

const DEFAULT_STATE: State = {
  events: [],
  records: [],
};

const stateRef: { current: State } = {
  current: cloneState(loadInitialState()),
};

export async function listEvents(): Promise<EventWithCurrentRecord[]> {
  await simulateLatency();
  const snapshot = cloneState(stateRef.current);
  return snapshot.events
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map((event) => attachCurrentRecord(event, snapshot.records));
}

export async function getEvent(eventId: string): Promise<EventDetail> {
  await simulateLatency();
  const snapshot = cloneState(stateRef.current);
  const event = snapshot.events.find((item) => item.id === eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const records = snapshot.records
    .filter((record) => record.eventId === eventId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return {
    ...attachCurrentRecord(event, snapshot.records),
    records,
  };
}

export async function createEvent(
  input: CreateEventInput
): Promise<EventWithCurrentRecord> {
  await simulateLatency();
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

  const nextState = cloneState(stateRef.current);
  nextState.events = [event, ...nextState.events];
  nextState.records = [record, ...nextState.records];
  commitState(nextState);

  return attachCurrentRecord(event, nextState.records);
}

export async function completeEvent(
  input: CompleteEventInput
): Promise<EventWithCurrentRecord> {
  await simulateLatency();
  const draft = cloneState(stateRef.current);
  const event = draft.events.find((evt) => evt.id === input.eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (!event.currentRecordId) {
    throw new Error("There is no active record to complete");
  }

  const recordIndex = draft.records.findIndex(
    (record) => record.id === event.currentRecordId
  );

  if (recordIndex === -1) {
    throw new Error("Current record could not be located");
  }

  const now = new Date().toISOString();
  const updatedRecord: EventRecord = {
    ...draft.records[recordIndex],
    completed: true,
    updatedAt: now,
  };

  draft.records[recordIndex] = updatedRecord;

  let nextCurrentRecordId: string | null = null;
  if (input.createNext) {
    const nextCount = Number.isFinite(input.nextCount)
      ? Number(input.nextCount)
      : 0;
    const nextRecord: EventRecord = {
      id: generateId(),
      eventId: event.id,
      createdAt: now,
      updatedAt: now,
      count: nextCount,
      completed: false,
    };
    draft.records = [nextRecord, ...draft.records];
    nextCurrentRecordId = nextRecord.id;
  }

  const updatedEvent: EventEntity = {
    ...event,
    updatedAt: now,
    currentRecordId: nextCurrentRecordId,
    completed: !input.createNext,
  };

  draft.events = draft.events.map((evt) =>
    evt.id === updatedEvent.id ? updatedEvent : evt
  );

  commitState(draft);

  return attachCurrentRecord(updatedEvent, draft.records);
}

export async function deleteEvent(eventId: string): Promise<void> {
  await simulateLatency();
  const draft = cloneState(stateRef.current);
  if (!draft.events.some((event) => event.id === eventId)) {
    throw new Error("Event not found");
  }

  draft.events = draft.events.filter((event) => event.id !== eventId);
  draft.records = draft.records.filter((record) => record.eventId !== eventId);

  commitState(draft);
}

function attachCurrentRecord(
  event: EventEntity,
  records: EventRecord[]
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

function cloneState(state: State): State {
  return {
    events: state.events.map((event) => ({ ...event })),
    records: state.records.map((record) => ({ ...record })),
  };
}

function commitState(next: State) {
  stateRef.current = next;
  persistState(next);
}

function persistState(state: State) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Swallow storage errors silently to avoid breaking the UX
  }
}

function loadInitialState(): State {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(storedValue) as State;
    if (!parsed.events || !parsed.records) {
      throw new Error("Malformed state");
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

function simulateLatency(duration = 250) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}
