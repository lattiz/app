import { z } from 'zod';

export const DomainSearchSchema = z.object({
  query: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(63, 'Máximo 63 caracteres')
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'Solo letras minúsculas, números y guiones'),
});

export const ConnectDomainSchema = z.object({
  domain: z
    .string()
    .min(4, 'Dominio demasiado corto')
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}$/,
      'Ingresa un dominio válido (ej: miempresa.com)',
    )
    .transform((v) =>
      v.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''),
    ),
});

export const DomainPurchaseSchema = z.object({
  domain: z.string().includes('.'),
  agreementTypes: z.tuple([z.literal('LATTIZ_TERMS')]),
  agreedAt: z.iso.datetime(),
  priceUsdCents: z.number().int().positive(),
});
