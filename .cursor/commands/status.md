Give a quick project status overview for Atlas Universalis. Run these checks in parallel:

**1. Local git state**
- `git status -sb`
- `git log -5 --oneline`
- Note any uncommitted changes, unpushed commits, or branch divergence.

**2. Droplet service health**
- `ssh root@167.71.179.90 "systemctl is-active atlasuniversalis && systemctl is-active nginx && df -h / | tail -1"`
- Report: backend service status, nginx status, disk usage.

**3. CI/CD status**
- `gh run list --repo idiehl/site-repo --branch master --limit 3`
- Report: latest workflow run status (success/failure/in_progress).

**4. Dev portal status** (if MCP available)
- Use `get_dev_status` from atlasops-dashboard MCP to check current status (READY/PENDING/BLOCKED).

Produce a compact summary table:

```
| Area       | Status     | Details                    |
|------------|------------|----------------------------|
| Local      | clean/dirty| N uncommitted, N unpushed  |
| Droplet    | up/down    | backend, nginx, disk       |
| CI/CD      | pass/fail  | last 3 runs                |
| Dev Portal | READY/...  | last update message        |
```
