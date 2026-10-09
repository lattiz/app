import type { PlanPriceDto } from '@lattiz/api-client';

export type PlanId = 'basico' | 'pro';
export type BillingPeriod = 'monthly' | 'annual';

export interface PlanDetails {
  id: PlanId;
  name: string;
  subtitle: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: PlanDetails[] = [
  {
    id: 'basico',
    name: 'Plan Básico',
    subtitle: 'Para tu negocio local',
    features: [
      '1 sitio publicado de forma continua',
      'Edición ilimitada de tu sitio',
      'Dominio propio .com.mx incluido',
      'Botón de WhatsApp',
      'Reporte mensual de visitas (GA4)',
      'SSL · 99.9% uptime',
      'Soporte por correo (48h)',
    ],
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    subtitle: 'Para crecer con tu marca',
    highlighted: true,
    features: [
      'Todo lo del plan Básico',
      'Dominio .com o .com.mx a elección',
      'Templates premium (próximamente)',
      'Analytics avanzado',
      'Soporte prioritario vía WhatsApp',
      'Acceso anticipado a nuevas funciones',
      'SEO avanzado configurado en onboarding',
    ],
  },
];

export function planById(id: string): PlanDetails | undefined {
  return PLANS.find((p) => p.id === id);
}

/** Amounts in cents, as Stripe bills them (GET /billing/plans). */
export interface PlanPricing {
  monthly: number;
  annual: number;
  currency: string;
}

/** Null until both periods of the plan have an active Stripe price. */
export function pricingFor(
  prices: PlanPriceDto[] | undefined,
  plan: PlanId,
): PlanPricing | null {
  const monthly = prices?.find(
    (p) => p.plan === plan && p.period === 'monthly',
  );
  const annual = prices?.find((p) => p.plan === plan && p.period === 'annual');
  if (!monthly || !annual || monthly.currency !== annual.currency) return null;
  return {
    monthly: monthly.amount,
    annual: annual.amount,
    currency: monthly.currency,
  };
}

/** Null when paying annually saves nothing. */
export function annualSavingLabel(pricing: PlanPricing): string | null {
  const saving = pricing.monthly * 12 - pricing.annual;
  if (saving <= 0) return null;
  if (saving === pricing.monthly * 2) return 'Ahorra 2 meses';
  return `Ahorra ${formatPrice(saving, pricing.currency)}`;
}

export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
