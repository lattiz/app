// Spike: slice the exported project into a section library, then recompose a variant.
const fs = require('fs');
const { headless } = require('./lib');
const SRC = '/mnt/user-data/uploads/gjs-project.grapesjs';
const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const clone = (o) => JSON.parse(JSON.stringify(o));
const walk = (c, fn) => { fn(c); (c.components || []).forEach((x) => walk(x, fn)); };
const cname = (k) => (typeof k === 'string' ? k : k.name);

// ---- 1. cut the page into slots -------------------------------------------------
const wrapper = src.pages[0].frames[0].component;
const slotNodes = {};
walk(wrapper, (c) => { const s = c.attributes && c.attributes['data-lz-slot']; if (s) slotNodes[s] = c; });
const classSet = (c) => { const s = new Set(); walk(c, (x) => (x.classes || []).forEach((k) => s.add(cname(k)))); return s; };
const slotClasses = Object.fromEntries(Object.entries(slotNodes).map(([k, v]) => [k, classSet(v)]));
const used = {}; Object.values(slotClasses).forEach((s) => s.forEach((k) => (used[k] = (used[k] || 0) + 1)));
const isShared = (k) => used[k] > 1;

// ---- 2. rule ownership ----------------------------------------------------------
const KEYFRAME_OWNER = { 'lz-marquee': 'marquee', 'lz-pulse': 'floating-whatsapp' };
function ownerOf(rule) {
  if (rule.atRuleType === 'keyframes') return KEYFRAME_OWNER[rule.mediaText] || 'core';
  const names = (rule.selectors || []).map(cname);
  if (rule.selectorsAdd) names.push(...(rule.selectorsAdd.match(/\.lz-[\w-]+/g) || []).map((x) => x.slice(1)));
  const lz = names.filter((n) => n.startsWith('lz-') || n.startsWith('gjs-t-'));
  if (!lz.length) return 'core';
  const owners = new Set(lz.map((n) => (isShared(n) || n.startsWith('gjs-t-') ? 'core' : Object.keys(slotClasses).find((s) => slotClasses[s].has(n)) || 'core')));
  return owners.size === 1 ? [...owners][0] : 'core';
}
const rulesBySlot = {};
src.styles.forEach((r) => { const o = ownerOf(r); (rulesBySlot[o] = rulesBySlot[o] || []).push(r); });

// ---- 3. themes (token overrides) ------------------------------------------------
const THEMES = {
  minimal_bone: {
    '--lz-color-bg': '#F5F2EB', '--lz-color-surface': '#FFFFFF', '--lz-color-surface-2': '#ECE8DF',
    '--lz-color-text': '#111111', '--lz-color-muted': '#6B675F', '--lz-color-accent': '#1F3DFF',
    '--lz-color-line': 'rgba(17,17,17,.16)', '--lz-color-on-accent': '#FFFFFF',
    '--lz-font-display': "'Bebas Neue', sans-serif", '--lz-font-serif': "'DM Serif Display', serif",
    '--lz-font-body': "'DM Sans', sans-serif", '--lz-radius': '999px',
    fonts: 'family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700',
  },
};

function compose({ id, name, theme, order }) {
  const out = clone(src);
  const page = out.pages[0]; page.name = name;
  const w = page.frames[0].component;
  const pageWrap = w.components[0];                      // .lz-page
  const header = pageWrap.components.find((c) => c.tagName === 'header');
  const main = pageWrap.components.find((c) => c.tagName === 'main');
  const footer = pageWrap.components.find((c) => c.tagName === 'footer');
  const mainSlots = order.filter((s) => !['navbar', 'footer'].includes(s));
  main.components = mainSlots.map((s) => clone(slotNodes[s]));
  pageWrap.components = [order.includes('navbar') ? header : null, main, order.includes('footer') ? footer : null].filter(Boolean);

  // keep only rules belonging to kept slots (+ core)
  const keep = new Set(['core', ...order]);
  out.styles = src.styles.filter((r) => keep.has(ownerOf(r)));

  // theme: tokens in :root, plus the duplicated gjs-t-* values + globalStyles defaults
  if (theme) {
    const t = THEMES[theme];
    const root = out.styles.find((r) => r.selectorsAdd === ':root');
    for (const [k, v] of Object.entries(t)) if (k.startsWith('--lz-')) root.style[k] = v;
    const map = { '#0B0B0C': t['--lz-color-bg'], '#F4F1EA': t['--lz-color-text'], '#FF4F1F': t['--lz-color-accent'], '#141416': t['--lz-color-surface'] };
    const swap = (v) => (typeof v === 'string' ? map[v] || v : v);
    out.styles.forEach((r) => { if (r.selectorsAdd === ':root') return; const sel = (r.selectors || []).map(cname).join(' '); if (sel.startsWith('gjs-t-')) for (const k of Object.keys(r.style)) r.style[k] = swap(r.style[k]); });
    const ds = out.dataSources.find((d) => d.id === 'globalStyles');
    ds.records.forEach((rec) => { if (typeof rec.defaultValue === 'string' && map[rec.defaultValue]) rec.defaultValue = map[rec.defaultValue]; });
    Object.entries(root.style).forEach(([k, v]) => { if (v && v.type === 'data-variable' && map[v.defaultValue]) v.defaultValue = map[v.defaultValue]; });
    // fonts live in the page <head>
    w.head.components.forEach((c) => { if (c.attributes && /css2\?/.test(c.attributes.href || '')) c.attributes.href = `https://fonts.googleapis.com/css2?${t.fonts}&display=swap`; });
  }
  out.custom = { ...out.custom, id };
  return out;
}

const variant = compose({
  id: 'barberia-minimal-v1', name: 'Barbería Minimal (variante generada)', theme: 'minimal_bone',
  order: ['navbar', 'hero', 'about', 'team', 'services', 'locations', 'testimonials', 'floating-whatsapp', 'footer'], // sin marquee, equipo antes de servicios
});
fs.mkdirSync('out', { recursive: true });
fs.writeFileSync('out/barberia-minimal-v1.grapesjs', JSON.stringify(variant));

// ---- 4. verify headless ---------------------------------------------------------
const ed = headless(variant);
const html = ed.getHtml(), css = ed.getCss();
console.log('VARIANT html', html.length, 'css', css.length, 'rules', variant.styles.length, '(source', src.styles.length + ')');
console.log('slot order:', [...html.matchAll(/data-lz-slot="([^"]+)"/g)].map((m) => m[1]).join(' > '));
console.log('bg token:', (css.match(/--lz-color-bg:[^;]+/) || [])[0], '| accent:', (css.match(/--lz-color-accent:[^;]+/) || [])[0]);
console.log('marquee leftovers in css:', /lz-marquee/.test(css), '| keyframes kept:', (css.match(/@keyframes [\w-]+/g) || []).join(','));
console.log('summary rules per owner:', Object.fromEntries(Object.entries(rulesBySlot).map(([k, v]) => [k, v.length])));
