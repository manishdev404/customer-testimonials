import type { ApiResponse } from '@/types';

/**
 * Base URL for the API. Points at the co-located Next.js route handlers by
 * default; set NEXT_PUBLIC_API_BASE_URL to move to a standalone backend
 * without touching a single call site.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

/** Error carrying the server's message and any field-level validation detail. */
export class HttpError extends Error {
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.fields = fields;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Query string values; `undefined` entries are dropped. */
  params?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = `${API_BASE_URL}${path}`;
  if (!params) return url;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

/**
 * Thin wrapper over the native fetch API: serialises JSON, unwraps the
 * `ApiResponse` envelope and normalises every failure into an `HttpError`.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      ...rest,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch only rejects on network-level failures.
    throw new HttpError('Network error. Please check your connection and try again.', 0);
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const error = payload && !payload.success ? payload.error : undefined;
    throw new HttpError(
      error?.message ?? 'Something went wrong. Please try again.',
      response.status,
      error?.fields,
    );
  }

  return payload.data;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
};
