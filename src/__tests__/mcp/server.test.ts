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

describe('mcp server', () => {
  it('registers get_user as a read-only tool', async () => {
    const client = await createClient();
    const { tools } = await client.listTools();
    const getUser = tools.find((t) => t.name === 'get_user');

    expect(getUser).toBeDefined();
    expect(getUser?.annotations?.readOnlyHint).toBe(true);
  });

  it('get_user returns the user as JSON', async () => {
    vi.mocked(api.get).mockResolvedValue({ id: 1, login: 'tim', name: 'Tim' });

    const client = await createClient();
    const result = await client.callTool({ name: 'get_user', arguments: {} });

    expect(api.get).toHaveBeenCalledWith('/me');
    expect(result.isError).toBeFalsy();
    expect(textPayload(result)).toEqual({ id: 1, login: 'tim', name: 'Tim' });
  });

  it('returns an error result without killing the server', async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce(new Error('Invalid API key.'))
      .mockResolvedValueOnce({ id: 1 });

    const client = await createClient();

    const failed = await client.callTool({ name: 'get_user', arguments: {} });
    expect(failed.isError).toBe(true);
    expect((failed.content as { text: string }[])[0].text).toBe('Invalid API key.');

    const ok = await client.callTool({ name: 'get_user', arguments: {} });
    expect(ok.isError).toBeFalsy();
  });
});
