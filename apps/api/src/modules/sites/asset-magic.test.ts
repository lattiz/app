import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assetMagic } from './asset-magic';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
const GIF = Buffer.from('GIF89a', 'ascii');
const WEBP = Buffer.concat([
  Buffer.from('RIFF', 'ascii'),
  Buffer.from([0, 0, 0, 0]),
  Buffer.from('WEBP', 'ascii'),
]);
const HTML = Buffer.from('<script>alert(1)</script>', 'utf8');

describe('assetMagic', () => {
  it('accepts each default mime only when the header matches', () => {
    assert.equal(assetMagic.matches('image/png', PNG), true);
    assert.equal(assetMagic.matches('image/jpeg', JPEG), true);
    assert.equal(assetMagic.matches('image/gif', GIF), true);
    assert.equal(assetMagic.matches('image/webp', WEBP), true);
    assert.equal(assetMagic.extensionFor('image/jpeg'), '.jpg');
  });

  it('rejects a declared type whose bytes belong to another type', () => {
    assert.equal(assetMagic.matches('image/png', JPEG), false);
    assert.equal(assetMagic.matches('image/jpeg', HTML), false);
    assert.equal(assetMagic.matches('image/svg+xml', HTML), false);
    assert.equal(
      assetMagic.matches('image/gif', Buffer.from('GIF99a', 'ascii')),
      false,
    );
  });
});
