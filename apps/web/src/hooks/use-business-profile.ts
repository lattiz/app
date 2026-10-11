import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tenantsControllerMeQueryKey,
  tenantsControllerUpdateBusinessProfileMutation,
} from '@lattiz/api-client';
import { toast } from 'sonner';

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

/** INVALID_BUSINESS_PROFILE carries an es-MX message; shape errors get a generic one. */
function businessProfileErrorMessage(error: unknown): string {
  const body = (error as ApiErrorBody | null | undefined)?.error;
  if (body?.code === 'INVALID_BUSINESS_PROFILE' && body.message)
    return body.message;
  if (body?.code === 'BAD_REQUEST')
    return 'Revisa los datos: hay un campo con formato no válido.';
  return 'No se pudieron guardar los datos del negocio. Intenta de nuevo.';
}

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    ...tenantsControllerUpdateBusinessProfileMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: tenantsControllerMeQueryKey(),
      });
      toast.success('Datos del negocio guardados.');
    },
    onError: (error) => {
      toast.error(businessProfileErrorMessage(error));
    },
  });
}
