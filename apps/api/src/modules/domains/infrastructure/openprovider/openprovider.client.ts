import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegistrarApiException } from '../../domains.exceptions';

interface Envelope<T> {
  code?: number;
  desc?: string;
  data?: T;
}

export interface OpenproviderRequest {
  /** Label for error messages, e.g. 'availability check'. */
  operation: string;
  query?: Record<string, string | number | boolean>;
  body?: unknown;
  /** Defaults to 15s; sandbox `.mx` checks hang until the gateway 504s, so callers set it explicitly. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;
// Bearer tokens live 48h; refresh early, a 401 triggers a re-login anyway.
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_RETRY_MS = 3_000;

// 10005 "Access denied" (IP not whitelisted / account restricted), 10008 "API access is disabled for this contact" — both observed live.
const ACCOUNT_ERROR_CODES = new Set([10005, 10008]);

/** Openprovider REST v1 client: lazy login, cached bearer token, one re-login on 401. */
@Injectable()
export class OpenproviderClient {
  private readonly logger = new Logger(OpenproviderClient.name);
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private token: { value: string; expiresAt: number } | null = null;
  private loginInFlight: Promise<string> | null = null;

  constructor(configService: ConfigService) {
    // Boots without credentials (mirrors StripeProvider); calls fail until configured.
    this.baseUrl = (
      configService.get<string>('OPENPROVIDER_BASE_URL') ??
      'https://api.openprovider.eu/v1'
    ).replace(/\/+$/, '');
    this.username = configService.get<string>('OPENPROVIDER_USERNAME') ?? '';
    this.password = configService.get<string>('OPENPROVIDER_PASSWORD') ?? '';
    if (!this.username || !this.password) {
      this.logger.warn(
        'OPENPROVIDER_USERNAME / OPENPROVIDER_PASSWORD not set — domain calls will fail until configured.',
      );
    }
  }

  get<T>(path: string, opts: OpenproviderRequest): Promise<T> {
    return this.request<T>('GET', path, opts);
  }

  post<T>(path: string, opts: OpenproviderRequest): Promise<T> {
    return this.request<T>('POST', path, opts);
  }

  put<T>(path: string, opts: OpenproviderRequest): Promise<T> {
    return this.request<T>('PUT', path, opts);
  }

  delete<T>(path: string, opts: OpenproviderRequest): Promise<T> {
    return this.request<T>('DELETE', path, opts);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    opts: OpenproviderRequest,
  ): Promise<T> {
    try {
      return await this.send<T>(method, path, opts, await this.getToken());
    } catch (err) {
      if (err instanceof RegistrarApiException && err.httpStatus === 401) {
        this.token = null;
        return this.send<T>(method, path, opts, await this.getToken());
      }
      // 429 means the request was rejected unprocessed, so one delayed retry is safe even for writes.
      if (err instanceof RegistrarApiException && err.httpStatus === 429) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_RETRY_MS));
        return this.send<T>(method, path, opts, await this.getToken());
      }
      throw err;
    }
  }

  private getToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now()) {
      return Promise.resolve(this.token.value);
    }
    this.loginInFlight ??= this.login().finally(() => {
      this.loginInFlight = null;
    });
    return this.loginInFlight;
  }

  private async login(): Promise<string> {
    if (!this.username || !this.password) {
      throw new RegistrarApiException(
        'login',
        'OPENPROVIDER_USERNAME / OPENPROVIDER_PASSWORD are not configured',
        undefined,
        undefined,
        true,
      );
    }
    const data = await this.send<{ token?: string }>(
      'POST',
      'auth/login',
      {
        operation: 'login',
        body: { username: this.username, password: this.password },
        timeoutMs: 10_000,
      },
      null,
    );
    if (!data.token) {
      throw new RegistrarApiException('login', 'response contained no token');
    }
    this.token = { value: data.token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return data.token;
  }

  private async send<T>(
    method: string,
    path: string,
    opts: OpenproviderRequest,
    token: string | null,
  ): Promise<T> {
    const query = opts.query
      ? `?${new URLSearchParams(
          Object.entries(opts.query).map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : '';

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/${path}${query}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      });
    } catch (err) {
      const timedOut = err instanceof Error && err.name === 'TimeoutError';
      throw new RegistrarApiException(
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

    // Openprovider answers errors as `{ code, desc }`; code 0 means success.
    if (!res.ok || !payload || (payload.code ?? 0) !== 0) {
      const desc = payload?.desc || res.statusText || 'unexpected response';
      throw new RegistrarApiException(
        opts.operation,
        desc,
        res.status,
        payload?.code,
        isAccountError(payload?.code, desc),
      );
    }
    return payload.data as T;
  }
}

// Users never supply handles, so a handle error is always our OPENPROVIDER_CUSTOMER_HANDLE.
function isAccountError(code: number | undefined, desc: string): boolean {
  return (
    (code !== undefined && ACCOUNT_ERROR_CODES.has(code)) ||
    /\bhandle\b/i.test(desc)
  );
}
