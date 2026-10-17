import { describe, expect, it } from 'vitest';
import { templateStatusBadge, templateTierBadge } from './labels';
import { previewScale } from './preview-scale';

describe('template badges', () => {
  it('names the tier and the catalog status', () => {
    expect(templateTierBadge('basic')).toEqual({ label: 'Básico', tone: 'neutral' });
    expect(templateTierBadge('pro')).toEqual({ label: 'Pro', tone: 'info' });
    expect(templateStatusBadge('active')).toEqual({ label: 'Activa', tone: 'good' });
    expect(templateStatusBadge('pending')).toEqual({ label: 'Pendiente', tone: 'warn' });
  });
});

describe('preview scale', () => {
  it('fits the iframe to the card and never scales it up', () => {
    expect(previewScale(720, 1440)).toBe(0.5);
    expect(previewScale(1600, 1440)).toBe(1);
    expect(previewScale(360, 360)).toBe(1);
    expect(previewScale(0, 1440)).toBe(0);
    expect(previewScale(400, 0)).toBe(1);
    expect(previewScale(Number.NaN, 768)).toBe(1);
  });
});
