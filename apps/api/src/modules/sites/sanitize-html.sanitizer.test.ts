import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { sanitizeUnpaidSiteHtml } from './sanitize-html.sanitizer';

const GRAPES_EXPORT = [
  '<!DOCTYPE html>',
  '<html lang="es"><head>',
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="description" content="Cafetería de barrio">',
  '<title>Café Norte</title>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">',
  '<style>#i1{padding:48px}.gjs-row{display:flex}.gjs-cell{flex:1}</style>',
  '</head><body>',
  '<div id="i1" class="gjs-row"><div id="i2" class="gjs-cell">',
  '<img src="https://assets.lattiz.app/hero.png" alt="Fachada">',
  '<a href="https://cafenorte.lattiz.app">Pedir</a>',
  '<a href="mailto:hola@cafenorte.test">Correo</a>',
  '<a href="tel:+525512345678">Llamar</a>',
  '<a href="#menu">Menú</a>',
  '</div></div>',
  '</body></html>',
].join('');

const GRAPES_KEPT = `<!DOCTYPE html>\n${[
  '<html lang="es"><head>',
  '<meta charset="utf-8" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1" />',
  '<meta name="description" content="Cafetería de barrio" />',
  '<title>Café Norte</title>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter" />',
  '<style>#i1{padding:48px}.gjs-row{display:flex}.gjs-cell{flex:1}</style>',
  '</head><body>',
  '<div id="i1" class="gjs-row"><div id="i2" class="gjs-cell">',
  '<img src="https://assets.lattiz.app/hero.png" alt="Fachada" />',
  '<a href="https://cafenorte.lattiz.app">Pedir</a>',
  '<a href="mailto:hola@cafenorte.test">Correo</a>',
  '<a href="tel:+525512345678">Llamar</a>',
  '<a href="#menu">Menú</a>',
  '</div></div>',
  '</body></html>',
].join('')}`;

describe('sanitizeUnpaidSiteHtml', () => {
  it('drops script, event handlers, and embedded active content', () => {
    const html = sanitizeUnpaidSiteHtml(
      [
        '<script>alert(1)</script>',
        '<div onclick="alert(1)" onerror="alert(2)">texto</div>',
        '<iframe src="https://evil.test"></iframe>',
        '<object data="https://evil.test"></object>',
        '<embed src="https://evil.test">',
        '<p>ok</p>',
      ].join(''),
    );
    assert.equal(html, '<div>texto</div><p>ok</p>');
    assert.doesNotMatch(html, /script|onclick|onerror|iframe|object|embed|alert/i);
  });

  it('drops form actions, refresh metas, and base tags', () => {
    const html = sanitizeUnpaidSiteHtml(
      [
        '<form action="https://evil.test"><input name="a"></form>',
        '<meta http-equiv="refresh" content="0;url=https://evil.test">',
        '<base href="https://evil.test/">',
      ].join(''),
    );
    assert.doesNotMatch(html, /<form|action=|http-equiv|refresh|<base/i);
    assert.match(html, /<input name="a" \/>/);
  });

  it('strips javascript: hrefs regardless of case or embedded whitespace', () => {
    const hrefs = [
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      ' \t javascript:alert(1)',
      'java\tscript:alert(1)',
      'JaVa\nScRiPt:alert(1)',
    ];
    for (const href of hrefs) {
      const html = sanitizeUnpaidSiteHtml(`<a href="${href}">x</a>`);
      assert.equal(html, '<a>x</a>', href);
      assert.doesNotMatch(html, /javascript/i);
    }
  });

  it('strips data:text/html from href and src', () => {
    const payload = 'data:text/html,<script>alert(1)</script>';
    const anchor = sanitizeUnpaidSiteHtml(`<a href="${payload}">x</a>`);
    const image = sanitizeUnpaidSiteHtml(
      `<img src="${payload}" alt="x">`,
    );
    assert.equal(anchor, '<a>x</a>');
    assert.equal(image, '<img alt="x" />');
    assert.doesNotMatch(`${anchor}${image}`, /data:text\/html|script/i);
  });

  it('drops import and script-preload links, and http stylesheets', () => {
    const html = sanitizeUnpaidSiteHtml(
      [
        '<link rel="import" href="https://evil.test/x.html">',
        '<link rel="preload" as="script" href="https://evil.test/x.js">',
        '<link rel="stylesheet" href="http://cdn.example/a.css">',
      ].join(''),
    );
    assert.equal(html, '');
  });

  it('keeps a full document and the allowed head, links, and images', () => {
    const html = sanitizeUnpaidSiteHtml(
      [
        '<!DOCTYPE html>',
        '<html lang="es"><head>',
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="description" content="Hola">',
        '<title>Sitio</title>',
        '<style>body{margin:0}</style>',
        '<link rel="stylesheet" href="https://fonts.example/a.css">',
        '</head><body>',
        '<a href="https://lattiz.app">web</a>',
        '<a href="mailto:a@b.co">mail</a>',
        '<a href="tel:+521234">tel</a>',
        '<a href="#seccion">ancla</a>',
        '<img src="https://assets.lattiz.app/x.png" alt="x">',
        '<img src="data:image/png;base64,iVBORw0KGgo=" alt="p">',
        '</body></html>',
      ].join(''),
    );
    assert.match(html, /^<!DOCTYPE html>\n<html lang="es">/);
    assert.match(html, /<meta charset="utf-8" \/>/);
    assert.match(
      html,
      /<meta name="viewport" content="width=device-width, initial-scale=1" \/>/,
    );
    assert.match(html, /<meta name="description" content="Hola" \/>/);
    assert.match(html, /<title>Sitio<\/title>/);
    assert.match(html, /<style>body\{margin:0\}<\/style>/);
    assert.match(
      html,
      /<link rel="stylesheet" href="https:\/\/fonts\.example\/a\.css" \/>/,
    );
    assert.match(html, /<a href="https:\/\/lattiz\.app">web<\/a>/);
    assert.match(html, /<a href="mailto:a@b\.co">mail<\/a>/);
    assert.match(html, /<a href="tel:\+521234">tel<\/a>/);
    assert.match(html, /<a href="#seccion">ancla<\/a>/);
    assert.match(
      html,
      /<img src="https:\/\/assets\.lattiz\.app\/x\.png" alt="x" \/>/,
    );
    assert.match(
      html,
      /<img src="data:image\/png;base64,iVBORw0KGgo=" alt="p" \/>/,
    );
    assert.match(html, /<\/body><\/html>$/);
  });

  it('leaves an allowed GrapesJS export intact aside from void-tag normalization', () => {
    const html = sanitizeUnpaidSiteHtml(GRAPES_EXPORT);
    assert.equal(html, GRAPES_KEPT);
  });
});
