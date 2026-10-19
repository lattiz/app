import { describe, expect, it } from 'vitest';
import { validateTemplateListSearch } from './list-search';
import { readKitMeta, kitCheckLabel } from './kit-meta';
import {
  addSlugTag,
  confirmIdMatches,
  isTemplateNotReady,
  moveListItem,
  templateActionSet,
  templateDeleteBlock,
  templateDraftError,
  templateInUseText,
  templateMutationMessage,
  templateNotReadyText,
  templateUpdateBody,
  thumbnailProblem,
  THUMBNAIL_MAX_BYTES,
} from './actions';

describe('template actions by role and status', () => {
  it('lets the owner edit, change status and delete', () => {
    expect(templateActionSet('owner', 'pending')).toMatchObject({
      edit: true,
      activate: true,
      activateLabel: 'Activar',
      retire: false,
      thumbnail: true,
      delete: true,
    });
    expect(templateActionSet('owner', 'active')).toMatchObject({
      activate: false,
      activateLabel: null,
      retire: true,
      delete: true,
    });
    expect(templateActionSet('owner', 'retired').activateLabel).toBe(
      'Volver a activar',
    );
  });

  it('hides delete from the operator and everything from a viewer', () => {
    expect(templateActionSet('operator', 'active').delete).toBe(false);
    expect(templateActionSet('operator', 'pending').activate).toBe(true);
    expect(templateActionSet('viewer', 'active')).toEqual({
      edit: false,
      activate: false,
      activateLabel: null,
      retire: false,
      thumbnail: false,
      delete: false,
    });
  });
});

describe('thumbnail file', () => {
  it('accepts jpeg, png and webp up to 2 MB', () => {
    expect(
      thumbnailProblem({ name: 'a.jpg', type: 'image/jpeg', size: 100 }),
    ).toBeNull();
    expect(
      thumbnailProblem({
        name: 'a.png',
        type: 'image/png',
        size: THUMBNAIL_MAX_BYTES,
      }),
    ).toBeNull();
    expect(
      thumbnailProblem({ name: 'a.webp', type: 'image/webp', size: 100 }),
    ).toBeNull();
    expect(
      thumbnailProblem({ name: 'a.jpg', type: 'image/jpg', size: 100 }),
    ).toBeNull();
    expect(
      thumbnailProblem({ name: 'foto.jpeg', type: '', size: 100 }),
    ).toBeNull();
  });

  it('rejects other types, empty files and files over 2 MB', () => {
    expect(
      thumbnailProblem({ name: 'a.gif', type: 'image/gif', size: 100 }),
    ).toMatch(/JPEG/);
    expect(
      thumbnailProblem({ name: 'a.png', type: 'image/png', size: 0 }),
    ).toMatch(/vacío/);
    expect(
      thumbnailProblem({
        name: 'a.png',
        type: 'image/png',
        size: THUMBNAIL_MAX_BYTES + 1,
      }),
    ).toMatch(/2 MB/);
  });
});

describe('template error codes', () => {
  it('explains a missing preview or thumbnail with the deploy command', () => {
    const error = {
      error: {
        code: 'TEMPLATE_NOT_READY',
        message: 'no lista',
        details: { missing: ['preview_url', 'thumbnail_url'] },
      },
    };
    expect(isTemplateNotReady(error)).toBe(true);
    expect(templateMutationMessage(error, 'cafe-roma')).toBe(
      'Faltan la vista previa y la miniatura; corre pnpm lattiz deploy cafe-roma.',
    );
    expect(
      templateNotReadyText({ missing: ['thumbnail_url'] }, 'cafe-roma'),
    ).toBe('Falta la miniatura; corre pnpm lattiz deploy cafe-roma.');
    expect(templateNotReadyText({}, 'cafe-roma')).toMatch(
      /vista previa o la miniatura/,
    );
  });

  it('names how many sites and archives still use the template', () => {
    const error = {
      error: {
        code: 'TEMPLATE_IN_USE',
        message: 'en uso',
        details: { sites: 2, archives: 1 },
      },
    };
    expect(templateMutationMessage(error, 'cafe-roma')).toBe(
      'No se puede borrar: la usan 2 sitios y 1 archivo.',
    );
    expect(templateInUseText(null)).toMatch(/sigue en uso/);
    expect(
      templateMutationMessage({ error: { message: 'Otro fallo' } }, 'x'),
    ).toBe('Otro fallo');
  });
});

describe('template draft and order', () => {
  it('blocks a delete while sites or archives reference it', () => {
    expect(
      templateDeleteBlock({ tenantsUsing: 0, archivedCount: 0 }),
    ).toBeNull();
    expect(templateDeleteBlock({ tenantsUsing: 1, archivedCount: 2 })).toBe(
      'La usan 1 sitio y 2 archivos.',
    );
    expect(confirmIdMatches(' cafe ', 'cafe')).toBe(true);
    expect(confirmIdMatches('Cafe', 'cafe')).toBe(false);
  });

  it('normalizes tags and the update body', () => {
    expect(addSlugTag([], ' Café ')).toMatchObject({
      error: expect.stringMatching(/minúsculas/),
    });
    expect(addSlugTag([], 'Cafe-Roma').tags).toEqual(['cafe-roma']);
    expect(addSlugTag(['a'], 'a').tags).toEqual(['a']);
    const full = Array.from({ length: 10 }, (_, index) => `tag-${index}`);
    expect(addSlugTag(full, 'extra').error).toMatch(/10/);
    expect(
      templateDraftError({
        name: 'Café Roma',
        description: '',
        category: 'Cafe',
        tags: ['cafe'],
        featured: true,
      }),
    ).toBeNull();
    expect(
      templateUpdateBody({
        name: ' Café ',
        description: '  ',
        category: 'Cafe',
        tags: ['cafe'],
        featured: false,
      }),
    ).toEqual({
      name: 'Café',
      description: null,
      category: 'cafe',
      tags: ['cafe'],
      featured: false,
    });
  });

  it('moves an item without touching the ends', () => {
    expect(moveListItem(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(moveListItem(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
  });

  it('keeps retired in the list search and lowercases the tag', () => {
    expect(
      validateTemplateListSearch({ status: 'retired', tag: 'Café' }),
    ).toEqual({
      status: 'retired',
      tag: 'café',
    });
  });
});

describe('kit meta', () => {
  it('reads the seed record and accepts a legacy giro key', () => {
    expect(readKitMeta(null)).toBeNull();
    expect(readKitMeta({ giro: 'barberia' })?.vertical).toBe('barberia');
    const view = readKitMeta({
      vertical: 'cafe',
      direction: 'calido',
      archetype: 'local',
      palette: 'tierra',
      fontPair: 'fraunces',
      sections: [
        { slot: 'hero', variant: 'split', role: 'intro' },
        { slot: 'x' },
      ],
      check: { result: 'FAIL', at: '2026-10-01T12:00:00.000Z' },
      gitSha: 'abc123',
    });
    expect(view?.sections).toEqual([{ slot: 'hero', variant: 'split' }]);
    expect(view?.check).toEqual({
      result: 'FAIL',
      at: '2026-10-01T12:00:00.000Z',
    });
    expect(view?.gitSha).toBe('abc123');
    expect(kitCheckLabel('pass')).toBe('Aprobó');
    expect(kitCheckLabel('custom')).toBe('custom');
  });
});
