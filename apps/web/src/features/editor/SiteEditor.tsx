import StudioEditor from '@grapesjs/studio-sdk/react';
import { layoutSidebarButtons } from '@grapesjs/studio-sdk-plugins';
import './grapesjs-sdk.css';
import './editor-i18n.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { tenantsControllerMeOptions } from '@lattiz/api-client';
import { Loader2Icon, ArrowLeft } from 'lucide-react';
import { type ComponentProps, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { displayHost, liveSiteUrl } from '@/lib/site-address';
import { cn } from '@/lib/utils';
import {
  getEditorProject,
  publishSite,
  saveEditorProject,
  uploadAssets,
} from './api';
import { grapesjsCoreLocaleEs, studioSdkLocaleEs } from './i18n';
import { SaveStatusBadge } from './SaveStatusBadge';
import {
  applyStyleMode,
  initStyleMode,
  readAdvancedStylesPreference,
  SIMPLE_STYLES_ROOT_CLASS,
  type StyleModeEditor,
  writeAdvancedStylesPreference,
} from './style-mode';
import type {
  EditorInstance,
  GrapesJSProjectJSON,
  ProjectFile,
  PublishSitePayload,
  SaveStatus,
} from './types';

interface SiteEditorProps {
  tenantId: string;
}

type StudioOptions = NonNullable<
  ComponentProps<typeof StudioEditor>['options']
>;
type StudioProjectData = NonNullable<
  NonNullable<StudioOptions['storage']>['project']
>;
type StudioPlugins = NonNullable<StudioOptions['plugins']>;

type DeviceOption = {
  id: string;
  name: string;
  width: string | null;
  widthMedia?: string | null;
};

const buildDevices = (device: string): DeviceOption => {
  switch (device) {
    case 'desktop':
      return { id: 'desktop', name: 'Vista Escritorio', width: '' };
    case 'tablet':
      return {
        id: 'tablet',
        name: 'Vista Tablet',
        width: '770px',
        widthMedia: '992px',
      };
    case 'mobile':
      return {
        id: 'mobile',
        name: 'Vista Móvil',
        width: '375px',
        widthMedia: '768px',
      };
    default:
      return { id: 'desktop', name: 'Vista Escritorio', width: '' };
  }
};

// GrapesJS SDK does not auto-load plugins referenced inside the project JSON —
// they must be declared explicitly in the SDK options.
function buildOptions(
  tenantId: string,
  projectJSON: GrapesJSProjectJSON,
  onSave: (project: GrapesJSProjectJSON) => void,
): StudioOptions {
  const plugins = [
    // Sidebar de botones con layouts propios para tablet y móvil (el layout por defecto no es usable < 1000px).
    // Cast: los tipos del plugin y del SDK instalado divergen aunque el runtime lo acepta.
    layoutSidebarButtons,
    ...(projectJSON.custom?.plugins ?? []).map((p) => ({
      id: p.id,
      src: p.src,
      options: p.options,
    })),
  ] as unknown as StudioPlugins;

  return {
    theme: 'light',

    // ── Internacionalización ────────────────────────────────────────────────
    // System 1 (módulos propios del SDK) → i18n.locales.
    // System 2 (módulos base de GrapesJS) → editor.I18n en onEditor.
    i18n: {
      locales: {
        en: studioSdkLocaleEs,
      },
    },

    // ── Paleta Lattiz (light) ───────────────────────────────────────────────
    // Valores oklch resueltos de los tokens :root para que el editor
    // permanezca en light mode aunque el resto de la app cambie de tema.
    customTheme: {
      default: {
        colors: {
          global: {
            background1: 'oklch(0.97 0 0)', // --muted
            background2: 'oklch(1 0 0)', // --card
            background3: 'oklch(1 0 0)', // --background
            backgroundHover: 'oklch(0.97 0 0)', // --accent
            text: 'oklch(0.145 0 0)', // --foreground
            border: 'oklch(0.922 0 0)', // --border
            focus: 'oklch(44.322% 0.19799 262.397)', // --ring
            placeholder: 'oklch(0.556 0 0)', // --muted-foreground
          },
          primary: {
            background1: 'oklch(53% 0.237 262.2)', // --primary
            background2: 'oklch(0.92 0.06 262.2)', // primary tint
            background3: 'oklch(0.97 0.03 262.2)', // primary tint sutil
            backgroundHover: 'oklch(44.322% 0.19799 262.397)', // --ring
            text: 'oklch(0.985 0 0)', // --primary-foreground
          },
          component: {
            background1: 'hsl(210 75% 50%)',
            background2: 'hsl(210 75% 70%)',
            background3: 'hsl(210 75% 93%)',
            backgroundHover: 'hsl(210 75% 60%)',
            text: '#ffffff',
          },
          selector: {
            background1: 'hsl(336 69% 30%)',
            background2: 'hsl(336 84% 90%)',
            background3: 'hsl(336 84% 97%)',
            backgroundHover: 'hsl(336 84% 80%)',
            text: '#ffffff',
          },
          symbol: {
            background1: 'oklch(53% 0.237 262.2)',
            background2: 'oklch(0.92 0.06 262.2)',
            background3: 'oklch(0.97 0.03 262.2)',
            backgroundHover: 'oklch(44.322% 0.19799 262.397)',
            text: 'oklch(0.985 0 0)',
          },
        },
      },
    },

    // ── Restricciones WaaS ─────────────────────────────────────────────────
    // MVP: un sitio = una página → panel de páginas deshabilitado.
    pages: false,
    // Elimina acceso al código fuente (View code / Import code) del toolbar.
    devices: {
      default: ['desktop', 'tablet', 'mobile'].map((device) =>
        buildDevices(device),
      ),
      selected: 'desktop',
    },
    actions: ({ actions }) =>
      actions.filter(
        (a) =>
          a.id !== 'showCode' &&
          a.id !== 'showImportCode' &&
          a.id !== 'componentOutline' &&
          a.id !== 'clearCanvas',
      ),

    // ── Assets ─────────────────────────────────────────────────────────────
    // Sin onUpload el SDK deja URLs `blob:`/`data:` de la sesión del editor en
    // el HTML exportado, que dan 404 en el sitio publicado. Se suben al API y
    // se devuelve la URL pública del almacenamiento.
    // Sin `onLoad` las referencias siguen guardándose en el project JSON, así
    // que las imágenes ya subidas reaparecen en sesiones posteriores.
    assets: {
      storageType: 'self',
      onUpload: async ({ files }) => {
        try {
          return await uploadAssets(tenantId, files);
        } catch (err) {
          toast.error(
            err instanceof Error
              ? err.message
              : 'No se pudo subir la imagen. Intenta de nuevo.',
          );
          throw err;
        }
      },
    },

    // ── Core ───────────────────────────────────────────────────────────────
    licenseKey: import.meta.env.VITE_GRAPESJS_LICENSE_KEY ?? 'DEV_LICENSE_KEY',
    project: { type: 'web' as const },
    storage: {
      type: 'self',
      project: projectJSON as unknown as StudioProjectData,
      autosaveChanges: 5,
      onSave: async ({ project }) => {
        onSave(project as unknown as GrapesJSProjectJSON);
      },
    },
    plugins,
  };
}

export function SiteEditor({ tenantId }: SiteEditorProps) {
  const editorRef = useRef<EditorInstance | null>(null);
  const grapesEditorRef = useRef<StyleModeEditor | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [advancedStyles, setAdvancedStyles] = useState(
    readAdvancedStylesPreference,
  );
  const lastProjectRef = useRef<GrapesJSProjectJSON | null>(null);

  const handleAdvancedStylesChange = (checked: boolean) => {
    setAdvancedStyles(checked);
    writeAdvancedStylesPreference(checked);
    const editor = grapesEditorRef.current;
    if (editor) applyStyleMode(editor, checked);
  };

  const query = useQuery({
    queryKey: ['editor-project', tenantId],
    queryFn: () => getEditorProject(tenantId),
    staleTime: Infinity,
  });

  // Already cached by the dashboard; only read here to tell the user where the site lives.
  const tenantMe = useQuery(tenantsControllerMeOptions());

  const saveMutation = useMutation({
    mutationFn: (project: GrapesJSProjectJSON) =>
      saveEditorProject(tenantId, project),
    onSuccess: (res) => setSavedAt(res.updatedAt),
  });

  const publishMutation = useMutation({
    mutationFn: (payload: PublishSitePayload) => publishSite(tenantId, payload),
  });

  const handleSave = (project: GrapesJSProjectJSON) => {
    lastProjectRef.current = project;
    saveMutation.mutate(project);
  };

  const retrySave = () => {
    if (lastProjectRef.current) saveMutation.mutate(lastProjectRef.current);
  };

  const handlePublish = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      const files = (await editor.runCommand('studio:projectFiles', {
        styles: 'inline',
      })) as ProjectFile[];
      const project = editor.getProjectData() as GrapesJSProjectJSON;
      const htmlFile =
        files.find((f) => f.name === 'index.html') ??
        files.find((f) => f.mimeType === 'text/html') ??
        files[0];
      if (!htmlFile) throw new Error('No HTML file exported from editor');
      await publishMutation.mutateAsync({
        project,
        exportedHtml: htmlFile.content,
      });
      const url = tenantMe.data ? liveSiteUrl(tenantMe.data) : null;
      if (url) {
        toast.success(`Tu sitio está en vivo en ${displayHost(url)}`, {
          action: {
            label: 'Abrir',
            onClick: () => window.open(url, '_blank', 'noopener,noreferrer'),
          },
        });
      } else {
        toast.success('Tu sitio se publicó.');
      }
    } catch (err) {
      console.error('[SiteEditor] Publish failed:', err);
      toast.error('No se pudo publicar tu sitio. Inténtalo de nuevo.');
    }
  };

  if (query.isLoading) {
    return (
      <div className="flex h-screen flex-col gap-3 p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="min-h-0 flex-1 rounded-lg" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No se pudo cargar el editor.
        </p>
        <Button size="sm" onClick={() => void query.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const saveStatus: SaveStatus = saveMutation.isPending
    ? 'saving'
    : saveMutation.isError
      ? 'error'
      : savedAt
        ? 'saved'
        : 'idle';

  const options = buildOptions(tenantId, query.data.project, handleSave);
  const isPublishing = publishMutation.isPending;

  return (
    <div
      className={cn(
        'flex h-dvh flex-col overflow-hidden',
        !advancedStyles && SIMPLE_STYLES_ROOT_CLASS,
      )}
    >
      {/* En móvil el header se colapsa al hacer scroll hacia abajo y reaparece al subir. */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 sm:grid-rows-[1fr]',
          headerHidden ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
        )}
        // El canvas de GrapesJS no se entera del cambio de alto del contenedor sin un resize.
        onTransitionEnd={() => window.dispatchEvent(new Event('resize'))}
      >
        <header
          className={cn(
            'flex min-h-0 w-full flex-wrap items-center justify-between gap-x-3 gap-y-0 overflow-hidden border-b border-border bg-primary px-3 py-1 sm:gap-y-1 sm:px-4 sm:py-2',
            headerHidden && 'max-sm:border-b-0 max-sm:py-0',
          )}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="linkSecondary"
              size="default"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="size-4" color="#FFF" />
              Regresar
            </Button>
            <div className="hidden sm:block">
              <SaveStatusBadge
                status={saveStatus}
                lastSavedAt={savedAt}
                onRetry={retrySave}
              />
            </div>
          </div>

          <div className="contents">
            <div className="order-3 flex w-full items-center justify-between gap-2 sm:contents">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <div className="flex items-center gap-2 text-primary-foreground sm:ml-auto">
                        <Switch
                          id="lattiz-advanced-styles"
                          size="sm"
                          checked={advancedStyles}
                          onCheckedChange={handleAdvancedStylesChange}
                          className="border-primary-foreground/40 data-checked:border-white data-checked:bg-white data-unchecked:bg-primary-foreground/30"
                          thumbClassName="data-checked:bg-primary dark:data-checked:bg-primary"
                        />
                        <Label
                          htmlFor="lattiz-advanced-styles"
                          className="cursor-pointer text-xs font-normal text-primary-foreground"
                        >
                          <span className="sm:hidden">Opciones avanzadas</span>
                          <span className="hidden sm:inline">
                            Mostrar opciones avanzadas
                          </span>
                        </Label>
                      </div>
                    }
                  />
                  <TooltipContent side="bottom">
                    Espaciado, posición, bordes y efectos
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="sm:hidden">
                <SaveStatusBadge
                  status={saveStatus}
                  lastSavedAt={savedAt}
                  onRetry={retrySave}
                />
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="order-2 sm:order-none"
              onClick={() => void handlePublish()}
              disabled={isPublishing || saveMutation.isPending}
            >
              {isPublishing ? (
                <>
                  <Loader2Icon className="mr-2 size-3 animate-spin" />
                  Publicando…
                </>
              ) : (
                'Publicar sitio 🚀'
              )}
            </Button>
          </div>
        </header>
      </div>

      <main className="min-h-0 flex-1">
        <StudioEditor
          options={options}
          onEditor={(editor) => {
            editorRef.current = editor as unknown as EditorInstance;
            grapesEditorRef.current = editor as unknown as StyleModeEditor;

            // Core GrapesJS i18n only responds to editor.I18n; SDK forces locale `en`.
            editor.on('load', () => {
              editor.I18n.addMessages({ en: grapesjsCoreLocaleEs });
              editor.I18n.setLocale('en');
              const advanced = initStyleMode(
                editor as unknown as StyleModeEditor,
              );
              setAdvancedStyles(advanced);
            });

            // Scroll (canvas iframe o paneles del editor) → mostrar/ocultar header solo en móvil.
            const mobile = window.matchMedia('(max-width: 639px)');
            const lastY = new WeakMap<object, number>();
            const onScroll = (e: Event, win?: Window) => {
              if (!mobile.matches) return;
              const t = e.target as Document | HTMLElement;
              const y =
                t.nodeType === 9
                  ? (win?.scrollY ?? window.scrollY)
                  : (t as HTMLElement).scrollTop;
              const prev = lastY.get(t) ?? 0;
              if (y <= 0 || y < prev - 4) setHeaderHidden(false);
              else if (y > 16 && y > prev + 4) setHeaderHidden(true);
              else return;
              lastY.set(t, y);
            };
            document.addEventListener('scroll', (e) => onScroll(e), true);
            const bound = new WeakSet<object>();
            const bindCanvasScroll = () => {
              const win = editor.Canvas.getWindow();
              if (!win || bound.has(win.document)) return;
              bound.add(win.document);
              win.document.addEventListener(
                'scroll',
                (e) => onScroll(e, win),
                true,
              );
            };
            editor.on('load', bindCanvasScroll);
            editor.on('canvas:frame:load', bindCanvasScroll);
          }}
        />
      </main>
    </div>
  );
}
