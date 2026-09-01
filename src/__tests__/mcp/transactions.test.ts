import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    paginated: vi.fn(),
    fetchAll: vi.fn(),
  },
  getUserId: vi.fn(() => Promise.resolve(1)),
}));

import { api } from '../../api.js';
import { createClient, textPayload } from './helpers.js';

beforeEach(() => {
  vi.mocked(api.get).mockReset();
  vi.mocked(api.post).mockReset();
  vi.mocked(api.put).mockReset();
  vi.mocked(api.paginated).mockReset();
});

describe('transactions tools', () => {
  it('list_transactions returns a pagination envelope', async () => {
    vi.mocked(api.paginated).mockResolvedValue({
      data: [{ id: 1, payee: 'Cafe' }],
      totalPages: 3,
      currentPage: 2,
    });

    const client = await createClient();
    const result = await client.callTool({
      name: 'list_transactions',
      arguments: { search: 'cafe', page: 2, per_page: 30 },
    });

    expect(api.paginated).toHaveBeenCalledWith(
      '/users/1/transactions',
      expect.objectContaining({ search: 'cafe', page: 2, per_page: 30 }),
    );
    expect(textPayload(result)).toEqual({
      data: [{ id: 1, payee: 'Cafe' }],
      current_page: 2,
      total_pages: 3,
    });
  });

  it('list_transactions scopes to an account when account_id is given', async () => {
    vi.mocked(api.paginated).mockResolvedValue({ data: [], totalPages: 1, currentPage: 1 });

    const client = await createClient();
    await client.callTool({ name: 'list_transactions', arguments: { account_id: 5 } });

    expect(api.paginated).toHaveBeenCalledWith('/accounts/5/transactions', expect.anything());
  });

  it('list_transactions passes review and category filters as API params', async () => {
    vi.mocked(api.paginated).mockResolvedValue({ data: [], totalPages: 1, currentPage: 1 });

    const client = await createClient();
    await client.callTool({
      name: 'list_transactions',
      arguments: { needs_review: true, uncategorized: true },
    });

    expect(api.paginated).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ needs_review: 1, uncategorised: 1 }),
    );
  });

  it('create_transaction posts the mapped body', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 99 });

    const client = await createClient();
    await client.callTool({
      name: 'create_transaction',
      arguments: {
        transaction_account_id: 7,
        payee: 'Cafe',
        amount: -4.5,
        date: '2026-06-01',
        category_id: 12,
      },
    });

    expect(api.post).toHaveBeenCalledWith('/transaction-accounts/7/transactions', {
      payee: 'Cafe',
      amount: -4.5,
      date: '2026-06-01',
      category_id: 12,
    });
  });

  it('update_transaction puts only the provided fields', async () => {
    vi.mocked(api.put).mockResolvedValue({ id: 99 });

    const client = await createClient();
    await client.callTool({
      name: 'update_transaction',
      arguments: { id: 99, category_id: 12 },
    });

    expect(api.put).toHaveBeenCalledWith('/transactions/99', { category_id: 12 });
  });

  it('update_transaction can clear the needs_review flag', async () => {
    vi.mocked(api.put).mockResolvedValue({ id: 99 });

    const client = await createClient();
    await client.callTool({
      name: 'update_transaction',
      arguments: { id: 99, needs_review: false },
    });

    expect(api.put).toHaveBeenCalledWith('/transactions/99', { needs_review: false });
  });

  it('rejects per_page outside 10-100', async () => {
    const client = await createClient();
    const result = await client.callTool({
      name: 'list_transactions',
      arguments: { per_page: 5 },
    });

    expect(result.isError).toBe(true);
    expect(api.paginated).not.toHaveBeenCalled();
  });
});
