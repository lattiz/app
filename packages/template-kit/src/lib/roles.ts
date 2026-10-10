import type { Role } from '../tiers';
import type { Blueprint } from '../types';
import { KitError } from './args';

/** Slot → role for every role the blueprint allows, resolved through the vertical's map. */
export function slotRoles(
  blueprint: Blueprint,
  vertical: string,
): Map<string, Role> {
  const spec = blueprint.verticals[vertical];
  if (!spec)
    throw new KitError(
      `blueprint ${blueprint.family}.${blueprint.tier} has no role map for vertical "${vertical}" (known: ${Object.keys(blueprint.verticals).join(', ')}).`,
    );
  const out = new Map<string, Role>();
  for (const role of Object.keys(blueprint.roles) as Role[]) {
    const slot = spec.slots[role];
    if (!slot)
      throw new KitError(
        `blueprint ${blueprint.family}.${blueprint.tier}: role "${role}" has no slot for vertical "${vertical}".`,
      );
    out.set(slot, role);
  }
  return out;
}
