/**
 * Client-side API fetcher. Same-origin cookie auth (httpOnly tokens ride along).
 * Returns the parsed `{ success, data, pagination, message }` envelope; throws a
 * typed ApiError on non-2xx or `success:false`.
 */
export interface ApiError {
  status: number;
  message: string;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function apiFetch<T>(
  path: string,
  opts: { method?: string; body?: unknown } = {},
): Promise<Envelope<T>> {
  const res = await fetch(path, {
    method: opts.method ?? "GET",
    headers:
      opts.body !== undefined ? { "content-type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
  });

  let json: (Envelope<T> & Partial<ApiError>) | null = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON body */
  }

  if (!res.ok || (json && json.success === false)) {
    throw {
      status: res.status,
      message: json?.message ?? "Request failed.",
      error: json?.error,
      details: json?.details,
    } satisfies ApiError;
  }
  return json as Envelope<T>;
}
