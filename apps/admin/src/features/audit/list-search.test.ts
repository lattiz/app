import { describe, expect, it } from 'vitest';
import { AUDIT_PAGE_SIZE, toAuditListQuery, validateAuditListSearch } from './list-search';

describe('audit list search', () => {
  it('keeps valid filters and drops junk', () => {
    expect(
      validateAuditListSearch({
        actor: ' ana@lattiz.test ',
        action: 'template.',
        target: ' tpl_1 ',
        from: '2026-10-01',
        to: '2026-10-17',
        page: 2,
        extra: 'x',
      }),
    ).toEqual({
      actor: 'ana@lattiz.test',
      action: 'template.',
      target: 'tpl_1',
      from: '2026-10-01',
      to: '2026-10-17',
      page: 2,
    });
  });

  it('rejects an unknown action or an impossible day', () => {
    expect(
      validateAuditListSearch({ action: 'nope', from: '2026-02-31', target: 'abc' }),
    ).toEqual({ target: 'abc' });
  });

  it('sends the day bounds in Mexico City time and the target id', () => {
    expect(
      toAuditListQuery({
        actor: 'ana@lattiz.test',
        action: 'member.',
        target: 'user-1',
        from: '2026-10-17',
        to: '2026-10-17',
      }),
    ).toEqual({
      actor: 'ana@lattiz.test',
      action: 'member.',
      targetId: 'user-1',
      from: '2026-10-17T00:00:00-06:00',
      to: '2026-10-17T23:59:59-06:00',
      page: 1,
      pageSize: AUDIT_PAGE_SIZE,
    });
  });
});
