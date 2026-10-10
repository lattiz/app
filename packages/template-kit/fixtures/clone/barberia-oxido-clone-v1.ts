import oxido from '../../templates/barberia-oxido-v1';
import type { Manifest } from '../../src/types';

/** A deliberate ÓXIDO clone: kit:validate must reject it on every uniqueness rule. */
export default {
  ...oxido,
  id: 'barberia-oxido-clone-v1',
  name: 'ÓXIDO clon',
} satisfies Manifest;
