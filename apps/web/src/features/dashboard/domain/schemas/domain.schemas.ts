import { z } from 'zod';

export const DomainSearchSchema = z.object({
  query: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(63, 'Máximo 63 caracteres')
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'Solo letras minúsculas, números y guiones'),
});

export const DomainPurchaseSchema = z.object({
  domain: z.string().includes('.'),
  quoteToken: z.string().min(1),
  agreementTypes: z.array(z.string()).min(1),
  agreedAt: z.iso.datetime(),
  priceUsdCents: z.number().int().positive(),
});
