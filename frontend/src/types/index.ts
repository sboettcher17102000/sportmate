export type SportCategory =
  | 'Volleyball'
  | 'Fußball'
  | 'Basketball'
  | 'Laufen'
  | 'Yoga'
  | 'Schwimmen'
  | 'Klettern'
  | 'Wassersport'
  | 'Tennis'
  | 'Andere';

export type EventSource = 'user' | 'university' | 'external';

export type ParticipationStatus = 'registered' | 'invited' | 'cancelled';

export type FriendshipStatus = 'pending' | 'accepted';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  semester?: number;
  university?: string | null;
  studiengang?: string | null;
  interests: string[];
}

export interface EventParticipant {
  name: string;
  isSelf: boolean;
  isFriend: boolean;
}

export interface Event {
  id: number;
  title: string;
  sport: SportCategory;
  date: string;
  location: string;
  description?: string;
  source: EventSource;
  maxCapacity?: number;
  creatorId: number;
  creator?: User;
  participationCount?: number;
  myStatus?: ParticipationStatus | null;
  friendParticipants?: User[];
  participants?: EventParticipant[];
}

export interface Participation {
  id: number;
  status: ParticipationStatus;
  userId: number;
  eventId: number;
  user?: User;
  event?: Event;
}

export interface Friendship {
  id: number;
  status: FriendshipStatus;
  userAId: number;
  userBId: number;
  friend?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}
