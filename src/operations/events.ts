import { api, getUserId } from '../api.js';
import type { Event } from '../types.js';

export interface ListEventsParams {
  startDate: string;
  endDate: string;
  scenarioId?: number | string;
  userId?: string;
}

export async function listEvents(p: ListEventsParams): Promise<Event[]> {
  const params: Record<string, string | number | boolean | undefined> = {
    start_date: p.startDate,
    end_date: p.endDate,
  };

  if (p.scenarioId) {
    return api.get<Event[]>(`/scenarios/${p.scenarioId}/events`, params);
  }
  const userId = await getUserId(p.userId);
  return api.get<Event[]>(`/users/${userId}/events`, params);
}

export function getEvent(id: number | string): Promise<Event> {
  return api.get<Event>(`/events/${id}`);
}

export interface UpdateEventInput {
  amount?: number | string;
  date?: string;
  repeatType?: string;
  repeatInterval?: number;
  note?: string;
}

export function updateEvent(id: number | string, input: UpdateEventInput): Promise<Event> {
  const body: Record<string, unknown> = {};
  if (input.amount !== undefined) body.amount = input.amount;
  if (input.date) body.date = input.date;
  if (input.repeatType) body.repeat_type = input.repeatType;
  if (input.repeatInterval != null) body.repeat_interval = input.repeatInterval;
  if (input.note !== undefined) body.note = input.note;

  return api.put<Event>(`/events/${id}`, body);
}
