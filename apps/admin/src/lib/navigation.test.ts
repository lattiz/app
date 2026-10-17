import { describe, expect, it } from 'vitest';
import {
  NAV_ITEMS,
  canAccess,
  navItemsFor,
  type AdminRole,
} from './navigation';

const ALL_PATHS = NAV_ITEMS.map((item) => item.to);

function pathsFor(role: AdminRole): string[] {
  return navItemsFor(role).map((item) => item.to);
}

describe('navItemsFor', () => {
  it('gives the viewer only Resumen', () => {
    expect(pathsFor('viewer')).toEqual(['/']);
    expect(navItemsFor('viewer').map((item) => item.label)).toEqual([
      'Resumen',
    ]);
  });

  it('lets the operator read Configuración and hides Auditoría and Equipo', () => {
    expect(pathsFor('operator')).toEqual([
      '/',
      '/plantillas',
      '/clientes',
      '/suscripciones',
      '/pruebas',
      '/configuracion',
    ]);
  });

  it('gives the owner every section, in table order', () => {
    expect(pathsFor('owner')).toEqual(ALL_PATHS);
    expect(navItemsFor('owner')).toHaveLength(8);
  });
});

describe('canAccess', () => {
  it('lets every role open Resumen', () => {
    for (const role of ['owner', 'operator', 'viewer'] as const) {
      expect(canAccess(role, '/')).toBe(true);
    }
  });

  it('blocks the viewer from every other section', () => {
    for (const path of ALL_PATHS) {
      if (path === '/') continue;
      expect(canAccess('viewer', path)).toBe(false);
    }
  });

  it('lets the operator open Configuración and blocks Auditoría and Equipo', () => {
    expect(canAccess('operator', '/configuracion')).toBe(true);
    expect(canAccess('operator', '/equipo')).toBe(false);
    expect(canAccess('operator', '/auditoria')).toBe(false);
    expect(canAccess('operator', '/clientes')).toBe(true);
  });

  it('lets the owner open every section', () => {
    for (const path of ALL_PATHS) {
      expect(canAccess('owner', path)).toBe(true);
    }
  });

  it('follows the section for nested paths and ignores unknown ones', () => {
    expect(canAccess('operator', '/plantillas/')).toBe(true);
    expect(canAccess('operator', '/plantillas/abc')).toBe(true);
    expect(canAccess('viewer', '/plantillas/abc')).toBe(false);
    expect(canAccess('owner', '/equipo?tab=1')).toBe(true);
    expect(canAccess('owner', '/equipo-extra')).toBe(false);
    expect(canAccess('owner', '/otra')).toBe(false);
    expect(canAccess('owner', '')).toBe(false);
  });
});
