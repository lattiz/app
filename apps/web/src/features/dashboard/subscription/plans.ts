export type PlanId = 'basico' | 'pro';
export type BillingPeriod = 'monthly' | 'annual';

export interface PlanDetails {
  id: PlanId;
  name: string;
  subtitle: string;
  monthly: number;
  annual: number;
  /** Annual price expressed per month, for the "equivale a" line. */
  annualMonthlyEquivalent: number;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: PlanDetails[] = [
  {
    id: 'basico',
    name: 'Plan Básico',
    subtitle: 'Para tu negocio local',
    monthly: 399,
    annual: 3990,
    annualMonthlyEquivalent: 332,
    features: [
      '1 sitio web profesional',
      'Panel de edición CMS sin código',
      'Dominio .com.mx incluido',
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
    monthly: 699,
    annual: 6990,
    annualMonthlyEquivalent: 582,
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

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}
