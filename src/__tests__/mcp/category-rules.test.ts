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
});

describe('category rules tools', () => {
  it('list_category_rules fetches user category rules', async () => {
    const rules = [
      { id: 10, payee_matches: 'NEW WORLD', category: { id: 3, title: 'Groceries' } },
    ];
    vi.mocked(api.get).mockResolvedValue(rules);

    const client = await createClient();
    const result = await client.callTool({ name: 'list_category_rules', arguments: {} });

    expect(api.get).toHaveBeenCalledWith('/users/1/category_rules');
    expect(textPayload(result)).toEqual(rules);
  });

  it('create_category_rule posts the mapped body', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 11, payee_matches: 'MITRE 10' });

    const client = await createClient();
    await client.callTool({
      name: 'create_category_rule',
      arguments: { category_id: 5, payee_matches: 'MITRE 10' },
    });

    expect(api.post).toHaveBeenCalledWith('/categories/5/category_rules', {
      payee_matches: 'MITRE 10',
    });
  });

  it('create_category_rule forwards apply flags when set', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 12, payee_matches: 'KOSCO' });

    const client = await createClient();
    await client.callTool({
      name: 'create_category_rule',
      arguments: { category_id: 6, payee_matches: 'KOSCO', apply_to_uncategorised: true },
    });

    expect(api.post).toHaveBeenCalledWith('/categories/6/category_rules', {
      payee_matches: 'KOSCO',
      apply_to_uncategorised: true,
    });
  });
});
