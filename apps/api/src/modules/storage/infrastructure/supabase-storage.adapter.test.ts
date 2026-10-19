import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ObjectStorageException } from '../domain/object-storage.exceptions';
import { SupabaseStorageAdapter } from './supabase-storage.adapter';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

interface Entry {
  name: string;
  id: string | null;
  metadata: { size: number } | null;
}

function supabaseAdapter(
  tree: Record<string, Entry[]>,
  options: { retain?: boolean } = {},
): {
  storage: SupabaseStorageAdapter;
  lists: { folder: string; limit: number; offset: number }[];
  removes: string[][];
} {
  const lists: { folder: string; limit: number; offset: number }[] = [];
  const removes: string[][] = [];
  const client = {
    storage: {
      from(bucket: string) {
        assert.equal(bucket, 'template-assets');
        return {
          async list(
            folder: string,
            query: { limit: number; offset: number },
          ) {
            lists.push({ folder, limit: query.limit, offset: query.offset });
            const all = tree[folder] ?? [];
            return {
              data: all.slice(query.offset, query.offset + query.limit),
              error: null,
            };
          },
          async remove(paths: string[]) {
            removes.push([...paths]);
            if (!options.retain) {
              for (const path of paths) {
                const slash = path.lastIndexOf('/');
                const folder = slash === -1 ? '' : path.slice(0, slash);
                const name = path.slice(slash + 1);
                const entries = tree[folder];
                if (!entries) continue;
                const index = entries.findIndex(
                  (entry) => entry.name === name && entry.id !== null,
                );
                if (index !== -1) entries.splice(index, 1);
              }
            }
            return { data: [], error: null };
          },
        };
      },
    },
  };
  return {
    storage: new SupabaseStorageAdapter({}, client as unknown as SupabaseClient),
    lists,
    removes,
  };
}

function files(count: number, size: number): Entry[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `f-${i}.png`,
    id: `id-${i}`,
    metadata: { size },
  }));
}

describe('SupabaseStorageAdapter.removePrefix', () => {
  it('pages the list and removes in batches of 1000', async () => {
    const folder = `tenant-assets/${TENANT_ID}`;
    const { storage, lists, removes } = supabaseAdapter({
      [folder]: files(1001, 3),
    });

    assert.deepEqual(await storage.removePrefix(`${folder}/`), {
      deletedObjects: 1001,
      deletedBytes: 3003,
    });
    assert.deepEqual(
      lists.map((call) => call.offset),
      [0, 1000, 0],
    );
    assert.equal(lists[0].limit, 1000);
    assert.equal(removes.length, 2);
    assert.equal(removes[0].length, 1000);
    assert.deepEqual(removes[1], [`${folder}/f-1000.png`]);
  });

  it('walks folders and does not remove the folder entry itself', async () => {
    const { storage, removes } = supabaseAdapter({
      [`tenant-assets/${TENANT_ID}`]: [
        { name: 'a.png', id: '1', metadata: { size: 10 } },
        { name: 'nested', id: null, metadata: null },
      ],
      [`tenant-assets/${TENANT_ID}/nested`]: [
        { name: 'b.png', id: '2', metadata: { size: 5 } },
      ],
    });

    assert.deepEqual(await storage.removePrefix(`tenant-assets/${TENANT_ID}/`), {
      deletedObjects: 2,
      deletedBytes: 15,
    });
    assert.deepEqual(removes, [
      [
        `tenant-assets/${TENANT_ID}/a.png`,
        `tenant-assets/${TENANT_ID}/nested/b.png`,
      ],
    ]);
  });

  it('does not call remove when the prefix has no objects', async () => {
    const { storage, removes } = supabaseAdapter({
      [`tenant-branding/${TENANT_ID}`]: [],
    });

    assert.deepEqual(await storage.removePrefix(`tenant-branding/${TENANT_ID}/`), {
      deletedObjects: 0,
      deletedBytes: 0,
    });
    assert.equal(removes.length, 0);
  });

  it('throws when a later list shows the prefix is not empty', async () => {
    const folder = `tenant-assets/${TENANT_ID}`;
    const { storage, removes } = supabaseAdapter(
      { [folder]: files(1, 4) },
      { retain: true },
    );

    await assert.rejects(
      () => storage.removePrefix(`${folder}/`),
      (error: unknown) => {
        assert.ok(error instanceof ObjectStorageException);
        assert.match(error.detail, /still has objects/);
        return true;
      },
    );
    assert.equal(removes.length, 1);
  });

  it('accepts only the assets and branding prefix of one uuid', async () => {
    for (const prefix of [
      `tenant-assets/${TENANT_ID}/`,
      `tenant-branding/${TENANT_ID}/`,
    ]) {
      const folder = prefix.slice(0, -1);
      const { storage, lists } = supabaseAdapter({ [folder]: [] });
      assert.deepEqual(await storage.removePrefix(prefix), {
        deletedObjects: 0,
        deletedBytes: 0,
      });
      assert.equal(lists.length > 0, true);
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
      const { storage, lists, removes } = supabaseAdapter({});
      await assert.rejects(
        () => storage.removePrefix(prefix),
        (error: unknown) => {
          assert.ok(error instanceof ObjectStorageException);
          assert.equal(error.operation, 'removePrefix');
          return true;
        },
      );
      assert.equal(lists.length, 0);
      assert.equal(removes.length, 0);
    }
  });
});
