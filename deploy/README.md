# Lattiz API — production runtime (GCP VM)

Only the NestJS API (`apps/api`) runs on this VM, behind Caddy (automatic TLS) at
`https://api.lattiz.app`. The dashboard, landing, `tenant-sites` and
`template-previews` are on Vercel and are not touched here.

CI builds a `linux/amd64` image, pushes it to GHCR, then SSHes to the VM and runs
`deploy.sh` (an SSH forced command) which pulls, rolls the `api` service, health-checks,
and rolls back on failure. **CI only rolls the image** — the files in this folder
(`docker-compose.yml`, `Caddyfile`, `deploy.sh`, `deploy.conf`) are synced to the VM by
hand (see "Updating config").

## Files (repo `deploy/` → VM `/opt/lattiz/`)

| Repo | VM | Notes |
|---|---|---|
| `docker-compose.prod.yml` | `/opt/lattiz/docker-compose.yml` | renamed on copy |
| `Caddyfile` | `/opt/lattiz/Caddyfile` | |
| `deploy.sh` | `/opt/lattiz/deploy.sh` | mode `0755`, SSH forced command |
| `deploy.conf` | `/opt/lattiz/deploy.conf` | image allowlist prefix |

Also on the VM, not in the repo:

| File | Purpose |
|---|---|
| `/opt/lattiz/.env` | app secrets, mode `600`, read by the `api` container |
| `/opt/lattiz/compose.env` | holds `API_IMAGE=…`; written by `deploy.sh` |

All owned by the `deploy` user (it must read `.env` and write `compose.env`).

## One-time VM bootstrap

```bash
# 0. Prereqs (done by the developer, see repo CLAUDE deploy runbook):
#    - 2 GB swap, Docker installed, user `deploy` in the `docker` group
#    - static external IP; firewall allows tcp:80,443
#    - Cloudflare A record api -> <IP>, DNS only (grey cloud), no AAAA

sudo mkdir -p /opt/lattiz
sudo chown deploy:deploy /opt/lattiz

# 1. Copy config from the repo (as the deploy user):
install -m 0644 deploy/docker-compose.prod.yml /opt/lattiz/docker-compose.yml
install -m 0644 deploy/Caddyfile               /opt/lattiz/Caddyfile
install -m 0644 deploy/deploy.conf             /opt/lattiz/deploy.conf
install -m 0755 deploy/deploy.sh               /opt/lattiz/deploy.sh

# 2. Create /opt/lattiz/.env (secrets) and lock it down:
#    (copy values from your secret store — never commit them)
chmod 600 /opt/lattiz/.env
#    Production must include at least: TRUST_PROXY_HOPS=1 (1 hop = Caddy),
#    CORS_ORIGIN=https://app.lattiz.app,https://lattiz.app and the usual secrets.

# 3. Authenticate to GHCR so docker can pull (read:packages PAT):
echo "$GHCR_PAT" | docker login ghcr.io -u <github-user> --password-stdin

# 4. Seed the first image and bring the whole stack up:
echo 'API_IMAGE=ghcr.io/lattiz/app/api:latest' > /opt/lattiz/compose.env
docker compose --env-file /opt/lattiz/compose.env -f /opt/lattiz/docker-compose.yml up -d

# 5. Install the deploy key for the `deploy` user (public key, one line):
#    ~deploy/.ssh/authorized_keys
#    command="/opt/lattiz/deploy.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAA...
```

## Host hardening

- SSH: key-only, plus `/etc/ssh/sshd_config.d/10-lattiz-hardening.conf` (`PermitRootLogin no`,
  no X11/agent forwarding, `AllowTcpForwarding local`, `MaxAuthTries 3`). The `10-` prefix
  matters: sshd keeps the first value it reads, so it must sort before the cloud-image drop-ins.
  Port 22 stays open to the world because GitHub-hosted runners have no fixed IPs.
- `fail2ban` with the `sshd` jail (systemd backend): 5 failures in 10 min → 1 h ban.
- No project-wide SSH keys in GCP metadata: every key there becomes a passwordless-sudo user.
- Containers: `read_only`, `cap_drop: ALL` (Caddy keeps only `NET_BIND_SERVICE`),
  `no-new-privileges`, `pids_limit`; the API runs as the image's non-root `node` user.
- Caddy sets HSTS and the security headers; `/docs` (Swagger) is not mounted in production.

## How a deploy works

`deploy.sh` receives the image ref in `$SSH_ORIGINAL_COMMAND`, validates it (strict regex +
the `ALLOWED_IMAGE_PREFIX` from `deploy.conf`), takes an `flock`, records the current
`API_IMAGE`, pulls the new one, writes `compose.env`, runs `up -d api`, and waits up to 90s
for `healthy`. On failure it restores the previous image and exits non-zero; on success it
prunes images older than 168h.

Manual run (equivalent to what CI does over SSH):

```bash
SSH_ORIGINAL_COMMAND='ghcr.io/lattiz/app/api:sha-abc1234' /opt/lattiz/deploy.sh
```

## Roll back by hand

```bash
docker images 'ghcr.io/lattiz/app/api' --format '{{.Tag}}'          # pick a prior sha-… tag
SSH_ORIGINAL_COMMAND='ghcr.io/lattiz/app/api:sha-<older>' /opt/lattiz/deploy.sh
# or directly:
echo 'API_IMAGE=ghcr.io/lattiz/app/api:sha-<older>' > /opt/lattiz/compose.env
docker compose --env-file /opt/lattiz/compose.env -f /opt/lattiz/docker-compose.yml up -d api
```

## Rotate secrets / change env

```bash
# edit /opt/lattiz/.env, then force a recreate so the container re-reads env
# (a plain `restart` does NOT re-read env_file):
docker compose --env-file /opt/lattiz/compose.env -f /opt/lattiz/docker-compose.yml up -d --force-recreate api
```

## Update compose / Caddy config (manual — CI never touches these)

```bash
install -m 0644 deploy/docker-compose.prod.yml /opt/lattiz/docker-compose.yml
install -m 0644 deploy/Caddyfile               /opt/lattiz/Caddyfile
docker compose --env-file /opt/lattiz/compose.env -f /opt/lattiz/docker-compose.yml up -d
# Caddy only: `... up -d caddy`. Reload just the Caddyfile without downtime:
docker compose --env-file /opt/lattiz/compose.env -f /opt/lattiz/docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## Logs & status

```bash
docker compose --env-file /opt/lattiz/compose.env -f /opt/lattiz/docker-compose.yml ps
docker compose --env-file /opt/lattiz/compose.env -f /opt/lattiz/docker-compose.yml logs -f --tail=100 api
docker compose --env-file /opt/lattiz/compose.env -f /opt/lattiz/docker-compose.yml logs -f --tail=100 caddy
docker stats --no-stream
```

After `sudo reboot` the stack returns on its own (`restart: unless-stopped`) and Caddy's
certificates persist in the `caddy_data` named volume.
