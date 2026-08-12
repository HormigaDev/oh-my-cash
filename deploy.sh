#!/usr/bin/env bash

set -Eeuo pipefail

APP_NAME="omc"
SERVICE_NAME="${APP_NAME}.service"

if [[ $# -lt 1 ]]; then
    printf 'Usage: %s <domain>\n' "$0" >&2
    printf 'Example: %s foo.example.com\n' "$0" >&2
    exit 1
fi

DOMAIN="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FRONTEND_DIR="${ROOT_DIR}/frontend"
FRONTEND_DIST="${FRONTEND_DIR}/dist/pwa"
BACKEND_BINARY="${ROOT_DIR}/target/release/oh-my-cash"
MIGRATION_BINARY="${ROOT_DIR}/target/release/migration"

WEB_ROOT="/var/www/omc"
RELEASES_DIR="${WEB_ROOT}/releases"
CURRENT_LINK="${WEB_ROOT}/current"

BACKEND_ROOT="/opt/omc"
BACKEND_RELEASES_DIR="${BACKEND_ROOT}/releases"
BACKEND_CURRENT_LINK="${BACKEND_ROOT}/current"
BACKEND_ENV_FILE="/etc/omc/backend.env"
SERVICE_SOURCE="${ROOT_DIR}/omc.service"
SERVICE_TARGET="/etc/systemd/system/${SERVICE_NAME}"

NGINX_SOURCE="${ROOT_DIR}/nginx/omc.conf"
NGINX_TARGET="/etc/nginx/sites-available/omc.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/omc.conf"

RELEASE_ID="$(date -u +%Y%m%d%H%M%S)"
FRONTEND_RELEASE="${RELEASES_DIR}/${RELEASE_ID}"
BACKEND_RELEASE="${BACKEND_RELEASES_DIR}/${RELEASE_ID}"

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

remove_old_releases() {
    local releases_dir="$1"
    mapfile -t old_releases < <(
        find "${releases_dir}" \
            -mindepth 1 \
            -maxdepth 1 \
            -type d \
            -printf '%f\n' \
        | sort -r \
        | tail -n "+$((KEEP_RELEASES + 1))"
    )

    for release in "${old_releases[@]}"; do
        sudo rm -rf "${releases_dir}/${release}"
    done
}

run_migrations() {
    sudo systemd-run \
        --quiet \
        --wait \
        --pipe \
        --property="User=omc" \
        --property="Group=omc" \
        --property="WorkingDirectory=${BACKEND_CURRENT_LINK}" \
        --property="EnvironmentFile=${BACKEND_ENV_FILE}" \
        "${BACKEND_CURRENT_LINK}/omc-migration" \
        up
}

ensure_runtime_user() {
    local runtime_user="omc"
    local runtime_group="omc"

    if ! getent group "${runtime_group}" >/dev/null; then
        log "Creating system group ${runtime_group}"
        sudo groupadd --system "${runtime_group}"
    fi

    if ! id -u "${runtime_user}" >/dev/null 2>&1; then
        log "Creating system user ${runtime_user}"
        sudo useradd \
            --system \
            --gid "${runtime_group}" \
            --home-dir "${BACKEND_ROOT}" \
            --no-create-home \
            --shell /usr/sbin/nologin \
            "${runtime_user}"
    elif [[ "$(id -gn "${runtime_user}")" != "${runtime_group}" ]]; then
        log "Assigning ${runtime_user} to primary group ${runtime_group}"
        sudo usermod --gid "${runtime_group}" "${runtime_user}"
    fi

    sudo install -d -o "${runtime_user}" -g "${runtime_group}" -m 0755 "${BACKEND_ROOT}"
}

trap cleanup EXIT

command -v cargo >/dev/null || fail "cargo is not installed"
command -v pnpm >/dev/null || fail "pnpm is not installed"
command -v rsync >/dev/null || fail "rsync is not installed"
command -v nginx >/dev/null || fail "nginx is not installed"
command -v systemctl >/dev/null || fail "systemd is not available"
command -v curl >/dev/null || fail "curl is not installed"

[[ -f "${BACKEND_ENV_FILE}" ]] || fail "backend environment file not found: ${BACKEND_ENV_FILE}"
[[ -f "${SERVICE_SOURCE}" ]] || fail "systemd service file not found: ${SERVICE_SOURCE}"

cd "${ROOT_DIR}"

log "Deployment domain: ${DOMAIN}"

log "Installing frontend dependencies"
(
    cd "${FRONTEND_DIR}"
    pnpm install --frozen-lockfile
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
    pnpm exec quasar build -m pwa
)

log "Building backend incrementally with pinned Rust toolchain"
cargo build --release --locked --bin oh-my-cash
cargo build --release --locked -p migration --bin migration

[[ -x "${BACKEND_BINARY}" ]] || fail "backend binary was not built"
[[ -x "${MIGRATION_BINARY}" ]] || fail "migration binary was not built"

log "Preparing bare-metal backend runtime"
ensure_runtime_user

sudo install -d -o omc -g omc -m 0755 "${BACKEND_RELEASE}" "${BACKEND_RELEASES_DIR}"
sudo install -o omc -g omc -m 0755 "${BACKEND_BINARY}" "${BACKEND_RELEASE}/oh-my-cash"
sudo install -o omc -g omc -m 0755 "${MIGRATION_BINARY}" "${BACKEND_RELEASE}/omc-migration"
sudo ln -sfn "${BACKEND_RELEASE}" "${BACKEND_CURRENT_LINK}"

log "Installing systemd service"
sudo install -o root -g root -m 0644 "${SERVICE_SOURCE}" "${SERVICE_TARGET}"
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}" >/dev/null

log "Running database migrations"
run_migrations

log "Restarting backend service"
sudo systemctl restart "${SERVICE_NAME}"

log "Waiting for backend health"
for attempt in $(seq 1 30); do
    if ! sudo systemctl is-active --quiet "${SERVICE_NAME}"; then
        sudo journalctl -u "${SERVICE_NAME}" --no-pager -n 100
        fail "backend service stopped unexpectedly"
    fi

    if curl --fail --silent --show-error "http://127.0.0.1:8383/health/ready" >/dev/null; then
        break
    fi

    sleep 1
done

curl --fail --silent --show-error "http://127.0.0.1:8383/health/ready" >/dev/null \
    || fail "backend did not become healthy"

log "Creating frontend release ${RELEASE_ID}"
sudo mkdir -p "${RELEASES_DIR}" "${FRONTEND_RELEASE}"
sudo rsync -a --delete "${FRONTEND_DIST}/" "${FRONTEND_RELEASE}/"
sudo chown -R root:www-data "${FRONTEND_RELEASE}"
sudo find "${FRONTEND_RELEASE}" -type d -exec chmod 755 {} \;
sudo find "${FRONTEND_RELEASE}" -type f -exec chmod 644 {} \;

log "Publishing frontend release"
sudo ln -sfn "${FRONTEND_RELEASE}" "${CURRENT_LINK}"

if [[ -e "${NGINX_TARGET}" ]]; then
    log "Nginx configuration already exists, skipping installation"
else
    [[ -f "${NGINX_SOURCE}" ]] || fail "nginx configuration not found at ${NGINX_SOURCE}"
    grep -qF '$URL_DEL_BACKEND' "${NGINX_SOURCE}" \
        || fail 'placeholder $URL_DEL_BACKEND not found in nginx/omc.conf'

    NGINX_RENDERED="$(mktemp)"
    log "Rendering Nginx configuration for ${DOMAIN}"
    sed "s|\$URL_DEL_BACKEND|${DOMAIN}|g" "${NGINX_SOURCE}" > "${NGINX_RENDERED}"

    if grep -qF '$URL_DEL_BACKEND' "${NGINX_RENDERED}"; then
        fail 'not all $URL_DEL_BACKEND placeholders were replaced'
    fi

    log "Installing Nginx configuration"
    sudo install -o root -g root -m 0644 "${NGINX_RENDERED}" "${NGINX_TARGET}"
fi

if [[ ! -e "${NGINX_ENABLED}" ]]; then
    log "Enabling Nginx configuration"
    sudo ln -s "${NGINX_TARGET}" "${NGINX_ENABLED}"
fi

log "Validating Nginx"
sudo nginx -t

log "Reloading Nginx"
sudo systemctl reload nginx

log "Removing old releases"
remove_old_releases "${RELEASES_DIR}"
remove_old_releases "${BACKEND_RELEASES_DIR}"

log "Deployment completed"
printf '\nDomain:\n%s\n' "${DOMAIN}"
printf '\nBackend:\n'
sudo systemctl --no-pager --full status "${SERVICE_NAME}"
printf '\nFrontend release:\n'
readlink -f "${CURRENT_LINK}"
printf '\nBackend release:\n'
readlink -f "${BACKEND_CURRENT_LINK}"
printf '\nNginx configuration:\n%s\n' "${NGINX_TARGET}"
