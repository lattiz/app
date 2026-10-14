import cantera from './cantera-editorial';
import jardin from './jardin-suave';
import marmol from './marmol-sobrio';
import neon from './neon-nocturno';
import terracota from './terracota-calida';
import tinta from './tinta-papel';
import type { ArtDirection } from './types';

export type { ArtDirection, DirectionRule } from './types';

/**
 * Art directions (extended catalog), in display order. Data only: src/spec/direction.ts validates
 * them (directionProblems) and the spec compiler reads one with `layout.direction`. Add one by
 * writing directions/<id>.ts and listing it here; ids are stable.
 */
export const DIRECTIONS: Record<string, ArtDirection> = Object.fromEntries(
  [cantera, neon, jardin, tinta, terracota, marmol].map((d) => [d.id, d]),
);
