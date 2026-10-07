#!/usr/bin/env bash
# Installed on the VM as /opt/lattiz/deploy.sh and pinned as an SSH forced command:
#   command="/opt/lattiz/deploy.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty <pubkey>
#
# The image ref to deploy arrives in $SSH_ORIGINAL_COMMAND and is the ONLY input
# we trust from the client; everything else is validated locally. A leaked key
# must not be able to run an arbitrary image, so the ref is checked against both
# a strict format regex and an allowlisted prefix from /opt/lattiz/deploy.conf.
set -euo pipefail

LATTIZ_DIR=/opt/lattiz
COMPOSE_FILE="$LATTIZ_DIR/docker-compose.yml"
ENV_FILE="$LATTIZ_DIR/compose.env"
CONF_FILE="$LATTIZ_DIR/deploy.conf"
LOCK_FILE="$LATTIZ_DIR/.deploy.lock"
HEALTH_TIMEOUT=90

log() { echo "[deploy] $*" >&2; }
fail() { log "ERROR: $*"; exit 1; }

compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

# 1. Validate the requested image ref.
IMAGE_REF="${SSH_ORIGINAL_COMMAND:-}"
IMAGE_REF="$(printf '%s' "$IMAGE_REF" | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
[ -n "$IMAGE_REF" ] || fail "no image ref provided"

# Strict shape: ghcr.io/<owner>/<repo-path>:<tag>, conservative charset only.
if ! printf '%s' "$IMAGE_REF" | grep -Eq '^ghcr\.io/[a-z0-9._-]+/[a-z0-9._/-]+:[A-Za-z0-9._-]+$'; then
  fail "image ref failed format check: $IMAGE_REF"
fi

# Allowlisted prefix so only our own image can be deployed.
[ -r "$CONF_FILE" ] || fail "missing $CONF_FILE"
ALLOWED_PREFIX="$(grep -E '^ALLOWED_IMAGE_PREFIX=' "$CONF_FILE" | head -1 | cut -d= -f2- || true)"
[ -n "$ALLOWED_PREFIX" ] || fail "ALLOWED_IMAGE_PREFIX not set in $CONF_FILE"
case "$IMAGE_REF" in
  "$ALLOWED_PREFIX"*) : ;;
  *) fail "image ref not under allowed prefix ($ALLOWED_PREFIX): $IMAGE_REF" ;;
esac

# 2. Serialize deploys.
exec 9>"$LOCK_FILE"
flock -n 9 || fail "another deploy is already in progress"

# Remember the currently running image for rollback.
PREV_IMAGE=""
if [ -r "$ENV_FILE" ]; then
  PREV_IMAGE="$(grep -E '^API_IMAGE=' "$ENV_FILE" | head -1 | cut -d= -f2- || true)"
fi
log "current image:  ${PREV_IMAGE:-<none>}"
log "requested image: $IMAGE_REF"

# 3. Pull the new image before touching the running service.
log "pulling $IMAGE_REF"
docker pull "$IMAGE_REF" >&2 || fail "docker pull failed for $IMAGE_REF"

# 4. Point compose at the new image and roll ONLY the api service (Caddy untouched).
printf 'API_IMAGE=%s\n' "$IMAGE_REF" > "$ENV_FILE"
log "starting api on the new image"
compose up -d api >&2

# 5. Wait for the container to report healthy.
wait_healthy() {
  local cid status deadline
  cid="$(compose ps -q api)"
  [ -n "$cid" ] || return 1
  deadline=$(( SECONDS + HEALTH_TIMEOUT ))
  while [ "$SECONDS" -lt "$deadline" ]; do
    status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || echo unknown)"
    case "$status" in
      healthy) return 0 ;;
      exited|dead) return 1 ;;
    esac
    sleep 3
  done
  return 1
}

if wait_healthy; then
  log "api is healthy on $IMAGE_REF"
  # 6. Success: reclaim disk from superseded images.
  docker image prune -af --filter 'until=168h' >&2 || true
  log "deploy OK"
  exit 0
fi

# Failure: restore the previous image if there was one.
log "api did not become healthy within ${HEALTH_TIMEOUT}s"
compose logs --tail=40 api >&2 || true
if [ -n "$PREV_IMAGE" ]; then
  log "rolling back to $PREV_IMAGE"
  printf 'API_IMAGE=%s\n' "$PREV_IMAGE" > "$ENV_FILE"
  compose up -d api >&2 || true
else
  log "no previous image to roll back to; leaving api as-is"
fi
fail "deploy failed"
