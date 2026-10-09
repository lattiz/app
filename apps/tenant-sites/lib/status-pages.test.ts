import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { expiredResponse } from './status-pages';

describe('expiredResponse', () => {
  it('returns a noindex 404 whose body escapes the tenant name and links to the upgrade url', async () => {
    const response = expiredResponse(
      'Café <b> & "O\'Brien"',
      'https://upgrade.example/plan?x=1&y=2',
    );
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
    assert.match(response.headers.get('Content-Type') ?? '', /text\/html/);

    const html = await response.text();
    assert.match(
      html,
      /La prueba gratuita de Café &lt;b&gt; &amp; &quot;O&#39;Brien&quot; terminó/,
    );
    assert.match(html, /href="https:\/\/upgrade\.example\/plan\?x=1&amp;y=2"/);
    assert.equal(html.includes('<b>'), false);
    assert.match(html, /Obtén tu dominio/);
  });
});
