import { mapsEmbedUrl, mapsLinkUrl } from '../src/lib/content';

/** Plumbing shared by the barbería voice packs; every word visitors read lives in the packs. */

export interface Branch {
  name: string;
  address: string;
  shortAddress: string;
  hours: string;
  /** Google Maps query for the embed and the "cómo llegar" link. */
  query: string;
}

export function branchCards(branches: Branch[]) {
  return branches.map((b) => ({
    name: b.name,
    address: b.address,
    hours: b.hours,
    directionsUrl: mapsLinkUrl(b.query),
    mapUrl: mapsEmbedUrl(b.query),
    mapTitle: `Mapa de la sucursal ${b.name}`,
  }));
}

export function footerBranches(branches: Branch[]) {
  return branches.map((b) => ({
    name: b.name,
    address: b.shortAddress,
    hours: b.hours,
  }));
}

/** Gallery items over gallery-01.jpg … in the template's asset folder. */
export function galleryItems(items: { caption: string; alt: string }[]) {
  return items.map((item, i) => ({
    image: `gallery-${String(i + 1).padStart(2, '0')}.jpg`,
    ...item,
  }));
}
