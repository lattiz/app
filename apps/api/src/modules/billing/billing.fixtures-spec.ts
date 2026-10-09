import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type Stripe from 'stripe';
import type { Database } from '../../database/database.module';

export interface RenderedQuery {
  sql: string;
  params: unknown[];
}

const dialect = new PgDialect();

/** A Database whose `execute` answers by inspecting the rendered SQL; every query is recorded. */
export function fakeDb(
  answer: (query: RenderedQuery) => unknown[] = () => [],
): {
  db: Database;
  queries: RenderedQuery[];
} {
  const queries: RenderedQuery[] = [];
  const db = {
    execute: jest.fn((statement: SQL) => {
      const { sql, params } = dialect.sqlToQuery(statement);
      const query = { sql: sql.replace(/\s+/g, ' ').trim(), params };
      queries.push(query);
      return Promise.resolve(answer(query));
    }),
  };
  return { db: db as unknown as Database, queries };
}

export const NOW_S = Math.floor(Date.now() / 1000);
export const PERIOD_END_S = NOW_S + 10 * 86_400;

export function price(
  id: string,
  lookupKey: string | null,
  interval: 'month' | 'year' = 'month',
  product = 'prod_x',
): Stripe.Price {
  return {
    id,
    object: 'price',
    lookup_key: lookupKey,
    product,
    recurring: { interval },
  } as unknown as Stripe.Price;
}

export function subscription(
  overrides: Partial<Stripe.Subscription> & { itemPrice?: Stripe.Price } = {},
): Stripe.Subscription {
  const { itemPrice = price('price_basico_m', 'basico_monthly'), ...rest } =
    overrides;
  return {
    id: 'sub_1',
    object: 'subscription',
    customer: 'cus_1',
    status: 'active',
    cancel_at: null,
    cancel_at_period_end: false,
    canceled_at: null,
    schedule: null,
    metadata: {
      tenant_id: 'tenant-1',
      plan: 'basico',
      lookup_key: 'basico_monthly',
    },
    items: {
      data: [
        {
          id: 'si_1',
          price: itemPrice,
          quantity: 1,
          current_period_start: NOW_S - 20 * 86_400,
          current_period_end: PERIOD_END_S,
        },
      ],
    },
    ...rest,
  } as unknown as Stripe.Subscription;
}
