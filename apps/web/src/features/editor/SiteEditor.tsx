import StudioEditor from '@grapesjs/studio-sdk/react';
import { layoutSidebarButtons } from '@grapesjs/studio-sdk-plugins';
import './grapesjs-sdk.css';
import './editor-i18n.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  stockControllerStatusOptions,
  tenantsControllerMeOptions,
  tenantsControllerMeQueryKey,
  type UploadedAssetResponseDto,
} from '@lattiz/api-client';
import { Loader2Icon, ArrowLeft, ImagesIcon, PaletteIcon } from 'lucide-react';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
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
import { formatBytes } from '@/lib/format-bytes';
import { displayHost, liveSiteUrl } from '@/lib/site-address';
import { type ResolvedTheme, useTheme } from '@/lib/theme-provider';
import { reportSiteActionError } from '@/lib/upload-errors';
import { cn } from '@/lib/utils';
import {
  getEditorProject,
  publishSite,
  saveEditorProject,
  uploadAssets,
} from './api';
import { grapesjsCoreLocaleEs, studioSdkLocaleEs } from './i18n';
import { SaveStatusBadge } from './SaveStatusBadge';
import { UpgradeProDialog } from '@/features/templates/UpgradeProDialog';
import { sectionBlocks } from './blocks';
import type { SectionBlock } from './blocks/shared';
import { DeviceSwitcher, editorDevices } from './DeviceSwitcher';
import { StockPhotosDialog } from './StockPhotosDialog';
import { applyFontLink, applyRootTokens } from './theme-apply';
import { type ThemeChoice, ThemeDialog } from './ThemeDialog';
import { fontTokens, googleFontsHref, paletteTokens } from './theme-presets';
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
  UploadedAsset,
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

type LayoutNode = { type: string; children?: LayoutNode[] } & Record<
  string,
  unknown
>;

// Escritorio y tablet: el <select> de dispositivos del topbar del canvas se cambia por botones con icono.
// Móvil (≤ breakpointMobile) conserva el dropdown del SDK, que cabe mejor en la barra superior.
function withDeviceSwitcher(layout: LayoutNode): LayoutNode {
  if (layout.type === 'canvasSidebarTop') {
    const sidebarTop = (layout.sidebarTop ?? {}) as Record<string, unknown>;
    return {
      ...layout,
      sidebarTop: {
        ...sidebarTop,
        devices: false,
        leftContainer: {
          buttons: [
            { id: 'lattiz-devices', type: 'custom', component: DeviceSwitcher },
          ],
        },
      },
    };
  }
  return layout.children
    ? { ...layout, children: layout.children.map(withDeviceSwitcher) }
    : layout;
}

