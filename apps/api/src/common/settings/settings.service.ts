import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SETTINGS_STORE, type SettingsStorePort } from './settings-store.port';
import {
  dbBool,
  dbInt,
  dbStringList,
  envBool,
  envInt,
  envStringList,
  envWarningDay,
  SETTINGS,
  type BoolKey,
  type IntKey,
  type IntSetting,
  type ResolveContext,
  type StringListKey,
} from './settings.registry';

const DEFAULT_REFRESH_SECONDS = 60;
const MIN_REFRESH_SECONDS = 5;
const NO_CONTEXT: ResolveContext = { trialDays: 0 };

export function refreshIntervalSeconds(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') return DEFAULT_REFRESH_SECONDS;
  const trimmed = raw.trim();
  if (!/^[0-9]+$/.test(trimmed)) {
    throw new Error(
      `SETTINGS_REFRESH_SECONDS="${trimmed}" is invalid; expected an integer >= ${MIN_REFRESH_SECONDS}.`,
    );
  }
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value) || value < MIN_REFRESH_SECONDS) {
    throw new Error(
      `SETTINGS_REFRESH_SECONDS="${trimmed}" is invalid; expected an integer >= ${MIN_REFRESH_SECONDS}.`,
    );
  }
  return value;
}

@Injectable()
export class SettingsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SettingsService.name);
  private snapshot: ReadonlyMap<string, unknown> = new Map();
  private readonly warnedKeys = new Set<string>();
  private inflight: Promise<void> | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly config: ConfigService,
    @Inject(SETTINGS_STORE) private readonly store: SettingsStorePort,
  ) {}

  async onModuleInit(): Promise<void> {
    const seconds = refreshIntervalSeconds(
      this.config.get<string>('SETTINGS_REFRESH_SECONDS'),
    );
    await this.reload();
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      void this.reload();
    }, seconds * 1000);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  /** Replaces the in-memory snapshot. Concurrent callers share one load. */
  reload(): Promise<void> {
    if (this.inflight) return this.inflight;
    this.inflight = this.loadSnapshot().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  getBool(key: BoolKey): boolean {
    const def = SETTINGS[key];
    if (this.snapshot.has(key)) {
      const parsed = dbBool(this.snapshot.get(key));
      if (parsed.ok && def.validate(parsed.value, NO_CONTEXT)) {
        this.warnedKeys.delete(key);
        return parsed.value;
      }
      this.warnOnce(key, parsed.ok ? 'failed validation' : parsed.reason);
    } else {
      this.warnedKeys.delete(key);
    }
    return envBool(def, this.readEnv(def.envVar));
  }

  getInt(key: IntKey): number {
    const def = SETTINGS[key];
    const ctx = this.contextFor(def);
    if (this.snapshot.has(key)) {
      const parsed = dbInt(this.snapshot.get(key));
      if (parsed.ok && def.validate(parsed.value, ctx)) {
        this.warnedKeys.delete(key);
        return parsed.value;
      }
      this.warnOnce(
        key,
        parsed.ok
          ? `value ${parsed.value} is outside the allowed range`
          : parsed.reason,
      );
    } else {
      this.warnedKeys.delete(key);
    }
    const raw = this.readEnv(def.envVar);
    if (def.deriveFromTrial) return envWarningDay(raw, ctx.trialDays);
    return envInt(def, raw, ctx);
  }

  getStringList(key: StringListKey): readonly string[] {
    const def = SETTINGS[key];
    if (this.snapshot.has(key)) {
      const parsed = dbStringList(def, this.snapshot.get(key));
      if (parsed.ok) {
        this.warnedKeys.delete(key);
        return parsed.value;
      }
      this.warnOnce(key, parsed.reason);
    } else {
      this.warnedKeys.delete(key);
    }
    return envStringList(def, this.readEnv(def.envVar));
  }

  private contextFor(def: IntSetting): ResolveContext {
    if (!def.deriveFromTrial) return NO_CONTEXT;
    return { trialDays: this.getInt('preview.trial_days') };
  }

  private readEnv(name: string): string | undefined {
    return this.config.get<string>(name);
  }

  private async loadSnapshot(): Promise<void> {
    try {
      this.snapshot = await this.store.loadAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `app_settings reload failed; keeping the previous snapshot: ${message}`,
      );
    }
  }

  private warnOnce(key: string, reason: string): void {
    if (this.warnedKeys.has(key)) return;
    this.warnedKeys.add(key);
    this.logger.warn(
      `app_settings "${key}" ignored (${reason}); using the environment variable or the code default`,
    );
  }
}
