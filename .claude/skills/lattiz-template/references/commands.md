# Contrato del CLI para la skill

Todo desde la raíz del repo con `pnpm lattiz …`. Códigos de salida: **0** ok · **1** falló una
verificación (validación del kit, unicidad, archivo editado a mano o congelado, FAIL en `check`) ·
**2** uso o datos (spec inválido, flag desconocido, falta algo). Con `--json`, stdout es solo el JSON;
en error, el mensaje va a stderr.

## Lectura

| Comando                   | Salida (`--json`)                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `giro list --json`        | `[{ id, label, category, businessCategory, aliases[], palettes, palettesFree, fontPairs, templates[] }]`                                                                                                                                                                                                                                                                            |
| `giro show <giro> --json` | `{ id, label, aliases, rules[], palettesList[{ id, label, mood, scheme, accent, free }], fontPairsList[{ id, label, mood, free }], shapes[{ id, label }], tiers.{basico,pro}{ id, counted, defaultSections[], roles[{ role, slot, required, variants[], purpose }] }, copy.<slot>{ keys[{ key, limit?, example? }], variants{} }, heroAlternates[], images{}, business{}, motion }` |
| `list --offline --json`   | filas con `origin` (`generated`/`frozen`/`clone`/`manual`), `drift[]`, y `unbuilt`                                                                                                                                                                                                                                                                                                  |
| `spec schema`             | JSON Schema del spec                                                                                                                                                                                                                                                                                                                                                                |

`free: true` = esa paleta/tipografía no choca con ninguna plantilla del giro: úsala tal cual. `otherFontPairs[]` (misma forma que `fontPairsList`) son los demás pares curados que `brand.fontPair` acepta: úsalos cuando el tono del negocio no está en los del giro (p. ej. una taquería urbana en un giro de restaurantes con serifas).

## Spec

| Comando                                             | Qué hace                                                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `spec init --giro <g> --nombre "<N>" --twin --json` | escribe `packages/template-kit/specs/<g>-<n>.spec.json` con el copy del giro; `{ file, ids, todo }` |
| `spec validate <stem\|archivo> --strict --json`     | `{ file, ok, strict, ids, errors, warnings, problems[{ level, path, message, hint?, rule? }] }`     |

Reglas de `--strict` (`rule`): `longitud`, `placeholder`, `promesa`, `contacto-literal`, `marca-real`
(errores); `acentos`, `ortografia`, `repetido`, `generico`, `datos-ficticios` (avisos). `path` es la
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
`--images placeholder|pexels|none`. **Nunca** `--force`.

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

Reglas: `kit`, `head`, `tokens`, `overflow`, `font`, `tap`, `contrast`, `alt`, `images`, `fit`, `motion`
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
