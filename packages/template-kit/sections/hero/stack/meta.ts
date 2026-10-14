import type { SectionMeta } from '../../../src/types';

export default {
  slot: 'hero',
  variant: 'stack',
  label: 'Portada',
  region: 'main',
  description:
    'Portada en baraja: el antetítulo, el titular, el texto y los CTAs en una tarjeta elevada con dos hojas desplazadas detrás; a la derecha, la foto a sangre hasta el borde de la ventana. Contiene el único <h1>.',
  intent:
    'Cercana y táctil: la tarjeta se siente como una ficha que se toma con la mano y la foto llena el resto; para tiendas, florerías, cafeterías y estéticas.',
  tiers: ['basic', 'pro'],
  archetypes: ['showcase', 'soft', 'catalog'],
  placeholder: { width: 1400, height: 1200 },
  contentKeys: [
    'image',
    'imageAlt',
    'eyebrow',
    'title',
    'text',
    'primaryCta',
    'secondaryCta',
    'secondaryHref',
  ],
} satisfies SectionMeta;
