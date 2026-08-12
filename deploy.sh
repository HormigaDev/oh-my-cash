#!/usr/bin/env bash

set -Eeuo pipefail

APP_NAME="omc"

if [[ $# -lt 1 ]]; then
    printf 'Usage: %s <domain>\n' "$0" >&2
    printf 'Example: %s foo.example.com\n' "$0" >&2
    exit 1
fi

DOMAIN="$1"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FRONTEND_DIR="${ROOT_DIR}/frontend"
FRONTEND_DIST="${FRONTEND_DIR}/dist/pwa"

WEB_ROOT="/var/www/omc"
RELEASES_DIR="${WEB_ROOT}/releases"
CURRENT_LINK="${WEB_ROOT}/current"

NGINX_SOURCE="${ROOT_DIR}/nginx/omc.conf"
NGINX_TARGET="/etc/nginx/sites-available/omc.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/omc.conf"

RELEASE_ID="$(date -u +%Y%m%d%H%M%S)"
FRONTEND_RELEASE="${RELEASES_DIR}/${RELEASE_ID}"

KEEP_RELEASES=3

NGINX_RENDERED=""

log() {
    printf '\n\033[1;36m==> %s\033[0m\n' "$1"
}

fail() {
    printf '\n\033[1;31mERROR: %s\033[0m\n' "$1" >&2
    exit 1
}

cleanup() {
    if [[ -n "${NGINX_RENDERED}" && -f "${NGINX_RENDERED}" ]]; then
        rm -f "${NGINX_RENDERED}"
    fi
}

trap cleanup EXIT

command -v docker >/dev/null \
    || fail "docker is not installed"

docker compose version >/dev/null \
    || fail "docker compose is not available"

command -v pnpm >/dev/null \
    || fail "pnpm is not installed"

command -v rsync >/dev/null \
    || fail "rsync is not installed"

command -v nginx >/dev/null \
    || fail "nginx is not installed"

cd "${ROOT_DIR}"

log "Deployment domain: ${DOMAIN}"

log "Installing frontend dependencies"

(
    cd "${FRONTEND_DIR}"

    pnpm install \
        --frozen-lockfile
)

log "Validating frontend"

(
    cd "${FRONTEND_DIR}"

    pnpm lint

    if pnpm run | grep -q "typecheck"; then
        pnpm typecheck
    fi
)

log "Building PWA"

(
    cd "${FRONTEND_DIR}"

    pnpm exec quasar \
        build \
        -m pwa
)

log "Building backend Docker image"

docker compose build backend

log "Running database migrations"

docker compose run \
    --rm \
    backend \
    omc-migration up

log "Starting backend"

docker compose up \
    -d \
    --remove-orphans \
    backend

log "Waiting for backend health"

for attempt in $(seq 1 30); do
    health="$(
        docker inspect \
            --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' \
            omc-backend \
            2>/dev/null \
            || true
    )"

    if [[ "${health}" == "healthy" ]]; then
        break
    fi

    if [[ "${health}" == "unhealthy" ]]; then
        docker compose logs \
            --tail=100 \
            backend

        fail "backend became unhealthy"
    fi

    sleep 1
done

health="$(
    docker inspect \
        --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' \
        omc-backend
)"

[[ "${health}" == "healthy" ]] \
    || fail "backend did not become healthy"

log "Creating frontend release ${RELEASE_ID}"

sudo mkdir -p \
    "${RELEASES_DIR}" \
    "${FRONTEND_RELEASE}"

sudo rsync \
    -a \
    --delete \
    "${FRONTEND_DIST}/" \
    "${FRONTEND_RELEASE}/"

sudo chown -R \
    root:www-data \
    "${FRONTEND_RELEASE}"

sudo find \
    "${FRONTEND_RELEASE}" \
    -type d \
    -exec chmod 755 {} \;

sudo find \
    "${FRONTEND_RELEASE}" \
    -type f \
    -exec chmod 644 {} \;

log "Publishing frontend release"

sudo ln \
    -sfn \
    "${FRONTEND_RELEASE}" \
    "${CURRENT_LINK}"

if [[ -e "${NGINX_TARGET}" ]]; then
    log "Nginx configuration already exists, skipping installation"
else
    [[ -f "${NGINX_SOURCE}" ]] \
        || fail "nginx configuration not found at ${NGINX_SOURCE}"

    grep -qF '$URL_DEL_BACKEND' "${NGINX_SOURCE}" \
        || fail 'placeholder $URL_DEL_BACKEND not found in nginx/omc.conf'

    NGINX_RENDERED="$(mktemp)"

    log "Rendering Nginx configuration for ${DOMAIN}"

    sed \
        "s|\$URL_DEL_BACKEND|${DOMAIN}|g" \
        "${NGINX_SOURCE}" \
        > "${NGINX_RENDERED}"

    if grep -qF '$URL_DEL_BACKEND' "${NGINX_RENDERED}"; then
        fail 'not all $URL_DEL_BACKEND placeholders were replaced'
    fi

    log "Installing Nginx configuration"

    sudo install \
        -o root \
        -g root \
        -m 0644 \
        "${NGINX_RENDERED}" \
        "${NGINX_TARGET}"
fi

if [[ ! -e "${NGINX_ENABLED}" ]]; then
    log "Enabling Nginx configuration"

    sudo ln \
        -s \
        "${NGINX_TARGET}" \
        "${NGINX_ENABLED}"
fi

log "Validating Nginx"

sudo nginx -t

log "Reloading Nginx"

sudo systemctl reload nginx

log "Removing old frontend releases"

mapfile -t old_releases < <(
    find "${RELEASES_DIR}" \
        -mindepth 1 \
        -maxdepth 1 \
        -type d \
        -printf '%f\n' \
    | sort -r \
    | tail -n "+$((KEEP_RELEASES + 1))"
)

for release in "${old_releases[@]}"; do
    sudo rm -rf \
        "${RELEASES_DIR}/${release}"
done

log "Cleaning unused Docker build cache"

docker builder prune \
    --force \
    --filter "until=168h" \
    >/dev/null

log "Deployment completed"

printf '\nDomain:\n%s\n' "${DOMAIN}"

printf '\nBackend:\n'
docker compose ps backend

printf '\nFrontend release:\n'
readlink -f "${CURRENT_LINK}"

printf '\nNginx configuration:\n'
printf '%s\n' "${NGINX_TARGET}"