import { api } from './client';
import type { AuthResponse } from '../types';

export function login(email: string, password: string) {
  return api.post<AuthResponse>('/auth/login', { email, password });
}

export function register(
  name: string,
  email: string,
  password: string,
  opts?: { university?: string; studiengang?: string; semester?: number }
) {
  return api.post<AuthResponse>('/auth/register', { name, email, password, ...opts });
}
