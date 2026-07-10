import { useQuery } from '@tanstack/react-query';
import { templatesControllerFindAllOptions } from '@lattiz/api-client';

export function useTemplates() {
  return useQuery({
    ...templatesControllerFindAllOptions(),
    staleTime: 10 * 60 * 1000,
  });
}
