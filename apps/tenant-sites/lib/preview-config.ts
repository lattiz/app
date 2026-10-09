export interface PreviewConfig {
  hardenEnabled: boolean;
  abuseReportUrl: string;
  upgradeUrl: string;
}

const DEFAULT_HARDEN_ENABLED = true;
const DEFAULT_ABUSE_REPORT_URL = 'mailto:soporte@lattiz.app';
const DEFAULT_UPGRADE_URL =
  'https://dashboard.lattiz.app/dashboard/subscription';

/**
 * Free-preview switches for the public renderer. The only place that reads
 * these env vars. Trial length and whether the window is open live in
 * app_settings (preview.trial_days / preview.enabled).
 */
export function loadPreviewConfig(
  env: Record<string, string | undefined> = process.env,
): PreviewConfig {
  return {
    hardenEnabled: readBool(
      'PREVIEW_HARDEN_ENABLED',
      env.PREVIEW_HARDEN_ENABLED,
      DEFAULT_HARDEN_ENABLED,
    ),
    abuseReportUrl: readUrl(
      'PREVIEW_ABUSE_REPORT_URL',
      env.PREVIEW_ABUSE_REPORT_URL,
      DEFAULT_ABUSE_REPORT_URL,
      (url) =>
        url.protocol === 'mailto:' ||
        url.protocol === 'https:' ||
        url.protocol === 'http:',
      'an http(s) URL or a mailto: address',
    ),
    upgradeUrl: readUrl(
      'PREVIEW_UPGRADE_URL',
      env.PREVIEW_UPGRADE_URL,
      DEFAULT_UPGRADE_URL,
      (url) => url.protocol === 'https:' || url.protocol === 'http:',
      'an absolute http(s) URL',
    ),
  };
}

function readBool(
  name: string,
  raw: string | undefined,
  fallback: boolean,
): boolean {
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = raw.trim().toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(
    `${name}="${raw.trim()}" is invalid; expected "true" or "false".`,
  );
}

function readUrl(
  name: string,
  raw: string | undefined,
  fallback: string,
  allowed: (url: URL) => boolean,
  expectation: string,
): string {
  const value = raw === undefined || raw.trim() === '' ? fallback : raw.trim();
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name}="${value}" is invalid; expected ${expectation}.`);
  }
  if (!allowed(url)) {
    throw new Error(`${name}="${value}" is invalid; expected ${expectation}.`);
  }
  return value;
}
