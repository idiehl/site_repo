#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
printf '%s\n' \
    '[deploy-dotnet] The in-place publish/rsync workflow has been retired.' \
    '[deploy-dotnet] Delegating to the immutable exact-commit release controller.' >&2
exec "${SCRIPT_DIR}/atlas-release.sh" "$@"
