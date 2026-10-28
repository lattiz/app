import type { GiroDefinition } from '../src/spec/giro';
import academiaCombate from './academia-combate';
import barberia from './barberia';
import clinica from './clinica';
import dental from './dental';
import despacho from './despacho';
import estetica from './estetica';
import floreria from './floreria';
import gimnasio from './gimnasio';
import restaurante from './restaurante';
import tienda from './tienda';
import veterinaria from './veterinaria';

/** Giros the spec flow knows; the id is also the kit vertical. */
export const GIROS: Record<string, GiroDefinition> = {
  'academia-combate': academiaCombate,
  barberia,
  clinica,
  dental,
  despacho,
  estetica,
  floreria,
  gimnasio,
  restaurante,
  tienda,
  veterinaria,
};
