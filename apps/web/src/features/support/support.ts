import type { TenantMeResponseDto } from '@lattiz/api-client';

/**
 * Support channels by plan: Básico gets email; Pro gets email plus priority
 * WhatsApp. The phone comes from VITE_SUPPORT_WHATSAPP_PHONE (digits only,
 * with country code); without it the WhatsApp channel is hidden.
 */

export const SUPPORT_EMAIL = 'soporte@lattiz.app';

export const SUPPORT_CATEGORIES = [
  'Dominios',
  'Pagos',
  'Personalización',
  'Cuenta',
  'Plantillas',
  'Analíticas',
] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

const WHATSAPP_PHONE = (import.meta.env.VITE_SUPPORT_WHATSAPP_PHONE ?? '').replace(
  /\D/g,
  '',
);

const PRIORITY_SUPPORT_PLANS = new Set(['pro', 'empresarial']);

/** Priority (WhatsApp) support needs a live Pro subscription; a lapsed Pro falls back to email. */
export function hasPrioritySupport(
  tenant: Pick<TenantMeResponseDto, 'plan' | 'isEntitled'> | null | undefined,
): boolean {
  return (
    !!tenant && tenant.isEntitled && PRIORITY_SUPPORT_PLANS.has(tenant.plan)
  );
}

export function isWhatsAppSupportConfigured(): boolean {
  return WHATSAPP_PHONE.length > 0;
}

export function supportMailto(): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Soporte Lattiz')}`;
}

export interface WhatsAppSupportRequest {
  category: SupportCategory | null;
  message: string;
  /** Only when the user agreed to share it. */
  customerId: string | null;
}

export function whatsAppSupportText({
  category,
  message,
  customerId,
}: WhatsAppSupportRequest): string {
  const header = [
    '¡Hola! Necesito ayuda con mi sitio en Lattiz.',
    category && `Tema: ${category}`,
    customerId && `Número de cliente: ${customerId}`,
  ].filter(Boolean);
  return `${header.join('\n')}\n\n${message.trim()}`;
}

export function whatsAppSupportUrl(request: WhatsAppSupportRequest): string {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(whatsAppSupportText(request))}`;
}