// GrapesJS SDK does not auto-load plugins referenced inside the project JSON —
// they must be declared explicitly in the SDK options.
function buildOptions(
  tenantId: string,
  projectJSON: GrapesJSProjectJSON,
  onSave: (project: GrapesJSProjectJSON) => void,
  onUploadError: (err: unknown) => void,
  proIncluded: boolean,
  theme: ResolvedTheme,
  onLockedBlock: (block: SectionBlock) => void,
): StudioOptions {
  const plugins = [
    // Sidebar de botones con layouts propios para tablet y móvil (el layout por defecto no es usable < 1000px).
    // Cast: los tipos del plugin y del SDK instalado divergen aunque el runtime lo acepta.
    layoutSidebarButtons.init({
      rootLayout: ({
        rootLayout,
        breakpoint,
        breakpointMobile,
      }: {
        rootLayout: LayoutNode;
        breakpoint: number;
        breakpointMobile: number;
      }) =>
        breakpoint === breakpointMobile
          ? rootLayout
          : withDeviceSwitcher(rootLayout),
    } as unknown as Parameters<typeof layoutSidebarButtons.init>[0]),
    ...(projectJSON.custom?.plugins ?? []).map((p) => ({
      id: p.id,
      src: p.src,
      options: p.options,
    })),
  ] as unknown as StudioPlugins;

  return {
    theme,

    // ── Internacionalización ────────────────────────────────────────────────
    // System 1 (módulos propios del SDK) → i18n.locales.
    // System 2 (módulos base de GrapesJS) → editor.I18n en onEditor.
    i18n: {
      locales: {
        en: studioSdkLocaleEs,
      },
    },

    // ── Tema ────────────────────────────────────────────────────────────────
    // Sigue el tema del dashboard (ThemeProvider); la paleta Lattiz vive en grapesjs-sdk.css.
    // Sin selector de tema propio del SDK: la preferencia se cambia desde el dashboard.
    settingsMenu: { theme: false },

    // ── Restricciones WaaS ─────────────────────────────────────────────────
    // MVP: un sitio = una página → panel de páginas deshabilitado.
    pages: false,
    // Elimina acceso al código fuente (View code / Import code) del toolbar.
    devices: {
      default: editorDevices,
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

    // ── Bloques: kit de secciones Lattiz; sin Pro, los Pro se ven con candado (templateAccess.proIncluded) ──
    blocks: {
      default: sectionBlocks(proIncluded, onLockedBlock) as unknown as NonNullable<
        StudioOptions['blocks']
      >['default'],
    },

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
          const uploaded = await uploadAssets(tenantId, files);
          toastSavings(uploaded);
          // Only what the asset manager needs ends up in the project JSON.
          return uploaded.map(({ id, name, src, mimeType, width, height }) => ({
            id,
            name,
            src,
            mimeType,
            ...(width && height ? { width, height } : {}),
          }));
        } catch (err) {
          onUploadError(err);
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<EditorInstance | null>(null);
  const grapesEditorRef = useRef<StyleModeEditor | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);
  const stockStatus = useQuery({
    ...stockControllerStatusOptions(),
    staleTime: Infinity,
  });
  const [advancedStyles, setAdvancedStyles] = useState(
    readAdvancedStylesPreference,
  );
  const lastProjectRef = useRef<GrapesJSProjectJSON | null>(null);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);

  // Studio lee `theme` solo al montar; los cambios posteriores (o el SO en modo 'system') van por comando.
  useEffect(() => {
    themeRef.current = resolvedTheme;
    editorRef.current?.runCommand('studio:setStateTheme', {
      theme: resolvedTheme,
    });
  }, [resolvedTheme]);

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
  const canPublish = tenantMe.data?.canPublish !== false;
  const isEntitled = tenantMe.data?.isEntitled !== false;
  const publishBlockedHint =
    tenantMe.data?.previewState === 'trial_expired'
      ? 'Tu prueba gratuita terminó. Elige un plan para seguir publicando'
      : 'Elige un plan para publicar tu sitio.';

  const reportActionError = (err: unknown, context: 'publish' | 'upload') => {
    reportSiteActionError(err, context, {
      onPlans: () => void navigate({ to: '/dashboard/subscription' }),
      onPreviewExpired: () => {
        void queryClient.invalidateQueries({
          queryKey: tenantsControllerMeQueryKey(),
        });
      },
    });
  };

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
    if (!canPublish) return;
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
      void queryClient.invalidateQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
      const me = tenantMe.data;
      const url = me ? (me.isEntitled ? liveSiteUrl(me) : me.previewUrl) : null;
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
      reportActionError(err, 'publish');
    }
  };

  // The block kit depends on the plan, and Studio reads `blocks` only at mount.
  if (query.isLoading || tenantMe.isLoading) {
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

  const proIncluded = tenantMe.data?.templateAccess.proIncluded === true;
  const options = buildOptions(
    tenantId,
    query.data.project,
    handleSave,
    (err) => reportActionError(err, 'upload'),
    proIncluded,
    resolvedTheme,
    (block) => setLockedFeature(block.label),
  );
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
            <Button
              variant="linkSecondary"
              size="default"
              onClick={() => setThemeOpen(true)}
            >
              <PaletteIcon className="size-4" color="#FFF" />
              <span className="hidden sm:inline">Tema</span>
            </Button>
            {stockStatus.data?.enabled && (
              <Button
                variant="linkSecondary"
                size="default"
                onClick={() => setStockOpen(true)}
              >
                <ImagesIcon className="size-4" color="#FFF" />
                <span className="hidden sm:inline">Fotos gratuitas</span>
              </Button>
            )}
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
            {canPublish ? (
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
                ) : isEntitled ? (
                  'Publicar sitio 🚀'
                ) : (
                  'Publicar prueba'
                )}
              </Button>
            ) : (
              <span className="order-2 flex items-center gap-1 sm:order-none">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="inline-flex">
                          <Button variant="secondary" size="sm" disabled>
                            {isEntitled ? 'Publicar sitio 🚀' : 'Publicar prueba'}
                          </Button>
                        </span>
                      }
                    />
                    <TooltipContent side="bottom">{publishBlockedHint}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="linkSecondary"
                  size="sm"
                  render={<Link to="/dashboard/subscription" />}
                >
                  Elige un plan
                </Button>
              </span>
            )}
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
              // Por si el tema cambió entre el montaje (`options.theme`) y la carga del editor.
              editor.runCommand('studio:setStateTheme', {
                theme: themeRef.current,
              });
              editor.I18n.addMessages({ en: grapesjsCoreLocaleEs });
              editor.I18n.setLocale('en');
              // Sin 'link' ni 'wrap' (el último botón): el RTE queda solo con formato básico.
              editor.RichTextEditor.remove('link');
              editor.RichTextEditor.remove('wrap');
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
      <UpgradeProDialog
        feature={lockedFeature}
        onClose={() => setLockedFeature(null)}
      />
      <ThemeDialog
        open={themeOpen}
        onOpenChange={setThemeOpen}
        proIncluded={proIncluded}
        onApply={(choice) => {
          applyTheme(editorRef.current, choice);
          setThemeOpen(false);
        }}
      />
      {stockStatus.data?.enabled && (
        <StockPhotosDialog
          tenantId={tenantId}
          open={stockOpen}
          onOpenChange={setStockOpen}
          onUse={(asset) => {
            applyStockAsset(editorRef.current, asset);
            setStockOpen(false);
          }}
        />
      )}
    </div>
  );
}

