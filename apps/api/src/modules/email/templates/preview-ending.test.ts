import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DASHBOARD_URLS } from '../domain/email-kinds';
import { renderEmail } from './index';
import { renderPreviewEnding } from './preview-ending';

const ENDS_AT = '2026-10-18T18:00:00.000Z';
const WHEN = new Date(ENDS_AT).toLocaleDateString('es-MX', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'America/Mexico_City',
});

describe('renderPreviewEnding', () => {
  it('renders the subject, end date, expiry copy, and subscription link', () => {
    const rendered = renderPreviewEnding({
      endsAt: ENDS_AT,
      siteName: 'Café Norte',
    });
    assert.equal(
      rendered.subject,
      'Tu sitio de prueba en Lattiz termina pronto',
    );
    assert.match(rendered.html, /Café Norte/);
    assert.match(rendered.html, new RegExp(WHEN));
    assert.match(rendered.html, /deja de verse/);
    assert.match(rendered.html, /borrador se conserva/);
    assert.match(rendered.html, new RegExp(DASHBOARD_URLS.subscription));
    assert.match(rendered.text, /Café Norte/);
    assert.match(rendered.text, new RegExp(WHEN));
    assert.match(rendered.text, /deja de verse/);
    assert.match(rendered.text, /borrador se conserva/);
    assert.match(rendered.text, new RegExp(DASHBOARD_URLS.subscription));
  });

  it('escapes the site name in html and keeps the plain-text version raw', () => {
    const rendered = renderPreviewEnding({
      endsAt: ENDS_AT,
      siteName: 'A & B <script>',
    });
    assert.match(rendered.html, /A &amp; B &lt;script&gt;/);
    assert.doesNotMatch(rendered.html, /<script>/);
    assert.match(rendered.text, /A & B <script>/);
  });

  it('is reachable from the kind renderer', () => {
    const rendered = renderEmail('preview_ending', {
      endsAt: ENDS_AT,
      siteName: 'Café Norte',
    });
    assert.equal(
      rendered.subject,
      'Tu sitio de prueba en Lattiz termina pronto',
    );
    assert.match(rendered.html, new RegExp(DASHBOARD_URLS.subscription));
  });
});
