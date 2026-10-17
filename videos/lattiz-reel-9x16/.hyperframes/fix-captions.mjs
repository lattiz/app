// Regroups caption words into phrases and swaps spoken numbers/URL for their display form.
// Re-run after every `captions.mjs build`: node .hyperframes/fix-captions.mjs
import { readFileSync, writeFileSync } from "node:fs";

const groupsPath = "caption_groups.json";
const htmlPath = "compositions/captions.html";
const data = JSON.parse(readFileSync(groupsPath, "utf8"));
const words = data.groups.flatMap((g) => g.words.map((w) => ({ ...w, frame: g.frame })));

// Each phrase: list of [displayText, spokenWordCount].
const P = (...items) => items.map((it) => (Array.isArray(it) ? it : [it, 1]));
const phrases = [
  P("Tu", "negocio", "existe."),
  P("Tu", "sitio", "web,"),
  P("también", "debería."),
  P(["7", 1], "de", "cada", ["10", 1], "mexicanos"),
  P("buscan", "en", "internet"),
  P("antes", "de", "comprar."),
  P("Una", "agencia"),
  P("cobra", "hasta", ["$80,000.", 3]),
  P("Con", "Lattiz,", "todo", "incluido."),
  P("Esto", "es", "Lattiz."),
  P("Tu", "sitio", "ya", "está", "construido:"),
  P("solo", "lánzalo."),
  P("Elige", "tu", "plantilla."),
  P("Personalízala", "con", "tu", "marca,"),
  P("hasta", "desde", "tu", "celular."),
  P("Escoge", "tu", "dominio,"),
  P("incluido", "en", "tu", "plan,"),
  P("y", "publica", "con", "un", "clic."),
  P("Plan", "Básico:"),
  P(["$449", 5], "al", "mes."),
  P("Prueba", "Lattiz", "gratis"),
  P(["3", 1], "días,"),
  P("en", ["lattiz.app", 3]),
];

const spokenTotal = phrases.flat().reduce((n, [, c]) => n + c, 0);
if (spokenTotal !== words.length) throw new Error(`phrase map covers ${spokenTotal} words, audio has ${words.length}`);

let k = 0;
const groups = phrases.map((phrase, gi) => {
  const out = phrase.map(([text, count], wi) => {
    const span = words.slice(k, k + count);
    k += count;
    return { id: `caption-word-${gi}-${wi}`, text, start: span[0].start, end: span[span.length - 1].end };
  });
  return { id: `caption-group-${gi}`, frame: words[k - 1].frame, start: out[0].start, end: out[out.length - 1].end + 0.12, text: out.map((w) => w.text).join(" "), words: out };
});
for (let i = 0; i < groups.length - 1; i++) groups[i].end = Math.min(groups[i].end, groups[i + 1].start);

data.groups = groups;
writeFileSync(groupsPath, JSON.stringify(data, null, 2));
const html = readFileSync(htmlPath, "utf8");
const re = /var GROUPS = \[[\s\S]*?\];/;
if (!re.test(html)) throw new Error("GROUPS hole not found in captions.html");
writeFileSync(htmlPath, html.replace(re, () => `var GROUPS = ${JSON.stringify(groups).replace(/</g, "\\u003c")};`));
console.log(`✓ ${groups.length} caption groups rewritten`);
groups.forEach((g) => console.log(g.start.toFixed(2), g.text));
