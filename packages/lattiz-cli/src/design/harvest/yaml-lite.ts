/**
 * The subset of YAML a Stitch DESIGN.md front matter uses: nested maps by two-space indentation
 * with scalar values (quoted or bare). No lists, anchors or multiline scalars: anything else is
 * ignored line by line instead of failing, because the file comes from a third party.
 */
export type YamlValue = string | { [key: string]: YamlValue };

const unquote = (v: string) => {
  const t = v.trim();
  const q = /^(['"])(.*)\1$/.exec(t);
  return q ? q[2] : t;
};

export function frontMatter(markdown: string): string | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown.trimStart());
  return m ? m[1] : null;
}

export function parseYamlLite(text: string): Record<string, YamlValue> {
  const root: Record<string, YamlValue> = {};
  const stack: { indent: number; node: Record<string, YamlValue> }[] = [
    { indent: -1, node: root },
  ];
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trimStart().startsWith('#')) continue;
    const m = /^(\s*)([^:\s][^:]*?)\s*:\s*(.*)$/.exec(raw);
    if (!m) continue;
    const indent = m[1].length;
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent)
      stack.pop();
    const parent = stack[stack.length - 1].node;
    const key = unquote(m[2]);
    if (m[3] === '') {
      const child: Record<string, YamlValue> = {};
      parent[key] = child;
      stack.push({ indent, node: child });
    } else parent[key] = unquote(m[3]);
  }
  return root;
}

export const asMap = (v: YamlValue | undefined) =>
  v && typeof v === 'object' ? v : ({} as Record<string, YamlValue>);
