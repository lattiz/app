import { client } from '@lattiz/api-client';
import { uploadErrorMessage } from '@/lib/upload-errors';
import type {
  EditorProjectResponse,
  GrapesJSAsset,
  GrapesJSProjectJSON,
  PublishSitePayload,
  PublishSiteResult,
  SaveSchemaResult,
} from './types';

// These calls use the shared, already-auth-configured api-client `client`
// (base URL + Supabase bearer token attached in configureApiClient). Once the
// NestJS endpoints are part of openapi.json, `pnpm generate:api` can replace
// these with generated SDK functions.

export async function getEditorProject(
  tenantId: string,
): Promise<EditorProjectResponse> {
  const { data, error, response } = await client.get({
    url: `/sites/${tenantId}/schema`,
  });
  if (error || !data) {
    throw new Error(
      `No se pudo cargar el proyecto (${response?.status ?? 'error'}).`,
    );
  }
  return data as EditorProjectResponse;
}

export async function saveEditorProject(
  tenantId: string,
  project: GrapesJSProjectJSON,
): Promise<SaveSchemaResult> {
  const { data, error, response } = await client.patch({
    url: `/sites/${tenantId}/schema`,
    body: { project },
  });
  if (error || !data) {
    throw new Error(`No se pudo guardar (${response?.status ?? 'error'}).`);
  }
  return data as SaveSchemaResult;
}

/** Uploads editor images and returns their public URLs (what ends up in the exported HTML). */
export async function uploadAssets(
  tenantId: string,
  files: File[],
): Promise<GrapesJSAsset[]> {
  const body = new FormData();
  files.forEach((file) => body.append('files', file));

  const { data, error, response } = await client.post({
    url: `/sites/${tenantId}/assets`,
    body,
    // Send the FormData untouched; the null header drops the client's default
    // application/json so fetch can set the multipart boundary itself.
    bodySerializer: null,
    headers: { 'Content-Type': null },
  });
  if (error || !data) {
    console.error('[editor] Asset upload failed:', response?.status, error);
    throw new Error(uploadErrorMessage(error));
  }
  return data as GrapesJSAsset[];
}

export async function publishSite(
  tenantId: string,
  payload: PublishSitePayload,
): Promise<PublishSiteResult> {
  const { data, error, response } = await client.post({
    url: `/sites/${tenantId}/publish`,
    body: payload,
  });
  if (error || !data) {
    throw new Error(`No se pudo publicar (${response?.status ?? 'error'}).`);
  }
  return data as PublishSiteResult;
}
