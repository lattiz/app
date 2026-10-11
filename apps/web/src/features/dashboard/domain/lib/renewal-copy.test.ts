import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { DomainRenewalStatusDto } from '@lattiz/api-client';
import {
  daysUntil,
  domainRenewalCopy,
  formatLongDate,
  renewalAmountLine,
} from './renewal-copy';

const DAY_MS = 86_400_000;
const NOW = new Date('2026-08-01T12:00:00.000Z');

function renewal(
  overrides: Partial<DomainRenewalStatusDto> = {},
): DomainRenewalStatusDto {
  return {
    domain: 'ejemplo.mx',
    status: 'open',
    expiresAt: new Date(NOW.getTime() + 20 * DAY_MS).toISOString(),
    lateDeadlineAt: null,
    baseCents: 59_900,
    taxCents: 9_584,
    totalCents: 69_484,
    currency: 'mxn',
    canPay: true,
    payBlockedReason: null,
    ...overrides,
  };
}

function atDays(days: number, extraMs = 0): string {
  return new Date(NOW.getTime() + days * DAY_MS + extraMs).toISOString();
}

describe('daysUntil', () => {
  it('rounds partial days up', () => {
    assert.equal(daysUntil(atDays(7, 1), NOW), 8);
    assert.equal(daysUntil(atDays(7, -1), NOW), 7);
    assert.equal(daysUntil(atDays(0), NOW), 0);
  });
});

describe('domainRenewalCopy', () => {
  it('uses an info tone more than 7 days before expiry', () => {
    const expiresAt = atDays(8);
    const copy = domainRenewalCopy(renewal({ expiresAt }), NOW);
    assert.equal(copy.tone, 'info');
    assert.equal(copy.title, 'Renueva tu dominio');
    assert.equal(copy.cta, 'Pagar renovación');
    assert.equal(copy.showAmount, true);
    assert.match(
      copy.description,
      new RegExp(
        `Tu dominio vence el ${formatLongDate(expiresAt)} \\(faltan 8 días\\)`,
      ),
    );
    assert.match(
      copy.description,
      /tu sitio, su dirección de Lattiz y el correo de tu dominio dejan de funcionar/,
    );
  });

  it('warns when 7 days or fewer remain', () => {
    const copy = domainRenewalCopy(renewal({ expiresAt: atDays(7) }), NOW);
    assert.equal(copy.tone, 'warning');
    assert.equal(copy.title, 'Tu dominio vence en 7 días');
    assert.match(copy.description, /faltan 7 días/);
  });

  it('uses the singular when one day remains', () => {
    const copy = domainRenewalCopy(renewal({ expiresAt: atDays(1) }), NOW);
    assert.equal(copy.title, 'Tu dominio vence en 1 día');
    assert.match(copy.description, /falta 1 día/);
  });

  it('says the domain expires today when no whole day remains', () => {
    const copy = domainRenewalCopy(renewal({ expiresAt: atDays(0) }), NOW);
    assert.equal(copy.tone, 'warning');
    assert.equal(copy.title, 'Tu dominio vence hoy');
    assert.match(copy.description, /\(hoy\)/);
  });

  it('describes an overdue site that can still be recovered', () => {
    const expiresAt = atDays(-2);
    const lateDeadlineAt = atDays(13);
    const copy = domainRenewalCopy(
      renewal({ status: 'overdue', expiresAt, lateDeadlineAt }),
      NOW,
    );
    assert.equal(copy.tone, 'destructive');
    assert.equal(copy.title, 'Tu sitio está fuera de línea');
    assert.equal(copy.cta, 'Pagar renovación');
    assert.equal(copy.showAmount, true);
    assert.match(
      copy.description,
      new RegExp(`Tu dominio venció el ${formatLongDate(expiresAt)}`),
    );
    assert.match(
      copy.description,
      new RegExp(
        `Puedes pagar hasta el ${formatLongDate(lateDeadlineAt)} para recuperar tu dominio y tu sitio`,
      ),
    );
    assert.match(copy.description, /se pierde definitivamente/);
  });

  it('asks to reactivate the plan instead of paying', () => {
    const copy = domainRenewalCopy(
      renewal({
        canPay: false,
        payBlockedReason: 'subscription_inactive',
      }),
      NOW,
    );
    assert.equal(copy.cta, 'Reactivar plan');
    assert.equal(copy.showAmount, true);
    assert.match(
      copy.description,
      /Para pagar la renovación primero reactiva tu plan\./,
    );
  });

  it('drops the button when the renewal window is closed', () => {
    const copy = domainRenewalCopy(
      renewal({
        status: 'overdue',
        expiresAt: atDays(-16),
        lateDeadlineAt: atDays(-1),
        canPay: false,
        payBlockedReason: 'window_closed',
      }),
      NOW,
    );
    assert.equal(copy.cta, null);
    assert.equal(copy.showAmount, false);
    assert.match(copy.description, /El plazo para renovar terminó\./);
  });

  it('confirms a received payment without a button', () => {
    const copy = domainRenewalCopy(
      renewal({ status: 'paid', canPay: false }),
      NOW,
    );
    assert.deepEqual(copy, {
      tone: 'info',
      title: 'Pago recibido',
      description:
        'Estamos renovando tu dominio; esto suele tardar unos minutos.',
      cta: null,
      showAmount: false,
    });
  });

  it('explains a manual renewal without a button', () => {
    const copy = domainRenewalCopy(
      renewal({ status: 'renewal_failed', canPay: false }),
      NOW,
    );
    assert.equal(copy.tone, 'warning');
    assert.equal(copy.title, 'Estamos renovando tu dominio');
    assert.equal(copy.cta, null);
    assert.equal(copy.showAmount, false);
    assert.match(copy.description, /te escribiremos por correo/);
  });
});

describe('renewalAmountLine', () => {
  it('breaks down the annual fee, IVA, and total', () => {
    assert.equal(
      renewalAmountLine(renewal()),
      'Cuota anual $599.00 + IVA $95.84 = $694.84 MXN',
    );
  });
});
