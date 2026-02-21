Ship the current changes to production. Execute these steps in order:

1. **Stage and commit**: Run `git status` to see what changed. Stage all relevant files. Read `docs/master_log/Master_Log.md` to find today's highest log sequence number, then commit with message format `AU-C01-YYYYMMDD-NNN: <description>` (increment NNN by 1).

2. **Push**: Run `git push origin master`. If rejected, stop and report.

3. **Deploy**: Use the `/deploy` subagent to handle the full deploy pipeline — it will push, pull on the droplet, detect changed apps, build frontends, run migrations if needed, restart services, and smoke check.

4. **Document**: After deploy returns a commit range, use the `/post-deploy-docs` subagent with the `deploy_commit_before`, `deploy_commit_after`, `deploy_summary`, `apps_affected`, and `deploy_status` from the deploy report.

5. **Verify**: Use the `/test-runner` subagent to smoke test all affected app URLs.

6. **Report**: Use the `/teller` subagent to produce a structured cycle response and draft the next prompt.

Launch steps 4 and 5 in parallel after step 3 completes. Any additional context the user provided after `/ship` describes what was changed and why — use it for the commit message and documentation.
