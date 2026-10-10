import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseOpenproviderDate } from './openprovider.mappers';

describe('parseOpenproviderDate', () => {
  it('treats the zero timestamp as no date', () => {
    assert.equal(parseOpenproviderDate('0000-00-00 00:00:00'), null);
    assert.equal(parseOpenproviderDate('0000-00-00'), null);
  });

  it('parses a registrar timestamp as UTC', () => {
    assert.equal(
      parseOpenproviderDate('2027-10-03 00:00:00')?.toISOString(),
      '2027-10-03T00:00:00.000Z',
    );
  });
});
