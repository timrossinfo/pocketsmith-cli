import { api, getUserId, type PaginatedResult } from '../api.js';
import type { Transaction } from '../types.js';

export interface TransactionFilters {
  accountId?: number | string;
  categoryId?: number | string;
  transactionAccountId?: number | string;
  startDate?: string;
  endDate?: string;
  search?: string;
  perPage?: number | string;
  userId?: string;
}

async function transactionsPath(filters: TransactionFilters): Promise<string> {
  if (filters.accountId) return `/accounts/${filters.accountId}/transactions`;
  if (filters.categoryId) return `/categories/${filters.categoryId}/transactions`;
  if (filters.transactionAccountId) {
    return `/transaction-accounts/${filters.transactionAccountId}/transactions`;
  }
  const userId = await getUserId(filters.userId);
  return `/users/${userId}/transactions`;
}

function transactionsParams(filters: TransactionFilters) {
  return {
    start_date: filters.startDate,
    end_date: filters.endDate,
    search: filters.search,
    per_page: filters.perPage,
  };
}

export async function listTransactions(
  filters: TransactionFilters & { page?: number | string },
): Promise<PaginatedResult<Transaction>> {
  const path = await transactionsPath(filters);
  return api.paginated<Transaction>(path, { ...transactionsParams(filters), page: filters.page });
}

export async function listAllTransactions(filters: TransactionFilters): Promise<Transaction[]> {
  const path = await transactionsPath(filters);
  return api.fetchAll<Transaction>(path, transactionsParams(filters));
}

export function getTransaction(id: number | string): Promise<Transaction> {
  return api.get<Transaction>(`/transactions/${id}`);
}

export interface CreateTransactionInput {
  payee: string;
  amount: number;
  date: string;
  note?: string;
  categoryId?: number;
  isTransfer?: boolean;
}

export function createTransaction(
  transactionAccountId: number | string,
  input: CreateTransactionInput,
): Promise<Transaction> {
  const body: Record<string, unknown> = {
    payee: input.payee,
    amount: input.amount,
    date: input.date,
  };
  if (input.note !== undefined) body.note = input.note;
  if (input.categoryId != null) body.category_id = input.categoryId;
  if (input.isTransfer) body.is_transfer = true;

  return api.post<Transaction>(`/transaction-accounts/${transactionAccountId}/transactions`, body);
}

export interface UpdateTransactionInput {
  payee?: string;
  amount?: number;
  date?: string;
  note?: string;
  categoryId?: number;
  isTransfer?: boolean;
}

export function updateTransaction(
  id: number | string,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const body: Record<string, unknown> = {};
  if (input.payee) body.payee = input.payee;
  if (input.amount !== undefined) body.amount = input.amount;
  if (input.date) body.date = input.date;
  if (input.note !== undefined) body.note = input.note;
  if (input.categoryId != null) body.category_id = input.categoryId;
  if (input.isTransfer !== undefined) body.is_transfer = input.isTransfer;

  return api.put<Transaction>(`/transactions/${id}`, body);
}
