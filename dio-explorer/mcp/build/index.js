#!/usr/bin/env node
/**
 * DIO Explorer MCP Server
 *
 * Transports supported:
 *   - stdio  (default)       → spawn via Bob's mcp.json with command/args
 *   - HTTP   (DIO_TRANSPORT=http) → remote access behind HTTPS reverse-proxy,
 *                                   API-key auth, or SSO Bearer token
 *
 * Auth (HTTP mode only):
 *   Set DIO_API_KEY env var.  Every request must include one of:
 *     Authorization: Bearer <key>
 *     x-api-key: <key>
 *
 * Tools exposed:
 *   list_formations   — list all available DIO formations
 *   get_formation     — full detail for a formation by id or technology
 *   get_challenge     — generate a coding challenge for a technology + level
 *   get_certificate   — generate a completion certificate for a user
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { readFileSync } from "fs";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
// ---------------------------------------------------------------------------
// Data layer
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
// data file lives at  ../../data/trilhas_dio.json  relative to build/
const DATA_PATH = resolve(__dirname, "../../data/trilhas_dio.json");
function loadData() {
    return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
}
function findFormation(data, query) {
    const q = query.toLowerCase();
    return (data.formations.find((f) => f.technology.toLowerCase().includes(q)) ??
        data.formations.find((f) => f.name.toLowerCase().includes(q)) ??
        data.formations.find((f) => String(f.id) === q));
}
// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------
const server = new McpServer({ name: "dio-explorer", version: "0.1.0" });
// ---------------------------------------------------------------------------
// Tool: list_formations
// ---------------------------------------------------------------------------
server.registerTool("list_formations", {
    description: "List all DIO formations available. Returns a summary table with id, name, technology, level and XP.",
    inputSchema: z.object({}),
}, async () => {
    try {
        const data = loadData();
        const rows = data.formations
            .map((f) => `| ${f.id} | ${f.name} | ${f.technology} | ${f.level} | ${f.total_xp} XP |`)
            .join("\n");
        const table = `| ID | Formation | Technology | Level | XP |\n` +
            `|----|-----------|------------|-------|----|\n` +
            rows;
        return { content: [{ type: "text", text: table }] };
    }
    catch (err) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error loading data: ${err instanceof Error ? err.message : String(err)}`,
                },
            ],
            isError: true,
        };
    }
});
// ---------------------------------------------------------------------------
// Tool: get_formation
// ---------------------------------------------------------------------------
server.registerTool("get_formation", {
    description: "Get the full study plan for a DIO formation. You can search by technology name (e.g. 'Python'), formation name, or numeric id.",
    inputSchema: z.object({
        query: z
            .string()
            .describe("Technology name, formation name, or formation id to look up."),
    }),
}, async ({ query }) => {
    try {
        const data = loadData();
        const formation = findFormation(data, query);
        if (!formation) {
            const available = data.formations.map((f) => f.technology).join(", ");
            return {
                content: [
                    {
                        type: "text",
                        text: `No formation found for "${query}". Available technologies: ${available}`,
                    },
                ],
                isError: true,
            };
        }
        const badges = formation.badges.map((b) => `- 🏅 ${b}`).join("\n");
        const lives = formation.lives
            .map((l) => `- **${l.title}** — Instructor: ${l.instructor} | ⏱ ${l.duration_minutes} min`)
            .join("\n");
        const promos = formation.promotions
            .map((p) => `- **${p.partner}**: ${p.discount}`)
            .join("\n");
        const text = `# 🎓 Formation: ${formation.name}\n\n` +
            `| Field | Value |\n|-------|-------|\n` +
            `| Technology | ${formation.technology} |\n` +
            `| Level | ${formation.level} |\n` +
            `| Modules | ${formation.modules} |\n` +
            `| Total XP | ${formation.total_xp} XP |\n\n` +
            `## 🏆 Badges\n${badges}\n\n` +
            `## 🎬 Exclusive Lives\n${lives}\n\n` +
            `## 🎁 Partner Promotions\n${promos}`;
        return { content: [{ type: "text", text }] };
    }
    catch (err) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${err instanceof Error ? err.message : String(err)}`,
                },
            ],
            isError: true,
        };
    }
});
// ---------------------------------------------------------------------------
// Tool: get_challenge
// ---------------------------------------------------------------------------
const CHALLENGE_TYPES = [
    "Algorithm",
    "Data Structures",
    "REST API Integration",
    "Debugging",
    "Refactoring",
    "Design Pattern",
    "Testing",
    "Performance Optimisation",
];
const XP_MAP = {
    beginner: 200,
    iniciante: 200,
    intermediate: 500,
    intermediário: 500,
    intermediario: 500,
    advanced: 1000,
    avançado: 1000,
    avancado: 1000,
};
server.registerTool("get_challenge", {
    description: "Generate a practical coding challenge for a given technology and difficulty level. Level can be Beginner/Iniciante, Intermediate/Intermediário, or Advanced/Avançado.",
    inputSchema: z.object({
        technology: z.string().describe("Programming technology, e.g. Python"),
        level: z
            .string()
            .optional()
            .describe("Difficulty level (Beginner, Intermediate, Advanced)"),
    }),
}, async ({ technology, level = "Intermediate" }) => {
    const normalised = level.toLowerCase().trim();
    const xp = XP_MAP[normalised] ?? 500;
    const challengeType = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)];
    const text = `# ⚔️ Coding Challenge — ${technology}\n\n` +
        `| Field | Value |\n|-------|-------|\n` +
        `| Technology | ${technology} |\n` +
        `| Level | ${level} |\n` +
        `| Type | ${challengeType} |\n` +
        `| XP Reward | ${xp} XP |\n\n` +
        `## 📋 Description\n` +
        `Build a ${challengeType.toLowerCase()} solution using ${technology}. ` +
        `The challenge focuses on real-world scenarios encountered by professional ${technology} developers. ` +
        `Your solution must be clean, well-tested, and follow community best practices. ` +
        `Think about edge cases, error handling, and code readability as you work through the problem.\n\n` +
        `## ✅ Requirements\n` +
        `1. Implement the core logic for a ${challengeType.toLowerCase()} problem appropriate for the ${level} level.\n` +
        `2. Write at least two unit tests covering the happy path and one edge case.\n` +
        `3. Handle errors gracefully and return meaningful messages to the caller.\n` +
        `4. Follow ${technology} naming conventions and style guide.\n` +
        `5. Document public functions/methods with docstrings or JSDoc comments.\n\n` +
        `## 💡 Hints\n` +
        `- Break the problem into small, testable functions before writing the main logic.\n` +
        `- Look at the standard library of ${technology} — there may be built-in helpers for this type of problem.\n` +
        `- Write the test first (TDD) to clarify what "done" looks like.\n\n` +
        `## 📊 Evaluation Criteria\n` +
        `| Criterion | Weight |\n|-----------|--------|\n` +
        `| Correctness | 40% |\n` +
        `| Readability | 25% |\n` +
        `| Performance | 20% |\n` +
        `| Best Practices | 15% |\n\n` +
        `> 💡 When done, use \`get_certificate\` to generate your completion certificate!`;
    return { content: [{ type: "text", text }] };
});
// ---------------------------------------------------------------------------
// Tool: get_certificate
// ---------------------------------------------------------------------------
server.registerTool("get_certificate", {
    description: "Generate a DIO completion certificate for a user who finished a formation.",
    inputSchema: z.object({
        name: z.string().describe("Full name of the learner"),
        technology: z
            .string()
            .describe("Technology of the completed formation, e.g. Python"),
    }),
}, async ({ name, technology }) => {
    try {
        const data = loadData();
        const formation = findFormation(data, technology);
        if (!formation) {
            const available = data.formations.map((f) => f.technology).join(", ");
            return {
                content: [
                    {
                        type: "text",
                        text: `No formation found for "${technology}". Available technologies: ${available}`,
                    },
                ],
                isError: true,
            };
        }
        const today = new Date().toLocaleDateString("pt-BR");
        const initials = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase();
        const hex = Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0")
            .toUpperCase();
        const code = `DIO-${String(formation.id).padStart(4, "0")}-${initials}-${hex}`;
        const badgesLines = formation.badges
            .map((b) => `║  🏅 ${b.padEnd(64)}║`)
            .join("\n");
        const cert = `╔══════════════════════════════════════════════════════════════════════╗\n` +
            `║                                                                      ║\n` +
            `║              🎓  DIO — Digital Innovation One                        ║\n` +
            `║                                                                      ║\n` +
            `╠══════════════════════════════════════════════════════════════════════╣\n` +
            `║                  CERTIFICADO DE CONCLUSÃO                            ║\n` +
            `║                                                                      ║\n` +
            `║  Certificamos que                                                    ║\n` +
            `║                                                                      ║\n` +
            `║              ★  ${name}  ★\n` +
            `║                                                                      ║\n` +
            `║  concluiu com êxito a trilha de aprendizagem                         ║\n` +
            `║                                                                      ║\n` +
            `║  ${formation.name.padEnd(68)}║\n` +
            `║                                                                      ║\n` +
            `║  Tecnologia : ${formation.technology.padEnd(55)}║\n` +
            `║  Nível      : ${formation.level.padEnd(55)}║\n` +
            `║  Módulos    : ${String(formation.modules).padEnd(55)}║\n` +
            `║  XP obtido  : ${formation.total_xp} XP${" ".repeat(Math.max(0, 52 - String(formation.total_xp).length))}║\n` +
            `║                                                                      ║\n` +
            `╠══════════════════════════════════════════════════════════════════════╣\n` +
            `║  Badges conquistados:                                                ║\n` +
            badgesLines +
            `\n╠══════════════════════════════════════════════════════════════════════╣\n` +
            `║  Data de emissão : ${today.padEnd(51)}║\n` +
            `║  Código          : ${code.padEnd(51)}║\n` +
            `║                                                                      ║\n` +
            `║      "A jornada de mil milhas começa com um único passo."            ║\n` +
            `║                              — Lao Tsé                               ║\n` +
            `║                                                                      ║\n` +
            `║                 ✅  Documento válido para portfólio                  ║\n` +
            `║                                                                      ║\n` +
            `╚══════════════════════════════════════════════════════════════════════╝`;
        const promos = formation.promotions
            .map((p) => `- **${p.partner}**: ${p.discount}`)
            .join("\n");
        const text = `\`\`\`\n${cert}\n\`\`\`\n\n` +
            `## 🎁 Partner Promotions\n${promos}\n\n` +
            `> 💡 Share your certificate on LinkedIn and show the world your achievement! 🌟`;
        return { content: [{ type: "text", text }] };
    }
    catch (err) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${err instanceof Error ? err.message : String(err)}`,
                },
            ],
            isError: true,
        };
    }
});
// ---------------------------------------------------------------------------
// Auth middleware (HTTP mode)
// ---------------------------------------------------------------------------
const API_KEY = process.env.DIO_API_KEY;
function isAuthorised(req) {
    if (!API_KEY)
        return true; // no key configured → open (dev mode)
    const authHeader = req.headers["authorization"] ?? "";
    const xApiKey = req.headers["x-api-key"] ?? "";
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7) === API_KEY;
    }
    if (typeof xApiKey === "string" && xApiKey === API_KEY)
        return true;
    return false;
}
// ---------------------------------------------------------------------------
// Transport selection
// ---------------------------------------------------------------------------
async function main() {
    const transport = process.env.DIO_TRANSPORT ?? "stdio";
    if (transport === "http") {
        const port = Number(process.env.DIO_PORT ?? 3100);
        const httpServer = createServer(async (req, res) => {
            if (!isAuthorised(req)) {
                res.writeHead(401, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Unauthorised" }));
                return;
            }
            // All MCP traffic goes to POST /mcp  (Streamable HTTP transport)
            if (req.method !== "POST" || req.url !== "/mcp") {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Not found. POST to /mcp" }));
                return;
            }
            const httpTransport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });
            await server.connect(httpTransport);
            await httpTransport.handleRequest(req, res);
        });
        httpServer.listen(port, () => {
            console.error(`dio-explorer MCP server (HTTP) listening on http://0.0.0.0:${port}/mcp`);
            if (!API_KEY) {
                console.error("⚠️  DIO_API_KEY not set — server is open. Set it for production use.");
            }
        });
    }
    else {
        // Default: stdio (used by Bob's local mcp.json)
        const stdioTransport = new StdioServerTransport();
        await server.connect(stdioTransport);
        console.error("dio-explorer MCP server running on stdio");
    }
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
