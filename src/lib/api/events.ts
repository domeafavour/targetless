import { router } from 'react-query-kit'

import {
  createEvent,
  completeEvent,
  completeRecord,
  deleteEvent,
  getEvent,
  listEvents,
  type CompleteEventInput,
  type CompleteRecordInput,
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
  completeRecord: router.mutation({
    mutationFn: (input: CompleteRecordInput) => completeRecord(input),
  }),
  delete: router.mutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
  }),
})
