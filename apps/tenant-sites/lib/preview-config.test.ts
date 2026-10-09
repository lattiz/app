import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadPreviewConfig } from './preview-config';

const DEFAULTS = {
  hardenEnabled: true,
  abuseReportUrl: 'mailto:soporte@lattiz.app',
  upgradeUrl: 'https://dashboard.lattiz.app/dashboard/subscription',
};

describe('loadPreviewConfig', () => {
  it('uses the documented defaults when the variables are unset or blank', () => {
    assert.deepEqual(loadPreviewConfig({}), DEFAULTS);
    assert.deepEqual(
      loadPreviewConfig({
        PREVIEW_HARDEN_ENABLED: '',
        PREVIEW_ABUSE_REPORT_URL: ' ',
        PREVIEW_UPGRADE_URL: '',
      }),
      DEFAULTS,
    );
  });

  it('accepts an explicit valid set', () => {
    const config = loadPreviewConfig({
      PREVIEW_HARDEN_ENABLED: 'false',
      PREVIEW_ABUSE_REPORT_URL: 'https://lattiz.app/abuso',
      PREVIEW_UPGRADE_URL: 'http://localhost:5173/dashboard/subscription',
    });
    assert.deepEqual(config, {
      hardenEnabled: false,
      abuseReportUrl: 'https://lattiz.app/abuso',
      upgradeUrl: 'http://localhost:5173/dashboard/subscription',
    });
  });

  it('ignores the retired trial window variables', () => {
    assert.deepEqual(
      loadPreviewConfig({
        PREVIEW_ENABLED: 'false',
        PREVIEW_TRIAL_DAYS: '30',
      }),
      DEFAULTS,
    );
  });

  it('rejects invalid switches and urls', () => {
    assert.throws(
      () => loadPreviewConfig({ PREVIEW_HARDEN_ENABLED: '1' }),
      /PREVIEW_HARDEN_ENABLED="1"/,
    );
    assert.throws(
      () => loadPreviewConfig({ PREVIEW_UPGRADE_URL: 'javascript:alert(1)' }),
      /PREVIEW_UPGRADE_URL/,
    );
    assert.throws(
      () => loadPreviewConfig({ PREVIEW_ABUSE_REPORT_URL: 'not a url' }),
      /PREVIEW_ABUSE_REPORT_URL/,
    );
    assert.throws(
      () =>
        loadPreviewConfig({ PREVIEW_UPGRADE_URL: 'mailto:soporte@lattiz.app' }),
      /PREVIEW_UPGRADE_URL/,
    );
  });
});
