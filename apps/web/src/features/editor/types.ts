/** Strict types for the GrapesJS project JSON and the editor API surface. */

export interface GrapesJSPluginConfig {
  id: string;
  src: string;
  version?: string;
  options?: Record<string, unknown>;
}

export interface GrapesJSAsset {
  id: string;
  name: string;
  src: string;
  mimeType?: string;
  type?: string;
}

// The `.grapesjs` export format has these top-level keys.
export interface GrapesJSProjectJSON {
  dataSources: unknown[];
  assets: GrapesJSAsset[];
  styles: unknown[];
  pages: unknown[];
  symbols: unknown[];
  custom: {
    projectType: string;
    id: string;
    globalPageSettings?: unknown;
    plugins?: GrapesJSPluginConfig[];
  };
}

export interface EditorProjectResponse {
  project: GrapesJSProjectJSON;
}

export interface SaveSchemaResult {
  saved: boolean;
  updatedAt: string;
}

export interface PublishSitePayload {
  project: GrapesJSProjectJSON;
  exportedHtml: string;
}

export interface PublishSiteResult {
  published: boolean;
  publishedAt: string;
}

/** A file produced by the `studio:projectFiles` export command. */
export interface ProjectFile {
  name: string;
  content: string;
  mimeType?: string;
}

/** Minimal surface of the GrapesJS editor instance we depend on. */
export interface EditorInstance {
  runCommand: (command: string, options?: Record<string, unknown>) => unknown;
  getProjectData: () => unknown;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
