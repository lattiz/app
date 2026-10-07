# syntax=docker/dockerfile:1
# Build context is the repo root: docker build -f apps/api/Dockerfile .

# ── Base: Node 24 (matches .nvmrc) + pnpm 11 via corepack ─────────────────
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /app

# ── Prune: isolate @lattiz/api + its deps into a minimal workspace ────────
FROM base AS pruner
# Pin turbo to the repo's major; prune output format is stable across 2.x.
RUN npm i -g turbo@2.5.8
COPY . .
RUN turbo prune @lattiz/api --docker

# ── Build: install all deps (incl. dev) and compile the API to dist/ ──────
FROM base AS builder
# Manifests + lockfile first for a cache-friendly install layer. The pruned
# pnpm-workspace.yaml keeps overrides (React pin) and allowBuilds (pnpm 11
# blocks build scripts unless listed), so the image uses the same policy as local.
COPY --from=pruner /app/out/json/ ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./
# Nest compile only — no OpenAPI generation, no network, no secrets.
RUN pnpm --filter @lattiz/api run build
# Self-contained prod-only tree. --legacy: @lattiz/api has no injected workspace
# deps, and pnpm 11 refuses the default deploy path without inject-workspace-packages.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @lattiz/api deploy --prod --legacy /prod

# ── Runtime: slim, non-root, only dist/ + production dependencies ─────────
FROM node:24-bookworm-slim AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY --from=builder --chown=node:node /prod/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/package.json ./package.json
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist
USER node
EXPOSE 3000
# slim has no curl; probe /health with Node's global fetch.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD ["node","-e","fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node","dist/main.js"]
