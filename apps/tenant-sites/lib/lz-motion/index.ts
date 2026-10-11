import { LZ_MOTION_CSS, LZ_MOTION_JS } from './runtime.generated';

// Motion attributes only: template-kit's data-lz-slot/variant/key/… are on every block.
const MOTION_ATTR_RE =
  /\sdata-lz-(?:reveal|stagger|counter|words|parallax|lightbox|compare|countdown|open-now)\b/;
const SECTION_ATTR_RE = /\sdata-lz-section="(?!none")/;
const MOTION_OFF_RE = /\sdata-lz-motion="none"/;
const MARKER = 'id="lz-motion"';

export function hasMotionAttributes(html: string): boolean {
  if (MOTION_ATTR_RE.test(html)) return true;
  return SECTION_ATTR_RE.test(html) && !MOTION_OFF_RE.test(html);
}

/** Inlines the Lattiz Motion runtime (style before </head>, script before </body>). Callers gate on Pro. */
export function injectMotion(html: string): string {
  if (!hasMotionAttributes(html) || html.includes(MARKER)) return html;
  const lower = html.toLowerCase();
  const style = `<style id="lz-motion-css">${LZ_MOTION_CSS}</style>\n`;
  const script = `<script ${MARKER}>${LZ_MOTION_JS}</script>\n`;

  const headClose = lower.indexOf('</head>');
  let out =
    headClose === -1
      ? style + html
      : html.slice(0, headClose) + style + html.slice(headClose);
  const bodyClose = out.toLowerCase().lastIndexOf('</body>');
  out =
    bodyClose === -1
      ? out + script
      : out.slice(0, bodyClose) + script + out.slice(bodyClose);
  return out;
}
