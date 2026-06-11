import { api, getUserId } from '../api.js';
import type { Attachment } from '../types.js';

export async function listAttachments(
  options: { transactionId?: number | string; userId?: string } = {},
): Promise<Attachment[]> {
  if (options.transactionId) {
    return api.get<Attachment[]>(`/transactions/${options.transactionId}/attachments`);
  }
  const userId = await getUserId(options.userId);
  return api.get<Attachment[]>(`/users/${userId}/attachments`);
}

export function getAttachment(id: number | string): Promise<Attachment> {
  return api.get<Attachment>(`/attachments/${id}`);
}
