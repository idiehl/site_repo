#!/usr/bin/env bash
set -euo pipefail

# Atlas Universalis immutable web release controller. The production source
# checkout is never a build input and public traffic changes only in `activate`.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
REPOSITORY_URL="${ATLAS_REPOSITORY_URL:-https://github.com/idiehl/site_repo.git}"
RELEASE_ROOT="${ATLAS_RELEASE_ROOT:-/opt/atlas/releases/web}"
STATE_ROOT="${ATLAS_RELEASE_STATE_ROOT:-/var/lib/atlas-releases/web}"
MIRROR_PATH="${ATLAS_RELEASE_MIRROR:-/opt/atlas/repository.git}"
BUILD_USER="${ATLAS_BUILD_USER:-atlas}"
BUILD_HOME="${ATLAS_BUILD_HOME:-/opt/atlas/build-home}"
RUN_USER="${ATLAS_RUN_USER:-www-data}"
RUN_GROUP="${ATLAS_RUN_GROUP:-www-data}"
PORT_MIN="${ATLAS_CANDIDATE_PORT_MIN:-5100}"
PORT_MAX="${ATLAS_CANDIDATE_PORT_MAX:-5199}"
ACTIVE_INCLUDE="${ATLAS_NGINX_ACTIVE_INCLUDE:-/etc/nginx/atlas-active/web-servers.conf}"
SITE_AVAILABLE="${ATLAS_NGINX_SITE_AVAILABLE:-/etc/nginx/sites-available/atlasuniversalis-main}"
SITE_ENABLED="${ATLAS_NGINX_SITE_ENABLED:-/etc/nginx/sites-enabled/atlasuniversalis-main}"
PROJECT_PATH="src/Atlas.Web/Atlas.Web.csproj"
APPLICATION_DLL="Atlas.Web.dll"

log() { printf '[atlas-release] %s\n' "$*" >&2; }
fail() { printf '[atlas-release] ERROR: %s\n' "$*" >&2; exit 1; }

usage() {
    cat <<'USAGE'
Usage:
  atlas-release.sh prepare <exact-commit>
  atlas-release.sh activate <exact-commit>
  atlas-release.sh rollback
  atlas-release.sh install-routing
  atlas-release.sh status
  atlas-release.sh verify

prepare starts a healthy owner-only loopback candidate without changing traffic.
activate atomically routes traffic after a second health check.
rollback restores the exact previously active route.
USAGE
}

require_root() { [ "${EUID}" -eq 0 ] || fail "This action requires root."; }
require_command() { command -v "$1" >/dev/null 2>&1 || fail "Required command '$1' is unavailable."; }
validate_commit() { [[ "${1:-}" =~ ^[0-9a-fA-F]{40,64}$ ]] || fail "Supply a full exact Git commit hash."; }

