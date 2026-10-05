/**
 * Modo simple/avanzado del Style Manager.
 *
 * Simple: sector "Básico" con 8 controles; sectores SDK ocultos vía
 * `property.isVisible = () => false` (sobrevive al recompute de selección).
 * Avanzado: restaura sectores SDK y oculta "Básico".
 * La caja de selectores/clases se oculta con CSS (`.lattiz-editor--simple-styles`).
 */

/** Superficie mínima del editor GrapesJS que usa este módulo. */
export interface StyleModeEditor {
  StyleManager: {
    getSector: (id: string) => StyleModeSector | undefined;
    getSectors: (opts?: { visible?: boolean }) => StyleModeSector[];
    addSector: (
      id: string,
      def: {
        name: string;
        open?: boolean;
        properties: ReadonlyArray<{ extend: string }>;
      },
      opts?: { at?: number },
    ) => StyleModeSector;
    select: (targets: unknown[]) => unknown;
    /** Interno de GrapesJS 0.22: emite `style:custom` con el contenedor actual. */
    __trgCustom?: () => void;
  };
  getSelectedAll: () => unknown[];
}

interface StyleModeSector {
  getProperties: () => StyleModeProperty[];
  setOpen: (open: boolean) => void;
  set: (key: string, value: unknown) => void;
}

interface StyleModeProperty {
  set: (key: string, value: unknown) => void;
  unset: (key: string) => void;
  get: (key: string) => unknown;
}

export const ADVANCED_STYLES_STORAGE_KEY = 'lattiz.editor.advancedStyles';
export const BASIC_SECTOR_ID = 'lattiz-basic';
export const SIMPLE_STYLES_ROOT_CLASS = 'lattiz-editor--simple-styles';

/** Sectores que instala el Studio SDK (web). */
export const SDK_SECTOR_IDS = [
  'gs-layout',
  'gs-size',
  'gs-space',
  'gs-position',
  'gs-typography',
  'gs-background',
  'gs-borders',
  'gs-effects',
] as const;

/** Propiedades del sector Básico, en orden de UI. */
export const BASIC_PROPERTIES = [
  { extend: 'font-family' },
  { extend: 'font-size' },
  { extend: 'font-weight' },
  { extend: 'color' },
  { extend: 'text-align' },
  { extend: 'background-color' },
  // El control de capas del SDK solo vive en el sector `gs-background`;
  // en Básico usamos la propiedad built-in (imagen URL / asset picker).
  { extend: 'background-image' },
  { extend: 'border-radius' },
] as const;

const alwaysHidden = () => false;
const ORIGINAL_IS_VISIBLE = '__lattizOriginalIsVisible';

export function readAdvancedStylesPreference(): boolean {
  try {
    return localStorage.getItem(ADVANCED_STYLES_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeAdvancedStylesPreference(advanced: boolean): void {
  try {
    localStorage.setItem(
      ADVANCED_STYLES_STORAGE_KEY,
      advanced ? 'true' : 'false',
    );
  } catch {
    // private mode / quota — ignore
  }
}

function setPropertiesHidden(
  editor: StyleModeEditor,
  sectorId: string,
  hidden: boolean,
): void {
  const sector = editor.StyleManager.getSector(sectorId);
  if (!sector) return;

  for (const prop of sector.getProperties()) {
    const current = prop.get('isVisible');
    if (hidden) {
      // Guarda el isVisible propio del SDK para restaurarlo en modo avanzado.
      if (current !== alwaysHidden) prop.set(ORIGINAL_IS_VISIBLE, current);
      prop.set('isVisible', alwaysHidden);
      prop.set('visible', false);
    } else if (current === alwaysHidden) {
      const original = prop.get(ORIGINAL_IS_VISIBLE);
      if (original) prop.set('isVisible', original);
      else prop.unset('isVisible');
    }
  }

  if (hidden) {
    sector.set('visible', false);
  }
}

function ensureBasicSector(editor: StyleModeEditor): void {
  const sm = editor.StyleManager;
  if (sm.getSector(BASIC_SECTOR_ID)) return;

  sm.addSector(
    BASIC_SECTOR_ID,
    {
      name: 'Básico',
      open: true,
      properties: [...BASIC_PROPERTIES],
    },
    { at: 0 },
  );
}

// select() recalcula la visibilidad, pero el panel React del SDK solo se
// redibuja con `style:custom`, que no se emite si la selección no cambia.
function refreshStyleManager(editor: StyleModeEditor): void {
  const sm = editor.StyleManager;
  sm.select(editor.getSelectedAll());
  sm.__trgCustom?.();
}

export function applySimpleMode(editor: StyleModeEditor): void {
  ensureBasicSector(editor);

  for (const id of SDK_SECTOR_IDS) {
    setPropertiesHidden(editor, id, true);
  }
  setPropertiesHidden(editor, BASIC_SECTOR_ID, false);

  const basic = editor.StyleManager.getSector(BASIC_SECTOR_ID);
  basic?.setOpen(true);
  basic?.set('visible', true);

  refreshStyleManager(editor);
}

export function applyAdvancedMode(editor: StyleModeEditor): void {
  ensureBasicSector(editor);

  for (const id of SDK_SECTOR_IDS) {
    setPropertiesHidden(editor, id, false);
  }
  setPropertiesHidden(editor, BASIC_SECTOR_ID, true);

  refreshStyleManager(editor);
}

export function applyStyleMode(
  editor: StyleModeEditor,
  advanced: boolean,
): void {
  if (advanced) {
    applyAdvancedMode(editor);
  } else {
    applySimpleMode(editor);
  }
}

/** Aplica el modo preferido al cargar el editor (tras i18n). */
export function initStyleMode(editor: StyleModeEditor): boolean {
  const advanced = readAdvancedStylesPreference();
  applyStyleMode(editor, advanced);
  return advanced;
}
