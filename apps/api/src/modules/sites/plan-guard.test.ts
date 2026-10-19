import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PLAN_CATALOG } from './plan-catalog.generated';
import {
  decidePlanGuard,
  NO_MARKERS,
  parseEnforcementMode,
  proMarkersInHtml,
  proMarkersInProject,
} from './plan-guard';

const section = (slot: string, variant: string) => ({
  tagName: 'section',
  attributes: { 'data-lz-slot': slot, 'data-lz-variant': variant },
});

describe('plan guard', () => {
  it('defaults to report mode', () => {
    assert.equal(parseEnforcementMode(undefined), 'report');
    assert.equal(parseEnforcementMode(''), 'report');
    assert.equal(parseEnforcementMode('nope'), null);
  });

  it('gallery and hero/bento are Pro-only in the generated catalog', () => {
    for (const key of ['gallery/grid', 'gallery/bento', 'hero/bento'])
      assert.ok(
        (PLAN_CATALOG.proOnlyVariants as readonly string[]).includes(key),
        key,
      );
  });

  it('finds Pro sections and hooks in a project and in HTML', () => {
    const project = {
      pages: [
        {
          component: {
            components: [
              section('hero', 'bento'),
              section('hero', 'rail'),
              { attributes: { 'data-lz-reveal': '' } },
            ],
          },
        },
      ],
    };
    const found = proMarkersInProject(project);
    assert.deepEqual(found.variants, ['hero/bento']);
    assert.deepEqual(found.hooks, ['data-lz-reveal']);
    assert.deepEqual(
      proMarkersInHtml(
        '<section data-lz-slot="gallery" data-lz-variant="grid"></section>',
      ).variants,
      ['gallery/grid'],
    );
  });

  it('flags a new Pro section on Básico, but not what its template shipped with', () => {
    const found = { variants: ['gallery/grid', 'hero/bento'], hooks: [] };
    const flagged = decidePlanGuard({
      found,
      proIncluded: false,
      currentTemplateTier: 'basic',
      templateMarkers: NO_MARKERS,
    });
    assert.equal(flagged.verdict, 'flagged');
    assert.equal(flagged.blocking, true);
    const exempt = decidePlanGuard({
      found,
      proIncluded: false,
      currentTemplateTier: 'basic',
      templateMarkers: found,
    });
    assert.equal(exempt.verdict, 'clean');
  });

  it('a plan with Pro is always clean; hooks alone never block', () => {
    assert.equal(
      decidePlanGuard({
        found: { variants: ['hero/bento'], hooks: [] },
        proIncluded: true,
        currentTemplateTier: 'basic',
        templateMarkers: NO_MARKERS,
      }).verdict,
      'clean',
    );
    const hooksOnly = decidePlanGuard({
      found: { variants: [], hooks: ['data-lz-reveal'] },
      proIncluded: false,
      currentTemplateTier: 'basic',
      templateMarkers: NO_MARKERS,
    });
    assert.equal(hooksOnly.verdict, 'flagged');
    assert.equal(hooksOnly.blocking, false);
  });
});
