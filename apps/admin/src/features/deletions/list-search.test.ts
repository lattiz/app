import { describe, expect, it } from 'vitest';
import { toDeletionListQuery, validateDeletionListSearch } from './list-search';

describe('validateDeletionListSearch', () => {
  it('drops an unknown status and keeps a real page', () => {
    expect(
      validateDeletionListSearch({ status: 'nope', page: 2, extra: true }),
    ).toEqual({ page: 2 });
    expect(validateDeletionListSearch({ status: 'failed', page: 1 })).toEqual({
      status: 'failed',
    });
  });
});

describe('toDeletionListQuery', () => {
  it('asks for the first page of 25 unless the search says otherwise', () => {
    expect(toDeletionListQuery({})).toEqual({ page: 1, pageSize: 25 });
    expect(toDeletionListQuery({ status: 'running', page: 3 })).toEqual({
      page: 3,
      pageSize: 25,
      status: 'running',
    });
  });
});
