import { api, getUserId } from '../api.js';

export async function listLabels(userId?: string): Promise<string[]> {
  const id = await getUserId(userId);
  return api.get<string[]>(`/users/${id}/labels`);
}
