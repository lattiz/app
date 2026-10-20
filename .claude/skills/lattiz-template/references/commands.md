# Contrato del CLI para la skill

Todo desde la raíz del repo con `pnpm lattiz …`. Códigos de salida: **0** ok · **1** falló una
verificación (validación del kit, unicidad, archivo editado a mano o congelado, FAIL en `check`) ·
**2** uso o datos (spec inválido, flag desconocido, falta algo). Con `--json`, stdout es solo el JSON;
en error, el mensaje va a stderr.

## Lectura

| Comando                                                         | Salida (`--json`)                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `giro list --json`                                              | `[{ id, label, category, businessCategory, aliases[], palettes, palettesFree, fontPairs, templates[] }]`                                                                                                                                                                                                                                                                            |
| `giro show <giro> --json`                                       | `{ id, label, aliases, rules[], palettesList[{ id, label, mood, scheme, accent, free }], fontPairsList[{ id, label, mood, free }], shapes[{ id, label }], tiers.{basico,pro}{ id, counted, defaultSections[], roles[{ role, slot, required, variants[], purpose }] }, copy.<slot>{ keys[{ key, limit?, example? }], variants{} }, heroAlternates[], images{}, business{}, motion }` |
| `list --offline --json`                                         | filas con `origin` (`generated`/`frozen`/`clone`/`manual`), `drift[]`, y `unbuilt`                                                                                                                                                                                                                                                                                                  |
| `kit capacity [--giro <g>] [--catalog legacy\|extended] --json` | por giro: `{ giro, catalog, templates{pro,basico,total}, pools{palettes, palettesFree, fontPairs, fontPairsFree, heroVariants, heroFreePro, shapes}, hueSlots, headroom{twins,pro,basico,total}{added, stop} }`: cuántas plantillas más acepta el compilador                                                                                                                        |
| `spec schema`                                                   | JSON Schema del spec                                                                                                                                                                                                                                                                                                                                                                |
| `direccion list\|show <id> --json`                              | `list`: las 6 direcciones completas; `show`: una `{ id, name, intent, voice{ register, rules[], avoid[], headline, cta }, palettes, fontPairs, style, primitives, archetypes[], heroes{pro,basic}, motion, dials, giros[], rules[] }`                                                                                                                                               |
| `kit list [--slot s] --json`                                    | el catálogo (`catalog.manifest.json`): `variants[{ key, tiers, proOnly, catalog, fit, archetypes, contentKeys, intent }]`, `primitives`, `palettes`, `fontPairs`, `archetypes`, `directions`                                                                                                                                                                                        |

`giro show` también trae `directions[{ id, name, intent, affinity, used }]` (las menos usadas primero), `archetypesUsed{}` y `freeProHeroes[]`. `usedAccentHues[]` y `freeHueRanges[]` (grados) dicen qué tonos de acento quedan para una paleta propia cuando ya no hay curadas libres. `free: true` = esa paleta/tipografía no choca con ninguna plantilla del giro: úsala tal cual. `otherFontPairs[]` (misma forma que `fontPairsList`) son los demás pares curados que `brand.fontPair` acepta: úsalos cuando el tono del negocio no está en los del giro (p. ej. una taquería urbana en un giro de restaurantes con serifas).

## Spec

