const BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn;
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

export async function api<T = unknown>(
  path: string,
  { method = 'GET', body, token }: ApiOptions = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not connect to the server');
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    const err = (data as ErrorBody | null)?.error;
    throw new ApiError(
      res.status,
      err?.code || 'UNKNOWN',
      err?.message || `Unexpected error (${res.status})`
    );
  }
  return data as T;
}
