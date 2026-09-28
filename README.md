# DIO Explorer — IBM Bob Final Project

> **IBM Bob DIO Bootcamp · Final Project**
> An AI-augmented learning assistant for [DIO (Digital Innovation One)](https://www.dio.me) built entirely inside **IBM Bob** — combining custom slash commands, a workspace MCP server, and a rich knowledge base of tech formations.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Architecture](#architecture)
4. [Knowledge Base](#knowledge-base)
5. [Bob Commands (Slash Commands)](#bob-commands-slash-commands)
6. [MCP Server](#mcp-server)
7. [Setup & Installation](#setup--installation)
8. [All Commands Reference](#all-commands-reference)
9. [Bob Modes Used](#bob-modes-used)
10. [Usage Tips & Pro Insights](#usage-tips--pro-insights)
11. [Environment Variables](#environment-variables)
12. [HTTP Mode & Production Deployment](#http-mode--production-deployment)

---

## Project Overview

DIO Explorer is a workspace built on top of IBM Bob that gives learners and educators instant access to DIO's formation catalogue — study plans, coding challenges and completion certificates — all from within the IDE chat.

The project has three interlocking layers:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Knowledge base** | JSON | 15 DIO formations with XP, badges, lives and partner deals |
| **Bob slash commands** | Markdown prompt files | `/trilha`, `/desafio`, `/certificado` — natural-language UX |
| **MCP server** | TypeScript / Node.js | Programmatic tools callable by any MCP-compatible host |

---

## Repository Structure

```
Final-Project-IBM-Bob-Formation/
└── dio-explorer/                  ← Bob workspace root
    ├── .bob/
    │   ├── mcp.json               ← Workspace MCP server registration
    │   └── commands/
    │       ├── trilha.md          ← /trilha slash command
    │       ├── desafio.md         ← /desafio slash command
    │       └── certificado.md     ← /certificado slash command
    ├── data/
    │   └── trilhas_dio.json       ← 15-formation knowledge base
    ├── docs/                      ← (reserved for future docs)
    ├── commands/                  ← (reserved for future scripts)
    ├── .bobignore                 ← Keeps .env files out of Bob's context
    └── mcp/                       ← MCP server package
        ├── src/
        │   └── index.ts           ← Full MCP server implementation
        ├── build/
        │   └── index.js           ← Compiled output (after npm run build)
        ├── package.json
        └── tsconfig.json
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   IBM Bob (IDE Chat)                     │
│                                                         │
│  User types /trilha python                              │
│        │                                                │
│        ▼                                                │
│  Bob reads .bob/commands/trilha.md                      │
│  → Loads data/trilhas_dio.json                          │
│  → Formats and returns study plan                       │
│                                                         │
│  — OR —                                                 │
│                                                         │
│  Bob calls MCP tool: get_formation({ query: "python" }) │
│        │                                                │
│        ▼                                                │
│  dio-explorer MCP Server (Node.js process / HTTP)       │
│  → Reads trilhas_dio.json at runtime                    │
│  → Returns structured markdown response                 │
└─────────────────────────────────────────────────────────┘
```

Bob can reach the formation data through **two independent paths**:

- **Slash commands** — Bob resolves the command prompt file, reads the JSON itself, and synthesises the answer in-context. Fast, zero-config, works offline.
- **MCP tools** — Bob calls the registered MCP server, which is a separate Node.js process. Useful for programmatic access, multi-host setups, and remote/HTTP deployments.

---

## Knowledge Base

**File:** [`data/trilhas_dio.json`](dio-explorer/data/trilhas_dio.json)

Contains **15 DIO formations** across the following technologies:

| ID | Formation | Technology | Level | XP |
|----|-----------|-----------|-------|----|
| 1 | Python AI Backend Developer | Python | Intermediate | 18 500 |
| 2 | Java Spring Boot Full Stack | Java | Advanced | 24 000 |
| 3 | React Web Developer | React | Intermediate | 15 000 |
| 4 | Cloud Native with AWS | AWS | Advanced | 28 000 |
| 5 | Data Science with Python and ML | Data Science | Advanced | 32 000 |
| 6 | Angular Enterprise Developer | Angular | Intermediate | 16 500 |
| 7 | DevOps and CI/CD Pipelines | DevOps | Advanced | 26 000 |
| 8 | iOS Developer with Swift | Swift | Intermediate | 19 500 |
| 9 | Android Developer with Kotlin | Kotlin | Intermediate | 18 000 |
| 10 | Cybersecurity Analyst | Cybersecurity | Advanced | 27 000 |
| 11 | Node.js Backend Developer | Node.js | Intermediate | 16 000 |
| 12 | Microsoft Azure Cloud Engineer | Azure | Advanced | 30 000 |
| 13–15 | *(additional formations)* | … | … | … |

Each formation record contains:

```jsonc
{
  "id": 1,
  "name": "Python AI Backend Developer",
  "technology": "Python",
  "level": "Intermediate",
  "modules": 12,
  "total_xp": 18500,
  "badges": ["Python Essentials", "REST API Builder", "…"],
  "promotions": [
    { "partner": "Alura", "discount": "30% off annual plan" }
  ],
  "lives": [
    { "title": "Python Best Practices with FastAPI",
      "instructor": "Ana Lima",
      "duration_minutes": 90 }
  ]
}
```

---

## Bob Commands (Slash Commands)

Slash commands live in [`.bob/commands/`](dio-explorer/.bob/commands/) as plain Markdown files. Bob reads the file whenever the user types the matching `/command` in the chat. Arguments are available as `$1`, `$2`, etc.

### `/trilha <tecnologia>`

**File:** [`.bob/commands/trilha.md`](dio-explorer/.bob/commands/trilha.md)

Displays the full study plan for a DIO formation matching the given technology.

```
/trilha python
/trilha java
/trilha aws
```

**Output includes:** formation metadata table · numbered module plan · badges list · exclusive live sessions · partner promotions.
If no match is found, lists all available technologies and prompts the user to choose.

**Cross-command tip:** The command footer suggests `/desafio` and `/certificado` as logical next steps, creating a natural learning flow.

---

### `/desafio <tecnologia> <nível>`

**File:** [`.bob/commands/desafio.md`](dio-explorer/.bob/commands/desafio.md)

Generates a **random practical coding challenge** for any technology at a given difficulty level.

```
/desafio python iniciante
/desafio java avançado
/desafio react intermediate
```

**Accepted levels:** `Iniciante` / `Beginner` · `Intermediário` / `Intermediate` · `Avançado` / `Advanced`
If level is omitted or unrecognised, defaults to `Intermediário`.

**Output includes:** challenge metadata · description · concrete requirements · hints · evaluation rubric (Correctness 40%, Readability 25%, Performance 20%, Best Practices 15%) · starter code skeleton.

**XP rewards by level:**
| Level | XP |
|-------|----|
| Iniciante | 200 XP |
| Intermediário | 500 XP |
| Avançado | 1 000 XP |

---

### `/certificado <seu nome> <tecnologia>`

**File:** [`.bob/commands/certificado.md`](dio-explorer/.bob/commands/certificado.md)

Generates a formatted completion certificate for a learner.

```
/certificado "Maria Silva" python
/certificado "João Santos" java
```

**Output includes:** ASCII-box certificate with name, formation details, badge list, unique certificate code (`DIO-{id}-{initials}-{hex}`), issue date · next-step suggestions · partner promotions.

Certificate code format example:
```
DIO-0001-MS-3F7A2B
     │    │   └── random 6-digit hex
     │    └─── initials (uppercase)
     └──── zero-padded formation id
```

---

## MCP Server

**Location:** [`mcp/`](dio-explorer/mcp/)
**Entry point:** [`mcp/src/index.ts`](dio-explorer/mcp/src/index.ts)

A fully typed TypeScript MCP server built with `@modelcontextprotocol/sdk`. It exposes the same DIO knowledge as programmatic tools, callable by Bob or any MCP-compatible client.

### Registered Tools

| Tool | Input | Description |
|------|-------|-------------|
| `list_formations` | *(none)* | Returns a markdown table of all 15 formations |
| `get_formation` | `query: string` | Full study plan — search by technology, name, or id |
| `get_challenge` | `technology`, `level?` | Random coding challenge with requirements and rubric |
| `get_certificate` | `name`, `technology` | Generates a personalised ASCII certificate |

### Transport Modes

| Mode | How to start | Use case |
|------|-------------|---------|
| **stdio** (default) | Spawned by Bob via `mcp.json` | Local development, zero network |
| **HTTP** | `DIO_TRANSPORT=http node build/index.js` | Remote, multi-user, behind HTTPS proxy |

### Authentication (HTTP mode)

Every HTTP request must include one of:

```http
Authorization: Bearer <DIO_API_KEY>
x-api-key: <DIO_API_KEY>
```

If `DIO_API_KEY` is not set, the server runs in **open mode** (development only — never use in production without a key).

---

## Setup & Installation

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **IBM Bob** installed and the workspace opened at `dio-explorer/`

### Step 1 — Build the MCP server

```bash
cd Final-Project-IBM-Bob-Formation/dio-explorer/mcp
npm install
npm run build
```

This compiles `src/index.ts` → `build/index.js` and sets the executable bit.

### Step 2 — Verify the workspace MCP registration

The workspace already ships a pre-configured [`.bob/mcp.json`](dio-explorer/.bob/mcp.json):

```json
{
  "mcpServers": {
    "dio-explorer": {
      "command": "node",
      "args": [
        "/absolute/path/to/dio-explorer/mcp/build/index.js"
      ]
    }
  }
}
```

> **Important:** Update the `args` path to match your local filesystem if you moved the repo.

### Step 3 — Open the workspace in Bob

Open the `dio-explorer/` folder as the Bob workspace. The slash commands and MCP server will be auto-detected.

### Step 4 — Verify everything works

In the Bob chat:

```
/trilha python
```

You should receive the full Python formation study plan.

---

## All Commands Reference

### Bob Slash Commands

| Command | Arguments | Example |
|---------|-----------|---------|
| `/trilha` | `<tecnologia>` | `/trilha python` |
| `/desafio` | `<tecnologia> [nível]` | `/desafio java avançado` |
| `/certificado` | `<nome> <tecnologia>` | `/certificado "Ana Lima" react` |

### MCP Tools (callable by Bob or programmatically)

| Tool | Arguments | Example |
|------|-----------|---------|
| `list_formations` | — | List all formations |
| `get_formation` | `query` | `get_formation({ query: "aws" })` |
| `get_challenge` | `technology`, `level` | `get_challenge({ technology: "python", level: "Advanced" })` |
| `get_certificate` | `name`, `technology` | `get_certificate({ name: "Maria", technology: "java" })` |

### npm Scripts (inside `mcp/`)

| Script | Command | Description |
|--------|---------|-------------|
| Build | `npm run build` | Compile TypeScript to `build/` |
| Start (stdio) | `npm run start:stdio` | Run server in stdio mode |
| Start (HTTP) | `npm run start:http` | Run server on HTTP (port 3100) |

### Shell Commands

```bash
# Build
cd mcp && npm install && npm run build

# Run HTTP server with auth
export DIO_API_KEY="your-secret-token"
DIO_TRANSPORT=http DIO_PORT=3100 node build/index.js

# Run HTTP server on a custom port (no auth — dev only)
DIO_TRANSPORT=http DIO_PORT=8080 node build/index.js
```

---

## Bob Modes Used

This project was built using all three Bob modes:

### Agent Mode
Used for all code generation, file creation, and editing:
- Scaffolded the MCP server TypeScript source from scratch
- Wrote and tuned the slash command `.md` prompt files
- Generated the `trilhas_dio.json` knowledge base with 15 formations
- Configured `.bob/mcp.json` and `.bobignore`

### Plan Mode
Used before implementation to:
- Design the three-layer architecture (JSON → commands → MCP)
- Decide transport strategy (stdio default + optional HTTP)
- Define the tool signatures and authentication scheme

### Ask Mode
Used throughout to:
- Query Bob documentation about MCP server registration syntax
- Clarify slash command `argument-hint` frontmatter behaviour
- Understand `@modelcontextprotocol/sdk` v2 `registerTool` API

---

## Usage Tips & Pro Insights

### 1. Partial matching works everywhere

Both slash commands and MCP tools use **case-insensitive partial matching** on the `technology` field. You never need an exact string:

```
/trilha py        → matches Python
/trilha data      → matches Data Science
get_formation({ query: "node" })  → matches Node.js
```

### 2. Chain the three commands for a complete learning flow

```
/trilha react                          # 1. Explore the trail
/desafio react intermediário           # 2. Practice with a challenge
/certificado "Your Name" react         # 3. Earn your certificate
```

### 3. The MCP server reads the JSON at call time — hot reloading

Because `loadData()` is called inside every tool handler (not at startup), you can edit `data/trilhas_dio.json` and the next MCP call picks up the change without restarting the server. This makes iteration fast.

### 4. Extending the knowledge base requires zero code changes

Add new formations to `trilhas_dio.json` following the existing schema. Both slash commands and MCP tools immediately see them — no TypeScript changes needed.

```jsonc
// Add to the formations array:
{
  "id": 16,
  "name": "My New Formation",
  "technology": "Go",
  "level": "Intermediate",
  "modules": 10,
  "total_xp": 15000,
  "badges": ["Go Fundamentals", "Concurrency Expert"],
  "promotions": [],
  "lives": []
}
```

### 5. Add new slash commands with no TypeScript

Drop a `.md` file into `.bob/commands/` and Bob will expose it immediately as `/filename`. The frontmatter controls the description and argument hint shown in the UI:

```markdown
---
description: My new command description
argument-hint: <arg1> [arg2]
---

Your prompt instructions here. Use $1 and $2 for arguments.
```

### 6. HTTP mode enables multi-user and CI/CD scenarios

Run the server as a persistent service and register it with a `url` in `mcp.json`. This means every developer on the team shares the same server — no per-machine `npm run build` needed:

```json
{
  "mcpServers": {
    "dio-explorer-remote": {
      "url": "https://your-domain.com/mcp",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

### 7. The `.bobignore` file protects secrets

[`.bobignore`](dio-explorer/.bobignore) excludes `.env` and `.env.*` files from Bob's file context. Always keep secrets out of `.env` files placed inside the workspace, and add sensitive paths to `.bobignore` proactively.

### 8. Certificate codes are portfolio-ready

The generated certificate code (`DIO-{id}-{initials}-{hex}`) is unique per run. While it is a demonstration artefact, the format mirrors real credential IDs and is suitable for README badges and LinkedIn portfolio posts.

### 9. Stdio vs HTTP — when to choose each

| Scenario | Recommended transport |
|----------|-----------------------|
| Solo developer, local machine | stdio (zero setup, default) |
| Team sharing one server | HTTP behind nginx/Caddy |
| CI/CD pipeline calling tools | HTTP with `DIO_API_KEY` |
| Air-gapped / offline environment | stdio |
| SSO/corporate IdP required | HTTP + JWT forwarding via reverse proxy |

### 10. TypeScript strict mode catches tool schema bugs early

The MCP server is compiled with `"strict": true`. If a Zod schema does not match the TypeScript interface, the build fails before deployment. Keep `tsconfig.json` strict to maintain this safety guarantee.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DIO_TRANSPORT` | `stdio` | Transport mode: `stdio` or `http` |
| `DIO_PORT` | `3100` | TCP port (HTTP mode only) |
| `DIO_API_KEY` | *(unset)* | Shared secret for Bearer / x-api-key authentication. If unset, the server runs in open/dev mode. **Always set in production.** |

---

## HTTP Mode & Production Deployment

### Start with authentication

```bash
export DIO_API_KEY="$(openssl rand -hex 32)"
DIO_TRANSPORT=http DIO_PORT=3100 node mcp/build/index.js
```

### nginx reverse proxy (TLS termination)

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    location /mcp {
        proxy_pass http://127.0.0.1:3100/mcp;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Register the remote server in Bob

```json
{
  "mcpServers": {
    "dio-explorer-remote": {
      "url": "https://your-domain.com/mcp",
      "headers": {
        "Authorization": "Bearer <DIO_API_KEY>"
      }
    }
  }
}
```

### SSO with Okta / Azure AD / Auth0

Configure your IdP to issue short-lived Bearer tokens. Point `DIO_API_KEY` to the shared secret, or deploy a reverse proxy (e.g. `oauth2-proxy`) that validates JWTs and forwards requests with the correct `Authorization` header.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| AI assistant | IBM Bob |
| MCP SDK | `@modelcontextprotocol/sdk` v1.12+ |
| Server language | TypeScript 5, Node.js 18+ |
| Schema validation | Zod 3 |
| HTTP server | Node.js built-in `http` module |
| Build | `tsc` (ES2022 target, Node16 modules) |
| Data | JSON (no database required) |

---

*Built with ❤️ during the IBM Bob DIO Bootcamp.*
