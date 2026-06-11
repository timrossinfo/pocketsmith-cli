import { api } from '../api.js';
import type { User } from '../types.js';

export function getUser(): Promise<User> {
  return api.get<User>('/me');
}
