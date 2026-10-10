import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { renderEmail } from './index';
import { renderAdminAlert } from './admin-alert';

describe('renderAdminAlert', () => {
  it('renders the title, summary and escaped label/value table', () => {
    const rendered = renderAdminAlert({
      title: 'Pago <sin> ciclo',
      summary: 'Hay que revisar y reembolsar <a>.',
      details: {
        '<tenant>': 'cafe & <script>',
        monto: 69484,
        vacio: null,
      },
    });
    assert.equal(rendered.subject, '[Lattiz] Pago <sin> ciclo');
    assert.match(rendered.html, /Pago &lt;sin&gt; ciclo/);
    assert.match(rendered.html, /reembolsar &lt;a&gt;/);
    assert.match(rendered.html, /&lt;tenant&gt;/);
    assert.match(rendered.html, /cafe &amp; &lt;script&gt;/);
    assert.match(rendered.html, /69484/);
    assert.match(rendered.html, /—/);
    assert.doesNotMatch(rendered.html, /<script>/);
    assert.doesNotMatch(rendered.html, /<tenant>/);
    assert.doesNotMatch(rendered.html, /Pagar/);
    assert.match(rendered.text, /<tenant>: cafe & <script>/);
  });

  it('is reachable from the kind renderer', () => {
    const rendered = renderEmail('admin_alert', {
      title: 'Aviso',
      summary: 'Revisa el caso.',
      details: { ciclo: 'abc' },
    });
    assert.equal(rendered.subject, '[Lattiz] Aviso');
    assert.match(rendered.html, /abc/);
  });
});
