import { api, getUserId } from '../api.js';
import type { Institution } from '../types.js';

export async function listInstitutions(userId?: string): Promise<Institution[]> {
  const id = await getUserId(userId);
  return api.get<Institution[]>(`/users/${id}/institutions`);
}

export function getInstitution(id: number | string): Promise<Institution> {
  return api.get<Institution>(`/institutions/${id}`);
}
