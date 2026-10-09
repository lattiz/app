---
name: postgres-js-date-params
description: Nunca enlazar un Date en un sql`` crudo de Drizzle+postgres.js; usar toISOString()
type: gotcha
date: 2026-10-09
commit: 32c4e0d
---

Con Drizzle sobre postgres.js, un `Date` interpolado en un template `sql\`…\`` crudo (`db.execute`) revienta en tiempo de ejecución: `The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received an instance of Date`. Drizzle lo reporta solo como `Failed query: …` y el log no muestra la causa. Un string ISO con cast (`${date.toISOString()}::timestamptz`) funciona.

**Why:** el aviso de fin de prueba gratuita (`PreviewNotifierService.selectDue`) fallaba en cada ejecución por esto; los tests no lo detectaban porque su BD falsa nunca pasa por postgres.js.
**How to apply:** en SQL crudo, enlazar fechas como texto ISO. En los fakes de BD de los tests, rechazar parámetros `Date` (ver `preview-notifier.service.test.ts`).
