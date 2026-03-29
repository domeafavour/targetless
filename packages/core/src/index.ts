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

export interface EventsRepository {
  listEvents(params?: ListEventsParams): Promise<EventWithCurrentRecord[]>;
  getEventsStats(): Promise<EventsStats>;
  getEvent(eventId: string): Promise<EventDetail>;
  createEvent(input: CreateEventInput): Promise<EventWithCurrentRecord>;
  completeEvent(input: CompleteEventInput): Promise<EventWithCurrentRecord>;
  completeRecord(input: CompleteRecordInput): Promise<EventWithCurrentRecord>;
  createRecord(input: CreateRecordInput): Promise<EventWithCurrentRecord>;
  deleteEvent(eventId: string): Promise<void>;
  updateEventTitle(input: UpdateEventTitleInput): Promise<EventWithCurrentRecord>;
}

export interface AuthRepository {
  getCurrentUser(): Promise<unknown | null>;
  signIn(input: { email: string; password: string }): Promise<unknown>;
  signUp(input: { email: string; password: string }): Promise<unknown>;
  signOut(): Promise<void>;
  isLoggedIn(): Promise<boolean>;
}

export function createEventsUsecases(repository: EventsRepository) {
  return {
    list: (params?: ListEventsParams) => repository.listEvents(params),
    stats: () => repository.getEventsStats(),
    detail: (eventId: string) => repository.getEvent(eventId),
    create: (input: CreateEventInput) => repository.createEvent(input),
    complete: (input: CompleteEventInput) => repository.completeEvent(input),
    completeRecord: (input: CompleteRecordInput) =>
      repository.completeRecord(input),
    createRecord: (input: CreateRecordInput) => repository.createRecord(input),
    delete: (eventId: string) => repository.deleteEvent(eventId),
    updateTitle: (input: UpdateEventTitleInput) =>
      repository.updateEventTitle(input),
  };
}

export function createAuthUsecases(repository: AuthRepository) {
  return {
    getCurrentUser: () => repository.getCurrentUser(),
    signIn: (input: { email: string; password: string }) => repository.signIn(input),
    signUp: (input: { email: string; password: string }) => repository.signUp(input),
    signOut: () => repository.signOut(),
    isLoggedIn: () => repository.isLoggedIn(),
  };
}
