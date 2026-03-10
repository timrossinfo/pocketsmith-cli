import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../config.js', () => ({
  getApiKey: vi.fn(() => 'test-api-key'),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
  vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('api', () => {
  describe('get', () => {
    it('sends GET request with auth header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1 }),
      });

      const { api } = await import('../api.js');
      const result = await api.get('/me');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pocketsmith.com/v2/me',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-Developer-Key': 'test-api-key',
          }),
        }),
      );
      expect(result).toEqual({ id: 1 });
    });

    it('appends query params to URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      const { api } = await import('../api.js');
      await api.get('/users/1/transactions', { start_date: '2024-01-01', page: 2 });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('start_date=2024-01-01');
      expect(calledUrl).toContain('page=2');
    });

    it('skips undefined params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      const { api } = await import('../api.js');
      await api.get('/test', { present: 'yes', missing: undefined });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('present=yes');
      expect(calledUrl).not.toContain('missing');
    });
  });

  describe('post', () => {
    it('sends POST request with JSON body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1 }),
      });

      const { api } = await import('../api.js');
      await api.post('/test', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pocketsmith.com/v2/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });
  });

  describe('put', () => {
    it('sends PUT request with JSON body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1 }),
      });

      const { api } = await import('../api.js');
      await api.put('/test/1', { name: 'updated' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pocketsmith.com/v2/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'updated' }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('sends DELETE request and handles 204', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const { api } = await import('../api.js');
      const result = await api.delete('/test/1');

      expect(result).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pocketsmith.com/v2/test/1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('error handling', () => {
    it('exits with error on 401', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Invalid key' }),
      });

      const { api } = await import('../api.js');
      await api.get('/me');

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('Invalid API key.');
    });

    it('exits with error on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Not found' }),
      });

      const { api } = await import('../api.js');
      await api.get('/accounts/999');

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('Resource not found: /accounts/999');
    });

    it('exits with error on 429 rate limit', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ error: 'Rate limited' }),
      });

      const { api } = await import('../api.js');
      await api.get('/me');

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('Rate limited. Please try again later.');
    });

    it('exits on network error', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      const { api } = await import('../api.js');
      await api.get('/me');

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('Could not connect to PocketSmith API.');
    });
  });

  describe('pagination', () => {
    it('returns paginated result with page info', async () => {
      const headers = new Map([
        ['x-total-pages', '5'],
        ['x-current-page', '2'],
      ]);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: 1 }, { id: 2 }]),
        headers: { get: (key: string) => headers.get(key) || null },
      });

      const { api } = await import('../api.js');
      const result = await api.paginated('/users/1/transactions', { page: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.totalPages).toBe(5);
      expect(result.currentPage).toBe(2);
    });

    it('fetchAll iterates through all pages', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        const headers = new Map([
          ['x-total-pages', '2'],
          ['x-current-page', String(callCount)],
        ]);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([{ id: callCount }]),
          headers: { get: (key: string) => headers.get(key) || null },
        });
      });

      const { api } = await import('../api.js');
      const result = await api.fetchAll('/users/1/transactions');

      expect(result).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUserId', () => {
    it('returns explicit ID when provided', async () => {
      const { getUserId } = await import('../api.js');
      const id = await getUserId('42');
      expect(id).toBe(42);
    });

    it('fetches from /me when no explicit ID', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 99 }),
      });

      // Need fresh import to clear cached user ID
      vi.resetModules();
      vi.doMock('../config.js', () => ({
        getApiKey: vi.fn(() => 'test-api-key'),
      }));
      const { getUserId } = await import('../api.js');
      const id = await getUserId();

      expect(id).toBe(99);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/me'),
        expect.anything(),
      );
    });
  });
});
