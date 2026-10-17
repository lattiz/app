import type { DeletionStepDto } from '@lattiz/api-client';
import { describe, expect, it } from 'vitest';
import {
  DELETION_POLL_MS,
  STEP_ICON,
  STEP_LABEL,
  STEP_ORDER,
  canStartDeletion,
  deletionPreviewCards,
  deletionRefetchInterval,
  describeStep,
  describeSteps,
  isFinalDeletionStatus,
  manualActions,
} from './model';

function step(
  key: DeletionStepDto['key'],
  status: DeletionStepDto['status'],
  extra: Partial<DeletionStepDto> = {},
): DeletionStepDto {
  return {
    key,
    status,
    startedAt: null,
    finishedAt: null,
    detail: null,
    error: null,
    ...extra,
  };
}

describe('canStartDeletion', () => {
  const ready = {
    blocking: false,
    slug: 'cafe-centro',
    confirmation: 'cafe-centro',
    reason: 'Cerró el local',
  };

  it('enables only when the slug matches exactly and the reason is long enough', () => {
    expect(canStartDeletion(ready)).toBe(true);
    expect(canStartDeletion({ ...ready, confirmation: 'Cafe-centro' })).toBe(
      false,
    );
    expect(canStartDeletion({ ...ready, confirmation: 'cafe-centro ' })).toBe(
      false,
    );
    expect(canStartDeletion({ ...ready, confirmation: '' })).toBe(false);
    expect(canStartDeletion({ ...ready, reason: 'no' })).toBe(false);
    expect(canStartDeletion({ ...ready, reason: '  ab  ' })).toBe(false);
    expect(canStartDeletion({ ...ready, reason: `  ${'a'.repeat(3)}  ` })).toBe(
      true,
    );
    expect(canStartDeletion({ ...ready, reason: 'a'.repeat(501) })).toBe(false);
    expect(canStartDeletion({ ...ready, reason: 'a'.repeat(500) })).toBe(true);
  });

  it('stays disabled while the preview is blocking', () => {
    expect(canStartDeletion({ ...ready, blocking: true })).toBe(false);
  });

  it('stays disabled when the slug itself is empty', () => {
    expect(canStartDeletion({ ...ready, slug: '', confirmation: '' })).toBe(
      false,
    );
  });
});

describe('describeSteps', () => {
  it('maps every step to its Spanish name, status and icon, in order', () => {
    const views = describeSteps([]);
    expect(views.map((view) => view.key)).toEqual([...STEP_ORDER]);
    expect(views.map((view) => view.label)).toEqual(
      STEP_ORDER.map((key) => STEP_LABEL[key]),
    );
    expect(views.every((view) => view.icon === 'circle')).toBe(true);
    expect(views.every((view) => view.statusLabel === 'Pendiente')).toBe(true);
  });

  it('uses the failed error, the manual detail, and the matching icon', () => {
    const failed = describeStep(
      step('stripe', 'failed', {
        error: 'Stripe no respondió',
        detail: 'no mostrar',
        finishedAt: '2026-03-01T18:00:00.000Z',
      }),
    );
    expect(failed).toMatchObject({
      label: 'Stripe',
      statusLabel: 'Falló',
      icon: 'x',
      note: 'Stripe no respondió',
      at: '2026-03-01T18:00:00.000Z',
    });

    const manual = describeStep(
      step('registrar', 'manual', {
        detail: 'Apaga la renovación en Openprovider',
        startedAt: '2026-03-01T17:00:00.000Z',
      }),
    );
    expect(manual).toMatchObject({
      label: 'Registrador',
      statusLabel: 'Acción manual',
      icon: 'alert',
      note: 'Apaga la renovación en Openprovider',
      at: '2026-03-01T17:00:00.000Z',
    });

    expect(describeStep(step('verify', 'running')).icon).toBe('spinner');
    expect(describeStep(step('offline', 'done')).icon).toBe('check');
    expect(describeStep(step('emails', 'skipped')).icon).toBe('minus');
    expect(STEP_ICON.pending).toBe('circle');
  });
});

describe('manualActions', () => {
  it('keeps only manual steps, in the fixed order, with their detail', () => {
    const actions = manualActions([
      step('analytics', 'manual', { detail: 'Vaciar la papelera el día 35' }),
      step('domain', 'manual', { detail: '  Quitar la zona ajena  ' }),
      step('stripe', 'done', { detail: 'ya cancelado' }),
      step('emails', 'failed', { error: 'no' }),
    ]);
    expect(actions).toEqual([
      {
        key: 'domain',
        label: 'Dominio (Vercel y Cloudflare)',
        detail: 'Quitar la zona ajena',
      },
      {
        key: 'analytics',
        label: 'Google Analytics',
        detail: 'Vaciar la papelera el día 35',
      },
    ]);
  });
});

describe('deletionRefetchInterval', () => {
  it('polls every 2 seconds only while the job is pending or running', () => {
    expect(deletionRefetchInterval('pending')).toBe(DELETION_POLL_MS);
    expect(deletionRefetchInterval('running')).toBe(2_000);
    expect(deletionRefetchInterval(undefined)).toBe(false);
    for (const status of ['completed', 'completed_manual', 'failed'] as const) {
      expect(isFinalDeletionStatus(status)).toBe(true);
      expect(deletionRefetchInterval(status)).toBe(false);
    }
  });
});

describe('deletionPreviewCards', () => {
  it('describes what each provider loses', () => {
    const cards = deletionPreviewCards(
      {
        stripe: {
          customerId: 'cus_1',
          liveSubscriptionIds: ['sub_1', 'sub_2'],
          balance: 0,
          openInvoices: 0,
        },
        domain: {
          name: 'cafe.mx',
          source: 'lattiz_managed',
          dnsProvider: null,
          dnsZoneId: null,
          activeDnsProvider: 'cloudflare',
          zoneOnActiveProvider: true,
          vercelInProject: true,
          expiresAt: '2027-03-03T00:00:00.000Z',
          autoRenew: 'off',
          renewalDate: null,
        },
        analytics: { propertyId: '123', isMock: false },
        storage: {
          assetsBytes: 24,
          brandingBytes: 0,
          assetsObjects: 1,
          brandingObjects: 0,
        },
        pendingEmails: 0,
      },
      () => '3 mar 2027',
    );
    expect(cards.map((card) => card.title)).toEqual([
      'Stripe',
      'Dominio',
      'Google Analytics',
      'Archivos (R2)',
      'Correos',
      'Cuenta',
    ]);
    expect(cards[0]?.body).toBe(
      'Se cancelan 2 suscripciones. El cliente y sus facturas se conservan.',
    );
    expect(cards[1]?.body).toContain('3 mar 2027');
    expect(cards[2]?.body).toContain('35 días');
    expect(cards[3]?.body).toBe('24 B en 1 archivo.');
    expect(cards[5]?.body).toContain('usuario');
  });
});
