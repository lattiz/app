import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../database/database.module';
import { AdminAlertService } from '../email/application/admin-alert.service';
import { DomainRenewalConfig } from './domain-renewal.config';
import { RENEWAL_DAY_MS } from './domain/domain-renewal.policy';
import { REGISTRAR_PORT, type RegistrarPort } from './domain/registrar.port';

const PRICE_CAP = 50;

interface DueDomainRow {
  domain: string;
  expires_at: string | Date;
}

/**
 * Daily check that the registrar balance covers upcoming renewals.
 * Prices are read one domain at a time because Openprovider returns 429 in bursts.
 */
@Injectable()
export class RegistrarBalanceAlertService {
  private readonly logger = new Logger(RegistrarBalanceAlertService.name);
  private running = false;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(REGISTRAR_PORT) private readonly registrar: RegistrarPort,
    private readonly config: DomainRenewalConfig,
    private readonly adminAlerts: AdminAlertService,
  ) {}

  @Cron('15 7 * * *')
  async runScheduled(now: Date = new Date()): Promise<void> {
    if (!this.config.enabled || this.running) return;
    this.running = true;
    try {
      await this.run(now);
    } catch (err) {
      this.logger.error(
        `[domain-renewal] Balance alert failed: ${errorText(err)}`,
      );
    } finally {
      this.running = false;
    }
  }

  async run(now: Date = new Date()): Promise<void> {
    if (!this.config.enabled) return;
    try {
      const through = new Date(
        now.getTime() + this.config.balanceAlertDays * RENEWAL_DAY_MS,
      );
      const rows = await this.query<DueDomainRow>(
        sql`SELECT domain, expires_at
            FROM (
              SELECT d.domain, d.expires_at
              FROM public.domains d
              WHERE d.source = 'lattiz_managed'
                AND d.is_mock = false
                AND d.released_at IS NULL
                AND d.purchase_completed_at IS NOT NULL
                AND d.registrar_domain_id IS NOT NULL
                AND d.expires_at IS NOT NULL
                AND d.expires_at > ${iso(now)}::timestamptz
                AND d.expires_at <= ${iso(through)}::timestamptz
              UNION
              SELECT d.domain, d.expires_at
              FROM public.domain_maintenance_cycles c
              JOIN public.domains d ON d.id = c.domain_id
              WHERE c.status = 'paid'
                AND d.source = 'lattiz_managed'
                AND d.is_mock = false
                AND d.released_at IS NULL
                AND d.purchase_completed_at IS NOT NULL
                AND d.registrar_domain_id IS NOT NULL
            ) due
            ORDER BY expires_at
            LIMIT ${PRICE_CAP}`,
      );
      if (rows.length === 0) return;

      let sum = 0;
      let unknown = 0;
      const listed: string[] = [];
      for (const row of rows.slice(0, PRICE_CAP)) {
        const expiresAt = asDate(row.expires_at);
        const when = Number.isNaN(expiresAt.getTime())
          ? String(row.expires_at)
          : expiresAt.toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              timeZone: 'America/Mexico_City',
            });
        listed.push(`${row.domain} (${when})`);
        try {
          sum += await this.registrar.getPriceUsdCents(row.domain, 'renew');
        } catch (err) {
          unknown += 1;
          this.logger.warn(
            `[domain-renewal] Renewal price unknown for ${row.domain}: ${errorText(err)}`,
          );
        }
      }

      const balance = await this.registrar.getBalance();
      if (balance.availableCents >= sum) return;
      await this.adminAlerts.alert({
        key: `registrar_balance:${mexicoDay(now)}`,
        title: 'Saldo del registrador insuficiente',
        summary:
          'El saldo disponible no cubre las renovaciones de la ventana. El saldo está en la moneda de la cuenta de Openprovider y los precios en USD; pueden no coincidir.',
        details: {
          saldo_disponible_centavos: balance.availableCents,
          suma_necesaria_centavos: sum,
          dominios: rows.length,
          precios_desconocidos: unknown,
          lista: listed.join(', '),
        },
      });
    } catch (err) {
      this.logger.error(
        `[domain-renewal] Balance alert failed: ${errorText(err)}`,
      );
    }
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function mexicoDay(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function asDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function errorText(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  return message.slice(0, 500);
}

/** postgres.js rejects a Date bound in raw sql; bind ISO text and cast. */
function iso(value: Date): string {
  return value.toISOString();
}
