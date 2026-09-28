# DIO Explorer — MCP Server

An [MCP](https://modelcontextprotocol.io) server that exposes the DIO Explorer knowledge base as callable tools. It can run:

| Mode | How |
|------|-----|
| **stdio** (default) | Spawned locally by Bob — zero network required |
| **HTTP** | Long-running service behind an HTTPS reverse-proxy, API Gateway or SSO provider |

---

## Tools

| Tool | Description |
|------|-------------|
| `list_formations` | List every DIO formation (id, name, technology, level, XP) |
| `get_formation` | Full study plan for a formation — search by technology, name or id |
| `get_challenge` | Generate a random coding challenge for a technology + level |
| `get_certificate` | Generate a completion certificate for a learner |

---

## Quick start (stdio — Bob local)

```bash
cd mcp
npm install
npm run build
```

Then register in `~/.bob/mcp.json` (global) or `.bob/mcp.json` (workspace):

```json
{
  "mcpServers": {
    "dio-explorer": {
      "command": "node",
      "args": ["/absolute/path/to/dio-explorer/mcp/build/index.js"]
    }
  }
}
```

---

## HTTP mode — remote / HTTPS / SSO

```bash
# Optional but strongly recommended for production:
export DIO_API_KEY="your-secret-token"

DIO_TRANSPORT=http DIO_PORT=3100 node build/index.js
```

All MCP messages are sent as `POST /mcp`.

### Authentication

Every HTTP request must include one of:

```
Authorization: Bearer <DIO_API_KEY>
x-api-key: <DIO_API_KEY>
```

If `DIO_API_KEY` is **not** set, the server runs in open mode (development only).

### HTTPS / Reverse proxy

The server itself speaks plain HTTP. Put it behind **nginx**, **Caddy**, or **AWS API Gateway** to terminate TLS:

```nginx
location /mcp {
    proxy_pass http://127.0.0.1:3100/mcp;
    proxy_set_header Host $host;
}
```

### SSO (Bearer token forwarded from IdP)

Configure your SSO provider (Okta, Azure AD, Auth0 …) to issue short-lived Bearer tokens and set `DIO_API_KEY` to the shared secret or use a reverse proxy that validates JWTs before forwarding the request.

Register the remote server in mcp.json with a `url` instead of `command`:

```json
{
  "mcpServers": {
    "dio-explorer-remote": {
      "url": "https://your-domain.com/mcp",
      "headers": {
        "Authorization": "Bearer <your-token>"
      }
    }
  }
}
```

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DIO_TRANSPORT` | `stdio` | `stdio` or `http` |
| `DIO_PORT` | `3100` | TCP port (HTTP mode only) |
| `DIO_API_KEY` | *(unset)* | Shared secret for Bearer / x-api-key auth |
