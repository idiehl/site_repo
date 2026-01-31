# AtlasOps Dashboard MCP Server

An MCP (Model Context Protocol) server that provides project overview, analytics, and architecture insights for the AtlasOps codebase.

## Features

This MCP server exposes the following tools:

| Tool | Description |
|------|-------------|
| `get_project_stats` | File counts, lines of code, dependency versions, git info |
| `get_api_inventory` | List all API endpoints with methods and descriptions |
| `get_db_schema` | Database tables, columns, and relationships |
| `get_analytics_summary` | Site visits, API usage, error rates, response times |
| `get_security_events` | Security events filtered by severity and time |
| `get_user_stats` | User signups, subscription tiers, OAuth providers |
| `get_architecture_diagram` | Mermaid diagram of system architecture |
| `get_celery_status` | Background task queue health |
| `get_recent_activity` | Recent jobs, applications, and resumes |

## Setup

### 1. Install Dependencies

```bash
cd mcp
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2. Configure Environment

The server reads from the parent directory's `.env` file. Ensure `DATABASE_URL` is set:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/atlasops
REDIS_URL=redis://localhost:6379/0
```

### 3. Configure Cursor

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "atlasops-dashboard": {
      "command": "/path/to/site_repo/mcp/.venv/bin/python",
      "args": ["/path/to/site_repo/mcp/server.py"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/atlasops"
      }
    }
  }
}
```

**Windows paths example:**
```json
{
  "mcpServers": {
    "atlasops-dashboard": {
      "command": "C:\\Users\\ihigg\\Git\\github\\site_repo\\mcp\\.venv\\Scripts\\python.exe",
      "args": ["C:\\Users\\ihigg\\Git\\github\\site_repo\\mcp\\server.py"]
    }
  }
}
```

### 4. Restart Cursor

After updating `mcp.json`, restart Cursor for the changes to take effect.

## Usage Examples

Once configured, you can ask the AI assistant things like:

- "What's the current state of the project?" → calls `get_project_stats`
- "Show me all API endpoints" → calls `get_api_inventory`
- "What's the error rate this week?" → calls `get_analytics_summary`
- "Any security events I should know about?" → calls `get_security_events`
- "How many users do we have?" → calls `get_user_stats`
- "Show me the system architecture" → calls `get_architecture_diagram`

## Development

To test the server locally:

```bash
cd mcp
source .venv/bin/activate
python server.py
```

The server communicates via stdin/stdout using the MCP protocol.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check that the database has been migrated (`alembic upgrade head`)

### MCP Not Loading
- Check `~/.cursor/mcp.json` syntax (valid JSON)
- Verify Python path is correct
- Check Cursor's developer console for errors

### Missing Tables
- Some analytics tables may not exist if migrations haven't been run
- The server handles missing tables gracefully
