import { existsSync, watch } from 'node:fs';
import { resolve } from 'node:path';
import { bool, type Command, str } from '../lib/command';
import { EXIT, usage } from '../lib/errors';
import { KIT, paths } from '../lib/paths';
import {
  MOTION_PRESETS,
  type MotionPreset,
  renderPreview,
} from '../lib/preview';
import { startPreviewServer } from '../lib/preview-server';
import {
  assertTemplate,
  cleanOutput,
  compile,
  readDist,
  tierLabel,
} from '../lib/templates';
import { c, duration, log } from '../lib/ui';
import { DEV_PORT, portFree } from './doctor';

export const VIEWPORTS = [
  { label: '360', w: 360 },
  { label: '390', w: 390 },
  { label: '768', w: 768 },
  { label: '1024', w: 1024 },
  { label: '1440', w: 1440 },
  { label: '1366×768', w: 1366, h: 768 },
  { label: '844×390', w: 844, h: 390 },
];

const RELOAD = `<script>new EventSource('/events').onmessage=function(e){if(e.data==='reload')location.reload()}</script>`;

function shell(id: string, tier: string, preset: MotionPreset): string {
  const pro = tier === 'pro';
  const buttons = VIEWPORTS.map(
    (v) =>
      `<button data-w="${v.w}" data-h="${v.h ?? ''}" title="${v.h ? 'Alto de pantalla fijo' : 'Ancho'}">${v.label}</button>`,
  ).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${id} · lattiz dev</title>
<style>
body{margin:0;font:13px system-ui,sans-serif;background:#1d1d1f;color:#eee;display:flex;flex-direction:column;height:100vh}
header{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 12px;background:#2a2a2d}
button,select,a.btn{font:inherit;padding:5px 10px;border-radius:6px;border:1px solid #555;background:#3a3a3d;color:#eee;cursor:pointer;text-decoration:none}
button.on{background:#0a84ff;border-color:#0a84ff}
button:disabled,select:disabled{opacity:.4;cursor:not-allowed}
main{flex:1;overflow:auto;display:flex;justify-content:center;align-items:flex-start;padding:16px}
iframe{border:0;background:#fff;box-shadow:0 0 0 1px #444;transition:width .2s,height .2s;flex:none}
.sep{width:1px;height:20px;background:#555;margin:0 4px}
.tag{padding:2px 8px;border-radius:99px;background:${pro ? '#7c3aed' : '#475569'};font-weight:600}
#size{color:#aaa;margin-left:auto}
</style></head><body>
<header><strong>${id}</strong><span class="tag">${tierLabel(tier)}</span><span class="sep"></span>${buttons}<button data-w="100%" data-h="">Auto</button><span class="sep"></span>
<button id="motion"${pro ? '' : ' disabled title="Lattiz Motion es solo para Pro"'}>Motion</button>
<select id="preset"${pro ? '' : ' disabled'}>${MOTION_PRESETS.map((p) => `<option${p === preset ? ' selected' : ''}>${p}</option>`).join('')}</select>
<button id="reduced" title="Emula prefers-reduced-motion: reduce">Reduced motion</button><button id="reload">↻ Recargar</button>
<a class="btn" id="open" target="_blank" rel="noopener">Abrir sin marco ↗</a><span id="size"></span></header>
<main><iframe id="f"></iframe></main>
<script>
var PRO=${pro};
var s={w:'390',h:'',motion:PRO,reduced:false,preset:${JSON.stringify(preset)}};
try{Object.assign(s,JSON.parse(localStorage.getItem('lz-cli-dev')||'{}'))}catch(e){}
if(!PRO)s.motion=false;
var f=document.getElementById('f');
function src(){return '/site?motion='+(s.motion?'on':'off')+'&reduced='+(s.reduced?1:0)+'&preset='+s.preset+'&live=1'}
function render(){
  try{localStorage.setItem('lz-cli-dev',JSON.stringify(s))}catch(e){}
  f.style.width=s.w==='100%'?'100%':s.w+'px';
  f.style.height=s.h?s.h+'px':'calc(100vh - 90px)';
  document.querySelectorAll('[data-w]').forEach(function(b){b.classList.toggle('on',b.dataset.w===s.w&&b.dataset.h===s.h)});
  document.getElementById('motion').classList.toggle('on',s.motion);
  document.getElementById('reduced').classList.toggle('on',s.reduced);
  document.getElementById('preset').value=s.preset;
  document.getElementById('open').href=src().replace('&live=1','');
  document.getElementById('size').textContent=(s.w==='100%'?'auto':s.w)+(s.h?'×'+s.h:'')+' · motion '+(s.motion?'on':'off')+(s.reduced?' · reduced':'');
  if(f.getAttribute('src')!==src())f.setAttribute('src',src());
}
document.querySelectorAll('[data-w]').forEach(function(b){b.onclick=function(){s.w=b.dataset.w;s.h=b.dataset.h;render()}});
document.getElementById('motion').onclick=function(){if(PRO){s.motion=!s.motion;render()}};
document.getElementById('reduced').onclick=function(){s.reduced=!s.reduced;render()};
document.getElementById('preset').onchange=function(e){s.preset=e.target.value;render()};
document.getElementById('reload').onclick=function(){f.contentWindow.location.reload()};
new EventSource('/events').onmessage=function(e){document.title=(e.data==='error'?'✗ compilación fallida · ':'')+${JSON.stringify(id)}};
render();
</script></body></html>`;
}

export const dev: Command = {
  name: 'dev',
  summary:
    'Servidor local con recarga en vivo, renderizado con el mismo pipeline que producción',
  usage: 'dev <id> [--port 4400] [--runtime-src]',
  help: [
    'Recompila (kit:compile) al guardar el manifiesto, secciones, temas, textos, assets o core.css',
    'y recarga. La página pasa por composeSiteHtml (tokens con el perfil demo → SEO → JSON-LD →',
    'Motion solo si la plantilla es Pro). Barra: 360/390/768/1024/1440, alto de pantalla 1366×768 y',
    '844×390, Motion on/off y preset (Pro), «Reduced motion», abrir sin marco.',
    '',
    '  --port <n>        puerto fijo (por defecto 4400)',
    '  --runtime-src     usa el runtime de Motion sin minificar de apps/tenant-sites/lib/lz-motion/src',
    '                    y recarga al editarlo (para quien trabaja en el runtime)',
    '',
    'Perfil demo opcional: packages/template-kit/demo-profiles/<id>.json (forma de business_profile).',
    'Nada de esto toca Supabase, R2 ni Vercel.',
  ],
  options: { port: { type: 'string' }, 'runtime-src': { type: 'boolean' } },
  async run(ctx) {
    const id = assertTemplate(ctx.positionals[0]);
    const port = Number(str(ctx.flags, 'port') ?? DEV_PORT);
    if (!Number.isInteger(port) || port <= 0)
      throw usage('--port debe ser un número de puerto.');
    const runtimeSrc = bool(ctx.flags, 'runtime-src');
    if (!(await portFree(port)))
      throw usage(
        `El puerto ${port} está ocupado.`,
        `pnpm lattiz dev ${id} --port ${port + 1}`,
      );

    log.title(`lattiz dev ${id}`);
    let building: Promise<void> | null = null;
    let queued = false;
    let lastOk = false;
    let notify: (event: string) => void = () => {};
    const build = (): Promise<void> => {
      if (building) {
        queued = true;
        return building;
      }
      building = compile(id).then((r) => {
        building = null;
        lastOk = r.code === 0;
        if (lastOk) {
          log.ok(`compilado en ${duration(r.ms)}`);
          notify('reload');
        } else {
          log.fail(`la compilación falló\n${cleanOutput(r.output)}`);
          notify('error');
        }
        if (queued) {
          queued = false;
          void build();
        }
      });
      return building;
    };
    await build();
    if (!lastOk) return EXIT.GATE;
    const { meta } = readDist(id);
    const tier = meta.tier;
    const preset = meta.motion?.preset ?? 'none';

    const server = await startPreviewServer({
      id,
      port,
      shell: () => shell(id, tier, preset),
      render(params) {
        const asked = params.get('preset') as MotionPreset | null;
        const preview = renderPreview(id, {
          origin: `http://localhost:${port}`,
          motion: params.get('motion') !== 'off',
          preset: asked && MOTION_PRESETS.includes(asked) ? asked : undefined,
          reducedMotion: params.get('reduced') === '1',
          runtimeSrc,
        });
        return params.get('live') === '1'
          ? preview.html.replace(
              /<\/body>(?![\s\S]*<\/body>)/i,
              `${RELOAD}</body>`,
            )
          : preview.html;
      },
    }).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE')
        throw usage(
          `El puerto ${port} está ocupado.`,
          `pnpm lattiz dev ${id} --port ${port + 1}`,
        );
      throw error;
    });
    notify = server.broadcast;

    let timer: NodeJS.Timeout | undefined;
    const later = (fn: () => void) => {
      clearTimeout(timer);
      timer = setTimeout(fn, 150);
    };
    for (const dir of [
      'sections',
      'themes',
      'content',
      'assets',
      'templates',
      'blueprints',
    ]) {
      watch(resolve(KIT, dir), { recursive: true }, () =>
        later(() => void build()),
      );
    }
    watch(resolve(KIT, 'core.css'), () => later(() => void build()));
    if (existsSync(paths.demoProfiles))
      watch(paths.demoProfiles, () => later(() => server.broadcast('reload')));
    if (runtimeSrc)
      watch(paths.motionSrc, () => later(() => server.broadcast('reload')));

    log.plain();
    log.ok(`${c.bold(id)} (${tierLabel(tier)}) en ${c.cyan(server.url)}`);
    log.info(`Sin marco: ${server.url}/site`);
    log.info(
      tier === 'pro'
        ? `Motion: preset ${preset} (se puede apagar en la barra)`
        : 'Básico: sin Lattiz Motion, igual que en producción',
    );
    log.plain(c.gray('  Ctrl+C para salir'));
    await new Promise<void>((done) => {
      process.once('SIGINT', () => {
        void server.close().then(done);
      });
    });
    return EXIT.OK;
  },
};
