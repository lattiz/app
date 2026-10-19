export type KitSectionView = {
  slot: string;
  variant: string;
};

export type KitCheckView = {
  result: string;
  at?: string;
};

export type KitMetaView = {
  vertical?: string;
  direction?: string;
  archetype?: string;
  palette?: string;
  fontPair?: string;
  sections: KitSectionView[];
  check?: KitCheckView;
  gitSha?: string;
};

const CHECK_LABEL: Record<string, string> = {
  PASS: 'Aprobó',
  FAIL: 'Falló',
  WARN: 'Con avisos',
};

export function readKitMeta(value: unknown): KitMetaView | null {
  const record = recordOf(value);
  if (!record) return null;
  const check = readCheck(record.check);
  return {
    vertical: text(record.vertical) ?? text(record.giro),
    direction: text(record.direction),
    archetype: text(record.archetype),
    palette: text(record.palette),
    fontPair: text(record.fontPair),
    sections: readSections(record.sections),
    check,
    gitSha: text(record.gitSha),
  };
}

export function kitCheckLabel(result: string): string {
  const key = result.trim().toUpperCase();
  return CHECK_LABEL[key] ?? result.trim();
}

function readCheck(value: unknown): KitCheckView | undefined {
  const record = recordOf(value);
  if (!record) return undefined;
  const result = text(record.result);
  if (!result) return undefined;
  return { result, at: text(record.at) };
}

function readSections(value: unknown): KitSectionView[] {
  if (!Array.isArray(value)) return [];
  const sections: KitSectionView[] = [];
  for (const item of value) {
    const record = recordOf(item);
    if (!record) continue;
    const slot = text(record.slot);
    const variant = text(record.variant);
    if (!slot || !variant) continue;
    sections.push({ slot, variant });
  }
  return sections;
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function recordOf(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}
