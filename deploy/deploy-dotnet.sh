#!/usr/bin/env bash
set -euo pipefail

# Atlas Universalis — .NET Deployment Script
# Usage:
#   ./deploy-dotnet.sh [web|apply|forge|all]
#   ./deploy-dotnet.sh --rollback [web|apply|forge|all]
#
# Environment variables (optional overrides):
#   ATLAS_SRC    — repo root         (default: /var/www/atlasuniversalis.com)
#   ATLAS_DEST   — install prefix    (default: /opt/atlas)
#   ATLAS_BACKUP — backup prefix     (default: /opt/atlas/backups)
#   DOTNET_CONFIG — build config     (default: Release)

ATLAS_SRC="${ATLAS_SRC:-/var/www/atlasuniversalis.com}"
ATLAS_DEST="${ATLAS_DEST:-/opt/atlas}"
ATLAS_BACKUP="${ATLAS_BACKUP:-/opt/atlas/backups}"
DOTNET_CONFIG="${DOTNET_CONFIG:-Release}"

APPS=("web" "apply" "forge")
PROJECTS=( "src/Atlas.Web/Atlas.Web.csproj"
           "src/Atlas.Apply/Atlas.Apply.csproj"
           "src/Atlas.Forge/Atlas.Forge.csproj" )
SERVICES=( "atlas-web" "atlas-apply" "atlas-forge" )
HEALTH_PORTS=( 5000 5010 5020 )

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC}  $*"; }
fail() { echo -e "${RED}[FAIL]${NC}  $*" >&2; exit 1; }

usage() {
    echo "Usage: $0 [--rollback] <web|apply|forge|all>"
    exit 1
}

# ---------------------------------------------------------------------------
# Resolve which apps to operate on
# ---------------------------------------------------------------------------
resolve_targets() {
    local target="${1:-all}"
    case "$target" in
        web)   INDICES=(0) ;;
        apply) INDICES=(1) ;;
        forge) INDICES=(2) ;;
        all)   INDICES=(0 1 2) ;;
        *)     usage ;;
    esac
}

# ---------------------------------------------------------------------------
# Build & publish
# ---------------------------------------------------------------------------
build_app() {
    local idx=$1
    local project="${PROJECTS[$idx]}"
    local app="${APPS[$idx]}"
    local publish_dir="${ATLAS_SRC}/publish/${app}"

    log "Building ${app} from ${project} ..."
    dotnet publish "${ATLAS_SRC}/${project}" \
        -c "${DOTNET_CONFIG}" \
        -o "${publish_dir}" \
        --no-self-contained
}

# ---------------------------------------------------------------------------
# Backup current install
# ---------------------------------------------------------------------------
backup_app() {
    local idx=$1
    local app="${APPS[$idx]}"
    local dest="${ATLAS_DEST}/${app}"
    local ts
    ts=$(date +%Y%m%d-%H%M%S)
    local backup_dir="${ATLAS_BACKUP}/${app}/${ts}"

    if [ -d "${dest}" ]; then
        log "Backing up ${dest} → ${backup_dir}"
        mkdir -p "${backup_dir}"
        cp -a "${dest}/." "${backup_dir}/"
    else
        warn "No existing install at ${dest}; skipping backup"
    fi
}

# ---------------------------------------------------------------------------
# Deploy (rsync published output → /opt/atlas/<app>/)
# ---------------------------------------------------------------------------
deploy_app() {
    local idx=$1
    local app="${APPS[$idx]}"
    local service="${SERVICES[$idx]}"
    local publish_dir="${ATLAS_SRC}/publish/${app}/"
    local dest="${ATLAS_DEST}/${app}/"

    log "Stopping ${service} ..."
    sudo systemctl stop "${service}" || warn "${service} was not running"

    log "Syncing ${publish_dir} → ${dest}"
    mkdir -p "${dest}"
    rsync -a --delete "${publish_dir}" "${dest}"

    log "Starting ${service} ..."
    sudo systemctl start "${service}"
}

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
health_check() {
    local idx=$1
    local app="${APPS[$idx]}"
    local port="${HEALTH_PORTS[$idx]}"
    local url="http://127.0.0.1:${port}/healthz"
    local retries=10
    local wait_sec=2

    log "Health-checking ${app} at ${url} ..."
    for ((i=1; i<=retries; i++)); do
        if curl -sf --max-time 5 "${url}" > /dev/null 2>&1; then
            log "${app} is healthy"
            return 0
        fi
        warn "Attempt ${i}/${retries} — waiting ${wait_sec}s ..."
        sleep "${wait_sec}"
    done

    fail "${app} failed health check after ${retries} attempts"
}

# ---------------------------------------------------------------------------
# Rollback
# ---------------------------------------------------------------------------
rollback_app() {
    local idx=$1
    local app="${APPS[$idx]}"
    local service="${SERVICES[$idx]}"
    local dest="${ATLAS_DEST}/${app}"
    local backup_root="${ATLAS_BACKUP}/${app}"

    if [ ! -d "${backup_root}" ]; then
        fail "No backups found for ${app} at ${backup_root}"
    fi

    local latest
    latest=$(ls -1t "${backup_root}" | head -1)
    if [ -z "${latest}" ]; then
        fail "No backup snapshots in ${backup_root}"
    fi

    local backup_dir="${backup_root}/${latest}"
    log "Rolling back ${app} from ${backup_dir} ..."

    sudo systemctl stop "${service}" || warn "${service} was not running"
    rsync -a --delete "${backup_dir}/" "${dest}/"
    sudo systemctl start "${service}"

    health_check "${idx}"
    log "Rollback of ${app} complete (restored ${latest})"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
ROLLBACK=false
TARGET="all"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --rollback) ROLLBACK=true; shift ;;
        -h|--help)  usage ;;
        *)          TARGET="$1"; shift ;;
    esac
done

resolve_targets "${TARGET}"

if [ "${ROLLBACK}" = true ]; then
    log "=== ROLLBACK MODE ==="
    for idx in "${INDICES[@]}"; do
        rollback_app "${idx}"
    done
    log "=== Rollback complete ==="
    exit 0
fi

log "=== Deploying: ${APPS[*]:0} (targets: ${INDICES[*]}) ==="

for idx in "${INDICES[@]}"; do
    build_app "${idx}"
done

for idx in "${INDICES[@]}"; do
    backup_app "${idx}"
    deploy_app "${idx}"
done

for idx in "${INDICES[@]}"; do
    health_check "${idx}"
done

log "=== Deployment complete ==="
