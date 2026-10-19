import { describe, expect, it } from 'vitest';
import {
  STATUS_MOVES,
  ValidationError,
  validateCandidate,
  validateHarvest,
} from '../src/design/types';

const candidate = {
  id: 'dental-executive-vision-01',
  giro: 'dental',
  source: 'stitch',
  status: 'collected',
  tags: ['glass', 'oscuro'],
  license_ref: 'docs/design-stitch-flow.md#licencia',
  created_at: '2026-10-18T00:00:00.000Z',
  stitch: { project_id: '1', screen_ids: ['a'] },
};

describe('candidate.json', () => {
  it('accepts a complete candidate', () => {
    expect(validateCandidate(candidate).id).toBe(candidate.id);
  });
  it('lists every problem at once', () => {
    try {
      validateCandidate({
        ...candidate,
        status: 'x',
        source: 'figma',
        tags: 1,
      });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).problems).toHaveLength(3);
    }
  });
  it('requires the license pointer', () => {
    expect(() => validateCandidate({ ...candidate, license_ref: '' })).toThrow(
      /license_ref/,
    );
  });
  it('rejected is terminal and promoted never goes back', () => {
    expect(STATUS_MOVES.rejected).toEqual([]);
    expect(STATUS_MOVES.promoted).not.toContain('collected');
  });
});

describe('harvest.json', () => {
  const harvest = {
    version: 1,
    candidate_id: candidate.id,
    harvested_at: '2026-10-18T00:00:00.000Z',
    input: { file: 'design.md', kind: 'design-md' },
    palette: { bg: '#08132a', text: '#d9e2ff', accent: '#b9c7e4' },
    typography: { scale: [] },
    sections: [{ layout: 'split' }],
    not_mappable: [],
    images_ignored: 0,
  };
  it('accepts a minimal harvest', () => {
    expect(validateHarvest(harvest).version).toBe(1);
  });
  it('rejects a palette without hex colors and unknown layouts', () => {
    expect(() =>
      validateHarvest({
        ...harvest,
        palette: { bg: 'red', text: '#000000', accent: '#ffffff' },
        sections: [{ layout: 'carousel' }],
      }),
    ).toThrow(/palette\.bg[\s\S]*layout|layout[\s\S]*palette\.bg/);
  });
});
