import { getApiKey } from './config.js';

const BASE_URL = 'https://api.pocketsmith.com/v2';

interface RequestOptions {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(method: string, path: string, options?: RequestOptions): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${BASE_URL}${path}`);

  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    'X-Developer-Key': apiKey,
    'Accept': 'application/json',
  };

  const init: RequestInit = { method, headers };

  if (options?.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), init);
  } catch {
    console.error('Could not connect to PocketSmith API.');
    return process.exit(1) as never;
  }

  if (!response.ok) {
    let message: string;
    try {
      const body = await response.json();
      message = body.error || body.message || JSON.stringify(body);
    } catch {
      message = response.statusText;
    }

    if (response.status === 401) {
      console.error('Invalid API key.');
      return process.exit(1) as never;
    }
    if (response.status === 404) {
      console.error(`Resource not found: ${path}`);
      return process.exit(1) as never;
    }
    if (response.status === 429) {
      console.error('Rate limited. Please try again later.');
      return process.exit(1) as never;
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface PaginatedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}

async function paginatedRequest<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<PaginatedResult<T>> {
  const apiKey = getApiKey();
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      'X-Developer-Key': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    let message: string;
    try {
      const body = await response.json();
      message = body.error || body.message || JSON.stringify(body);
    } catch {
      message = response.statusText;
    }

    if (response.status === 401) {
      console.error('Invalid API key.');
      return process.exit(1) as never;
    }

    throw new ApiError(response.status, message);
  }

  const data = await response.json() as T[];
  const total = parseInt(response.headers.get('total') || '0', 10);
  const perPage = parseInt(response.headers.get('per-page') || '30', 10);
  const totalPages = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
  const currentPage = params?.page ? Number(params.page) : 1;

  return { data, totalPages, currentPage };
}

async function fetchAllPages<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T[]> {
  const allData: T[] = [];
  let page = 1;

  while (true) {
    const result = await paginatedRequest<T>(path, { ...params, page });
    allData.push(...result.data);

    if (page >= result.totalPages) break;
    page++;
  }

  return allData;
}

let cachedUserId: number | null = null;

export async function getUserId(explicitId?: string): Promise<number> {
  if (explicitId) return parseInt(explicitId, 10);
  if (cachedUserId) return cachedUserId;
  const me = await api.get<{ id: number }>('/me');
  cachedUserId = me.id;
  return cachedUserId;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>('PUT', path, { body }),
  delete: (path: string) =>
    request<void>('DELETE', path),
  paginated: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    paginatedRequest<T>(path, params),
  fetchAll: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    fetchAllPages<T>(path, params),
};
