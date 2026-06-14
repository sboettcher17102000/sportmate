import { api } from './client';
import type { Friendship, FriendActivity, User } from '../types';

export function getFriends() {
  return api.get<Friendship[]>('/friendships');
}

export function getFriendActivity() {
  return api.get<FriendActivity[]>('/friendships/activity');
}

export function getPendingRequests() {
  return api.get<Friendship[]>('/friendships/pending');
}

export function sendFriendRequest(targetUserId: number) {
  return api.post<Friendship>('/friendships/request', { targetUserId });
}

export function acceptFriendRequest(friendshipId: number) {
  return api.patch<Friendship>(`/friendships/${friendshipId}/accept`, {});
}

export function declineFriendRequest(friendshipId: number) {
  return api.delete<unknown>(`/friendships/${friendshipId}`);
}

export function searchUsers(q: string) {
  return api.get<User[]>(`/users/search?q=${encodeURIComponent(q)}`);
}

export function getUserProfile(id: number) {
  return api.get<User>(`/users/${id}`);
}

export function updateMyProfile(data: {
  name?: string;
  university?: string;
  studiengang?: string;
  semester?: number;
}) {
  return api.patch<User>('/users/me', data);
}
