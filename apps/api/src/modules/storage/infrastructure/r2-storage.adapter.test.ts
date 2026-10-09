import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { R2StorageAdapter, type S3Sender } from './r2-storage.adapter';

function adapter(pages: unknown[]): {
  storage: R2StorageAdapter;
  prefixes: string[];
} {
  const prefixes: string[] = [];
  let index = 0;
  const client: S3Sender = {
    async send(command) {
      assert.ok(command instanceof ListObjectsV2Command);
      prefixes.push(command.input.Prefix ?? '');
      const page = pages[index];
      index += 1;
      return page;
    },
  };
  return {
    storage: new R2StorageAdapter(
      {
        accountId: 'acct',
        accessKeyId: 'key',
        secretAccessKey: 'secret',
        bucket: 'lattiz-assets',
        publicUrl: 'https://assets.lattiz.app',
      },
      client,
    ),
    prefixes,
  };
}

describe('R2StorageAdapter.usageBytes', () => {
  it('sums every page under the prefix', async () => {
    const { storage, prefixes } = adapter([
      {
        Contents: [{ Size: 10 }, { Size: 5 }],
        IsTruncated: true,
        NextContinuationToken: 'page-2',
      },
      {
        Contents: [{ Size: 7 }, {}],
        IsTruncated: false,
      },
    ]);
    assert.equal(await storage.usageBytes('tenant-assets/tenant-1/'), 22);
    assert.deepEqual(prefixes, [
      'tenant-assets/tenant-1/',
      'tenant-assets/tenant-1/',
    ]);
  });
});
