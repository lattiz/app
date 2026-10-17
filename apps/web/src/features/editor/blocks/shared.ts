/** A Studio block whose content is one component definition (markup + its CSS + optional traits). */
export interface SectionBlock {
  id: string;
  label: string;
  category: string;
  media: string;
  content: Record<string, unknown>;
  /** Kit `slot/variant` this block stands for; its plan follows that variant (see plan.ts). */
  kitVariant?: string;
  /** No kit counterpart on purpose: lives only in the editor (docs/template-kit-catalog.md). */
  editorOnly?: true;
  /** Studio: shown but not draggable (a Pro block for a plan without Pro). */
  disable?: boolean;
  onClick?: () => void;
}

/**
 * Blocks read the template's --lz-* tokens (template-kit themes) and fall back
 * to neutral values, so they match kit templates and still look right elsewhere.
 * Breakpoints follow the kit: 992px and 480px.
 */
export const BASE_CSS = `
.lzb{--lzb-bg:var(--lz-color-bg,#fafaf7);--lzb-surface:var(--lz-color-surface,#fff);--lzb-surface-2:var(--lz-color-surface-2,#f0efea);--lzb-text:var(--lz-color-text,#1a1a1a);--lzb-muted:var(--lz-color-muted,#5c5c57);--lzb-accent:var(--lz-color-accent,#1f4fd1);--lzb-on-accent:var(--lz-color-on-accent,#fff);--lzb-accent-text:var(--lz-color-accent-text,#1f4fd1);--lzb-line:var(--lz-color-line,rgba(0,0,0,.12));--lzb-radius:var(--lz-radius-card,14px);--lzb-pill:var(--lz-radius-pill,999px);--lzb-display:var(--lz-font-display,inherit);--lzb-body:var(--lz-font-body,inherit);position:relative;padding:var(--lz-section-pad,clamp(56px,8vw,112px)) 0;background:var(--lzb-bg);color:var(--lzb-text);font-family:var(--lzb-body)}
.lzb__inner{width:min(100% - 48px,var(--lz-container,1200px));margin:0 auto}
.lzb__eyebrow{margin:0 0 12px;color:var(--lzb-muted);font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase}
.lzb__title{margin:0 0 16px;font-family:var(--lzb-display);font-size:clamp(32px,5vw,64px);line-height:1;text-transform:var(--lz-display-transform,none);font-weight:var(--lz-display-weight,700)}
.lzb__lead{margin:0;max-width:60ch;color:var(--lzb-muted);font-size:clamp(16px,1.6vw,19px);line-height:1.6}
.lzb__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 22px;border-radius:var(--lzb-pill);background:var(--lzb-accent);color:var(--lzb-on-accent);font-weight:700;text-decoration:none}
.lzb__btn--ghost{background:transparent;color:var(--lzb-text);border:var(--lz-border-width,1px) solid var(--lzb-line)}
.lzb img{display:block;max-width:100%;height:auto}
`;

/** Neutral SVG placeholder; replaced by the tenant's photo (upload or "Fotos gratuitas"). */
export function placeholder(
  width: number,
  height: number,
  label = 'Tu foto',
): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="#d9d6cf"/>` +
    `<text x="50%" y="50%" fill="#8a867d" font-family="sans-serif" font-size="${Math.round(Math.min(width, height) / 10)}" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function img(
  width: number,
  height: number,
  alt: string,
  extra = '',
): string {
  return `<img src="${placeholder(width, height)}" alt="${alt}" width="${width}" height="${height}" loading="lazy"${extra ? ` ${extra}` : ''}>`;
}

export const ICONS = {
  hero: '<svg viewBox="0 0 24 24"><path d="M3 4h18v10H3zM5 17h9v2H5zM16 17h3v2h-3z"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>',
  gallery:
    '<svg viewBox="0 0 24 24"><path d="M20 5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h16M5 16h14l-4.5-6-3.5 4.5-2.5-3L5 16Z"/></svg>',
  contact:
    '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
  marquee:
    '<svg viewBox="0 0 24 24"><path d="M2 9h20v6H2zM4 11h4v2H4zm6 0h4v2h-4zm6 0h4v2h-4z"/></svg>',
  stack:
    '<svg viewBox="0 0 24 24"><path d="M5 3h14v4H5zM4 9h16v5H4zM3 16h18v5H3z"/></svg>',
  snap: '<svg viewBox="0 0 24 24"><path d="M2 6h6v12H2zm7 0h6v12H9zm7 0h6v12h-6z"/></svg>',
  compare:
    '<svg viewBox="0 0 24 24"><path d="M3 4h8v16H3zm10 0h8v16h-8zM11.5 2h1v20h-1z"/></svg>',
  stats:
    '<svg viewBox="0 0 24 24"><path d="M4 20V10h3v10zm6.5 0V4h3v16zM17 20v-7h3v7z"/></svg>',
  promo:
    '<svg viewBox="0 0 24 24"><path d="M2 8h20v8H2zm9 2v4h2v-4zm-6 1h4v2H5zm10 0h4v2h-4z"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 5v5.4l4 2.4-.8 1.3L11 13V7z"/></svg>',
  whatsapp:
    '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 5 5.1-1.3A10 10 0 1 0 12 2m5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7a11 11 0 0 1-4.3-3.8c-.4-.6-1-1.7-1-2.9s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.4"/></svg>',
};

/** Appended to a locked block's media; styled in grapesjs-sdk.css (editor UI, never the canvas). */
export const PRO_BADGE = '<span class="lzb-pro-badge">Pro</span>';
