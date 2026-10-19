import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={pressed ? 'default' : 'outline'}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function FilterSelect<T extends string>({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  allLabel: string;
  value: T | undefined;
  options: readonly { value: T; label: string }[];
  onChange: (value: T | undefined) => void;
}) {
  const items = [{ value: 'all', label: allLabel }, ...options];
  const current = value ?? 'all';
  const selectedLabel = items.find((item) => item.value === current)?.label ?? allLabel;

  return (
    <Select
      items={items}
      value={current}
      onValueChange={(next) => {
        if (next == null || next === 'all') {
          onChange(undefined);
          return;
        }
        onChange(next as T);
      }}
    >
      <SelectTrigger aria-label={label} className="min-w-36">
        <SelectValue>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
