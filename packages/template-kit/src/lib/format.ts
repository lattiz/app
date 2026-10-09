import type { ChildNode, Root } from 'postcss';

const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

function openTag(el: Element): string {
  const attrs = Array.from(el.attributes)
    .map((a) =>
      a.value === ''
        ? ` ${a.name}`
        : ` ${a.name}="${a.value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`,
    )
    .join('');
  return `<${el.localName}${attrs}>`;
}

/** Breaks lines only between element children of text-free containers, so rendering is unchanged. */
export function formatHtml(el: Element, indent = ''): string {
  const children = Array.from(el.childNodes);
  const hasText = children.some(
    (n) => n.nodeType === 3 && (n.nodeValue ?? '').trim() !== '',
  );
  const isBlock =
    !hasText &&
    children.some((n) => n.nodeType === 1) &&
    el.namespaceURI === 'http://www.w3.org/1999/xhtml';
  if (!isBlock) return `${indent}${el.outerHTML}`;
  if (VOID.has(el.localName)) return `${indent}${openTag(el)}`;
  const inner = children
    .filter((n): n is Element => n.nodeType === 1)
    .map((c) => formatHtml(c, `${indent}  `))
    .join('\n');
  return `${indent}${openTag(el)}\n${inner}\n${indent}</${el.localName}>`;
}

function formatNode(node: ChildNode, indent: string): string {
  if (node.type === 'decl')
    return `${indent}${node.prop}: ${node.value}${node.important ? ' !important' : ''};`;
  if (node.type === 'comment') return `${indent}/* ${node.text} */`;
  const head =
    node.type === 'rule'
      ? node.selector
      : `@${node.name}${node.params ? ` ${node.params}` : ''}`;
  if (node.type === 'atrule' && !node.nodes) return `${indent}${head};`;
  const body = (node.nodes ?? [])
    .map((n) => formatNode(n, `${indent}  `))
    .join('\n');
  return `${indent}${head} {\n${body}\n${indent}}`;
}

export function formatCss(root: Root): string {
  return root.nodes.map((n) => formatNode(n, '')).join('\n\n') + '\n';
}
