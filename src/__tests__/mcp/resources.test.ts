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
  vi.mocked(api.put).mockReset();
});

describe('remaining resource tools', () => {
  it('exposes exactly the 24 designed tools', async () => {
    const client = await createClient();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();

    expect(names).toEqual(
      [
        'get_user',
        'list_accounts', 'get_account',
        'list_transactions', 'get_transaction', 'create_transaction', 'update_transaction',
        'list_categories', 'get_category', 'create_category', 'update_category',
        'list_budgets', 'get_budget_summary', 'get_budget_trend_analysis',
        'list_events', 'get_event', 'update_event',
        'list_institutions', 'get_institution',
        'list_labels',
        'list_currencies', 'get_currency',
        'list_attachments', 'get_attachment',
      ].sort(),
    );
  });

  it('every tool has a title and readOnlyHint annotation', async () => {
    const client = await createClient();
    const { tools } = await client.listTools();

    for (const tool of tools) {
      expect(tool.title ?? tool.annotations?.title, tool.name).toBeTruthy();
      expect(tool.annotations?.readOnlyHint, tool.name).toBeTypeOf('boolean');
    }
  });

  it('list_events scopes to a scenario when scenario_id is given', async () => {
    vi.mocked(api.get).mockResolvedValue([]);

    const client = await createClient();
    await client.callTool({
      name: 'list_events',
      arguments: { start_date: '2026-06-01', end_date: '2026-06-30', scenario_id: 9 },
    });

    expect(api.get).toHaveBeenCalledWith('/scenarios/9/events', {
      start_date: '2026-06-01',
      end_date: '2026-06-30',
    });
  });

  it('update_event puts only provided fields', async () => {
    vi.mocked(api.put).mockResolvedValue({ id: 5 });

    const client = await createClient();
    await client.callTool({ name: 'update_event', arguments: { id: 5, amount: -120 } });

    expect(api.put).toHaveBeenCalledWith('/events/5', { amount: -120 });
  });

  it('list_attachments scopes to a transaction when transaction_id is given', async () => {
    vi.mocked(api.get).mockResolvedValue([]);

    const client = await createClient();
    await client.callTool({ name: 'list_attachments', arguments: { transaction_id: 42 } });

    expect(api.get).toHaveBeenCalledWith('/transactions/42/attachments');
  });

  it('get_currency fetches by code', async () => {
    vi.mocked(api.get).mockResolvedValue({ id: 'nzd', name: 'New Zealand Dollar' });

    const client = await createClient();
    const result = await client.callTool({ name: 'get_currency', arguments: { code: 'nzd' } });

    expect(api.get).toHaveBeenCalledWith('/currencies/nzd');
    expect(textPayload(result)).toEqual({ id: 'nzd', name: 'New Zealand Dollar' });
  });
});
