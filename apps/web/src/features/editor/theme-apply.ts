import type { EditorInstance } from './types';

interface StyleRule {
  addStyle: (style: Record<string, string>) => unknown;
}
interface HeadComponent {
  remove: () => unknown;
}
interface ThemeEditor {
  Css: {
    getRule: (selector: string) => StyleRule | null | undefined;
    setRule: (selector: string, style: Record<string, string>) => unknown;
  };
  getWrapper: () =>
    | {
        head?: {
          find: (selector: string) => HeadComponent[];
          components: () => {
            add: (definition: Record<string, unknown>) => unknown;
          };
        };
      }
    | undefined;
}

/** Merges tokens into the project's :root rule (template-kit stores its theme there). */
export function applyRootTokens(
  editor: EditorInstance | null,
  tokens: Record<string, string>,
): boolean {
  const studio = editor as unknown as ThemeEditor | null;
  if (!studio) return false;
  const rule = studio.Css.getRule(':root');
  if (rule) rule.addStyle(tokens);
  else studio.Css.setRule(':root', tokens);
  return true;
}

/** Swaps the theme's Google Fonts <link> in the document head; the template's own links stay. */
export function applyFontLink(
  editor: EditorInstance | null,
  href: string,
): boolean {
  const head = (editor as unknown as ThemeEditor | null)?.getWrapper()?.head;
  if (!head) return false;
  head.find('link[data-lz-theme-fonts]').forEach((link) => link.remove());
  head.components().add({
    tagName: 'link',
    void: true,
    attributes: { rel: 'stylesheet', href, 'data-lz-theme-fonts': '1' },
  });
  return true;
}
