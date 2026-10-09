import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FREE_CONTENT_SECURITY_POLICY,
  PAID_CONTENT_SECURITY_POLICY,
  composePublishedHtml,
  contentSecurityPolicy,
  injectFreeSiteBanner,
  publishedSiteHeaders,
} from './free-site';

const PAID_CUSTOM_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Security-Policy': 'frame-ancestors *',
  'Cache-Control': 'public, max-age=5, stale-while-revalidate=10, s-maxage=0',
};

describe('contentSecurityPolicy', () => {
  it('matches the strict unpaid policy and leaves paid sites on frame-ancestors', () => {
    assert.equal(
      FREE_CONTENT_SECURITY_POLICY,
      "default-src 'none'; img-src https: data:; style-src 'unsafe-inline' https:; font-src https: data:; script-src 'none'; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'; object-src 'none'; frame-ancestors *",
    );
    assert.equal(PAID_CONTENT_SECURITY_POLICY, 'frame-ancestors *');
    assert.equal(
      contentSecurityPolicy({ isPaid: false, hardenEnabled: true }),
      FREE_CONTENT_SECURITY_POLICY,
    );
    assert.equal(
      contentSecurityPolicy({ isPaid: false, hardenEnabled: false }),
      PAID_CONTENT_SECURITY_POLICY,
    );
    assert.equal(
      contentSecurityPolicy({ isPaid: true, hardenEnabled: true }),
      PAID_CONTENT_SECURITY_POLICY,
    );
  });
});

describe('publishedSiteHeaders', () => {
  it('keeps the historical headers for a paid custom domain and a paid preview', () => {
    assert.deepEqual(
      publishedSiteHeaders({
        isPaid: true,
        isPreview: false,
        hardenEnabled: true,
      }),
      PAID_CUSTOM_HEADERS,
    );
    assert.deepEqual(
      publishedSiteHeaders({
        isPaid: true,
        isPreview: false,
        hardenEnabled: false,
      }),
      PAID_CUSTOM_HEADERS,
    );
    assert.deepEqual(
      publishedSiteHeaders({
        isPaid: true,
        isPreview: true,
        hardenEnabled: true,
      }),
      { ...PAID_CUSTOM_HEADERS, 'X-Robots-Tag': 'noindex' },
    );
  });

  it('noindexes unpaid sites and applies the strict policy only when hardening is on', () => {
    assert.equal(
      publishedSiteHeaders({
        isPaid: false,
        isPreview: true,
        hardenEnabled: true,
      })['Content-Security-Policy'],
      FREE_CONTENT_SECURITY_POLICY,
    );
    assert.equal(
      publishedSiteHeaders({
        isPaid: false,
        isPreview: true,
        hardenEnabled: false,
      })['Content-Security-Policy'],
      PAID_CONTENT_SECURITY_POLICY,
    );
    assert.equal(
      publishedSiteHeaders({
        isPaid: false,
        isPreview: false,
        hardenEnabled: false,
      })['X-Robots-Tag'],
      'noindex',
    );
  });
});

describe('injectFreeSiteBanner', () => {
  it('inserts the banner before </body> and appends it when the tag is missing', () => {
    const withBody = injectFreeSiteBanner(
      '<html><body><p>Hola</p></body></html>',
      'https://dashboard.lattiz.app/dashboard/subscription',
      'mailto:soporte@lattiz.app',
    );
    const bodyAt = withBody.toLowerCase().lastIndexOf('</body>');
    assert.ok(withBody.indexOf('id="lz-preview-banner"') < bodyAt);
    assert.match(withBody, /Sitio de prueba creado con Lattiz/);
    assert.match(withBody, /Obtén tu dominio/);
    assert.match(withBody, /Reportar abuso/);
    assert.equal(withBody.includes('<script'), false);

    const bare = injectFreeSiteBanner(
      '<p>Hola</p>',
      'https://lattiz.app/plan',
      'mailto:a@b.c',
    );
    assert.ok(bare.endsWith('</div>'));
    assert.match(bare, /href="https:\/\/lattiz\.app\/plan"/);
  });

  it('escapes urls so they cannot break out of the href attribute', () => {
    const html = injectFreeSiteBanner(
      '<body></BODY>',
      'https://example.com/?q="><img>',
      'mailto:a&b@lattiz.app',
    );
    assert.match(
      html,
      /href="https:\/\/example\.com\/\?q=&quot;&gt;&lt;img&gt;"/,
    );
    assert.match(html, /href="mailto:a&amp;b@lattiz\.app"/);
    assert.equal(html.includes('<img>'), false);
    assert.match(html, /<\/body>$/i);
  });
});

describe('composePublishedHtml', () => {
  const seoHtml = '<html><head></head><body><p>Sitio</p></body></html>';

  it('leaves a paid document unchanged aside from analytics', () => {
    assert.equal(
      composePublishedHtml({
        seoHtml,
        isPaid: true,
        analyticsMeasurementId: null,
        hardenEnabled: true,
        upgradeUrl: 'https://dashboard.lattiz.app/dashboard/subscription',
        abuseReportUrl: 'mailto:soporte@lattiz.app',
      }),
      seoHtml,
    );
    const withAnalytics = composePublishedHtml({
      seoHtml,
      isPaid: true,
      analyticsMeasurementId: 'G-TEST1234',
      hardenEnabled: true,
      upgradeUrl: 'https://dashboard.lattiz.app/dashboard/subscription',
      abuseReportUrl: 'mailto:soporte@lattiz.app',
    });
    assert.match(withAnalytics, /lz-consent-host/);
    assert.equal(withAnalytics.includes('lz-preview-banner'), false);
  });

  it('skips analytics on unpaid sites and skips the banner when hardening is off', () => {
    const hardened = composePublishedHtml({
      seoHtml,
      isPaid: false,
      analyticsMeasurementId: 'G-TEST1234',
      hardenEnabled: true,
      upgradeUrl: 'https://dashboard.lattiz.app/dashboard/subscription',
      abuseReportUrl: 'mailto:soporte@lattiz.app',
    });
    assert.equal(hardened.includes('lz-consent-host'), false);
    assert.match(hardened, /lz-preview-banner/);

    const open = composePublishedHtml({
      seoHtml,
      isPaid: false,
      analyticsMeasurementId: 'G-TEST1234',
      hardenEnabled: false,
      upgradeUrl: 'https://dashboard.lattiz.app/dashboard/subscription',
      abuseReportUrl: 'mailto:soporte@lattiz.app',
    });
    assert.equal(open, seoHtml);
  });
});
