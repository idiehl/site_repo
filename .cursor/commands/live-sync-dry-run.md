Validate the immutable release contract without changing server state:

```bash
./deploy/atlas-release.sh verify
```

For a real commit, `prepare <exact-commit>` creates a loopback-only candidate. It is
not a dry-run build, but it does not alter public traffic and can be inspected through
the linked-host SSH tunnel before any explicit activation.
