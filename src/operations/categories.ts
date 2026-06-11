import { api, getUserId } from '../api.js';
import type { Category } from '../types.js';

export async function listCategories(userId?: string): Promise<Category[]> {
  const id = await getUserId(userId);
  return api.get<Category[]>(`/users/${id}/categories`);
}

export function getCategory(id: number | string): Promise<Category> {
  return api.get<Category>(`/categories/${id}`);
}

export interface CreateCategoryInput {
  title: string;
  parentId?: number;
  isTransfer?: boolean;
  isBill?: boolean;
}

export async function createCategory(
  input: CreateCategoryInput,
  userId?: string,
): Promise<Category> {
  const id = await getUserId(userId);
  const body: Record<string, unknown> = { title: input.title };
  if (input.parentId != null) body.parent_id = input.parentId;
  if (input.isTransfer !== undefined) body.is_transfer = input.isTransfer;
  if (input.isBill !== undefined) body.is_bill = input.isBill;

  return api.post<Category>(`/users/${id}/categories`, body);
}

export interface UpdateCategoryInput {
  title?: string;
  colour?: string;
  isTransfer?: boolean;
  isBill?: boolean;
}

export function updateCategory(
  id: number | string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const body: Record<string, unknown> = {};
  if (input.title) body.title = input.title;
  if (input.colour) body.colour = input.colour;
  if (input.isTransfer !== undefined) body.is_transfer = input.isTransfer;
  if (input.isBill !== undefined) body.is_bill = input.isBill;

  return api.put<Category>(`/categories/${id}`, body);
}
