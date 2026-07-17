// Local stand-in for the GoDaddy API (v3 + v1) so the DomainsModule pipeline
// can be exercised end-to-end without a GODADDY_PAT. Run: node godaddy-mock.js
const http = require('node:http');
const { randomUUID } = require('node:crypto');

const PORT = 4001;

const PRICES = {
  '.com': 1499,
  '.com.mx': 999,
  '.mx': 3999, // above DOMAIN_MAX_COST_USD_CENTS → "no incluido en tu plan"
  '.net': 1299,
};

function tldOf(domain) {
  const parts = domain.split('.');
  return '.' + parts.slice(1).join('.');
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  console.log(`${req.method} ${url.pathname}${url.search}`);

  if (req.method === 'GET' && url.pathname === '/v3/domains/check-availability') {
    const domain = url.searchParams.get('domain') ?? '';
    const price = PRICES[tldOf(domain)] ?? 1999;
    await sleep(400);
    return json(res, 200, {
      domain,
      available: !domain.startsWith('taken'),
      prices: [
        { term: 'ANNUAL', period: 1, price: { currencyCode: 'USD', value: price } },
      ],
    });
  }

  if (req.method === 'POST' && url.pathname === '/v3/domains/registration-quotes') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { domain, period = 1 } = JSON.parse(body || '{}');
    const price = PRICES[tldOf(domain)] ?? 1999;
    await sleep(400);
    return json(res, 200, {
      quoteToken: `qt_${randomUUID()}`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      domain,
      available: true,
      price: { currencyCode: 'USD', value: price },
      renewalPrice: { currencyCode: 'USD', value: price },
      period,
      requiredAgreements: [
        {
          agreementType: 'DNRA',
          title: 'el Acuerdo de Registro de Nombres de Dominio',
          url: 'https://www.godaddy.com/legal/agreements/domain-name-registration-agreement',
        },
        {
          agreementType: 'API_DPA',
          title: 'el Acuerdo de Procesamiento de Datos',
          url: 'https://www.godaddy.com/legal/agreements/data-processing-addendum',
        },
      ],
      irreversible: true,
    });
  }

  if (req.method === 'POST' && url.pathname === '/v3/domains/registrations') {
    return json(res, 202, {
      registrationId: randomUUID(),
      status: 'PENDING',
      links: [{ rel: 'poll' }],
    });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/v3/domains/registrations/')) {
    return json(res, 200, { status: 'COMPLETED', domain: '' });
  }

  if (
    req.method === 'POST' &&
    url.pathname.startsWith('/v3/domains/zones/') &&
    url.pathname.endsWith('/dns-records')
  ) {
    await sleep(1200); // visible "Configurando DNS" step in the UI
    return json(res, 201, { status: 'created' });
  }

  if (req.method === 'PATCH' && url.pathname.startsWith('/v1/domains/')) {
    return json(res, 200, {});
  }

  return json(res, 404, { code: 'NOT_FOUND', path: url.pathname });
});

server.listen(PORT, () => console.log(`GoDaddy mock listening on :${PORT}`));
