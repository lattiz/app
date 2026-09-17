import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type TenantsControllerUploadBrandingData,
  tenantsControllerMeQueryKey,
  tenantsControllerRemoveBrandingMutation,
  tenantsControllerUploadBrandingMutation,
} from '@lattiz/api-client';
import { toast } from 'sonner';

export type BrandingType =
  TenantsControllerUploadBrandingData['body']['type'];

/** Client-side mirror of the API's per-slot rules, so we reject before uploading. */
export const BRANDING_RULES: Record<
  BrandingType,
  { accept: string; mimeTypes: string[]; maxBytes: number }
> = {
  favicon_light: {
    accept: 'image/png,image/x-icon,.ico',
    mimeTypes: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
    maxBytes: 1024 * 1024,
  },
  favicon_dark: {
    accept: 'image/png,image/x-icon,.ico',
    mimeTypes: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
    maxBytes: 1024 * 1024,
  },
  social_preview: {
    accept: 'image/png,image/jpeg',
    mimeTypes: ['image/png', 'image/jpeg'],
    maxBytes: 4 * 1024 * 1024,
  },
};

export function useUploadBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    ...tenantsControllerUploadBrandingMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
      toast.success('Imagen actualizada.');
    },
    onError: () => {
      toast.error('No se pudo subir la imagen. Intenta de nuevo.');
    },
  });
}

export function useRemoveBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    ...tenantsControllerRemoveBrandingMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
      toast.success('Imagen eliminada.');
    },
    onError: () => {
      toast.error('No se pudo eliminar la imagen. Intenta de nuevo.');
    },
  });
}
