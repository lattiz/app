import StudioEditor from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2Icon, ArrowLeft } from 'lucide-react';
import { type ComponentProps, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getEditorProject,
  publishSite,
  saveEditorProject,
  uploadAssets,
} from './api';
import { SaveStatusBadge } from './SaveStatusBadge';
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

// Traducciones de los módulos propios del Studio SDK (System 1): el SDK fuerza
// el locale `en` internamente, así que estas cadenas se registran bajo `en`.
const studioSdkLocaleEs = {
  styleManager: {
    tabStyles: 'Estilos',
    tabProperties: 'Propiedades',
  },
  selectorManager: {
    label: 'Selección',
    stateLabel: '- Estado -',
  },
  blockManager: {
    notFound: 'No se encontraron bloques',
    blocks: 'Bloques',
    add: 'Añadir más bloques',
    search: 'Buscar...',
    types: {
      regular: 'Regular',
      symbols: 'Símbolos',
    },
    symbols: {
      notFound: 'No se encontraron símbolos',
      instancesProject: 'Instancia/s en el proyecto',
      delete: 'Eliminar símbolo',
      deleteConfirm:
        '¿Seguro que quieres eliminar el símbolo? Todas las instancias del proyecto serán desvinculadas.',
    },
  },
};

// GrapesJS SDK does not auto-load plugins referenced inside the project JSON —
// they must be declared explicitly in the SDK options.
function buildOptions(
  tenantId: string,
  projectJSON: GrapesJSProjectJSON,
  onSave: (project: GrapesJSProjectJSON) => void,
): StudioOptions {
  const plugins: StudioPlugins = (projectJSON.custom?.plugins ?? []).map(
    (p) => ({
      id: p.id,
      src: p.src,
      options: p.options,
    }),
  );

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
    // se devuelve la URL pública de Supabase Storage.
    // Sin `onLoad` las referencias siguen guardándose en el project JSON, así
    // que las imágenes ya subidas reaparecen en sesiones posteriores.
    assets: {
      storageType: 'self',
      onUpload: async ({ files }) => uploadAssets(tenantId, files),
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
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const lastProjectRef = useRef<GrapesJSProjectJSON | null>(null);

  const query = useQuery({
    queryKey: ['editor-project', tenantId],
    queryFn: () => getEditorProject(tenantId),
    staleTime: Infinity,
  });

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
    } catch (err) {
      console.error('[SiteEditor] Publish failed:', err);
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
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-primary px-4 py-2 w-full">
        <div className="flex items-center gap-2 ">
          <Button
            variant="linkSecondary"
            size="default"
            onClick={() => window.history.back()}
            className=""
          >
            <ArrowLeft className="size-4" color="#FFF" />
            Regresar
          </Button>
          <SaveStatusBadge
            status={saveStatus}
            lastSavedAt={savedAt}
            onRetry={retrySave}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
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

      <main className="min-h-0 flex-1">
        <StudioEditor
          options={options}
          onEditor={(editor) => {
            editorRef.current = editor as unknown as EditorInstance;

            // Módulos base de GrapesJS (styleManager, traitManager, domComponents,
            // panels, deviceManager): solo responden a editor.I18n. El SDK fuerza
            // el locale `en`, por eso se sobrescribe ese bucket (no `es`).
            editor.on('load', () => {
              editor.I18n.addMessages({
                en: {
                  styleManager: {
                    empty: 'Selecciona un elemento para editar sus estilos',
                    layer: 'Capa',
                    fileButton: 'Imágenes',
                    sectors: {
                      layout: 'Diseño',
                      size: 'Tamaño',
                      space: 'Espacio',
                      position: 'Posición',
                      typography: 'Tipografía',
                      decorations: 'Decoraciones',
                      extra: 'Extra',
                      flex: 'Flex',
                      general: 'General',
                      dimension: 'Dimensión',
                    },
                    properties: {
                      float: 'Flotación',
                      display: 'Visualización',
                      position: 'Posición',
                      top: 'Superior',
                      right: 'Derecho',
                      bottom: 'Inferior',
                      left: 'Izquierdo',
                      width: 'Ancho',
                      'min-width': 'Ancho mínimo',
                      'max-width': 'Ancho máximo',
                      height: 'Alto',
                      'min-height': 'Alto mínimo',
                      'max-height': 'Alto máximo',
                      margin: 'Margen',
                      'margin-top': 'Superior',
                      'margin-right': 'Derecho',
                      'margin-bottom': 'Inferior',
                      'margin-left': 'Izquierdo',
                      padding: 'Relleno',
                      'padding-top': 'Superior',
                      'padding-right': 'Derecho',
                      'padding-bottom': 'Inferior',
                      'padding-left': 'Izquierdo',
                      'font-family': 'Fuente',
                      'font-size': 'Tamaño',
                      'font-weight': 'Peso',
                      'letter-spacing': 'Espaciado',
                      'line-height': 'Altura de línea',
                      'text-align': 'Alineación',
                      'text-decoration': 'Decoración',
                      'text-transform': 'Transformación',
                      'text-shadow': 'Sombra de texto',
                      color: 'Color',
                      'background-color': 'Color de fondo',
                      'background-image': 'Imagen de fondo',
                      'background-repeat': 'Repetición',
                      'background-position': 'Posición de fondo',
                      'background-size': 'Tamaño de fondo',
                      border: 'Borde',
                      'border-width': 'Grosor de borde',
                      'border-style': 'Estilo de borde',
                      'border-color': 'Color de borde',
                      'border-radius': 'Radio de borde',
                      'border-top-left-radius': 'Radio sup. izquierdo',
                      'border-top-right-radius': 'Radio sup. derecho',
                      'border-bottom-left-radius': 'Radio inf. izquierdo',
                      'border-bottom-right-radius': 'Radio inf. derecho',
                      opacity: 'Opacidad',
                      cursor: 'Cursor',
                      gap: 'Espacio entre elementos',
                      'flex-direction': 'Dirección flex',
                      'flex-wrap': 'Ajuste flex',
                      'justify-content': 'Justificar contenido',
                      'align-items': 'Alinear elementos',
                      'align-content': 'Alinear contenido',
                      'flex-grow': 'Crecer',
                      'flex-shrink': 'Encoger',
                      'flex-basis': 'Base flex',
                      'align-self': 'Auto-alineación',
                      order: 'Orden',
                    },
                  },
                  traitManager: {
                    empty: 'Selecciona un elemento del canvas',
                    label: 'Propiedades',
                  },
                  domComponents: {
                    names: {
                      '': 'Bloque',
                      wrapper: 'Contenedor',
                      text: 'Texto',
                      comment: 'Comentario',
                      image: 'Imagen',
                      video: 'Video',
                      label: 'Etiqueta',
                      link: 'Enlace',
                      map: 'Mapa',
                      tfoot: 'Pie de tabla',
                      tbody: 'Cuerpo de tabla',
                    },
                  },
                  panels: {
                    buttons: {
                      titles: {
                        preview: 'Vista previa',
                        fullscreen: 'Pantalla completa',
                        'sw-visibility': 'Ver componentes',
                        'export-template': 'Ver código',
                        undo: 'Deshacer',
                        redo: 'Rehacer',
                        'canvas-clear': 'Limpiar canvas',
                      },
                    },
                  },
                  deviceManager: {
                    device: 'Dispositivo',
                  },
                },
              });

              // El SDK fuerza `en`; setLocale re-dispara el render con el bucket ya traducido.
              editor.I18n.setLocale('en');
            });
          }}
        />
      </main>
    </div>
  );
}
