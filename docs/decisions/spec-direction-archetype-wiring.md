---
name: spec-direction-archetype-wiring
description: layout.direction/archetype/variantOverrides/dials en specs extended; la dirección elige y sus reglas son compuerta
type: project
date: 2026-10-14
commit: 69f6846
---

Un spec `extended` puede llevar `layout` (`direction`, `archetype`, `variantOverrides`, `dials`) y `brand.primitives`; sin `layout` compila igual que antes. Con dirección: su estilo y primitivos van debajo de los del spec, sus paletas y pares primero (rotados por la semilla del id) y el respaldo solo con lo que sus reglas aceptan; variantes: spec > lock > `variantOverrides` > arquetipo > giro; portada: las de la dirección ordenadas por el dial de variación. El lock guarda `layout`; `lattiz build` agrega las reglas de la dirección (`rule: "direction"`) a la compuerta.

**Why:** las direcciones y los arquetipos eran datos que nadie leía. Los arquetipos quedan como registro aparte (`archetypes/`) y no como entradas de blueprint, para no tocar `manifest.archetype` ni los blueprints de las plantillas existentes. El filtro del respaldo salió de la primera prueba: una Básica de `terracota-calida` cayó en una paleta oscura. Los `meta.sample` solo se fusionan con `layout`, porque fusionarlos en todo spec `extended` habría cambiado el pack de `restaurante-fresca-nube`.
**How to apply:** nuevas plantillas por spec: `lattiz spec init --direccion <id>` y no fijar paleta, par ni forma. Probar sin tocar el kit con `lattiz build <spec> --out <dir>` y `lattiz check <id> --root <dir>`. Ver [[template-art-directions]], [[template-catalog-versioning]], [[cta-role]].
