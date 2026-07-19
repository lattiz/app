import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

/** supabase.auth.updateUser({ email }) only sends a confirmation link — the
 * email doesn't change until the user clicks it. */
export function useUpdateEmail() {
  return useMutation({
    mutationFn: async (newEmail: string) => {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
    },
    onSuccess: (_data, newEmail) => {
      toast.success(
        `Revisa ${newEmail}. Hemos enviado un enlace de verificación — el cambio aplicará cuando lo confirmes.`,
      );
    },
    onError: () => {
      toast.error('No se pudo actualizar el email. Intenta de nuevo.');
    },
  });
}
