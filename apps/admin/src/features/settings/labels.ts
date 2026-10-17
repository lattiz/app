const GROUP_LABEL: Record<string, string> = {
  preview: 'Prueba gratuita',
  email: 'Correos',
  dns: 'DNS',
  domain: 'Dominios',
  domains: 'Dominios',
  alerts: 'Alertas',
};

const GROUP_ORDER = ['preview', 'email', 'dns', 'domain', 'domains', 'alerts'];

const KEY_LABEL: Record<string, string> = {
  'preview.enabled': 'Prueba gratuita activa',
  'preview.trial_days': 'Días de prueba',
  'preview.warning_day': 'Día del aviso',
  'preview.max_asset_bytes': 'Tamaño máximo de un archivo',
  'preview.sanitize_enabled': 'Limpiar el HTML publicado',
  'preview.require_verified_email': 'Exigir correo verificado',
  'preview.allowed_asset_mime': 'Tipos de archivo permitidos',
  'preview.publish_rate_limit_per_min': 'Publicaciones por minuto',
  'preview.asset_rate_limit_per_min': 'Subidas por minuto',
  'preview.notify_enabled': 'Avisos de fin de prueba',
  'preview.notify_interval_minutes': 'Minutos entre avisos',
  'preview.notify_batch': 'Avisos por lote',
  'email.sending_enabled': 'Envío de correos',
  'email.max_per_run': 'Correos por lote',
  'dns.reconcile.enabled': 'Revisión automática de DNS',
  'dns.reconcile.grace_minutes': 'Minutos de gracia del DNS',
  'dns.reconcile.max_deletes': 'Borrados máximos de DNS',
  'dns.reconcile.keep_zones': 'Zonas que se conservan',
  'domain.max_cost_usd_cents': 'Tope de costo del dominio',
  'domain.basic_renewal_max_cost_usd_cents': 'Tope de renovación del plan Básico',
  'domain.pro_renewal_max_cost_usd_cents': 'Tope de renovación del plan Pro',
  'domains.mock_purchases': 'Compras de dominio de prueba',
  'domain.renewal.enabled': 'Renovación de dominios',
  'domain.renewal.fee_basic_mxn_cents': 'Precio de renovación del plan Básico',
  'domain.renewal.fee_pro_mxn_cents': 'Precio de renovación del plan Pro',
  'domain.renewal.tax_rate_bps': 'Impuesto de la renovación',
  'domain.renewal.open_days_before': 'Días antes para abrir el cobro',
  'domain.renewal.notice_days_before': 'Días de aviso antes del vencimiento',
  'domain.renewal.late_days': 'Días de mora',
  'domain.renewal.late_notice_days_after': 'Días de aviso después del vencimiento',
  'domain.renewal.max_registrar_attempts': 'Intentos con el registrador',
  'domain.renewal.balance_alert_days': 'Días para avisar del saldo',
  'alerts.admin_email': 'Correo de alertas',
};

export const SOURCE_LABEL = {
  db: 'Ajustado aquí',
  env: 'Variable del servidor',
  default: 'Por defecto',
} as const;

export function settingGroupLabel(group: string): string {
  return GROUP_LABEL[group] ?? group;
}

export function settingLabel(key: string): string {
  return KEY_LABEL[key] ?? humanizeSettingKey(key);
}

/** Último tramo de la clave, con guiones bajos como espacios. */
export function humanizeSettingKey(key: string): string {
  const tail = key.split('.').filter(Boolean).at(-1) ?? key;
  const words = tail.split(/[_-]+/).filter(Boolean).join(' ');
  if (!words) return key;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function groupSettings<T extends { group: string }>(
  items: readonly T[],
): { group: string; label: string; items: T[] }[] {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const list = buckets.get(item.group);
    if (list) list.push(item);
    else buckets.set(item.group, [item]);
  }
  return [...buckets.keys()]
    .sort(compareGroups)
    .map((group) => ({
      group,
      label: settingGroupLabel(group),
      items: buckets.get(group) ?? [],
    }));
}

function compareGroups(a: string, b: string): number {
  const ia = GROUP_ORDER.indexOf(a);
  const ib = GROUP_ORDER.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b, 'es');
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}
