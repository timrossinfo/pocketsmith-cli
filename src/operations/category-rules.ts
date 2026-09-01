import { api, getUserId } from '../api.js';
import type { CategoryRule } from '../types.js';

export async function listCategoryRules(userId?: string): Promise<CategoryRule[]> {
  const id = await getUserId(userId);
  return api.get<CategoryRule[]>(`/users/${id}/category_rules`);
}

export interface CreateCategoryRuleInput {
  categoryId: number;
  payeeMatches: string;
  applyToUncategorised?: boolean;
  applyToAll?: boolean;
}

export function createCategoryRule(input: CreateCategoryRuleInput): Promise<CategoryRule> {
  const body: Record<string, unknown> = { payee_matches: input.payeeMatches };
  if (input.applyToUncategorised !== undefined) {
    body.apply_to_uncategorised = input.applyToUncategorised;
  }
  if (input.applyToAll !== undefined) body.apply_to_all = input.applyToAll;

  return api.post<CategoryRule>(`/categories/${input.categoryId}/category_rules`, body);
}
