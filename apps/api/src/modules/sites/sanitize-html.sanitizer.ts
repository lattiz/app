import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import type { HtmlSanitizerPort } from './html-sanitizer.port';

const TEXT_TAGS = [
  'html',
  'head',
  'body',
  'title',
  'meta',
  'link',
  'style',
  'div',
  'span',
  'section',
  'header',
  'footer',
  'main',
  'nav',
  'article',
  'aside',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'hr',
  'a',
  'img',
  'picture',
  'source',
  'figure',
  'figcaption',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'small',
  'mark',
  'sub',
  'sup',
  'blockquote',
  'pre',
  'code',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'caption',
  'colgroup',
  'col',
  'label',
  'input',
  'textarea',
  'select',
  'option',
  'button',
];

const SVG_TAGS = [
  'svg',
  'path',
  'g',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'ellipse',
  'defs',
  'symbol',
  'lineargradient',
  'radialgradient',
  'stop',
  'clippath',
  'text',
  'tspan',
];

const GLOBAL_ATTRS = [
  'class',
  'id',
  'style',
  'title',
  'dir',
  'lang',
  'role',
  'tabindex',
  'hidden',
  'aria-*',
  'data-*',
];

const SVG_ATTRS = [
  ...GLOBAL_ATTRS,
  'd',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'viewbox',
  'xmlns',
  'fill-rule',
  'clip-rule',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'points',
  'transform',
  'opacity',
  'offset',
  'stop-color',
  'stop-opacity',
  'width',
  'height',
  'preserveaspectratio',
  'href',
];

function allowedAttributes(): sanitizeHtml.IOptions['allowedAttributes'] {
  const attributes: Record<string, string[]> = {
    '*': GLOBAL_ATTRS,
    a: [...GLOBAL_ATTRS, 'href', 'target', 'rel', 'name'],
    img: [
      ...GLOBAL_ATTRS,
      'src',
      'srcset',
      'alt',
      'width',
      'height',
      'loading',
      'sizes',
    ],
    source: [...GLOBAL_ATTRS, 'src', 'srcset', 'type', 'media', 'sizes'],
    link: [...GLOBAL_ATTRS, 'rel', 'href', 'crossorigin', 'media', 'type'],
    meta: ['charset', 'name', 'content', 'http-equiv', 'property'],
    html: ['lang'],
    td: [...GLOBAL_ATTRS, 'colspan', 'rowspan'],
    th: [...GLOBAL_ATTRS, 'colspan', 'rowspan', 'scope'],
    input: [
      ...GLOBAL_ATTRS,
      'type',
      'name',
      'placeholder',
      'value',
      'checked',
      'disabled',
      'readonly',
      'required',
      'for',
    ],
    label: [...GLOBAL_ATTRS, 'for'],
    button: [...GLOBAL_ATTRS, 'type', 'disabled'],
  };
  for (const tag of SVG_TAGS) attributes[tag] = SVG_ATTRS;
  return attributes;
}

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...TEXT_TAGS, ...SVG_TAGS],
  // The library refuses <style> unless this is set; <script> stays off the allowlist.
  allowVulnerableTags: true,
  allowedAttributes: allowedAttributes(),
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
    source: ['http', 'https', 'data'],
  },
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite', 'action'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  // Page-builder trees are deeper than the library default.
  nestingLimit: 100,
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'iframe'],
  exclusiveFilter: (frame) => {
    if (frame.tag === 'meta') return isRefreshMeta(frame.attribs);
    if (frame.tag === 'link') return !isAllowedDocumentLink(frame.attribs);
    return false;
  },
  transformTags: {
    a: (_tagName, attribs) => ({
      tagName: 'a',
      attribs: withoutUnsafeHref(attribs),
    }),
    img: (_tagName, attribs) => ({
      tagName: 'img',
      attribs: withoutUnsafeImage(attribs),
    }),
    source: (_tagName, attribs) => ({
      tagName: 'source',
      attribs: withoutUnsafeImage(attribs),
    }),
  },
};

