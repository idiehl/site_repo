Live production synchronization is retired. Do not upload files into the server
checkout or restart production from a working directory.

Use the reviewed immutable flow:

```bash
./deploy/atlas-release.sh prepare <exact-commit>
./deploy/atlas-release.sh activate <exact-commit>
```

Preparation is safe to run before activation: it binds a candidate only to loopback
and leaves public traffic unchanged.