| Comando                                             | Qué hace                                                                                                                                                                                     |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spec init --giro <g> --nombre "<N>" --twin --json` | escribe `packages/template-kit/specs/<g>-<n>.spec.json` con el copy del giro; `{ file, ids, todo }`. Con `--direccion <id>` escribe `layout.direction` y no fija paleta, tipografía ni forma |
| `spec validate <stem\|archivo> --strict --json`     | `{ file, ok, strict, ids, errors, warnings, problems[{ level, path, message, hint?, rule? }] }`                                                                                              |
| `spec lock <stem> \| --all [--refresh] --json`      | escribe `specs/<stem>.lock.json` si el spec reproduce sus archivos; `[{ code, spec, ids, lock, action, reproduces, files[{ path, state, same }], problems, message? }]`                      |

`spec init` escribe `brand.catalog: "extended"` (paletas, tipografías y variantes nuevas además de las
de siempre); un spec sin `catalog` es `legacy` y nunca ve lo nuevo al elegir solo (nombrar un id nuevo
a mano sí funciona). `build` reusa el lock: lo que el spec no fija sale del lock, y si eso ya choca
el build falla con `spec lock <stem> --refresh` como sugerencia; no lo uses sin que te lo pidan.

Reglas de `--strict` (`rule`): `longitud`, `placeholder`, `promesa`, `contacto-literal`, `marca-real`
(errores); `acentos`, `ortografia`, `repetido`, `generico`, `datos-ficticios`, y las de texto
genérico `muletilla`, `rayas`, `mayusculas`, `esqueleto` (avisos: arréglalos igual).

`layout` (solo con `brand.catalog: "extended"`): `direction` (id de `direccion list`), `archetype`,
`variantOverrides` (`{ "<rol o slot>": "<variante>" }`, validado contra el blueprint), `dials`
(`variance`, `density`, `motion`, 1–10). `brand.primitives` cambia un primitivo de la dirección
(`{ "button": "outline" }`). `build` falla si la plantilla rompe una regla de la dirección
(`rule: "direction"`, p. ej. fondo oscuro en una dirección clara). `path` es la
ruta en el spec que hay que cambiar (`copy.hero.title`, `overrides.basico.copy.hero.text`…).

## Compilar

`build <stem> --json` (y `new --spec <archivo> --yes --json`, que además crea el spec si no existe):

```json
{
  "ok": true,
  "code": 0,
  "spec": "specs/x.spec.json",
  "hash": "…",
  "ids": ["…-v1", "…-base-…-v1"],
  "tiers": [
    {
      "id": "…",
      "tier": "pro",
      "theme": "…",
      "choices": ["paleta: …"],
      "findings": [],
      "similarity": [{ "other": "…", "score": 0.3 }],
      "similarityLimit": 0.5,
      "images": []
    }
  ],
  "files": [
    {
      "path": "templates/…ts",
      "kind": "manifest",
      "ids": ["…"],
      "action": "create",
      "hash": "…"
    }
  ],
  "problems": [],
  "lock": {
    "path": "specs/x.lock.json",
    "used": true,
    "action": "unchanged"
  },
  "ms": 5000,
  "next": [
    "pnpm lattiz check … --json",
    "pnpm lattiz review …",
    "pnpm lattiz dev …",
    "pnpm lattiz ship … # solo con aprobación humana explícita"
  ]
}
```

`files[].action`: `create`, `update`, `unchanged`; conflictos que detienen el build: `edited` (alguien
editó el generado), `frozen`, `foreign`, `other-spec`. Opciones útiles: `--dry-run --diff`,
`--images placeholder|pixabay|none` (por defecto `pixabay` si hay `PIXABAY_API_KEY`, si no `placeholder`; la primera línea de stderr dice cuál usó). **Nunca** `--force`. Con clave, cada imagen sale de la búsqueda `images[].source: { "search": "…" }` (o la del giro) y `CREDITS.json` anota `source: "pixabay"`, autor, página y `tags`. Sin clave, las fotos van por URL en el spec: `images[].source: { "url": "https://…" }` (hosts permitidos: `images.pexels.com`, `images.unsplash.com`, `pixabay.com`, `cdn.pixabay.com`); el build las descarga una vez (caché `.lattiz/cache/images/`), las recorta y anota `CREDITS.json` (`source: "url"`, `url`, `pageUrl`). Una URL escrita en `copy.*.image` es error de `spec validate`.

## Revisar (uno a la vez)

`check <id> --json` (20–40 s, ~1 GiB): `{ id, tier, status: PASS|WARN|FAIL, spec, results[], findings[], ms, peakBytes, shots }`

```json
{
  "rule": "fit",
  "severity": "FAIL",
  "viewport": "1366×768",
  "section": "hero",
  "variant": "split",
  "selector": null,
  "message": "contentHeight 700 px vs 625 px …",
  "specHint": "copy.hero.title (≤ 56 caracteres; ideal ≤ 40) y copy.hero.text más cortos; …"
}
```

Reglas: `kit`, `head`, `tokens`, `overflow`, `font`, `tap`, `contrast`, `alt`, `images`, `fit`, `fold` (WARN: el CTA del hero no se ve sin scroll; para la skill es bloqueante), `motion`
(Pro), `nojs` (Pro), `credits`. `specHint: null` = no se arregla desde el spec (estilo de la variante o
del pipeline). Código 1 si hay FAIL.

`review <id> [--json]` (~15–20 s): escribe `.lattiz/review/<id>/` con `movil-390x844.png`,
`movil-390-completa.png`, `laptop-1366x768.png`, `escritorio-1440x900.png`,
`escritorio-1440-completa.png`, `secciones/NN-<slot>.png`, `review.md` y `review.json`
(`choices`: tema, paleta, tipografía, forma, Motion, secciones; `copy[]` por sección; `twin.summary[]`).

`dev <id>`: servidor local con 7 tamaños (para el humano). `kit:compare-visual dist/<id>…`
(`pnpm --filter @lattiz/template-kit kit:compare-visual dist/<idA> dist/<idB>`): distancia visual
≥ 0.33 contra el resto del giro.

## Remoto (prohibido sin pedido explícito)

`seed`, `deploy`, `publish`, `ship`. Sin terminal interactiva rechazan si no llevan `--yes` **y**
`--confirm-remote`. Solo el humano decide correrlos; tú entregas el comando.
