import type { ContentObject } from '../src/types';
import type { ArchetypeId, ArchetypeRole } from './index';

/**
 * Vertical modules (WP7): named bundles of extended variants a giro needs beyond the generic page
 * (the hours of the day in the header, the menu as a printed carta, who attends you…), with the
 * es-MX copy of the keys only the new variants read. WP8 moves this copy into giros/<giro>.ts and
 * lets a spec ask for a module by id; until then only tests and the gallery read it.
 */

export interface ModuleDef {
  id: string;
  label: string;
  /** Why a business wants it, one line. */
  why: string;
  sections: {
    role: ArchetypeRole;
    slot: string;
    variant: string;
    tiers: ('basic' | 'pro')[];
  }[];
  /** Copy keys the module adds (slot.key), filled per giro below. */
  keys: string[];
}

export const MODULES: Record<string, ModuleDef> = {
  'aviso-del-dia': {
    id: 'aviso-del-dia',
    label: 'Aviso del día',
    why: 'El horario de hoy o una promo arriba del menú, sin gastar una sección.',
    sections: [
      {
        role: 'header',
        slot: 'navbar',
        variant: 'notice-bar',
        tiers: ['basic', 'pro'],
      },
    ],
    keys: ['navbar.notice'],
  },
  'cita-con-nota': {
    id: 'cita-con-nota',
    label: 'Cita con nota',
    why: 'Portada que concentra la cita y deja a la vista una nota corta de horario o urgencias.',
    sections: [
      { role: 'hero', slot: 'hero', variant: 'panel', tiers: ['basic', 'pro'] },
    ],
    keys: ['hero.note'],
  },
  carta: {
    id: 'carta',
    label: 'Carta impresa',
    why: 'Muchos precios en dos columnas con líderes, como el menú del local.',
    sections: [
      {
        role: 'catalog',
        slot: 'services',
        variant: 'menu-columns',
        tiers: ['basic', 'pro'],
      },
    ],
    keys: [],
  },
  cierre: {
    id: 'cierre',
    label: 'Franja de cierre',
    why: 'Una última invitación antes de las preguntas o el contacto, con el mismo texto de CTA.',
    sections: [
      { role: 'cta', slot: 'cta', variant: 'band', tiers: ['basic', 'pro'] },
    ],
    keys: ['cta.title', 'cta.text', 'cta.primaryCta'],
  },
  'quien-atiende': {
    id: 'quien-atiende',
    label: 'Quién te atiende',
    why: 'La persona al frente en grande y su equipo detrás; humaniza los giros de confianza.',
    sections: [
      { role: 'team', slot: 'team', variant: 'spotlight', tiers: ['pro'] },
    ],
    keys: [],
  },
  calificacion: {
    id: 'calificacion',
    label: 'Calificación de ejemplo',
    why: 'Una calificación grande marcada como ejemplo hasta que el negocio ponga la suya.',
    sections: [
      {
        role: 'testimonials',
        slot: 'testimonials',
        variant: 'rating-wall',
        tiers: ['pro'],
      },
    ],
    keys: ['testimonials.scoreNote'],
  },
  'ubicacion-ligera': {
    id: 'ubicacion-ligera',
    label: 'Ubicación sin mapa embebido',
    why: 'Dirección, horario y «cómo llegar» a un toque, sin el peso de un iframe.',
    sections: [
      {
        role: 'contact',
        slot: 'locations',
        variant: 'map-link',
        tiers: ['pro'],
      },
      {
        role: 'contact',
        slot: 'locations',
        variant: 'single-card',
        tiers: ['basic'],
      },
    ],
    keys: [],
  },
  'galeria-bento': {
    id: 'galeria-bento',
    label: 'Galería bento',
    why: 'Ocho fotos con jerarquía para los giros que venden con la imagen.',
    sections: [
      { role: 'proof', slot: 'gallery', variant: 'bento', tiers: ['pro'] },
    ],
    keys: [],
  },
  'doble-arco': {
    id: 'doble-arco',
    label: 'Portada de doble arco',
    why: 'Dos fotos encimadas en arco: el lugar y un detalle del trabajo.',
    sections: [
      {
        role: 'hero',
        slot: 'hero',
        variant: 'duo-arch',
        tiers: ['basic', 'pro'],
      },
    ],
    keys: ['hero.detailImage', 'hero.detailAlt'],
  },
  'preguntas-a-la-vista': {
    id: 'preguntas-a-la-vista',
    label: 'Preguntas a la vista',
    why: 'Todas las dudas abiertas en celdas que se escanean, para giros con muchas preguntas.',
    sections: [
      { role: 'faq', slot: 'faq', variant: 'grid', tiers: ['basic', 'pro'] },
    ],
    keys: [],
  },
};

export interface VerticalModule {
  giro: string;
  /** Archetypes that fit the giro, best first. */
  archetypes: ArchetypeId[];
  /** Modules in order of value for the giro, with the copy of their keys (by slot). */
  modules: { id: string; copy: Record<string, ContentObject> }[];
}

const cierre = (
  title: string,
  text: string,
  primaryCta: string,
): Record<string, ContentObject> => ({ cta: { title, text, primaryCta } });

