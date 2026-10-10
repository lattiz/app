import { describe, expect, it } from 'vitest';
import { hasPrioritySupport, whatsAppSupportText } from './support';

describe('hasPrioritySupport', () => {
  it('is true only for an entitled Pro (or higher) tenant', () => {
    expect(hasPrioritySupport({ plan: 'pro', isEntitled: true })).toBe(true);
    expect(hasPrioritySupport({ plan: 'empresarial', isEntitled: true })).toBe(true);
    expect(hasPrioritySupport({ plan: 'basico', isEntitled: true })).toBe(false);
    expect(hasPrioritySupport({ plan: 'pro', isEntitled: false })).toBe(false);
    expect(hasPrioritySupport({ plan: 'trial', isEntitled: false })).toBe(false);
    expect(hasPrioritySupport(undefined)).toBe(false);
  });
});

describe('whatsAppSupportText', () => {
  it('includes the topic and customer number only when given', () => {
    expect(
      whatsAppSupportText({ category: 'Dominios', message: ' No carga ', customerId: 'abc-123' }),
    ).toBe(
      '¡Hola! Necesito ayuda con mi sitio en Lattiz.\nTema: Dominios\nNúmero de cliente: abc-123\n\nNo carga',
    );
    expect(whatsAppSupportText({ category: null, message: 'Ayuda', customerId: null })).toBe(
      '¡Hola! Necesito ayuda con mi sitio en Lattiz.\n\nAyuda',
    );
  });
});
