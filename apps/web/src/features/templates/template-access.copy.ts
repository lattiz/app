/** Spanish copy for template access by plan (the web app keeps its strings in *.copy.ts modules). */
export const templateAccessCopy = {
  tierLabel: { basic: 'Básico', pro: 'Pro' } as const,
  filters: { all: 'Todas', basic: 'Básico', pro: 'Pro' } as const,
  filterLabel: 'Filtrar por plan',
  useTemplate: 'Usar plantilla',
  editTemplate: 'Editar',
  current: 'actual',
  preview: 'Vista previa',
  upgradeCta: 'Mejorar a Pro',
  lockedHint: 'Incluida en el plan Pro.',
  currentLockedHint: 'Tu plan ya no incluye esta plantilla.',
  emptyFilter: 'No hay plantillas en este plan.',
  requiresProError:
    'Esta plantilla es del plan Pro. Mejora tu plan para usarla.',
  lockedError:
    'Tu plan ya no incluye esta plantilla. Elige una plantilla Básica o reactiva Pro para seguir editando.',
  banner: {
    title: 'Tu plan ya no incluye esta plantilla',
    body: (name: string | null) =>
      `Tu sitio usa la plantilla Pro${name ? ` «${name}»` : ''}. Sigue publicado tal como está, pero para editarlo o publicar cambios elige una plantilla Básica o reactiva Pro.`,
    chooseBasic: 'Elegir plantilla Básica',
    reactivatePro: 'Reactivar Pro',
  },
  downgradeLoss: {
    title: 'Vas a perder el acceso a tu plantilla',
    body: (name: string | null, date: string) =>
      `Tu sitio usa la plantilla Pro «${name ?? 'actual'}». Al pasar a Básico dejarás de tener acceso a esta plantilla y a todos los cambios hechos en ella, y tendrás que elegir una plantilla Básica. Esto aplica desde ${date}.`,
    acknowledge:
      'Entiendo que dejaré de tener acceso a mi plantilla Pro y a sus cambios',
    loading: 'Revisando qué cambia con tu plan…',
    impactError:
      'No pudimos revisar qué cambia con tu plan. Intenta de nuevo en unos minutos.',
  },
} as const;
