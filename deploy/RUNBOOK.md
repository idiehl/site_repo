# Atlas immutable release runbook

Atlas Archive releases are commit-addressed and immutable. The dirty historical
checkout at `/var/www/atlasuniversalis.com` is not a build input and must never be
reset, cleaned, synchronized, or used as a deployment directory.

## One-time routing installation

From a reviewed clone containing this release controller:

```bash
sudo ./deploy/atlas-release.sh verify
sudo ./deploy/atlas-release.sh install-routing
```

`install-routing` records the existing `127.0.0.1:5000` backend before installing
the nginx include contract. Its initial reload does not change traffic.

## Prepare an owner-only candidate

Use the full commit printed by Hypershell's Atlas publication receipt:

```bash
sudo ./deploy/atlas-release.sh prepare <exact-40-or-64-character-commit>
```

The controller fetches advertised refs into `/opt/atlas/repository.git`, verifies
the exact identity, exports it under `/opt/atlas/releases/web/<commit>`, builds as
the unprivileged `atlas` identity, records artifact hashes, and starts a hardened
release-specific service on a free loopback port in `5100-5199`.

Preview it only through the linked-host tunnel printed by the command, for example:

```bash
ssh -L 5500:127.0.0.1:5107 pinglab
```

Then open `http://127.0.0.1:5500/Archive` locally. The candidate has no public nginx
route and the workflow never opens a firewall port.

## Activate

After source review and owner preview:

```bash
sudo ./deploy/atlas-release.sh activate <exact-commit>
```

Activation rechecks candidate health, atomically changes only
`/etc/nginx/atlas-active/web-servers.conf`, validates nginx, reloads it, and checks
the public TLS health route. A failed check restores the previous route. Receipts
under `/var/lib/atlas-releases/web/receipts` record commit, artifact-manifest hash,
loopback URL, activation time, and previous release identity.

## Exact rollback

```bash
sudo ./deploy/atlas-release.sh rollback
```

Rollback verifies and restores the exact previously recorded loopback route. It
does not reconstruct files from a mutable backup.

## Inspect

```bash
sudo ./deploy/atlas-release.sh status
systemctl status 'atlas-web-release-*.service'
ls -la /var/lib/atlas-releases/web/receipts
```

Atlas Apply and legacy migration material are separate from the Archive publisher
and must not use the retired live-sync or in-place deployment paths.
