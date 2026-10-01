const MARKER = 'id="lz-consent-host"';

// Shadow DOM styles: `:host { all: initial }` stops arbitrary GrapesJS template
// CSS from leaking in, and nothing here can leak out.
const BANNER_CSS = `
:host{all:initial}
.b{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483647;max-width:640px;margin:0 auto;box-sizing:border-box;display:flex;align-items:center;gap:16px;padding:16px 18px;border-radius:12px;border:1px solid #e5e7eb;background:#fff;color:#1f2937;box-shadow:0 10px 30px rgba(0,0,0,.12);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;animation:lzIn .2s ease-out}
.t{margin:0;flex:1}
.a{display:flex;gap:8px;flex-shrink:0}
button{font:inherit;font-weight:600;cursor:pointer;border-radius:8px;padding:8px 16px;min-height:40px;border:1px solid #d1d5db;background:#fff;color:#111827}
button.p{background:#111827;border-color:#111827;color:#fff}
button:hover{filter:brightness(.95)}
button:focus-visible{outline:3px solid #2563eb;outline-offset:2px}
@media (max-width:520px){.b{flex-direction:column;align-items:stretch}.a{flex-direction:column-reverse}button{width:100%}}
@media (prefers-color-scheme:dark){.b{background:#111827;color:#f3f4f6;border-color:#374151;box-shadow:0 10px 30px rgba(0,0,0,.5)}button{background:#1f2937;color:#f9fafb;border-color:#4b5563}button.p{background:#f9fafb;border-color:#f9fafb;color:#111827}button:focus-visible{outline-color:#60a5fa}}
@media (prefers-reduced-motion:reduce){.b{animation:none}}
@keyframes lzIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
`.replace(/\n/g, '');

const BANNER_HTML =
  '<div class="b" role="dialog" aria-label="Aviso de cookies" aria-live="polite">' +
  '<p class="t">Usamos cookies de analítica para entender cómo se usa este sitio y mejorarlo.</p>' +
  '<div class="a"><button type="button" data-c="denied">Rechazar</button>' +
  '<button type="button" class="p" data-c="granted">Aceptar</button></div></div>';

/**
 * Consent-gated GA4 loader, vanilla ES5. gtag.js is requested only after an
 * explicit "Aceptar"; consent is per origin, so per tenant domain. If storage
 * is blocked the choice lives in memory and the banner returns on next load.
 * TODO: consent-withdrawal UI, privacy-notice link and Consent Mode v2.
 */
function buildScript(measurementId: string): string {
  // JSON.stringify + `<` escaping keeps the id inert inside the inline <script>.
  const literal = (value: string) => JSON.stringify(value).replace(/</g, '\\u003c');
  return `(function(){
var ID=${literal(measurementId)},KEY='lz_consent',TTL=365*864e5;
var host=document.getElementById('lz-consent-host');
function read(){try{var r=JSON.parse(localStorage.getItem(KEY)||'null');if(r&&Date.now()-r.t<TTL)return r.c;}catch(e){}return null;}
function write(c){try{localStorage.setItem(KEY,JSON.stringify({c:c,t:Date.now()}));}catch(e){}}
function loadGA(){if(window.__lzGA)return;window.__lzGA=1;
window.dataLayer=window.dataLayer||[];
window.gtag=function(){window.dataLayer.push(arguments);};
var s=document.createElement('script');s.async=true;
s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ID);
document.head.appendChild(s);
window.gtag('js',new Date());
window.gtag('config',ID,{allow_google_signals:false,allow_ad_personalization_signals:false});}
function removeHost(){if(host&&host.parentNode)host.parentNode.removeChild(host);}
var c=read();
if(c==='granted'){removeHost();loadGA();return;}
if(c==='denied'){removeHost();return;}
if(!host||!host.attachShadow){return;}
var root=host.attachShadow({mode:'open'});
root.innerHTML=${literal(`<style>${BANNER_CSS}</style>${BANNER_HTML}`)};
var buttons=root.querySelectorAll('button');
for(var i=0;i<buttons.length;i++){buttons[i].addEventListener('click',function(ev){
var choice=ev.currentTarget.getAttribute('data-c');
write(choice);removeHost();if(choice==='granted')loadGA();});}
})();`;
}

/**
 * Appends the consent banner host + loader before </body> (else </html>, else
 * the end). The caller must pass a regex-validated Measurement ID.
 */
export function injectAnalytics(html: string, measurementId: string): string {
  if (html.includes(MARKER)) return html;

  const snippet = `<div ${MARKER}></div>\n<script>${buildScript(measurementId)}</script>\n`;

  const bodyIdx = html.toLowerCase().lastIndexOf('</body>');
  if (bodyIdx !== -1) return html.slice(0, bodyIdx) + snippet + html.slice(bodyIdx);
  const htmlIdx = html.toLowerCase().lastIndexOf('</html>');
  if (htmlIdx !== -1) return html.slice(0, htmlIdx) + snippet + html.slice(htmlIdx);
  return html + snippet;
}