/** Scrubs an unpaid publish. Paid HTML never goes through here. */
export function sanitizeUnpaidSiteHtml(html: string): string {
  const sanitized = sanitizeHtml(html, OPTIONS);
  if (/^\s*<!doctype html/i.test(html) && !/^\s*<!doctype html/i.test(sanitized)) {
    return `<!DOCTYPE html>\n${sanitized}`;
  }
  return sanitized;
}

@Injectable()
export class SanitizeHtmlSanitizer implements HtmlSanitizerPort {
  sanitizeUnpaidSiteHtml(html: string): string {
    return sanitizeUnpaidSiteHtml(html);
  }
}

function isRefreshMeta(attribs: Record<string, string>): boolean {
  return (attribs['http-equiv'] ?? '').trim().toLowerCase() === 'refresh';
}

function isAllowedDocumentLink(attribs: Record<string, string>): boolean {
  const rels = (attribs.rel ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter((rel) => rel.length > 0);
  if (rels.includes('import')) return false;
  if (rels.includes('preload') && (attribs.as ?? '').toLowerCase() === 'script') {
    return false;
  }
  const kept = rels.includes('stylesheet') || rels.includes('preconnect');
  if (!kept) return false;
  return isHttpsUrl(attribs.href ?? '');
}

function withoutUnsafeHref(
  attribs: Record<string, string>,
): Record<string, string> {
  const href = attribs.href;
  if (href !== undefined && !isSafeAnchorHref(href)) {
    const next = { ...attribs };
    delete next.href;
    return next;
  }
  return attribs;
}

function withoutUnsafeImage(
  attribs: Record<string, string>,
): Record<string, string> {
  const next = { ...attribs };
  if (next.src !== undefined && !isSafeImageUrl(next.src)) delete next.src;
  if (next.href !== undefined && !isSafeImageUrl(next.href)) delete next.href;
  if (next.srcset !== undefined) {
    const filtered = filterSrcset(next.srcset);
    if (filtered) next.srcset = filtered;
    else delete next.srcset;
  }
  return next;
}

function isSafeAnchorHref(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === '' || hasActiveScheme(trimmed)) return false;
  if (trimmed.startsWith('#') || trimmed.startsWith('?')) return true;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return true;
  }
  if (!trimmed.includes(':')) return true;
  try {
    const protocol = new URL(trimmed).protocol;
    return (
      protocol === 'http:' ||
      protocol === 'https:' ||
      protocol === 'mailto:' ||
      protocol === 'tel:'
    );
  } catch {
    return false;
  }
}

function isSafeImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (hasActiveScheme(trimmed) && !/^data:image\//i.test(stripSpace(trimmed))) {
    return false;
  }
  if (/^data:/i.test(stripSpace(trimmed))) {
    return /^data:image\/[a-z0-9.+-]+[;,]/i.test(stripSpace(trimmed));
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return true;
  }
  if (!trimmed.includes(':')) return true;
  try {
    const protocol = new URL(trimmed).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function filterSrcset(srcset: string): string {
  return srcset
    .split(',')
    .map((part) => part.trim())
    .filter((part) => {
      const url = part.split(/\s+/)[0];
      return url !== undefined && isSafeImageUrl(url);
    })
    .join(', ');
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}

/** `javascript:` and `data:text/html` survive some parsers when whitespace or case is mixed. */
function hasActiveScheme(value: string): boolean {
  const compact = stripSpace(value);
  return (
    compact.startsWith('javascript:') ||
    compact.startsWith('vbscript:') ||
    compact.startsWith('data:text/html')
  );
}

function stripSpace(value: string): string {
  let compact = '';
  for (const char of value) {
    if (char.charCodeAt(0) > 0x20) compact += char;
  }
  return compact.toLowerCase();
}