function toastSavings(uploaded: UploadedAsset[]): void {
  const original = uploaded.reduce((sum, a) => sum + a.originalBytes, 0);
  const stored = uploaded.reduce((sum, a) => sum + a.bytes, 0);
  if (stored >= original) return;
  const label =
    uploaded.length === 1
      ? 'Optimizada'
      : `${uploaded.length} imágenes optimizadas`;
  toast.success(`${label}: ${formatBytes(original)} → ${formatBytes(stored)}`);
}

interface StockAssetEditor {
  Assets: { add: (asset: Record<string, unknown>) => unknown };
  getSelected: () =>
    | { is: (type: string) => boolean; set: (props: Record<string, unknown>) => unknown }
    | undefined;
}

/** Adds the imported photo to the asset manager and, when an image is selected, swaps its src. */
function applyStockAsset(
  editor: EditorInstance | null,
  asset: UploadedAssetResponseDto,
): void {
  const studio = editor as unknown as StockAssetEditor | null;
  if (!studio) return;
  studio.Assets.add({
    id: asset.id,
    src: asset.src,
    name: asset.name,
    mimeType: asset.mimeType,
    ...(asset.width && asset.height
      ? { width: asset.width, height: asset.height }
      : {}),
  });
  const selected = studio.getSelected();
  if (selected?.is('image')) {
    selected.set({ src: asset.src });
    toast.success('Foto aplicada a la imagen seleccionada.');
  } else {
    toast.success(
      'Foto agregada a tus imágenes. Selecciona una imagen y elígela en el gestor.',
    );
  }
}

function applyTheme(editor: EditorInstance | null, choice: ThemeChoice): void {
  const colors = choice.palette
    ? choice.dark && choice.palette.dark
      ? choice.palette.dark
      : choice.palette.light
    : null;
  const tokens = {
    ...(colors ? paletteTokens(colors) : {}),
    ...(choice.font ? fontTokens(choice.font) : {}),
  };
  const applied =
    applyRootTokens(editor, tokens) &&
    (!choice.font || applyFontLink(editor, googleFontsHref(choice.font)));
  if (applied) toast.success('Tema aplicado. Ctrl/⌘ + Z para deshacer.');
  else toast.error('No se pudo aplicar el tema. Recarga el editor e intenta de nuevo.');
}
