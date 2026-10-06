# Stripe Setup — Lattiz Billing

Subscriptions use **Stripe Hosted Checkout** (redirect flow). The frontend never
mounts Stripe.js — it just redirects to the `url` returned by the API — so no
publishable key is needed in `apps/web`.

The API resolves prices by **lookup key** (never hardcoded price IDs), so the
same code works across test and live as long as the lookup keys exist.

## 1. Products & prices (already created in TEST mode)

These were created via the Stripe API in the connected **test** account
(`Lattiz`). **Before launch, recreate the same products, prices and lookup keys
in live mode** — nothing in test mode carries over.

| Product        | Lookup key       | Price             | Amount (centavos) | Test price ID                    |
| -------------- | ---------------- | ----------------- | ----------------- | -------------------------------- |
| Lattiz Básico  | `basico_monthly` | $449 MXN / mes    | `44900`           | `price_1ULqno5lxAq0Fx1a5hQPADjg` |
| Lattiz Básico  | `basico_annual`  | $4,490 MXN / año  | `449000`          | `price_1ULqnp5lxAq0Fx1azaKzdyAV` |
| Lattiz Pro     | `pro_monthly`    | $699 MXN / mes    | `69900`           | `price_1Tstyk5lxAq0Fx1agzuadOpj` |
| Lattiz Pro     | `pro_annual`     | $6,990 MXN / año  | `699000`          | `price_1Tstyk5lxAq0Fx1aY3kbihVM` |

To create manually (Dashboard → Products): add each price, then set its lookup
key under **Price → Advanced → Lookup key**. Ensure **MXN** is enabled under
Settings → Business → Bank accounts and currencies.

The dashboard renders amounts from `GET /billing/plans` (Stripe, cached ~10 min),
never from hard-coded numbers, so a price change needs no deploy.

### Changing a price

Stripe prices are immutable and cannot be deleted, only archived. To change one:

```bash
stripe prices create --product <prod_id> --currency mxn --unit-amount <centavos> \
  -d "recurring[interval]=month" --nickname "Básico Mensual"
stripe prices update <new_price_id> -d lookup_key=basico_monthly -d transfer_lookup_key=true
stripe prices update <old_price_id> -d active=false
```

Without `transfer_lookup_key=true` the key stays on the old price and checkout
keeps charging it. Archived prices keep billing existing subscribers
(grandfathering); their subscription metadata still carries the same
`lookup_key`, which is how webhooks resolve the plan — never rewrite it.
At boot the API logs a warning if any of the four keys lacks an active price.

Archived test prices (grandfathered Básico subscribers): `price_1Tstyh5lxAq0Fx1aqLjOJY4g`
($399/mes) and `price_1Tstyi5lxAq0Fx1aiJtsiJdp` ($3,990/año).

## 2. API keys → `apps/api/.env`

Dashboard → Developers → API keys:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
STRIPE_API_VERSION=2025-06-30.basil
APP_URL=http://localhost:5173
```

## 3. Webhooks

The webhook endpoint is **`POST /billing/webhooks`** (no `/api` prefix — the
NestJS app has no global prefix). It verifies the Stripe signature over the raw
request body.

**Local dev (Stripe CLI):**

```bash
stripe listen --forward-to localhost:3000/billing/webhooks
```

Copy the printed `whsec_...` into `apps/api/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

**Deployed:** Dashboard → Developers → Webhooks → Add endpoint
`https://<api-host>/billing/webhooks`, subscribe to:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## 4. Test the flow

1. Start the API and web app (`pnpm dev`) and run `stripe listen` (above).
2. In the app, open **Dashboard → Suscripción** and click **Suscribirme**.
3. On Stripe Checkout use test card `4242 4242 4242 4242`, any future expiry/CVC.
4. After redirect back, the `subscriptions` row is `active` and `tenants.plan`
   is `basico`/`pro`. Manage/cancel via **Administrar suscripción** (Customer
   Portal). Enable the portal once at
   https://dashboard.stripe.com/test/settings/billing/portal
