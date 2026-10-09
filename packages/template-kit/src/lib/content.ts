import type { Business, ContentObject, ContentValue } from '../types';
import { KitError } from './args';
import { parseFragment, stripFormattingWhitespace } from './dom';

/** Google Maps "cómo llegar" link, encoded the way Maps share links are (spaces as `+`). */
export function mapsLinkUrl(query: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(query).replace(/%20/g, '+')}`;
}

/** Keyless Google Maps embed for an <iframe>. */
export function mapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function whatsappUrl(
  business: Business,
  message = business.whatsappMessage,
): string {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}

export interface RenderContext {
  business: Business;
  /** Two-digit position among numbered sections, e.g. "02". */
  index?: string;
  /** For error messages: the fragment being rendered. */
  source: string;
}

const VAR_RE = /\{\{\s*([\w]+)(?::([^}]*))?\s*\}\}/g;

/** Replaces `{{var}}` business variables; `{{whatsappUrl:mensaje}}` builds a link with a custom message. */
export function interpolate(text: string, ctx: RenderContext): string {
  return text.replace(VAR_RE, (_all, name: string, arg: string | undefined) => {
    if (name === 'whatsappUrl')
      return whatsappUrl(ctx.business, arg?.trim() || undefined);
    if (name === 'index') {
      if (!ctx.index)
        throw new KitError(
          `${ctx.source}: {{index}} used in a section without "numbered: true".`,
        );
      return ctx.index;
    }
    const value = (ctx.business as unknown as Record<string, unknown>)[name];
    if (typeof value !== 'string') {
      throw new KitError(
        `${ctx.source}: unknown variable {{${name}}} (business fields: ${Object.keys(ctx.business).join(', ')}).`,
      );
    }
    return value;
  });
}

type Scope = ContentValue[];

function lookup(
  path: string,
  scopes: Scope,
  source: string,
): ContentValue | undefined {
  if (path === '.') return scopes[0];
  for (const scope of scopes) {
    let current: ContentValue | undefined = scope;
    for (const part of path.split('.')) {
      current =
        current !== null &&
        typeof current === 'object' &&
        !Array.isArray(current)
          ? (current as ContentObject)[part]
          : undefined;
    }
    if (current !== undefined) return current;
  }
  if (!path) throw new KitError(`${source}: empty content key.`);
  return undefined;
}

function isEmpty(value: ContentValue | undefined): boolean {
  return (
    value === undefined ||
    value === null ||
    value === false ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

function asText(
  value: ContentValue | undefined,
  path: string,
  source: string,
): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  throw new KitError(
    `${source}: content key "${path}" is ${value === undefined ? 'missing' : `a ${Array.isArray(value) ? 'list' : typeof value}`}, expected text.`,
  );
}

const ATTR_PREFIX = 'data-lz-attr-';

function applyBindings(el: Element, scopes: Scope, source: string): void {
  for (const attr of Array.from(el.attributes)) {
    if (!attr.name.startsWith(ATTR_PREFIX)) continue;
    const target = attr.name.slice(ATTR_PREFIX.length);
    el.setAttribute(
      target,
      asText(lookup(attr.value, scopes, source), attr.value, source),
    );
    el.removeAttribute(attr.name);
  }
  const key = el.getAttribute('data-lz-key');
  if (key !== null) {
    el.innerHTML = asText(lookup(key, scopes, source), key, source);
    el.removeAttribute('data-lz-key');
  }
}

function renderChildren(
  parent: ParentNode,
  scopes: Scope,
  source: string,
): void {
  for (const el of Array.from(parent.children))
    renderElement(el, scopes, source);
}

function renderElement(el: Element, scopes: Scope, source: string): void {
  const each = el.getAttribute('data-lz-each');
  if (each !== null) {
    const list = lookup(each, scopes, source);
    if (!Array.isArray(list))
      throw new KitError(`${source}: data-lz-each="${each}" needs a list.`);
    const isTemplate = el.localName === 'template';
    for (const item of list) {
      const itemScopes = [item, ...scopes];
      if (isTemplate) {
        const fragment = (el as HTMLTemplateElement).content.cloneNode(
          true,
        ) as DocumentFragment;
        renderChildren(fragment, itemScopes, source);
        el.parentNode?.insertBefore(fragment, el);
      } else {
        const clone = el.cloneNode(true) as Element;
        clone.removeAttribute('data-lz-each');
        el.parentNode?.insertBefore(clone, el);
        renderElement(clone, itemScopes, source);
      }
    }
    el.remove();
    return;
  }
  const condition = el.getAttribute('data-lz-if');
  if (condition !== null) {
    if (isEmpty(lookup(condition, scopes, source))) {
      el.remove();
      return;
    }
    el.removeAttribute('data-lz-if');
  }
  const hadKey = el.hasAttribute('data-lz-key');
  applyBindings(el, scopes, source);
  if (!hadKey) renderChildren(el, scopes, source);
}

function interpolateTree(root: Node, ctx: RenderContext): void {
  const doc = root.ownerDocument;
  if (!doc) return;
  const walker = doc.createTreeWalker(
    root,
    1 | 4 /* SHOW_ELEMENT | SHOW_TEXT */,
  );
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === 3) {
      if (n.nodeValue?.includes('{{'))
        n.nodeValue = interpolate(n.nodeValue, ctx);
      continue;
    }
    for (const attr of Array.from((n as Element).attributes)) {
      if (attr.value.includes('{{')) attr.value = interpolate(attr.value, ctx);
    }
  }
}

/** Renders one section fragment against its content: bindings first, then `{{vars}}`. */
export function renderSection(
  html: string,
  data: ContentObject,
  ctx: RenderContext,
): Element {
  const fragment = parseFragment(html);
  stripFormattingWhitespace(fragment);
  const roots = Array.from(fragment.children);
  if (roots.length !== 1)
    throw new KitError(
      `${ctx.source}: a section fragment must have exactly one root element.`,
    );
  renderChildren(fragment, [data], ctx.source);
  const root = fragment.children[0];
  if (!root)
    throw new KitError(
      `${ctx.source}: the root element was removed by data-lz-if.`,
    );
  interpolateTree(root, ctx);
  const leftover = root.querySelector(
    '[data-lz-key],[data-lz-each],[data-lz-if]',
  );
  if (leftover)
    throw new KitError(
      `${ctx.source}: unprocessed binding on <${leftover.localName}>.`,
    );
  return root;
}
