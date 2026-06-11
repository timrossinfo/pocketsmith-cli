import { api, getUserId } from '../api.js';
import type { Account } from '../types.js';

export async function listAccounts(userId?: string): Promise<Account[]> {
  const id = await getUserId(userId);
  return api.get<Account[]>(`/users/${id}/accounts`);
}

export function getAccount(id: number | string): Promise<Account> {
  return api.get<Account>(`/accounts/${id}`);
}
