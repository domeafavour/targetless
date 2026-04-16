export type EventRecord = {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  count: number;
  eventId: string;
  completed: boolean;
  note?: string | null;
};

export type EventEntity = {
  id: string;
  createdAt: string;
  updatedAt: string | null;
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
  note?: string;
};

export type CreateRecordInput = {
  eventId: string;
  count: number;
  note?: string;
};

export type UpdateEventTitleInput = {
  eventId: string;
  title: string;
};

export type EventsFilter = "total" | "active" | "completed";

export type EventsSortField = "createdAt" | "updatedAt";
export type EventsSortOrder = "asc" | "desc";

export type ListEventsParams = {
  filter?: EventsFilter;
  sortField?: EventsSortField;
  sortOrder?: EventsSortOrder;
};

export type EventsStats = {
  total: number;
  active: number;
  completed: number;
};
