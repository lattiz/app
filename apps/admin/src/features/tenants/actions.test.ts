import { describe, expect, it } from 'vitest';
import { addFreeTag, notesError, sameFlags, tenantActionSet } from './actions';

describe('tenant actions', () => {
  it('suspends an active site and reactivates a suspended one', () => {
    expect(tenantActionSet('owner', 'active')).toEqual({
      suspend: true,
      reactivate: false,
      notes: true,
    });
    expect(tenantActionSet('operator', 'inactive')).toEqual({
      suspend: false,
      reactivate: true,
      notes: true,
    });
    expect(tenantActionSet('operator', 'cancelled')).toEqual({
      suspend: false,
      reactivate: false,
      notes: true,
    });
    expect(tenantActionSet('viewer', 'active').notes).toBe(false);
  });

  it('keeps up to 10 tags of 24 characters', () => {
    expect(addFreeTag(['Vip'], ' vip ').tags).toEqual(['Vip']);
    expect(addFreeTag([], 'a'.repeat(25)).error).toMatch(/24/);
    const full = Array.from({ length: 10 }, (_, index) => `t${index}`);
    expect(addFreeTag(full, 'extra').error).toMatch(/10/);
    expect(notesError('a'.repeat(2001))).toMatch(/2000/);
    expect(notesError('hola')).toBeNull();
  });

  it('notices when notes, tags or the internal flag changed', () => {
    const current = { isInternal: false, tags: ['a'], notes: 'hola' };
    expect(
      sameFlags(current, { isInternal: false, tags: ['a'], notes: ' hola ' }),
    ).toBe(true);
    expect(
      sameFlags(current, { isInternal: true, tags: ['a'], notes: 'hola' }),
    ).toBe(false);
  });
});
