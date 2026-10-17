import type { AdminSettingViewDto, AdminUpdateSettingDto } from '@lattiz/api-client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatDateTime } from '@/lib/format';
import { SOURCE_LABEL, settingLabel } from './labels';
import {
  formatSettingValue,
  sameSettingValue,
  settingRangeLabel,
  settingValueError,
} from './values';

export function asSettingValue(value: unknown): AdminUpdateSettingDto['value'] {
  return value as AdminUpdateSettingDto['value'];
}

export function SettingField({
  item,
  canEdit,
  pending,
  onSave,
  onReset,
}: {
  item: AdminSettingViewDto;
  canEdit: boolean;
  pending: boolean;
  onSave: (value: unknown) => void;
  onReset: () => void;
}) {
  const label = settingLabel(item.key);
  const [draft, setDraft] = useState<unknown>(item.effectiveValue);
  const [seen, setSeen] = useState(item.effectiveValue);
  if (!sameSettingValue(item.effectiveValue, seen)) {
    setSeen(item.effectiveValue);
    setDraft(item.effectiveValue);
  }

  const error = canEdit
    ? settingValueError(item.type, draft, item.min, item.max)
    : null;
  const dirty = !sameSettingValue(draft, item.effectiveValue);
  const range = settingRangeLabel(item.min, item.max);

  return (
    <div className="flex min-w-0 flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-medium">{label}</h3>
          {item.description ? (
            <p className="text-sm text-pretty text-muted-foreground">{item.description}</p>
          ) : null}
        </div>
        <Badge variant="outline">{SOURCE_LABEL[item.source]}</Badge>
      </div>

      {canEdit ? (
        <SettingControl
          item={item}
          label={label}
          draft={draft}
          disabled={pending}
          onChange={setDraft}
        />
      ) : (
        <ValueReadout value={item.effectiveValue} />
      )}

      {error && dirty ? <p className="text-sm text-destructive">{error}</p> : null}
      {range ? <p className="text-xs text-muted-foreground">{range}</p> : null}
      <p className="text-xs text-muted-foreground">{changeLabel(item)}</p>

      {canEdit ? (
        <div className="flex flex-wrap gap-2">
          {dirty ? (
            <Button
              type="button"
              size="sm"
              disabled={pending || error != null}
              onClick={() => onSave(draft)}
            >
              Guardar
            </Button>
          ) : null}
          {item.source === 'db' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={onReset}
            >
              Volver al valor por defecto
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SettingControl({
  item,
  label,
  draft,
  disabled,
  onChange,
}: {
  item: AdminSettingViewDto;
  label: string;
  draft: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
}) {
  if (item.type === 'bool') {
    return (
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={draft === true}
          disabled={disabled}
          aria-label={label}
          onCheckedChange={onChange}
        />
        {draft === true ? 'Sí' : 'No'}
      </label>
    );
  }
  if (item.type === 'int') {
    return (
      <IntControl
        label={label}
        value={draft}
        min={item.min}
        max={item.max}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  if (item.type === 'string-list' || item.type === 'int-list') {
    return (
      <ListControl
        kind={item.type === 'int-list' ? 'int' : 'string'}
        label={label}
        value={draft}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  return (
    <Input
      aria-label={label}
      value={typeof draft === 'string' ? draft : ''}
      disabled={disabled}
      className="max-w-md"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function IntControl({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: unknown;
  min: number | null;
  max: number | null;
  disabled: boolean;
  onChange: (value: unknown) => void;
}) {
  const [text, setText] = useState(() => intText(value));
  const [echo, setEcho] = useState(value);
  if (!sameSettingValue(value, echo)) {
    setEcho(value);
    setText(intText(value));
  }

  return (
    <Input
      type="number"
      inputMode="numeric"
      aria-label={label}
      value={text}
      min={min ?? undefined}
      max={max ?? undefined}
      step={1}
      disabled={disabled}
      className="max-w-40"
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        setEcho(parseIntText(next));
        onChange(parseIntText(next));
      }}
    />
  );
}

function ListControl({
  kind,
  label,
  value,
  disabled,
  onChange,
}: {
  kind: 'string' | 'int';
  label: string;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function add() {
    const raw = text.trim();
    if (!raw) {
      setError(kind === 'int' ? 'Escribe un número entero.' : 'Escribe un valor.');
      return;
    }
    if (kind === 'int') {
      if (!/^-?\d+$/.test(raw)) {
        setError('Escribe un número entero.');
        return;
      }
      const next = Number(raw);
      if (items.includes(next)) {
        setError('Ese número ya está.');
        return;
      }
      onChange([...items, next]);
    } else {
      if (items.includes(raw)) {
        setError('Ese valor ya está.');
        return;
      }
      onChange([...items, raw]);
    }
    setText('');
    setError(null);
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {items.length > 0 ? (
        <ul className="flex flex-wrap gap-1">
          {items.map((item, index) => (
            <li key={`${index}-${String(item)}`}>
              <button
                type="button"
                disabled={disabled}
                className="inline-flex h-7 items-center gap-1 rounded-3xl bg-muted px-2 text-xs"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              >
                {String(item)}
                <span className="sr-only">Quitar {String(item)}</span>
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Ninguno</p>
      )}
      <div className="flex min-w-0 max-w-md gap-2">
        <Input
          aria-label={label}
          value={text}
          disabled={disabled}
          inputMode={kind === 'int' ? 'numeric' : 'text'}
          placeholder={kind === 'int' ? 'Número' : 'Agregar'}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" disabled={disabled} onClick={add}>
          Agregar
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function ValueReadout({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-muted-foreground">Ninguno</p>;
    }
    return (
      <ul className="flex flex-wrap gap-1">
        {value.map((item, index) => (
          <li
            key={`${index}-${String(item)}`}
            className="inline-flex h-7 max-w-full items-center rounded-3xl bg-muted px-2 text-xs break-all"
          >
            {String(item)}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm break-all">{formatSettingValue(value)}</p>;
}

function changeLabel(item: AdminSettingViewDto): string {
  if (!item.updatedAt) return 'Nadie lo ha cambiado desde aquí.';
  const who = item.updatedBy?.trim() || 'Alguien del equipo';
  return `Lo cambió ${who} el ${formatDateTime(item.updatedAt)}.`;
}

function intText(value: unknown): string {
  return typeof value === 'number' && Number.isInteger(value) ? String(value) : '';
}

function parseIntText(raw: string): unknown {
  const trimmed = raw.trim();
  if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}