validate_repository_url() {
    [[ "${REPOSITORY_URL}" != *$'\n'* ]] || fail "The repository URL is invalid."
    [[ ! "${REPOSITORY_URL}" =~ ^https?://[^/@]+@ ]] \
        || fail "Repository URLs must not embed credentials."
}

ensure_layout() {
    install -d -m 0755 -o "${BUILD_USER}" -g "${BUILD_USER}" "$(dirname -- "${MIRROR_PATH}")"
    install -d -m 0755 -o "${BUILD_USER}" -g "${BUILD_USER}" "${RELEASE_ROOT}"
    install -d -m 0755 -o "${BUILD_USER}" -g "${BUILD_USER}" \
        "${BUILD_HOME}" "${BUILD_HOME}/.nuget" "${BUILD_HOME}/.nuget/packages"
    install -d -m 0750 -o root -g root "${STATE_ROOT}" "${STATE_ROOT}/receipts" "${STATE_ROOT}/routing"
    install -d -m 0755 -o root -g root "$(dirname -- "${ACTIVE_INCLUDE}")"
}

as_build_user() { runuser -u "${BUILD_USER}" -- "$@"; }

fetch_exact_commit() {
    local requested="$1"
    validate_repository_url
    if [ ! -d "${MIRROR_PATH}/objects" ]; then
        log "Creating protected repository mirror."
        as_build_user git clone --mirror -- "${REPOSITORY_URL}" "${MIRROR_PATH}"
    else
        as_build_user git --git-dir="${MIRROR_PATH}" remote set-url origin "${REPOSITORY_URL}"
        as_build_user git --git-dir="${MIRROR_PATH}" fetch --prune origin \
            '+refs/heads/*:refs/heads/*' '+refs/tags/*:refs/tags/*'
    fi
    local resolved containing_refs
    resolved="$(as_build_user git --git-dir="${MIRROR_PATH}" rev-parse "${requested}^{commit}")" \
        || fail "The exact commit is not present on an advertised remote ref."
    [ "${resolved,,}" = "${requested,,}" ] \
        || fail "The requested commit did not resolve to the exact supplied identity."
    containing_refs="$(as_build_user git --git-dir="${MIRROR_PATH}" for-each-ref \
        --format='%(refname)' --contains "${resolved}" refs/heads refs/tags)"
    [ -n "${containing_refs}" ] \
        || fail "The exact commit is not reachable from an advertised remote branch or tag."
    printf '%s\n' "${resolved,,}"
}

select_free_port() {
    local port
    for ((port=PORT_MIN; port<=PORT_MAX; port++)); do
        if ! ss -H -ltn | awk '{ print $4 }' | grep -Eq ":${port}$"; then
            printf '%s\n' "${port}"
            return 0
        fi
    done
    fail "No free loopback candidate port is available in ${PORT_MIN}-${PORT_MAX}."
}

release_dir_for() { printf '%s/%s\n' "${RELEASE_ROOT}" "$1"; }
unit_for() { printf 'atlas-web-release-%s.service\n' "$1"; }

health_check_port() {
    local port="$1" output_path="${2:-/dev/null}" attempt
    for attempt in $(seq 1 30); do
        if curl --fail --silent --show-error --max-time 5 \
            "http://127.0.0.1:${port}/healthz" -o "${output_path}"; then
            return 0
        fi
        sleep 2
    done
    return 1
}

write_release_unit() {
    local commit="$1" port="$2" release_dir="$3" unit dotnet_path unit_path temporary
    unit="$(unit_for "${commit}")"
    dotnet_path="$(command -v dotnet)"
    unit_path="/etc/systemd/system/${unit}"
    temporary="${unit_path}.tmp.$$"
    cat >"${temporary}" <<UNIT
[Unit]
Description=Atlas Web immutable release ${commit}
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${RUN_USER}
Group=${RUN_GROUP}
WorkingDirectory=${release_dir}/publish
ExecStart=${dotnet_path} ${release_dir}/publish/${APPLICATION_DLL}
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://127.0.0.1:${port}
Environment=ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
Environment=ATLAS_RELEASE_COMMIT=${commit}
Environment=DOTNET_CLI_TELEMETRY_OPTOUT=1
Restart=on-failure
RestartSec=5
TimeoutStopSec=30
KillSignal=SIGINT
NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectHome=true
ProtectSystem=full
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictSUIDSGID=true

[Install]
WantedBy=multi-user.target
UNIT
    chmod 0644 "${temporary}"
    mv -f "${temporary}" "${unit_path}"
    systemctl daemon-reload
    printf '%s\n' "${unit}"
}

prepare_release() {
    require_root
    for command in git dotnet runuser curl ss sha256sum; do require_command "${command}"; done
    local requested="${1:-}" commit release_dir port unit prepared_at
    validate_commit "${requested}"
    ensure_layout
    commit="$(fetch_exact_commit "${requested}")"
    release_dir="$(release_dir_for "${commit}")"
    if [ -f "${release_dir}/commit" ]; then
        [ "$(cat "${release_dir}/commit")" = "${commit}" ] || fail "Existing release identity mismatch."
        port="$(cat "${release_dir}/port")"
        unit="$(cat "${release_dir}/unit")"
        systemctl start "${unit}"
        health_check_port "${port}" "${release_dir}/candidate-health.json" \
            || fail "The existing exact candidate did not become healthy."
        log "Exact candidate ${commit} is healthy at http://127.0.0.1:${port}."
        return 0
    fi

    install -d -m 0755 -o "${BUILD_USER}" -g "${BUILD_USER}" \
        "${release_dir}" "${release_dir}/source" "${release_dir}/publish"
    log "Exporting exact commit ${commit} without touching a production checkout."
    as_build_user bash -c 'git --git-dir="$1" archive "$2" | tar -x -C "$3"' \
        _ "${MIRROR_PATH}" "${commit}" "${release_dir}/source"
    [ -f "${release_dir}/source/${PROJECT_PATH}" ] || fail "Commit lacks ${PROJECT_PATH}."
    log "Publishing as unprivileged identity ${BUILD_USER}."
    as_build_user env \
        HOME="${BUILD_HOME}" \
        DOTNET_CLI_HOME="${BUILD_HOME}" \
        NUGET_PACKAGES="${BUILD_HOME}/.nuget/packages" \
        DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1 \
        dotnet publish "${release_dir}/source/${PROJECT_PATH}" \
        -c Release -o "${release_dir}/publish" --no-self-contained --nologo

    port="$(select_free_port)"
    unit="$(write_release_unit "${commit}" "${port}" "${release_dir}")"
    prepared_at="$(date --utc +%Y-%m-%dT%H:%M:%SZ)"
    printf '%s\n' "${commit}" >"${release_dir}/commit"
    printf '%s\n' "${port}" >"${release_dir}/port"
    printf '%s\n' "${unit}" >"${release_dir}/unit"
    printf 'server 127.0.0.1:%s;\n' "${port}" >"${release_dir}/nginx-servers.conf"
    find "${release_dir}/publish" -type f -print0 | sort -z | xargs -0 sha256sum \
        >"${release_dir}/artifacts.sha256"
    cat >"${release_dir}/release.json" <<JSON
{
  "schemaVersion": 1,
  "application": "atlas-web",
  "sourceCommit": "${commit}",
  "candidateLoopbackUrl": "http://127.0.0.1:${port}",
  "systemdUnit": "${unit}",
  "preparedAtUtc": "${prepared_at}"
}
JSON
    chown -R root:root "${release_dir}"
    find "${release_dir}" -type d -exec chmod 0555 {} +
    find "${release_dir}" -type f -exec chmod 0444 {} +
    systemctl start "${unit}"
    health_check_port "${port}" "${release_dir}/candidate-health.json" \
        || { systemctl stop "${unit}" || true; fail "Candidate failed; public traffic is unchanged."; }
    log "Candidate ${commit} is healthy on loopback port ${port}."
    log "Owner preview: ssh -L 5500:127.0.0.1:${port} <linked-host>"
}

atomic_symlink() {
    local target="$1" link="$2" temporary="${2}.tmp.$$"
    ln -s "${target}" "${temporary}"
    mv -Tf "${temporary}" "${link}"
}

restore_route() {
    atomic_symlink "$1" "${ACTIVE_INCLUDE}"
    nginx -t >/dev/null 2>&1 && systemctl reload nginx
}

public_health_check() {
    local expected_commit="${1:-}" response attempt
    # nginx reload returns before new workers necessarily serve requests. Allow
    # ten bounded requests and nine one-second waits (at most ~29 seconds).
    for ((attempt=1; attempt<=10; attempt++)); do
        if response="$(curl --fail --silent --show-error --max-time 2 \
            --resolve atlasuniversalis.com:443:127.0.0.1 \
            https://atlasuniversalis.com/healthz)"; then
            if [ -z "${expected_commit}" ] \
                || grep -Fq "\"release\":\"${expected_commit}\"" <<<"${response}"; then
                return 0
            fi
        fi
        [ "${attempt}" -eq 10 ] || sleep 1
    done
    return 1
}

install_routing() {
    require_root
    require_command nginx
    ensure_layout
    local initial_route="${STATE_ROOT}/routing/bootstrap-5000.conf"
    printf 'server 127.0.0.1:5000;\n' >"${initial_route}"
    chmod 0644 "${initial_route}"
    [ -e "${ACTIVE_INCLUDE}" ] || atomic_symlink "${initial_route}" "${ACTIVE_INCLUDE}"
    local source_config="${SCRIPT_DIR}/nginx/atlasuniversalis-main-immutable.conf"
    [ -f "${source_config}" ] || fail "Immutable nginx configuration is missing."
    local timestamp backup_root
    timestamp="$(date --utc +%Y%m%dT%H%M%SZ)"
    backup_root="${STATE_ROOT}/routing-backups/${timestamp}"
    install -d -m 0750 "${backup_root}"
    [ ! -e "${SITE_AVAILABLE}" ] || cp -a "${SITE_AVAILABLE}" "${backup_root}/site-available"
    [ ! -e "${SITE_ENABLED}" ] || cp -a "${SITE_ENABLED}" "${backup_root}/site-enabled"
    install -m 0644 "${source_config}" "${SITE_AVAILABLE}.tmp"
    mv -f "${SITE_AVAILABLE}.tmp" "${SITE_AVAILABLE}"
    if [ -L "${SITE_ENABLED}" ]; then
        atomic_symlink "${SITE_AVAILABLE}" "${SITE_ENABLED}"
    else
        install -m 0644 "${source_config}" "${SITE_ENABLED}.tmp"
        mv -f "${SITE_ENABLED}.tmp" "${SITE_ENABLED}"
    fi
    if ! nginx -t; then
        [ ! -e "${backup_root}/site-available" ] || cp -a "${backup_root}/site-available" "${SITE_AVAILABLE}"
        [ ! -e "${backup_root}/site-enabled" ] || cp -a "${backup_root}/site-enabled" "${SITE_ENABLED}"
        fail "nginx validation failed; prior files were restored without a reload."
    fi
    systemctl reload nginx
    log "Immutable routing installed on the existing port 5000 backend; traffic is unchanged."
}

activate_release() {
    require_root
    for command in nginx curl sha256sum; do require_command "${command}"; done
    local commit="${1:-}" release_dir port unit old_route old_release new_route
    local old_active old_previous old_previous_routing receipt receipt_temporary activated_at
    validate_commit "${commit}"
    commit="${commit,,}"
    release_dir="$(release_dir_for "${commit}")"
    [ -f "${release_dir}/commit" ] || fail "Prepare this exact commit before activation."
    [ "$(cat "${release_dir}/commit")" = "${commit}" ] || fail "Release identity mismatch."
    grep -q 'atlas_active_web' "${SITE_ENABLED}" || fail "Run install-routing before activation."
    port="$(cat "${release_dir}/port")"
    unit="$(cat "${release_dir}/unit")"
    systemctl start "${unit}"
    health_check_port "${port}" "${release_dir}/candidate-health.json" \
        || fail "Candidate health failed; public traffic is unchanged."
    old_route="$(readlink -f "${ACTIVE_INCLUDE}")"
    [ -f "${old_route}" ] || fail "The active route is not an exact release file."
    old_active="$(readlink -f "${STATE_ROOT}/active" 2>/dev/null || true)"
    old_previous="$(readlink -f "${STATE_ROOT}/previous" 2>/dev/null || true)"
    old_previous_routing="$(readlink -f "${STATE_ROOT}/previous-routing" 2>/dev/null || true)"
    old_release="${old_active:-bootstrap-5000}"
    new_route="${release_dir}/nginx-servers.conf"
    activated_at="$(date --utc +%Y-%m-%dT%H:%M:%SZ)"
    receipt="${STATE_ROOT}/receipts/$(date --utc +%Y%m%dT%H%M%SZ)-${commit}.json"
    receipt_temporary="${receipt}.tmp.$$"
    cat >"${receipt_temporary}" <<JSON
{
  "schemaVersion": 1,
  "sourceCommit": "${commit}",
  "activatedAtUtc": "${activated_at}",
  "previousRelease": "${old_release}",
  "candidateLoopbackUrl": "http://127.0.0.1:${port}",
  "artifactManifestSha256": "$(sha256sum "${release_dir}/artifacts.sha256" | awk '{ print $1 }')"
}
JSON
    chmod 0440 "${receipt_temporary}"
    if ! systemctl enable "${unit}" >/dev/null; then
        rm -f -- "${receipt_temporary}"
        fail "Candidate could not be enabled; public traffic is unchanged."
    fi
    if ! atomic_symlink "${old_route}" "${STATE_ROOT}/previous-routing"; then
        systemctl disable "${unit}" >/dev/null || true
        rm -f -- "${receipt_temporary}"
        fail "The rollback route could not be recorded; public traffic is unchanged."
    fi
    if ! atomic_symlink "${new_route}" "${ACTIVE_INCLUDE}"; then
        systemctl disable "${unit}" >/dev/null || true
        if [ -n "${old_previous_routing}" ]; then
            atomic_symlink "${old_previous_routing}" "${STATE_ROOT}/previous-routing" || true
        else
            rm -f -- "${STATE_ROOT}/previous-routing"
        fi
        rm -f -- "${receipt_temporary}"
        fail "The candidate route could not be staged; public traffic is unchanged."
    fi
    if ! nginx -t >/dev/null 2>&1 || ! systemctl reload nginx; then
        restore_route "${old_route}" || true
        systemctl disable "${unit}" >/dev/null || true
        if [ -n "${old_previous_routing}" ]; then
            atomic_symlink "${old_previous_routing}" "${STATE_ROOT}/previous-routing" || true
        else
            rm -f -- "${STATE_ROOT}/previous-routing"
        fi
        rm -f -- "${receipt_temporary}"
        fail "Activation failed; the previous route was restored."
    fi
    if ! public_health_check "${commit}"; then
        restore_route "${old_route}" || true
        systemctl disable "${unit}" >/dev/null || true
        if [ -n "${old_previous_routing}" ]; then
            atomic_symlink "${old_previous_routing}" "${STATE_ROOT}/previous-routing" || true
        else
            rm -f -- "${STATE_ROOT}/previous-routing"
        fi
        rm -f -- "${receipt_temporary}"
        fail "Public health failed; the previous route was restored."
    fi

    local state_failed=0
    if [ -n "${old_active}" ] && ! atomic_symlink "${old_active}" "${STATE_ROOT}/previous"; then
        state_failed=1
    fi
    if ! atomic_symlink "${release_dir}" "${STATE_ROOT}/active"; then
        state_failed=1
    fi
    if ! mv -f -- "${receipt_temporary}" "${receipt}"; then
        state_failed=1
    fi
    if [ "${state_failed}" -ne 0 ]; then
        restore_route "${old_route}" || true
        systemctl disable "${unit}" >/dev/null || true
        if [ -n "${old_active}" ]; then
            atomic_symlink "${old_active}" "${STATE_ROOT}/active" || true
        else
            rm -f -- "${STATE_ROOT}/active"
        fi
        if [ -n "${old_previous}" ]; then
            atomic_symlink "${old_previous}" "${STATE_ROOT}/previous" || true
        else
            rm -f -- "${STATE_ROOT}/previous"
        fi
        if [ -n "${old_previous_routing}" ]; then
            atomic_symlink "${old_previous_routing}" "${STATE_ROOT}/previous-routing" || true
        else
            rm -f -- "${STATE_ROOT}/previous-routing"
        fi
        rm -f -- "${receipt}" "${receipt_temporary}"
        fail "Activation bookkeeping failed; the previous route and state were restored."
    fi
    if [ -L "${STATE_ROOT}/previous" ] && [ -f "$(readlink -f "${STATE_ROOT}/previous")/unit" ]; then
        systemctl disable "$(cat "$(readlink -f "${STATE_ROOT}/previous")/unit")" >/dev/null || true
    fi
    log "Public traffic now targets exact healthy commit ${commit}."
}

rollback_release() {
    require_root
    for command in nginx curl; do require_command "${command}"; done
    [ -L "${STATE_ROOT}/previous-routing" ] || fail "No exact previous route is recorded."
    local previous_route current_route previous_port
    previous_route="$(readlink -f "${STATE_ROOT}/previous-routing")"
    current_route="$(readlink -f "${ACTIVE_INCLUDE}")"
    previous_port="$(sed -nE 's/.*127\.0\.0\.1:([0-9]+).*/\1/p' "${previous_route}")"
    [ -n "${previous_port}" ] || fail "The previous route has no loopback port."
    health_check_port "${previous_port}" || fail "Previous release is unhealthy; traffic is unchanged."
    atomic_symlink "${previous_route}" "${ACTIVE_INCLUDE}"
    if ! nginx -t >/dev/null 2>&1 || ! systemctl reload nginx || ! public_health_check; then
        restore_route "${current_route}" || true
        fail "Rollback health failed; the current route was restored."
    fi
    atomic_symlink "${current_route}" "${STATE_ROOT}/previous-routing"
    if [ -L "${STATE_ROOT}/previous" ]; then
        local old_active
        old_active="$(readlink -f "${STATE_ROOT}/active" 2>/dev/null || true)"
        atomic_symlink "$(readlink -f "${STATE_ROOT}/previous")" "${STATE_ROOT}/active"
        [ -z "${old_active}" ] || atomic_symlink "${old_active}" "${STATE_ROOT}/previous"
    fi
    log "Rollback restored exact route ${previous_route}."
}

show_status() {
    printf 'active-route=%s\n' "$(readlink -f "${ACTIVE_INCLUDE}" 2>/dev/null || printf 'not-installed')"
    printf 'active-release=%s\n' "$(readlink -f "${STATE_ROOT}/active" 2>/dev/null || printf 'bootstrap-or-none')"
    printf 'previous-release=%s\n' "$(readlink -f "${STATE_ROOT}/previous" 2>/dev/null || printf 'none')"
    [ ! -d "${RELEASE_ROOT}" ] \
        || find "${RELEASE_ROOT}" -mindepth 1 -maxdepth 1 -type d -printf 'candidate=%f\n' | sort
}

verify_contract() {
    local nginx_contract="${SCRIPT_DIR}/nginx/atlasuniversalis-main-immutable.conf"
    [ -f "${nginx_contract}" ] || fail "Immutable nginx contract is missing."
    grep -q 'git --git-dir=.* archive' "$0" || fail "Exact commit export gate is missing."
    grep -q 'runuser -u' "$0" || fail "Unprivileged build gate is missing."
    grep -q '127.0.0.1:' "$0" || fail "Loopback candidate gate is missing."
    grep -q 'atomic_symlink' "$0" || fail "Atomic activation gate is missing."
    grep -q 'previous-routing' "$0" || fail "Exact rollback gate is missing."
    ! grep -q 'r[s]ync .*--delete' "$0" || fail "In-place destructive sync is prohibited."
    grep -q 'include /etc/nginx/atlas-active/web-servers.conf' "${nginx_contract}" \
        || fail "nginx does not use the atomic active-release include."
    printf '%s\n' 'ATLAS_ARCHIVE_RELEASE_OK|exact-commit|unprivileged-build|immutable-directory|loopback-candidate|owner-tunnel|health-gate|atomic-activation|failed-candidate-no-traffic|exact-rollback|production-checkout-immutable'
}

command="${1:-}"
case "${command}" in
    prepare) shift; prepare_release "${1:-}" ;;
    activate) shift; activate_release "${1:-}" ;;
    rollback) rollback_release ;;
    install-routing) install_routing ;;
    status) show_status ;;
    verify) verify_contract ;;
    -h|--help|help|"") usage ;;
    *) usage; fail "Unknown release action '${command}'." ;;
esac