export const VERTICAL_MODULES: Record<string, VerticalModule> = {
  barberia: {
    giro: 'barberia',
    archetypes: ['bold', 'showcase', 'catalog'],
    modules: [
      {
        id: 'aviso-del-dia',
        copy: { navbar: { notice: 'Hoy de 10:00 a 20:00, sin cita temprano' } },
      },
      { id: 'carta', copy: {} },
      { id: 'galeria-bento', copy: {} },
      {
        id: 'cierre',
        copy: cierre(
          'Tu corte, <span class="lz-title__serif">esta semana</span>',
          'Escríbenos y te decimos qué horarios quedan libres hoy y mañana.',
          'Agendar corte',
        ),
      },
    ],
  },
  clinica: {
    giro: 'clinica',
    archetypes: ['booking', 'trust', 'minimal'],
    modules: [
      {
        id: 'cita-con-nota',
        copy: { hero: { note: 'Consulta general hoy de 9:00 a 19:00' } },
      },
      { id: 'quien-atiende', copy: {} },
      {
        id: 'calificacion',
        copy: { testimonials: { scoreNote: 'Calificación de ejemplo' } },
      },
      { id: 'ubicacion-ligera', copy: {} },
    ],
  },
  dental: {
    giro: 'dental',
    archetypes: ['booking', 'soft', 'trust'],
    modules: [
      {
        id: 'cita-con-nota',
        copy: { hero: { note: 'Urgencias: llámanos antes de venir' } },
      },
      { id: 'quien-atiende', copy: {} },
      { id: 'preguntas-a-la-vista', copy: {} },
      {
        id: 'cierre',
        copy: cierre(
          'Agenda tu <span class="lz-title__serif">valoración</span>',
          'Te explicamos qué incluye cada tratamiento y su precio antes de empezar.',
          'Agendar valoración',
        ),
      },
    ],
  },
  despacho: {
    giro: 'despacho',
    archetypes: ['trust', 'editorial', 'minimal'],
    modules: [
      {
        id: 'cita-con-nota',
        copy: { hero: { note: 'Respondemos en horario de oficina' } },
      },
      { id: 'quien-atiende', copy: {} },
      {
        id: 'calificacion',
        copy: { testimonials: { scoreNote: 'Calificación de ejemplo' } },
      },
      { id: 'ubicacion-ligera', copy: {} },
    ],
  },
  estetica: {
    giro: 'estetica',
    archetypes: ['soft', 'showcase', 'booking'],
    modules: [
      {
        id: 'doble-arco',
        copy: {
          hero: {
            detailImage: 'gallery-01.jpg',
            detailAlt:
              'Uñas con esmaltado en gel color durazno, recién terminadas',
          },
        },
      },
      { id: 'galeria-bento', copy: {} },
      {
        id: 'aviso-del-dia',
        copy: { navbar: { notice: 'Sábados con cita desde las 9:00' } },
      },
      {
        id: 'cierre',
        copy: cierre(
          'Tu cita, <span class="lz-title__serif">sin vueltas</span>',
          'Escríbenos qué te quieres hacer y te proponemos día, hora y duración.',
          'Pedir cita',
        ),
      },
    ],
  },
  floreria: {
    giro: 'floreria',
    archetypes: ['editorial', 'soft', 'showcase'],
    modules: [
      {
        id: 'aviso-del-dia',
        copy: { navbar: { notice: 'Pedidos para hoy hasta las 15:00' } },
      },
      {
        id: 'doble-arco',
        copy: {
          hero: {
            detailImage: 'gallery-01.jpg',
            detailAlt: 'Ramo de temporada envuelto en papel kraft con listón',
          },
        },
      },
      { id: 'galeria-bento', copy: {} },
      { id: 'carta', copy: {} },
    ],
  },
  gimnasio: {
    giro: 'gimnasio',
    archetypes: ['bold', 'booking', 'catalog'],
    modules: [
      {
        id: 'aviso-del-dia',
        copy: { navbar: { notice: 'Hoy abrimos de 6:00 a 22:00' } },
      },
      {
        id: 'cierre',
        copy: cierre(
          'Tu primera <span class="lz-title__serif">clase</span>',
          'Ven a conocer el espacio y a los coaches; te decimos qué membresía te conviene.',
          'Agendar visita',
        ),
      },
      {
        id: 'calificacion',
        copy: { testimonials: { scoreNote: 'Calificación de ejemplo' } },
      },
      { id: 'preguntas-a-la-vista', copy: {} },
    ],
  },
  restaurante: {
    giro: 'restaurante',
    archetypes: ['catalog', 'editorial', 'showcase'],
    modules: [
      {
        id: 'aviso-del-dia',
        copy: { navbar: { notice: 'Hoy: comida de 13:00 a 18:00' } },
      },
      { id: 'carta', copy: {} },
      { id: 'galeria-bento', copy: {} },
      {
        id: 'cierre',
        copy: cierre(
          'Tu mesa, <span class="lz-title__serif">este fin</span>',
          'Reservamos por WhatsApp; para grupos de más de ocho, escríbenos un día antes.',
          'Reservar mesa',
        ),
      },
    ],
  },
  tienda: {
    giro: 'tienda',
    archetypes: ['catalog', 'minimal', 'bold'],
    modules: [
      {
        id: 'aviso-del-dia',
        copy: { navbar: { notice: 'Envíos en la ciudad de lunes a sábado' } },
      },
      {
        id: 'cierre',
        copy: cierre(
          'Aparta por <span class="lz-title__serif">WhatsApp</span>',
          'Te confirmamos existencias, tallas y el costo del envío antes de pagar.',
          'Preguntar existencias',
        ),
      },
      { id: 'ubicacion-ligera', copy: {} },
    ],
  },
  veterinaria: {
    giro: 'veterinaria',
    archetypes: ['soft', 'booking', 'trust'],
    modules: [
      {
        id: 'cita-con-nota',
        copy: { hero: { note: 'Urgencias: llama antes de venir' } },
      },
      { id: 'quien-atiende', copy: {} },
      { id: 'preguntas-a-la-vista', copy: {} },
      {
        id: 'calificacion',
        copy: { testimonials: { scoreNote: 'Calificación de ejemplo' } },
      },
    ],
  },
};
