// Public surface of @lattiz/api-client. Everything here is generated from the
// API's openapi.json (see `generate:client`); do not hand-write API types.

// SDK functions + request/response types (re-exported by the generated index).
export * from './generated';

// TanStack Query option factories + query keys (e.g. `meControllerMeOptions`).
export * from './generated/@tanstack/react-query.gen';

// The shared fetch client instance. Configure its base URL / auth once at
// app startup via `client.setConfig(...)` / `client.interceptors`.
export { client } from './generated/client.gen';
export { createClient, createConfig } from './generated/client';
export type { Client, Config, Options } from './generated/client';
