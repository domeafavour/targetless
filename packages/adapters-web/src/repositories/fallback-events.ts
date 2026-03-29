import type { EventsRepository } from "@targetless/core";

export function createFallbackEventsRepository(input: {
  remote: EventsRepository;
  local: EventsRepository;
  isLoggedIn: () => Promise<boolean>;
}): EventsRepository {
  const run = async <T>(remote: () => Promise<T>, local: () => Promise<T>) => {
    try {
      const loggedIn = await input.isLoggedIn();
      if (loggedIn) {
        return await remote();
      }
      return await local();
    } catch {
      return await local();
    }
  };

  return {
    listEvents: (params) => run(() => input.remote.listEvents(params), () => input.local.listEvents(params)),
    getEventsStats: () => run(() => input.remote.getEventsStats(), () => input.local.getEventsStats()),
    getEvent: (eventId) => run(() => input.remote.getEvent(eventId), () => input.local.getEvent(eventId)),
    createEvent: (payload) => run(() => input.remote.createEvent(payload), () => input.local.createEvent(payload)),
    completeEvent: (payload) => run(() => input.remote.completeEvent(payload), () => input.local.completeEvent(payload)),
    completeRecord: (payload) =>
      run(() => input.remote.completeRecord(payload), () => input.local.completeRecord(payload)),
    createRecord: (payload) => run(() => input.remote.createRecord(payload), () => input.local.createRecord(payload)),
    deleteEvent: (eventId) => run(() => input.remote.deleteEvent(eventId), () => input.local.deleteEvent(eventId)),
    updateEventTitle: (payload) =>
      run(() => input.remote.updateEventTitle(payload), () => input.local.updateEventTitle(payload)),
  };
}
