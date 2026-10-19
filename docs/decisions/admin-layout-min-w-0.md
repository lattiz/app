---
name: admin-layout-min-w-0
description: SidebarInset de shadcn necesita min-w-0 o una tabla ancha desborda toda la página
type: gotcha
date: 2026-10-17
commit: 44fec50
---

En `apps/admin`, el `SidebarInset` de shadcn (flex item) no se encoge por debajo de su contenido sin `min-w-0`. Una tabla ancha dentro de una tarjeta con `overflow-x-auto` igual empujaba la página 58 px a 1440 de ancho. La causa estaba en el layout, no en la tarjeta.

**Why:** ponerle `min-w-0` solo a la tarjeta o al `main` no basta; todo ancestro flex hasta el inset debe poder encogerse.
**How to apply:** una página nueva del admin no necesita nada más que `overflow-x-auto` en el contenedor de su tabla. Para verificarlo: `document.documentElement.scrollWidth === window.innerWidth` a 1440 y 390 px. Ver [[admin-architecture]].
