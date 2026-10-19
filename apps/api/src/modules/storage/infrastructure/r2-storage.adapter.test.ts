import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { ObjectStorageException } from '../domain/object-storage.exceptions';
import { R2StorageAdapter, type S3Sender } from './r2-storage.adapter';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

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

const R2_CONFIG = {
  accountId: 'acct',
  accessKeyId: 'key',
  secretAccessKey: 'secret',
  bucket: 'lattiz-assets',
  publicUrl: 'https://assets.lattiz.app',
};

function scriptedAdapter(options: { pages: unknown[]; deletes?: unknown[] }): {
  storage: R2StorageAdapter;
  lists: { prefix: string; token?: string; maxKeys?: number }[];
  deletes: string[][];
  calls: { n: number };
} {
  const lists: { prefix: string; token?: string; maxKeys?: number }[] = [];
  const deletes: string[][] = [];
  const calls = { n: 0 };
  let listIndex = 0;
  let deleteIndex = 0;
  const client: S3Sender = {
    async send(command) {
      calls.n += 1;
      if (command instanceof ListObjectsV2Command) {
        lists.push({
          prefix: command.input.Prefix ?? '',
          token: command.input.ContinuationToken,
          maxKeys: command.input.MaxKeys,
        });
        const page = options.pages[listIndex];
        listIndex += 1;
        if (!page) throw new Error(`unexpected list #${listIndex}`);
        return page;
      }
      if (command instanceof DeleteObjectsCommand) {
        const keys = (command.input.Delete?.Objects ?? []).map(
          (object) => object.Key ?? '',
        );
        deletes.push(keys);
        const response = options.deletes?.[deleteIndex] ?? {
          Deleted: keys.map((Key) => ({ Key })),
        };
        deleteIndex += 1;
        return response;
      }
      throw new Error('unexpected command');
    },
  };
  return { storage: new R2StorageAdapter(R2_CONFIG, client), lists, deletes, calls };
}

function listed(prefix: string, count: number, size: number) {
  return Array.from({ length: count }, (_, i) => ({
    Key: `${prefix}o-${i}`,
    Size: size,
  }));
}

describe('R2StorageAdapter.removePrefix', () => {
  it('deletes every page in batches of 1000 and checks the prefix is empty', async () => {
    const prefix = `tenant-assets/${TENANT_ID}/`;
    const { storage, lists, deletes } = scriptedAdapter({
      pages: [
        {
          Contents: listed(prefix, 1000, 2),
          IsTruncated: true,
          NextContinuationToken: 'page-2',
        },
        { Contents: listed(`${prefix}tail-`, 1, 5), IsTruncated: false },
        { Contents: [], IsTruncated: false },
      ],
    });

    assert.deepEqual(await storage.removePrefix(prefix), {
      deletedObjects: 1001,
      deletedBytes: 2005,
    });
    assert.equal(deletes.length, 2);
    assert.equal(deletes[0].length, 1000);
    assert.equal(deletes[1].length, 1);
    assert.equal(lists.length, 3);
    assert.equal(lists[0].maxKeys, 1000);
    assert.equal(lists[1].token, 'page-2');
    assert.equal(lists[1].maxKeys, 1000);
    assert.equal(lists[2].token, undefined);
  });

  it('does not call delete when the prefix has no objects', async () => {
    const { storage, lists, deletes } = scriptedAdapter({
      pages: [
        { Contents: [], IsTruncated: false },
        { Contents: [], IsTruncated: false },
      ],
    });

    assert.deepEqual(await storage.removePrefix(`tenant-branding/${TENANT_ID}/`), {
      deletedObjects: 0,
      deletedBytes: 0,
    });
    assert.equal(deletes.length, 0);
    assert.equal(lists.length, 2);
  });

  it('throws the first DeleteObjects error after the whole batch was sent', async () => {
    const prefix = `tenant-assets/${TENANT_ID}/`;
    const objects = listed(prefix, 1000, 1);
    const { storage, lists, deletes } = scriptedAdapter({
      pages: [{ Contents: objects, IsTruncated: false }],
      deletes: [
        {
          Errors: [
            { Key: objects[0].Key, Code: 'AccessDenied', Message: 'nope' },
            { Key: objects[1].Key, Code: 'InternalError', Message: 'later' },
          ],
        },
      ],
    });

    await assert.rejects(
      () => storage.removePrefix(prefix),
      (error: unknown) => {
        assert.ok(error instanceof ObjectStorageException);
        assert.equal(error.operation, 'removePrefix');
        assert.match(error.detail, /AccessDenied/);
        assert.equal(error.detail.includes('InternalError'), false);
        return true;
      },
    );
    assert.equal(deletes.length, 1);
    assert.equal(deletes[0].length, 1000);
    assert.equal(lists.length, 1);
  });

  it('throws when a later list shows the prefix is not empty', async () => {
    const prefix = `tenant-assets/${TENANT_ID}/`;
    const { storage, deletes } = scriptedAdapter({
      pages: [
        { Contents: listed(prefix, 1, 4), IsTruncated: false },
        { Contents: listed(prefix, 1, 4), IsTruncated: false },
      ],
    });

    await assert.rejects(
      () => storage.removePrefix(prefix),
      (error: unknown) => {
        assert.ok(error instanceof ObjectStorageException);
        assert.match(error.detail, /still has objects/);
        return true;
      },
    );
    assert.equal(deletes.length, 1);
  });

  it('accepts only the assets and branding prefix of one uuid', async () => {
    for (const prefix of [
      `tenant-assets/${TENANT_ID}/`,
      `tenant-branding/${TENANT_ID}/`,
    ]) {
      const { storage, calls } = scriptedAdapter({
        pages: [
          { Contents: [], IsTruncated: false },
          { Contents: [], IsTruncated: false },
        ],
      });
      assert.deepEqual(await storage.removePrefix(prefix), {
        deletedObjects: 0,
        deletedBytes: 0,
      });
      assert.equal(calls.n > 0, true);
    }
  });

  it('refuses unsafe prefixes without calling storage', async () => {
    for (const prefix of [
      '',
      '/',
      'tenant-assets/',
      'tenant-branding/',
      'tenant-assets/x/',
      `tenant-assets/${TENANT_ID}`,
      `tenant-assets/${TENANT_ID}/sub/`,
      `templates/${TENANT_ID}/`,
      'tenant-assets/../templates/',
    ]) {
      const { storage, lists, deletes, calls } = scriptedAdapter({ pages: [] });
      await assert.rejects(
        () => storage.removePrefix(prefix),
        (error: unknown) => {
          assert.ok(error instanceof ObjectStorageException);
          assert.equal(error.operation, 'removePrefix');
          return true;
        },
      );
      assert.equal(calls.n, 0);
      assert.equal(lists.length, 0);
      assert.equal(deletes.length, 0);
    }
  });
});
