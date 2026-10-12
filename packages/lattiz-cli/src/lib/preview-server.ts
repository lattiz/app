import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, normalize, resolve, sep } from 'node:path';
import { distDir, paths } from './paths';

const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'video/mp4',
};
// The favicons route.ts links to when a tenant has none.
const TENANT_STATIC = new Set(['/favicon.png', '/apple-touch-icon.png']);

export interface PreviewServer {
  url: string;
  port: number;
  broadcast(event: string): void;
  close(): Promise<void>;
}

export interface PreviewServerOptions {
  id: string;
  port: number;
  host?: string;
  /** `/site?…`: the composed page. */
  render(params: URLSearchParams): string;
  /** `/`: the dev shell; defaults to the page itself. */
  shell?(): string;
}

function send(
  res: ServerResponse,
  status: number,
  type: string,
  body: string | Buffer,
): void {
  const buf = typeof body === 'string' ? Buffer.from(body) : body;
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': buf.length,
    'Cache-Control': 'no-store',
  });
  res.end(buf);
}

/** Serves the composed page, the template's dist/ assets and a live-reload SSE stream. */
export function startPreviewServer(
  opts: PreviewServerOptions,
): Promise<PreviewServer> {
  const root = distDir(opts.id);
  const clients = new Set<ServerResponse>();
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (url.pathname === '/' && opts.shell)
        return send(res, 200, 'text/html; charset=utf-8', opts.shell());
      if (url.pathname === '/' || url.pathname === '/site') {
        return send(
          res,
          200,
          'text/html; charset=utf-8',
          opts.render(url.searchParams),
        );
      }
      if (url.pathname === '/events') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-store',
          Connection: 'keep-alive',
        });
        res.write(': connected\n\n');
        clients.add(res);
        req.on('close', () => clients.delete(res));
        return;
      }
      const file = TENANT_STATIC.has(url.pathname)
        ? resolve(paths.tenantSitesApp, url.pathname.slice(1))
        : normalize(resolve(root, `.${decodeURIComponent(url.pathname)}`));
      if (
        (!TENANT_STATIC.has(url.pathname) && !file.startsWith(root + sep)) ||
        !existsSync(file) ||
        !statSync(file).isFile()
      ) {
        return send(res, 404, 'text/plain', 'Not found');
      }
      return send(
        res,
        200,
        TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
        readFileSync(file),
      );
    } catch (error) {
      return send(
        res,
        500,
        'text/plain; charset=utf-8',
        `Error al componer la vista:\n${(error as Error).stack ?? error}`,
      );
    }
  });
  return new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(opts.port, opts.host ?? '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      done({
        port,
        url: `http://localhost:${port}`,
        broadcast(event) {
          for (const res of clients) res.write(`data: ${event}\n\n`);
        },
        close() {
          for (const res of clients) res.end();
          return new Promise((closed) => server.close(() => closed()));
        },
      });
    });
  });
}
