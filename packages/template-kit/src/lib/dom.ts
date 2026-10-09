import { JSDOM } from 'jsdom';

export function parseDocument(html: string, withLocations = false): JSDOM {
  return new JSDOM(html, { includeNodeLocations: withLocations });
}

/** Parses an HTML fragment into a detached <template> so nothing is hoisted into <head>. */
export function parseFragment(html: string): DocumentFragment {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const template = dom.window.document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

export function elementChildren(node: ParentNode): Element[] {
  return Array.from(node.children);
}

/** Removes formatting-only whitespace (text nodes with a newline and nothing else). */
export function stripFormattingWhitespace(root: Node): void {
  const doc = root.ownerDocument ?? (root as Document);
  const walker = doc.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const remove: Node[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue ?? '';
    if (text.includes('\n') && text.trim() === '') remove.push(n);
  }
  for (const n of remove) n.parentNode?.removeChild(n);
}

export function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  );
}
