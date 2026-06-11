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
});

describe('categories tools', () => {
  it('list_categories fetches user categories', async () => {
    vi.mocked(api.get).mockResolvedValue([{ id: 3, title: 'Groceries' }]);

    const client = await createClient();
    const result = await client.callTool({ name: 'list_categories', arguments: {} });

    expect(api.get).toHaveBeenCalledWith('/users/1/categories');
    expect(textPayload(result)).toEqual([{ id: 3, title: 'Groceries' }]);
  });

  it('create_category posts the mapped body', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 4 });

    const client = await createClient();
    await client.callTool({
      name: 'create_category',
      arguments: { title: 'Projects', parent_id: 3, is_bill: true },
    });

    expect(api.post).toHaveBeenCalledWith('/users/1/categories', {
      title: 'Projects',
      parent_id: 3,
      is_bill: true,
    });
  });

  it('update_category supports clearing boolean flags', async () => {
    vi.mocked(api.put).mockResolvedValue({ id: 3 });

    const client = await createClient();
    await client.callTool({
      name: 'update_category',
      arguments: { id: 3, is_transfer: false },
    });

    expect(api.put).toHaveBeenCalledWith('/categories/3', { is_transfer: false });
  });
});
