import type { Component, Editor, ParsedCssRule, ProjectData } from 'grapesjs';
import { JSDOM } from 'jsdom';
import postcss, { type ChildNode, type Container } from 'postcss';

type GrapesModule = typeof import('grapesjs');
type GrapesInit = GrapesModule['default'];

const DOM_GLOBALS = [
  'document',
  'navigator',
  'Node',
  'Element',
  'HTMLElement',
  'DOMParser',
  'XMLSerializer',
  'MutationObserver',
  'getComputedStyle',
  'CSS',
  'Event',
  'CustomEvent',
] as const;

let grapesPromise: Promise<GrapesInit> | null = null;

/** GrapesJS reads browser globals at import time, so jsdom is installed before the dynamic import. */
function loadGrapes(): Promise<GrapesInit> {
  if (!grapesPromise) {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      pretendToBeVisual: true,
    });
    const win = dom.window as unknown as Record<string, unknown>;
    Object.defineProperty(globalThis, 'window', {
      value: dom.window,
      configurable: true,
      writable: true,
    });
    for (const key of DOM_GLOBALS) {
      Object.defineProperty(globalThis, key, {
        value: win[key],
        configurable: true,
        writable: true,
      });
    }
    grapesPromise = import('grapesjs').then((m) => m.default);
  }
  return grapesPromise;
}

/**
 * jsdom's CSSOM rewrites shorthands (`margin:0` → four longhands, and `border` + `border-top` with
 * var() loses the shorthand entirely), so styles are parsed with postcss and passed through verbatim.
 */
export function parseCssForGrapes(input: string): ParsedCssRule[] {
  const rules: ParsedCssRule[] = [];
  const styleOf = (container: Container): Record<string, string> => {
    const style: Record<string, string> = {};
    container.each((node) => {
      if (node.type === 'decl')
        style[node.prop] = node.important
          ? `${node.value} !important`
          : node.value;
    });
    return style;
  };
  const visit = (node: ChildNode, media?: string): void => {
    if (node.type === 'rule') {
      rules.push({
        selectors: node.selector,
        style: styleOf(node),
        ...(media ? { atRule: 'media', params: media } : {}),
      });
    } else if (node.type === 'atrule') {
      if (/keyframes$/i.test(node.name)) {
        node.each((kf) => {
          if (kf.type === 'rule')
            rules.push({
              selectors: kf.selector,
              style: styleOf(kf),
              atRule: 'keyframes',
              params: node.params,
            });
        });
      } else if (node.name === 'media') {
        node.each((child) => visit(child, node.params));
      } else if (node.nodes) {
        rules.push({
          selectors: '',
          style: styleOf(node),
          atRule: node.name,
          params: node.params,
        });
      }
    }
  };
  postcss.parse(input).each((node) => visit(node));
  return rules;
}

/** Mirrors the `heading` type the Studio SDK registers, so h1–h6 serialize like a Studio export. */
function headingType(editor: Editor): void {
  editor.Components.addType('heading', {
    extend: 'text',
    isComponent: (el: HTMLElement) =>
      /^H[1-6]$/.test(el.tagName ?? '')
        ? { type: 'heading', tagName: el.tagName.toLowerCase() }
        : undefined,
    model: { defaults: { tagName: 'h1' } },
  });
}

export async function withEditor<T>(
  projectData: ProjectData | undefined,
  fn: (editor: Editor) => T,
): Promise<T> {
  const grapesjs = await loadGrapes();
  const editor = grapesjs.init({
    headless: true,
    storageManager: false,
    parser: { parserCss: parseCssForGrapes },
    plugins: [headingType],
    ...(projectData ? { projectData } : {}),
  });
  try {
    return fn(editor);
  } finally {
    editor.destroy();
  }
}

export interface ProjectBuild {
  project: ProjectData;
  html: string;
  css: string;
}

export interface BuildProjectInput {
  documentHtml: string;
  css: string;
  templateId: string;
  pageName: string;
  /** Component names by `data-lz-slot` value. */
  slotNames: Record<string, string>;
}

// Component.find() queries the view's DOM, which doesn't exist headless, so walk the models.
function walk(component: Component, fn: (c: Component) => void): void {
  fn(component);
  component.components().forEach((child: Component) => walk(child, fn));
}

function nameComponents(
  editor: Editor,
  slotNames: Record<string, string>,
): void {
  const wrapper = editor.getWrapper();
  if (!wrapper) return;
  walk(wrapper, (c) => {
    const attrs = c.getAttributes();
    const slot = attrs['data-lz-slot'];
    if (typeof slot === 'string' && slotNames[slot])
      c.set('name', slotNames[slot]);
    if (typeof attrs['data-lz-name'] === 'string') {
      c.set('name', attrs['data-lz-name']);
      c.removeAttributes('data-lz-name');
    }
  });
}

type Json = Record<string, unknown>;

function isJson(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Aligns headless output with the Studio export shape the editor and seed script expect. */
function normalizeProject(
  project: ProjectData,
  templateId: string,
  pageName: string,
): ProjectData {
  const out: Json = JSON.parse(JSON.stringify(project));
  const pages = Array.isArray(out.pages) ? out.pages : [];
  for (const page of pages) {
    if (!isJson(page)) continue;
    page.name = pageName;
    delete page.type;
    const frames = Array.isArray(page.frames) ? page.frames : [];
    for (const frame of frames) {
      if (isJson(frame) && isJson(frame.component))
        delete frame.component.stylable;
    }
  }
  return {
    dataSources: [],
    assets: [],
    styles: out.styles,
    pages,
    symbols: [],
    custom: { projectType: 'web', id: templateId },
  } as ProjectData;
}

export async function buildProject(
  input: BuildProjectInput,
): Promise<ProjectBuild> {
  return withEditor(undefined, (editor) => {
    editor.setComponents(input.documentHtml, { asDocument: true });
    editor.setStyle(input.css);
    nameComponents(editor, input.slotNames);
    return {
      project: normalizeProject(
        editor.getProjectData(),
        input.templateId,
        input.pageName,
      ),
      html: editor.getHtml(),
      css: editor.getCss() ?? '',
    };
  });
}

/** Renders any project (e.g. a Studio export) the way the editor would export it. */
export async function renderProject(
  project: ProjectData,
): Promise<{ html: string; css: string }> {
  return withEditor(project, (editor) => ({
    html: editor.getHtml(),
    css: editor.getCss() ?? '',
  }));
}
