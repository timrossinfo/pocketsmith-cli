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
});

describe('budgets tools', () => {
  it('list_budgets passes roll_up when requested', async () => {
    vi.mocked(api.get).mockResolvedValue([]);

    const client = await createClient();
    await client.callTool({ name: 'list_budgets', arguments: { roll_up: true } });

    expect(api.get).toHaveBeenCalledWith('/users/1/budget', { roll_up: true });
  });

  it('get_budget_summary maps params to snake_case', async () => {
    vi.mocked(api.get).mockResolvedValue({});

    const client = await createClient();
    await client.callTool({
      name: 'get_budget_summary',
      arguments: { period: 'months', interval: 1, start_date: '2026-01-01', end_date: '2026-06-30' },
    });

    expect(api.get).toHaveBeenCalledWith('/users/1/budget_summary', {
      period: 'months',
      interval: 1,
      start_date: '2026-01-01',
      end_date: '2026-06-30',
    });
  });

  it('get_budget_trend_analysis passes category and scenario ids', async () => {
    vi.mocked(api.get).mockResolvedValue([]);

    const client = await createClient();
    const result = await client.callTool({
      name: 'get_budget_trend_analysis',
      arguments: { period: 'months', interval: 1, categories: '1,2', scenarios: '3' },
    });

    expect(api.get).toHaveBeenCalledWith(
      '/users/1/trend_analysis',
      expect.objectContaining({ categories: '1,2', scenarios: '3' }),
    );
    expect(textPayload(result)).toEqual([]);
  });
});
