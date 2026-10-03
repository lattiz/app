import { DnsProviderApiException } from '../../domains.exceptions';

interface CloudflareError {
  code?: number;
  message?: string;
}

interface ResultInfo {
  page?: number;
  per_page?: number;
  total_pages?: number;
}

interface Envelope<T> {
  success?: boolean;
  errors?: CloudflareError[];
  result?: T;
  result_info?: ResultInfo;
}

export interface CloudflareRequest {
  /** Label for error messages, e.g. 'zone lookup'. */
  operation: string;
  query?: Record<string, string | number | boolean>;
  body?: unknown;
  timeoutMs?: number;
}

const BASE_URL = 'https://api.cloudflare.com/client/v4';
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RATE_LIMIT_RETRY_MS = 3_000;
// A longer Retry-After means the 5-minute global window is exhausted; waiting inside a request is pointless.
const MAX_RATE_LIMIT_RETRY_MS = 10_000;
// Guards a misbehaving `result_info` from looping forever.
const MAX_PAGES = 100;

interface Attempt<T> {
  res: Response;
  payload: Envelope<T> | null;
}

/** Cloudflare REST v4 client: bearer API token, `{success, errors, result}` envelope, one retry on 429. */
export class CloudflareClient {
  constructor(
    private readonly apiToken: string,
    readonly accountId: string,
  ) {}

  async get<T>(path: string, opts: CloudflareRequest): Promise<T> {
    return (await this.request<T>('GET', path, opts)).result as T;
  }

  async post<T>(path: string, opts: CloudflareRequest): Promise<T> {
    return (await this.request<T>('POST', path, opts)).result as T;
  }

  async put<T>(path: string, opts: CloudflareRequest): Promise<T> {
    return (await this.request<T>('PUT', path, opts)).result as T;
  }

  async delete<T>(path: string, opts: CloudflareRequest): Promise<T> {
    return (await this.request<T>('DELETE', path, opts)).result as T;
  }

  /** Follows `result_info` pagination of a list endpoint and returns every item. */
  async getAll<T>(
    path: string,
    opts: CloudflareRequest & { perPage: number },
  ): Promise<T[]> {
    const items: T[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const envelope = await this.request<T[]>('GET', path, {
        ...opts,
        query: { ...opts.query, page, per_page: opts.perPage },
      });
      const batch = envelope.result ?? [];
      items.push(...batch);
      const totalPages = envelope.result_info?.total_pages;
      const done =
        totalPages === undefined
          ? batch.length < opts.perPage
          : page >= totalPages;
      if (done) return items;
    }
    throw new DnsProviderApiException(opts.operation, 'too many result pages');
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    opts: CloudflareRequest,
  ): Promise<Envelope<T>> {
    let attempt = await this.send<T>(method, path, opts);
    // 429 means the request was rejected unprocessed, so one delayed retry is safe even for writes.
    if (attempt.res.status === 429) {
      const waitMs = retryAfterMs(attempt.res);
      if (waitMs <= MAX_RATE_LIMIT_RETRY_MS) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        attempt = await this.send<T>(method, path, opts);
      }
    }

    const { res, payload } = attempt;
    if (!res.ok || !payload || payload.success !== true) {
      const errors = payload?.errors ?? [];
      throw new DnsProviderApiException(
        opts.operation,
        errors.length > 0
          ? errors
              .map((e) => `${e.message ?? 'unknown error'} (code ${e.code})`)
              .join('; ')
          : res.statusText || 'unexpected response',
        res.status,
        errors[0]?.code,
      );
    }
    return payload;
  }

  private async send<T>(
    method: string,
    path: string,
    opts: CloudflareRequest,
  ): Promise<Attempt<T>> {
    const query = opts.query
      ? `?${new URLSearchParams(
          Object.entries(opts.query).map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : '';

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/${path}${query}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      });
    } catch (err) {
      const timedOut = err instanceof Error && err.name === 'TimeoutError';
      throw new DnsProviderApiException(
        opts.operation,
        timedOut ? 'request timed out' : `network error (${String(err)})`,
      );
    }

    let payload: Envelope<T> | null;
    try {
      payload = (await res.json()) as Envelope<T>;
    } catch {
      payload = null;
    }
    return { res, payload };
  }
}

function retryAfterMs(res: Response): number {
  const seconds = Number(res.headers.get('retry-after'));
  return Number.isFinite(seconds) && seconds > 0
    ? seconds * 1000
    : DEFAULT_RATE_LIMIT_RETRY_MS;
}
