#!/usr/bin/env bash
set -euo pipefail

# Deploy Atlas.Web.VNext to /opt/atlas/web-vnext.
#
# Usage:
#   ./deploy/deploy-main-site-vnext.sh
#
# Optional env vars:
#   ATLAS_SRC=/var/www/atlasuniversalis.com
#   ATLAS_DEST=/opt/atlas/web-vnext
#   ATLAS_BACKUP=/opt/atlas/backups/web-vnext
#   DOTNET_CONFIG=Release

ATLAS_SRC="${ATLAS_SRC:-/var/www/atlasuniversalis.com}"
ATLAS_DEST="${ATLAS_DEST:-/opt/atlas/web-vnext}"
ATLAS_BACKUP="${ATLAS_BACKUP:-/opt/atlas/backups/web-vnext}"
DOTNET_CONFIG="${DOTNET_CONFIG:-Release}"
SERVICE_NAME="${SERVICE_NAME:-atlas-web-vnext}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:5003/healthz}"

PROJECT_PATH="${ATLAS_SRC}/src/Atlas.Web.VNext/Atlas.Web.VNext.csproj"
PUBLISH_DIR="${ATLAS_SRC}/publish/web-vnext"

echo "[vnext-deploy] Building ${PROJECT_PATH}"
dotnet publish "${PROJECT_PATH}" -c "${DOTNET_CONFIG}" -o "${PUBLISH_DIR}" --no-self-contained

if [ -d "${ATLAS_DEST}" ]; then
  ts="$(date +%Y%m%d-%H%M%S)"
  backup_dir="${ATLAS_BACKUP}/${ts}"
  echo "[vnext-deploy] Backing up ${ATLAS_DEST} -> ${backup_dir}"
  mkdir -p "${backup_dir}"
  cp -a "${ATLAS_DEST}/." "${backup_dir}/"
fi

echo "[vnext-deploy] Stopping ${SERVICE_NAME}"
sudo systemctl stop "${SERVICE_NAME}" || true

echo "[vnext-deploy] Syncing published output"
mkdir -p "${ATLAS_DEST}"
rsync -a --delete "${PUBLISH_DIR}/" "${ATLAS_DEST}/"
sudo chown -R www-data:www-data "${ATLAS_DEST}"

echo "[vnext-deploy] Starting ${SERVICE_NAME}"
sudo systemctl start "${SERVICE_NAME}"

echo "[vnext-deploy] Health check ${HEALTH_URL}"
for _ in {1..20}; do
  if curl -sf "${HEALTH_URL}" >/dev/null; then
    echo "[vnext-deploy] Healthy"
    exit 0
  fi
  sleep 1
done

echo "[vnext-deploy] Health check failed" >&2
exit 1
