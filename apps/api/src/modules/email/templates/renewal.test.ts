import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DASHBOARD_URLS } from '../domain/email-kinds';
import { renderEmail } from './index';
import {
  type RenewalEmailData,
  renderDomainExpired,
  renderDomainLost,
  renderDomainRenewed,
  renderRenewalLastNotice,
  renderRenewalUpcoming,
} from './renewal';

const EXPIRES_AT = '2026-07-15T18:00:00.000Z';
const LATE_AT = '2026-07-30T18:00:00.000Z';

function when(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Mexico_City',
  });
}

function money(cents: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(cents / 100);
}

function payload(overrides: Partial<RenewalEmailData> = {}): RenewalEmailData {
  return {
    domain: 'cafe.mx',
    expiresAt: EXPIRES_AT,
    lateDeadlineAt: LATE_AT,
    daysLeft: 14,
    baseCents: 59900,
    taxCents: 9584,
    totalCents: 69484,
    currency: 'mxn',
    subscriptionActive: true,
    ...overrides,
  };
}

function assertMoney(rendered: { html: string; text: string }): void {
  for (const body of [rendered.html, rendered.text]) {
    assert.match(body, new RegExp(escapeRegExp(money(59900))));
    assert.match(body, new RegExp(escapeRegExp(money(9584))));
    assert.match(body, new RegExp(escapeRegExp(money(69484))));
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('renewal email templates', () => {
  it('renders the upcoming notice with the real days, charge and offline warning', () => {
    const rendered = renderRenewalUpcoming(payload());
    assert.equal(rendered.subject, 'Tu dominio cafe.mx vence en 14 días');
    assert.match(rendered.html, new RegExp(when(EXPIRES_AT)));
    assert.match(rendered.text, /faltan 14 días/);
    assert.match(rendered.html, /subdominio de Lattiz/);
    assert.match(rendered.html, /correo asociado al dominio/);
    assert.match(rendered.html, new RegExp(when(LATE_AT)));
    assert.match(rendered.html, /no se reembolsa/);
    assert.match(rendered.html, new RegExp(DASHBOARD_URLS.domain));
    assert.match(rendered.html, /Pagar renovación/);
    assert.doesNotMatch(rendered.html, new RegExp(DASHBOARD_URLS.subscription));
    assertMoney(rendered);
  });

  it('renders the expiry-day notice', () => {
    const rendered = renderDomainExpired(payload({ daysLeft: 0 }));
    assert.equal(rendered.subject, 'Tu dominio cafe.mx venció');
    assert.match(rendered.html, /fuera de línea/);
    assert.match(rendered.html, /subdominio de Lattiz/);
    assert.match(rendered.html, /correo del dominio/);
    assert.match(rendered.html, new RegExp(when(LATE_AT)));
    assert.match(rendered.html, new RegExp(DASHBOARD_URLS.domain));
    assertMoney(rendered);
  });

  it('renders the late notice with the deadline', () => {
    const rendered = renderRenewalLastNotice(payload({ daysLeft: 8 }));
    assert.equal(rendered.subject, 'Tu dominio cafe.mx sigue fuera de línea');
    assert.match(rendered.html, /sigue fuera de línea/);
    assert.match(rendered.html, /se pierde definitivamente/);
    assert.match(rendered.html, new RegExp(when(LATE_AT)));
    assert.match(rendered.html, new RegExp(DASHBOARD_URLS.domain));
    assertMoney(rendered);
  });

  it('tells an inactive subscriber to reactivate the plan before paying', () => {
    for (const render of [
      renderRenewalUpcoming,
      renderDomainExpired,
      renderRenewalLastNotice,
    ]) {
      const rendered = render(payload({ subscriptionActive: false }));
      assert.match(rendered.html, /reactiva tu plan/);
      assert.match(rendered.html, new RegExp(DASHBOARD_URLS.subscription));
      assert.match(rendered.text, new RegExp(DASHBOARD_URLS.subscription));
    }
  });

  it('escapes a domain that contains HTML', () => {
    const domain = 'a<b>&c.mx';
    for (const render of [
      renderRenewalUpcoming,
      renderDomainExpired,
      renderRenewalLastNotice,
      renderDomainLost,
      renderDomainRenewed,
    ]) {
      const rendered = render(payload({ domain }));
      assert.match(rendered.html, /a&lt;b&gt;&amp;c\.mx/);
      assert.doesNotMatch(rendered.html, /<b>/);
      assert.match(rendered.text, /a<b>&c\.mx/);
      assert.match(rendered.subject, /a<b>&c\.mx/);
    }
  });

  it('says the domain is lost and the site is back on the Lattiz subdomain', () => {
    const rendered = renderDomainLost(payload());
    assert.equal(rendered.subject, 'Se perdió el dominio cafe.mx');
    assert.match(rendered.html, /se perdió de forma definitiva/);
    assert.match(rendered.html, /subdominio de Lattiz/);
    assert.match(rendered.html, /hola@lattiz\.app/);
    assert.match(rendered.text, /hola@lattiz\.app/);
    assert.doesNotMatch(rendered.html, /Pagar renovación/);
  });

  it('confirms the new expiry and, when the site was offline, that it is back', () => {
    const quiet = renderDomainRenewed(payload());
    assert.equal(quiet.subject, 'Renovamos el dominio cafe.mx');
    assert.match(quiet.html, new RegExp(when(EXPIRES_AT)));
    assert.doesNotMatch(quiet.html, /vuelve a estar en línea/);

    const back = renderDomainRenewed(payload({ siteWasOffline: true }));
    assert.match(back.html, /vuelve a estar en línea/);
    assert.match(back.text, /vuelve a estar en línea/);
  });

  it('is reachable from the kind renderer', () => {
    const rendered = renderEmail('domain_lost', {
      domain: 'cafe.mx',
      expiresAt: EXPIRES_AT,
      lateDeadlineAt: LATE_AT,
      daysLeft: 0,
      baseCents: 59900,
      taxCents: 9584,
      totalCents: 69484,
      currency: 'mxn',
      subscriptionActive: true,
    });
    assert.equal(rendered.subject, 'Se perdió el dominio cafe.mx');
  });
});
