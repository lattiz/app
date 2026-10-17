const ACTION_LABEL: Record<string, string> = {
  'template.retire': 'Retiró una plantilla',
  'template.activate': 'Activó una plantilla',
  'template.update': 'Editó una plantilla',
  'template.delete': 'Borró una plantilla',
  'template.reorder': 'Reordenó las plantillas',
  'template.thumbnail': 'Cambió la miniatura de una plantilla',
  'subscription.cancel': 'Canceló una suscripción',
  'subscription.resume': 'Reanudó una suscripción',
  'tenant.suspend': 'Suspendió un cliente',
  'tenant.reactivate': 'Reactivó un cliente',
  'tenant.flags': 'Cambió las marcas de un cliente',
  'tenant.storage.refresh': 'Actualizó el espacio de un cliente',
  'tenant.domain.activation_check': 'Revisó la activación del dominio',
  'settings.update': 'Cambió un ajuste',
  'settings.delete': 'Volvió un ajuste al valor por defecto',
  'member.grant': 'Agregó a una persona al equipo',
  'member.role': 'Cambió el rol de una persona',
  'member.revoke': 'Revocó el acceso de una persona',
};

export type AuditActionView = {
  label: string;
  failed: boolean;
};

export function describeAction(action: string): AuditActionView {
  const failed = action.endsWith('.failed');
  const base = failed ? action.slice(0, -'.failed'.length) : action;
  return { label: ACTION_LABEL[base] ?? action, failed };
}
