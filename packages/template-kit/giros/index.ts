import type { GiroDefinition } from '../src/spec/giro';
import barberia from './barberia';
import clinica from './clinica';
import floreria from './floreria';
import restaurante from './restaurante';

/** Giros the spec flow knows; the id is also the kit vertical. */
export const GIROS: Record<string, GiroDefinition> = {
  barberia,
  clinica,
  floreria,
  restaurante,
};
