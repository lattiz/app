export type DiffChange = {
  field: string;
  before: unknown;
  after: unknown;
};

export type DiffText = {
  text: string;
  scroll: boolean;
};

const INLINE_LIMIT = 80;

export function diffChanges(before: unknown, after: unknown): DiffChange[] {
  const left = asRecord(before);
  const right = asRecord(after);
  if (left && right) {
    return [...new Set([...Object.keys(left), ...Object.keys(right)])]
      .sort((a, b) => a.localeCompare(b, 'es'))
      .filter((key) => !sameJson(left[key], right[key]))
      .map((key) => ({ field: key, before: left[key], after: right[key] }));
  }
  if (left || right) {
    const record = left ?? right;
    if (!record) return [];
    const filled = left ? 'before' : 'after';
    return Object.keys(record)
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map((key) => ({
        field: key,
        before: filled === 'before' ? record[key] : undefined,
        after: filled === 'after' ? record[key] : undefined,
      }));
  }
  if (sameJson(before, after)) return [];
  return [{ field: 'Valor', before, after }];
}

export function formatDiffValue(value: unknown): DiffText {
  if (value === undefined) return { text: '—', scroll: false };
  if (value === null) return { text: 'vacío', scroll: false };
  if (typeof value === 'boolean') return { text: value ? 'sí' : 'no', scroll: false };
  if (typeof value === 'number') return { text: String(value), scroll: false };
  if (typeof value === 'string') {
    return { text: value === '' ? 'vacío' : value, scroll: value.length > INLINE_LIMIT };
  }
  const compact = JSON.stringify(value);
  if (compact.length <= INLINE_LIMIT) return { text: compact, scroll: false };
  return { text: JSON.stringify(value, null, 2), scroll: true };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
