import { router } from 'react-query-kit'

import {
  createEvent,
  completeEvent,
  deleteEvent,
  getEvent,
  listEvents,
  type CompleteEventInput,
  type CreateEventInput,
} from '@/lib/event-store'

export const eventsApi = router(['events'], {
  list: router.query({
    fetcher: () => listEvents(),
  }),
  detail: router.query({
    fetcher: ({ eventId }: { eventId: string }) => getEvent(eventId),
  }),
  create: router.mutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
  }),
  complete: router.mutation({
    mutationFn: (input: CompleteEventInput) => completeEvent(input),
  }),
  delete: router.mutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
  }),
})
