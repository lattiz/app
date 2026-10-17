import { describe, expect, it } from 'vitest';
import { diffChanges, formatDiffValue } from './diff';

describe('diffChanges', () => {
  it('lists only the fields that changed', () => {
    expect(
      diffChanges(
        { name: 'Ana', plan: 'basico', notes: 'hola' },
        { name: 'Ana', plan: 'pro', tags: ['interna'] },
      ),
    ).toEqual([
      { field: 'notes', before: 'hola', after: undefined },
      { field: 'plan', before: 'basico', after: 'pro' },
      { field: 'tags', before: undefined, after: ['interna'] },
    ]);
  });

  it('shows every field when one side is missing', () => {
    expect(diffChanges(null, { role: 'viewer' })).toEqual([
      { field: 'role', before: undefined, after: 'viewer' },
    ]);
  });

  it('compares a single value when the payload is not a record', () => {
    expect(diffChanges('antes', 'después')).toEqual([
      { field: 'Valor', before: 'antes', after: 'después' },
    ]);
    expect(diffChanges(null, null)).toEqual([]);
  });
});

describe('formatDiffValue', () => {
  it('keeps short values on one line and pretty-prints a large object', () => {
    expect(formatDiffValue(true)).toEqual({ text: 'sí', scroll: false });
    expect(formatDiffValue(null)).toEqual({ text: 'vacío', scroll: false });
    expect(formatDiffValue(['a'])).toEqual({ text: '["a"]', scroll: false });
    const large = { note: 'x'.repeat(90) };
    const formatted = formatDiffValue(large);
    expect(formatted.scroll).toBe(true);
    expect(formatted.text).toContain('\n');
  });
});
