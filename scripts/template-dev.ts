/**
 * Local preview of one template-kit template with the Lattiz Motion runtime and live reload.
 *
 *   pnpm template:dev <id> [--port 4400]
 *
 * Recompiles (kit:compile) when sections/, themes/, content/, core.css, assets/ or the manifest
 * change, and reloads when the runtime source (apps/tenant-sites/lib/lz-motion/src) changes.
 * The toolbar switches viewport (360/390/768/1024/1440), motion on/off, preset and reduced
 * motion. Nothing here touches Supabase, R2 or Vercel. Workflow: docs/template-workflow.md
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, watch } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import {
  MOTION_PRESETS,
  motionHtml,
  type MotionPreset,
  type SectionOverrides,
} from './lib/motion-sections';

const REPO_ROOT = resolve(__dirname, '..');
const KIT = join(REPO_ROOT, 'packages/template-kit');
const RUNTIME_SRC = join(REPO_ROOT, 'apps/tenant-sites/lib/lz-motion/src');
const WIDTHS = [360, 390, 768, 1024, 1440];
const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

const argv = process.argv.slice(2).filter((a) => a !== '--');
const id = argv.find((a) => !a.startsWith('--'));
const portAt = argv.indexOf('--port');
const port = portAt === -1 ? 4400 : Number(argv[portAt + 1]);
if (!id || !existsSync(join(KIT, 'templates', `${id}.ts`))) {
  console.error('Usage: pnpm template:dev <template-id> [--port 4400]  (a manifest in packages/template-kit/templates)');
  process.exit(1);
}
const dist = join(KIT, 'dist', id);

let building: Promise<void> | null = null;
let queued = false;
const clients = new Set<ServerResponse>();

function broadcast(event: string): void {
  for (const res of clients) res.write(`data: ${event}\n\n`);
}

/** kit:compile in a child process: manifests and content packs are TS modules the parent would cache. */
function compile(): Promise<void> {
  if (building) {
    queued = true;
    return building;
  }
  const started = Date.now();
  building = new Promise<void>((done) => {
    const child = spawn('pnpm', ['--filter', '@lattiz/template-kit', 'kit:compile', `templates/${id}.ts`], {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let log = '';
    child.stdout.on('data', (d) => (log += d));
    child.stderr.on('data', (d) => (log += d));
    child.on('close', (code) => {
      building = null;
      if (code === 0) {
        console.log(`✓ compiled in ${Date.now() - started} ms`);
        broadcast('reload');
      } else {
        console.error(`✗ compile failed\n${log}`);
        broadcast('error');
      }
      done();
      if (queued) {
        queued = false;
        void compile();
      }
    });
  });
  return building;
}

function meta(): { preset: MotionPreset; sections: SectionOverrides } {
  const file = join(dist, 'template.meta.json');
  const raw = existsSync(file)
    ? (JSON.parse(readFileSync(file, 'utf8')) as { motion?: { preset?: MotionPreset; sections?: SectionOverrides } })
    : {};
  return { preset: raw.motion?.preset ?? 'calm', sections: raw.motion?.sections ?? {} };
}

/** The runtime straight from its source, so runtime edits show without build:motion. */
function inject(html: string): string {
  const css = readFileSync(join(RUNTIME_SRC, 'style.css'), 'utf8');
  const js = readFileSync(join(RUNTIME_SRC, 'runtime.js'), 'utf8');
  return html
    .replace('</head>', `<style id="lz-motion-css">${css}</style>\n</head>`)
    .replace(/<\/body>(?![\s\S]*<\/body>)/, `<script id="lz-motion">${js}</script>\n</body>`);
}

// Emulates prefers-reduced-motion for both the template CSS and the runtime's matchMedia check.
const REDUCED_SHIM = `<script>(function(){var m=window.matchMedia;window.matchMedia=function(q){return /prefers-reduced-motion:\\s*reduce/.test(q)?{matches:true,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){}}:m.call(window,q)}})();</script>`;
const RELOAD = `<script>new EventSource('/events').onmessage=function(e){if(e.data==='reload')location.reload()}</script>`;

function frame(params: URLSearchParams): string {
  const file = join(dist, 'index.html');
  if (!existsSync(file)) return '<p>Compiling…</p>';
  const { preset: defaultPreset, sections } = meta();
  const asked = params.get('preset') as MotionPreset | null;
  const preset = asked && MOTION_PRESETS.includes(asked) ? asked : defaultPreset;
  let html = motionHtml(readFileSync(file, 'utf8'), preset, sections, false).html;
  if (params.get('motion') !== 'off') html = inject(html);
  if (params.get('reduced') === '1') {
    html = html
      .replace(/prefers-reduced-motion:\s*reduce/g, 'min-width: 0px')
      .replace(/prefers-reduced-motion:\s*no-preference/g, 'max-width: 0px')
      .replace(/<head([^>]*)>/i, `<head$1>${REDUCED_SHIM}`);
  }
  return html.replace('</body>', `${RELOAD}</body>`);
}

function shell(): string {
  const { preset } = meta();
  const buttons = WIDTHS.map((w) => `<button data-w="${w}">${w}</button>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${id} · template:dev</title>
<style>
body{margin:0;font:13px system-ui,sans-serif;background:#1d1d1f;color:#eee;display:flex;flex-direction:column;height:100vh}
header{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 12px;background:#2a2a2d}
button,select{font:inherit;padding:5px 10px;border-radius:6px;border:1px solid #555;background:#3a3a3d;color:#eee;cursor:pointer}
button.on{background:#0a84ff;border-color:#0a84ff}
main{flex:1;overflow:auto;display:flex;justify-content:center;padding:16px}
iframe{border:0;background:#fff;height:100%;box-shadow:0 0 0 1px #444;transition:width .2s}
.sep{width:1px;height:20px;background:#555;margin:0 4px}
</style></head><body>
<header><strong>${id}</strong><span class="sep"></span>${buttons}<button data-w="100%">Auto</button><span class="sep"></span>
<button id="motion" class="on">Motion</button>
<select id="preset">${MOTION_PRESETS.map((p) => `<option${p === preset ? ' selected' : ''}>${p}</option>`).join('')}</select>
<button id="reduced">Reduced motion</button><button id="replay">↻ Reload</button></header>
<main><iframe id="f"></iframe></main>
<script>
var s={w:'390',motion:true,reduced:false,preset:${JSON.stringify(preset)}};
try{Object.assign(s,JSON.parse(localStorage.getItem('lz-dev')||'{}'))}catch(e){}
var f=document.getElementById('f');
function render(){
  try{localStorage.setItem('lz-dev',JSON.stringify(s))}catch(e){}
  f.style.width=s.w==='100%'?'100%':s.w+'px';
  document.querySelectorAll('[data-w]').forEach(function(b){b.classList.toggle('on',b.dataset.w===s.w)});
  document.getElementById('motion').classList.toggle('on',s.motion);
  document.getElementById('reduced').classList.toggle('on',s.reduced);
  document.getElementById('preset').value=s.preset;
  var src='/frame?motion='+(s.motion?'on':'off')+'&reduced='+(s.reduced?1:0)+'&preset='+s.preset;
  if(f.getAttribute('src')!==src)f.setAttribute('src',src);
}
document.querySelectorAll('[data-w]').forEach(function(b){b.onclick=function(){s.w=b.dataset.w;render()}});
document.getElementById('motion').onclick=function(){s.motion=!s.motion;render()};
document.getElementById('reduced').onclick=function(){s.reduced=!s.reduced;render()};
document.getElementById('preset').onchange=function(e){s.preset=e.target.value;render()};
document.getElementById('replay').onclick=function(){f.contentWindow.location.reload()};
new EventSource('/events').onmessage=function(e){if(e.data==='error')document.title='✗ compile failed';else document.title=${JSON.stringify(id)}};
render();
</script></body></html>`;
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(shell());
  }
  if (url.pathname === '/frame') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(frame(url.searchParams));
  }
  if (url.pathname === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  const file = normalize(join(dist, decodeURIComponent(url.pathname)));
  if (!file.startsWith(dist) || !existsSync(file)) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});

let timer: NodeJS.Timeout | undefined;
const later = (fn: () => void) => {
  clearTimeout(timer);
  timer = setTimeout(fn, 150);
};
for (const dir of ['sections', 'themes', 'content', 'assets', 'templates', 'blueprints']) {
  watch(join(KIT, dir), { recursive: true }, () => later(() => void compile()));
}
watch(join(KIT, 'core.css'), () => later(() => void compile()));
watch(RUNTIME_SRC, () => later(() => broadcast('reload')));

void compile().then(() => {
  server.listen(port, () => console.log(`▶ ${id} at http://localhost:${port}  (Ctrl+C to stop)`));
});
