#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
printf '%s\n' '[deploy-main-site-vnext] Retired: use immutable prepare/activate with an exact commit.' >&2
exec "${SCRIPT_DIR}/atlas-release.sh" "$@"
