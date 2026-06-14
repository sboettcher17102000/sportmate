import { api } from './client';
import type { Event } from '../types';

export interface EventFilters {
  source?: string;
  sport?: string;
  search?: string;
}

export function getEvents(filters?: EventFilters) {
  const params = new URLSearchParams();
  if (filters?.source) params.set('source', filters.source);
  if (filters?.sport) params.set('sport', filters.sport);
  if (filters?.search) params.set('search', filters.search);
  const query = params.toString();
  return api.get<Event[]>(`/events${query ? `?${query}` : ''}`);
}

export function getMyEvents() {
  return api.get<Event[]>('/events/mine');
}

export function getUserEvents(id: number) {
  return api.get<Event[]>(`/events/user/${id}`);
}

export function getEvent(id: number) {
  return api.get<Event>(`/events/${id}`);
}

export function createEvent(data: {
  title: string;
  sport: string;
  date: string;
  location: string;
  description?: string;
  source?: string;
  isPrivate?: boolean;
  maxCapacity?: number;
}) {
  return api.post<Event>('/events', data);
}

export function joinEvent(id: number) {
  return api.post<unknown>(`/events/${id}/join`, {});
}

export function leaveEvent(id: number) {
  return api.delete<unknown>(`/events/${id}/join`);
}
