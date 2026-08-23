# Live sync retired

Direct file synchronization into `/var/www/atlasuniversalis.com` is disabled.
It bypasses source attribution, candidate health checks, and exact rollback.

Use the immutable workflow in [RUNBOOK.md](RUNBOOK.md):

1. Push the exact reviewed publication commit.
2. Run `atlas-release.sh prepare <commit>`.
3. Inspect the loopback candidate through the linked-host SSH tunnel.
4. Run `atlas-release.sh activate <commit>` only after review.

No current deployment command builds in or mutates the production checkout.
