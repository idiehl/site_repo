Create a smart commit using the Atlas Universalis log ID format. Do NOT push — use `/ship` for that.

Steps:

1. Run `git status` and `git diff` to understand all changes (staged and unstaged).
2. Read `docs/master_log/Master_Log.md` and find today's date entries. Determine the next sequence number (NNN). If no entries exist for today, start at 001.
3. Stage all relevant files (exclude files that contain secrets: `.env`, `credentials.json`, etc.).
4. Draft a concise commit message in this format:

   ```
   AU-C01-YYYYMMDD-NNN: <short description of what changed>
   ```

   Use America/Kentucky/Louisville timezone for the date. The description should capture the "why" in under 80 characters.

5. Commit with the drafted message.
6. Report what was committed (files, message) but do NOT push.

If the user provided additional context after `/commit`, use it as the commit description. Otherwise, infer the description from the diff.
