import postcss, {
  type AtRule,
  type ChildNode,
  type Container,
  type Root,
} from 'postcss';
import { animationNames, classesInSelector } from './css';

export const CORE = 'core';

/** class → slots that use it. */
export function classUsage(
  slotClasses: Map<string, Set<string>>,
): Map<string, Set<string>> {
  const usage = new Map<string, Set<string>>();
  for (const [slot, classes] of slotClasses) {
    for (const c of classes) {
      const set = usage.get(c) ?? new Set<string>();
      set.add(slot);
      usage.set(c, set);
    }
  }
  return usage;
}

/**
 * A rule belongs to a slot when it names at least one class only that slot uses and no class
 * exclusive to another slot; shared classes don't count against it. Anything else is core.
 */
export function selectorOwner(
  selector: string,
  usage: Map<string, Set<string>>,
): string {
  const owners = new Set<string>();
  for (const cls of classesInSelector(selector)) {
    const slots = usage.get(cls);
    if (slots && slots.size === 1) owners.add([...slots][0]);
  }
  return owners.size === 1 ? [...owners][0] : CORE;
}

/** Keyframes follow the slot whose rules use them; shared or unused keyframes stay in core. */
export function keyframeOwners(
  root: Root,
  usage: Map<string, Set<string>>,
): Map<string, string> {
  const users = new Map<string, Set<string>>();
  root.walkDecls(/^animation(-name)?$/i, (decl) => {
    const parent = decl.parent;
    if (!parent || parent.type !== 'rule') return;
    const owner = selectorOwner((parent as postcss.Rule).selector, usage);
    for (const name of animationNames(decl.value)) {
      const set = users.get(name) ?? new Set<string>();
      set.add(owner);
      users.set(name, set);
    }
  });
  const owners = new Map<string, string>();
  for (const [name, set] of users)
    owners.set(name, set.size === 1 ? [...set][0] : CORE);
  return owners;
}

export interface CssSplit {
  core: Root;
  slots: Map<string, Root>;
}

/** Splits a stylesheet into core + per-slot sheets, recreating at-rule wrappers in each bucket. */
export function splitCss(
  root: Root,
  slotClasses: Map<string, Set<string>>,
): CssSplit {
  const usage = classUsage(slotClasses);
  const kfOwners = keyframeOwners(root, usage);
  const buckets = new Map<string, Root>([[CORE, postcss.root()]]);
  const bucket = (owner: string): Root => {
    const existing = buckets.get(owner);
    if (existing) return existing;
    const created = postcss.root();
    buckets.set(owner, created);
    return created;
  };

  // Reuses the bucket's last wrapper when params match, so per-slot media blocks stay grouped.
  const containerFor = (owner: string, chain: AtRule[]): Container => {
    let target: Container = bucket(owner);
    for (const at of chain) {
      const last = target.last;
      if (
        last &&
        last.type === 'atrule' &&
        last.name === at.name &&
        last.params === at.params
      ) {
        target = last;
      } else {
        const clone = at.clone({ nodes: [] });
        target.append(clone);
        target = clone;
      }
    }
    return target;
  };

  const visit = (node: ChildNode, chain: AtRule[]): void => {
    if (node.type === 'comment' || node.type === 'decl') return;
    if (node.type === 'rule') {
      containerFor(selectorOwner(node.selector, usage), chain).append(
        node.clone(),
      );
      return;
    }
    if (/keyframes$/i.test(node.name)) {
      containerFor(kfOwners.get(node.params) ?? CORE, chain).append(
        node.clone(),
      );
      return;
    }
    if (
      node.nodes &&
      ['media', 'supports', 'container', 'layer'].includes(node.name)
    ) {
      for (const child of node.nodes) visit(child, [...chain, node]);
      return;
    }
    containerFor(CORE, chain).append(node.clone());
  };
  for (const node of root.nodes) visit(node, []);

  const core = buckets.get(CORE) ?? postcss.root();
  buckets.delete(CORE);
  return { core, slots: buckets };
}
