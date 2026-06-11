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

describe('accounts tools', () => {
  it('list_accounts fetches the user accounts', async () => {
    vi.mocked(api.get).mockResolvedValue([{ id: 10, title: 'Everyday' }]);

    const client = await createClient();
    const result = await client.callTool({ name: 'list_accounts', arguments: {} });

    expect(api.get).toHaveBeenCalledWith('/users/1/accounts');
    expect(textPayload(result)).toEqual([{ id: 10, title: 'Everyday' }]);
  });

  it('get_account fetches a single account', async () => {
    vi.mocked(api.get).mockResolvedValue({ id: 10, title: 'Everyday' });

    const client = await createClient();
    const result = await client.callTool({ name: 'get_account', arguments: { id: 10 } });

    expect(api.get).toHaveBeenCalledWith('/accounts/10');
    expect(textPayload(result)).toEqual({ id: 10, title: 'Everyday' });
  });
});
