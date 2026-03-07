#!/usr/bin/env bash

usage() {
  cat <<'EOF'
Usage:
  ./deploy/switch-main-site-backend.sh --target <legacy|web|vnext> [options]

Options:
  --route-map <path>           Route map file (default: /etc/nginx/conf.d/atlas-route-map.conf)
  --readiness-packet <path>    Required when target=vnext; must contain "Overall: PASS"
  --dry-run                    Validate and preview update without writing file
  --skip-nginx-reload          Write route map but skip `nginx -t` and reload
  --help                       Show this help
EOF
}

target=""
route_map="/etc/nginx/conf.d/atlas-route-map.conf"
readiness_packet=""
dry_run=false
skip_nginx_reload=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      target="${2:-}"
      shift 2
      ;;
    --route-map)
      route_map="${2:-}"
      shift 2
      ;;
    --readiness-packet)
      readiness_packet="${2:-}"
      shift 2
      ;;
    --dry-run)
      dry_run=true
      shift
      ;;
    --skip-nginx-reload)
      skip_nginx_reload=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "${target}" ]]; then
  echo "Missing required --target argument" >&2
  usage
  exit 1
fi

backend=""
case "${target}" in
  legacy) backend="atlas_legacy" ;;
  web)    backend="atlas_dotnet_web" ;;
  vnext)  backend="atlas_dotnet_web_vnext" ;;
  *)
    echo "Unsupported target: ${target}" >&2
    usage
    exit 1
    ;;
esac

if [[ ! -f "${route_map}" ]]; then
  echo "Route map file not found: ${route_map}" >&2
  exit 1
fi

if [[ "${target}" == "vnext" ]]; then
  if [[ -z "${readiness_packet}" ]]; then
    echo "Switching to vnext requires --readiness-packet" >&2
    exit 1
  fi
  if [[ ! -f "${readiness_packet}" ]]; then
    echo "Readiness packet not found: ${readiness_packet}" >&2
    exit 1
  fi
  if ! grep -Eq "Overall:[[:space:]]+PASS" "${readiness_packet}"; then
    echo "Readiness packet does not show a passing gate result: ${readiness_packet}" >&2
    exit 1
  fi
fi

tmp_file="$(mktemp)"
cleanup() {
  rm -f "${tmp_file}"
}
trap cleanup EXIT

awk -v backend="${backend}" '
  BEGIN { in_main_map=0; replaced=0 }
  {
    if ($0 ~ /^map \$request_uri \$main_backend[[:space:]]*\{/) {
      in_main_map=1
    }
    if (in_main_map == 1 && $1 == "default" && replaced == 0) {
      $0 = "    default " backend ";"
      replaced = 1
      in_main_map = 0
    }
    print
  }
  END {
    if (replaced == 0) {
      exit 2
    }
  }
' "${route_map}" > "${tmp_file}" || {
  echo "Failed to update main backend mapping in ${route_map}" >&2
  exit 1
}

if cmp -s "${route_map}" "${tmp_file}"; then
  echo "No change required. main_backend already points to ${backend}."
  exit 0
fi

if [[ "${dry_run}" == "true" ]]; then
  echo "Dry run successful. main_backend would be set to ${backend} in ${route_map}."
  exit 0
fi

backup_path="${route_map}.bak.$(date +%Y%m%d-%H%M%S)"
cp "${route_map}" "${backup_path}"
mv "${tmp_file}" "${route_map}"
trap - EXIT

echo "Updated ${route_map}. Backup created at ${backup_path}."

if [[ "${skip_nginx_reload}" == "true" ]]; then
  echo "Skipping nginx validation/reload by request."
  exit 0
fi

if ! nginx -t; then
  echo "nginx config test failed. Restoring backup." >&2
  cp "${backup_path}" "${route_map}"
  exit 1
fi

nginx -s reload
echo "Switched main_backend to ${backend} and reloaded nginx."
