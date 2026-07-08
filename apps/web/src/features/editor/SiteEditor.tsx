import StudioEditor from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { type ComponentProps, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getEditorProject, publishSite, saveEditorProject } from './api';
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

type StudioOptions = NonNullable<ComponentProps<typeof StudioEditor>['options']>;
type StudioProjectData = NonNullable<
  NonNullable<StudioOptions['storage']>['project']
>;
type StudioPlugins = NonNullable<StudioOptions['plugins']>;

// GrapesJS SDK does not auto-load plugins referenced inside the project JSON —
// they must be declared explicitly in the SDK options.
function buildOptions(
  projectJSON: GrapesJSProjectJSON,
  onSave: (project: GrapesJSProjectJSON) => void,
): StudioOptions {
  const plugins: StudioPlugins = (projectJSON.custom?.plugins ?? []).map((p) => ({
    id: p.id,
    src: p.src,
    options: p.options,
  }));

  return {
    licenseKey: import.meta.env.VITE_GRAPESJS_LICENSE_KEY ?? 'DEV_LICENSE_KEY',
    project: { type: 'web' as const },
    storage: {
      type: 'self',
      // storage.project replaces the onLoad callback (project JSON is already
      // fetched). onSave is still mandatory with storage.type = 'self'.
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

  const options = buildOptions(query.data.project, handleSave);
  const isPublishing = publishMutation.isPending;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            Editor de sitio
          </span>
          <SaveStatusBadge
            status={saveStatus}
            lastSavedAt={savedAt}
            onRetry={retrySave}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="default"
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
              'Publicar sitio'
            )}
          </Button>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <StudioEditor
          options={options}
          onEditor={(editor) => {
            editorRef.current = editor as unknown as EditorInstance;
          }}
        />
      </main>
    </div>
  );
}
