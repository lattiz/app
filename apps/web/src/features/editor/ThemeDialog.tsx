import { useState } from 'react';
import { CheckIcon, LockIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  FONT_PAIRINGS,
  type FontPairing,
  THEME_PALETTES,
  type ThemePalette,
} from './theme-presets';

export interface ThemeChoice {
  palette: ThemePalette | null;
  dark: boolean;
  font: FontPairing | null;
}

interface ThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** templateAccess.proIncluded: Pro palettes, dark variants and font pairings. */
  proIncluded: boolean;
  onApply: (choice: ThemeChoice) => void;
}

function Swatches({ palette, dark }: { palette: ThemePalette; dark: boolean }) {
  const colors = dark && palette.dark ? palette.dark : palette.light;
  return (
    <span
      className="flex h-12 w-full items-end gap-1 rounded-md border p-1.5"
      style={{ background: colors.bg }}
      aria-hidden="true"
    >
      <span
        className="h-full flex-1 rounded-sm"
        style={{ background: colors.accent }}
      />
      <span
        className="h-2/3 flex-1 rounded-sm"
        style={{ background: colors.text }}
      />
      <span
        className="h-1/2 flex-1 rounded-sm"
        style={{ background: colors['surface-2'] }}
      />
    </span>
  );
}

/** Theme presets: they rewrite the template's --lz-* tokens, so every section follows. */
export function ThemeDialog({
  open,
  onOpenChange,
  proIncluded,
  onApply,
}: ThemeDialogProps) {
  const [paletteId, setPaletteId] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [fontId, setFontId] = useState<string | null>(null);

  const palette = THEME_PALETTES.find((p) => p.id === paletteId) ?? null;
  const font = FONT_PAIRINGS.find((f) => f.id === fontId) ?? null;
  const canDark = proIncluded && !!palette?.dark;

  const renderPalette = (p: ThemePalette) => {
    const locked = p.tier === 'pro' && !proIncluded;
    const selected = p.id === paletteId;
    return (
      <button
        key={p.id}
        type="button"
        disabled={locked}
        onClick={() => setPaletteId(p.id)}
        aria-pressed={selected}
        className={cn(
          'flex flex-col gap-1.5 rounded-lg border p-2 text-left text-xs transition-colors',
          selected ? 'border-primary ring-2 ring-primary/30' : 'hover:bg-muted',
          locked && 'cursor-not-allowed opacity-50',
        )}
      >
        <Swatches palette={p} dark={dark && !!p.dark && proIncluded} />
        <span className="flex items-center justify-between gap-1 font-medium">
          {p.label}
          {selected ? (
            <CheckIcon className="size-3.5" />
          ) : (
            locked && <LockIcon className="size-3" />
          )}
        </span>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-4 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tema</DialogTitle>
          <DialogDescription>
            Cambia colores y tipografía de todo el sitio de una vez. Puedes
            deshacerlo con Ctrl/⌘ + Z.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-2">
          <p className="text-sm font-medium">Paletas</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {THEME_PALETTES.filter((p) => p.tier === 'basic').map(
              renderPalette,
            )}
          </div>
        </section>

        <section className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            Paletas Pro <Badge variant="secondary">Pro</Badge>
          </p>
          {!proIncluded && (
            <p className="text-xs text-muted-foreground">
              Disponibles con el plan Pro, junto con el modo oscuro y las
              combinaciones tipográficas.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {THEME_PALETTES.filter((p) => p.tier === 'pro').map(renderPalette)}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch
              id="lz-theme-dark"
              checked={dark && canDark}
              disabled={!canDark}
              onCheckedChange={setDark}
            />
            <Label htmlFor="lz-theme-dark" className="text-sm">
              Variante oscura
            </Label>
          </div>
        </section>

        <section className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            Tipografía <Badge variant="secondary">Pro</Badge>
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {FONT_PAIRINGS.map((f) => (
              <button
                key={f.id}
                type="button"
                disabled={!proIncluded}
                aria-pressed={f.id === fontId}
                onClick={() => setFontId(f.id === fontId ? null : f.id)}
                className={cn(
                  'flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm',
                  f.id === fontId
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'hover:bg-muted',
                  !proIncluded && 'cursor-not-allowed opacity-50',
                )}
              >
                {f.label}
                {f.id === fontId && <CheckIcon className="size-4" />}
              </button>
            ))}
          </div>
        </section>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!palette && !font}
            onClick={() =>
              onApply({
                palette,
                dark: dark && canDark,
                font: proIncluded ? font : null,
              })
            }
          >
            Aplicar tema
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
