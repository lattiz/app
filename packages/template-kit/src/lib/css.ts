import postcss, {
  type AtRule,
  type ChildNode,
  type Node,
  type Root,
  type Rule,
} from 'postcss';

export function parseCss(css: string, from?: string): Root {
  return postcss.parse(css, from ? { from } : undefined);
}

/** Class names referenced anywhere in a selector list (including inside :not()/:is()). */
export function classesInSelector(selector: string): string[] {
  const cleaned = selector
    .replace(/\[[^\]]*\]/g, '')
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, '');
  return [...cleaned.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]);
}

/** The at-rule chain (outermost first) a node lives in, e.g. `['media (max-width: 992px)']`. */
export function atRuleChain(node: ChildNode): AtRule[] {
  const chain: AtRule[] = [];
  let parent: Node | undefined = node.parent;
  while (parent && parent.type !== 'root') {
    if (parent.type === 'atrule') chain.unshift(parent as AtRule);
    parent = parent.parent;
  }
  return chain;
}

export function isInsideKeyframes(node: ChildNode): boolean {
  return atRuleChain(node).some((a) => /keyframes$/i.test(a.name));
}

/** Style rules outside @keyframes, in document order. */
export function styleRules(root: Root): Rule[] {
  const rules: Rule[] = [];
  root.walkRules((rule) => {
    if (!isInsideKeyframes(rule)) rules.push(rule);
  });
  return rules;
}

export function isReducedMotionMedia(atRule: AtRule): boolean {
  return (
    atRule.name === 'media' &&
    /prefers-reduced-motion\s*:\s*reduce/i.test(atRule.params)
  );
}

export function animationNames(value: string): string[] {
  return value
    .split(',')
    .flatMap((part) => part.trim().split(/\s+/))
    .filter(
      (t) =>
        /^[a-z_][\w-]*$/i.test(t) && !ANIMATION_KEYWORDS.has(t.toLowerCase()),
    );
}

const ANIMATION_KEYWORDS = new Set([
  'none',
  'infinite',
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'step-start',
  'step-end',
  'normal',
  'reverse',
  'alternate',
  'alternate-reverse',
  'forwards',
  'backwards',
  'both',
  'running',
  'paused',
  'initial',
  'inherit',
  'unset',
]);
