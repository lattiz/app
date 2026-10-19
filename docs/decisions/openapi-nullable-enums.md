---
name: openapi-nullable-enums
description: enum nulo en un DTO: null dentro del array enum; nullable:true solo no llega al cliente
type: gotcha
date: 2026-10-17
commit: 7fba163
---

Para que un enum que puede ser `null` llegue así al cliente generado (`@hey-api/openapi-ts`), el `@ApiProperty` lleva `null` dentro del array: `enum: [...VALUES, null], nullable: true`. Con solo `nullable: true`, el tipo generado queda como enum obligatorio y el front tipa mal los campos que vienen de un `LEFT JOIN`. Strings, números y booleanos con `nullable: true` sí salen como `| null`.

**Why:** pasó en los DTOs del admin (`subscriptionStatus`, `renewalStatus`, `revenueError`…). El mismo patrón ya lo usaba `lockedReason`.
**How to apply:** en un DTO nuevo con enum opcional, revisa el tipo resultante en `packages/api-client/src/generated/types.gen.ts` tras `pnpm generate:api`. Ver [[admin-architecture]].
