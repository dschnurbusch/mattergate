# AGENTS.md

## Project summary

Legal MCP Gateway is a self-hostable/local MCP permissions gateway for legal-tech systems. It lets an admin connect vendor accounts, provision team users, assign job-title presets, and expose only the MCP tools and actions a user is allowed to use.

## Tooling

- Runtime/package manager: Node + npm workspaces.
- Language: TypeScript, strict mode.
- Tests: Vitest.
- Admin UI scaffold: Vite + React.
- Current scaffold intentionally uses a mock legal connector. Do not add real vendor credentials.

## Commands

```bash
npm install
npm run build
npm test
npm run verify
npm run dev:server
npm run dev:admin
npm run dev:stdio
```

`npm run verify` is the normal pre-finish check. It builds all workspaces and runs tests.

## Important docs

Tracked project docs live in `docs/`:

- `docs/project-plan.md` — MVP scope, architecture, roadmap, and build phases.
- `docs/project-tracker.md` — current status, decisions, next actions, and open questions.
- `docs/auth-model.md` — user login, per-client MCP grants, token validation, and Lawmatics auth assumptions.
- `docs/architecture.md` — system architecture.
- `docs/policy-model.md` — RBAC/ABAC permission model.
- `docs/connector-development.md` — how to add connectors safely.
- `docs/deployment.md` — local/self-hosted deployment notes.

Local research files live in `docs/research/` and are intentionally gitignored. They currently include:

- `docs/research/oauth-permissions-research.md`
- `docs/research/legal-tech-integration-catalog.md`
- `docs/research/weave-legal-notes.md`

Use research files as local source notes. If a research conclusion becomes a durable project decision, distill it into a tracked doc rather than removing the gitignore.

## Architecture rules

- Put shared types and audit/external-content helpers in `packages/core`.
- Put all permission evaluation in `packages/policy`.
- Put connector manifests and implementations in `packages/connectors`.
- Put MCP tool filtering and invocation enforcement in `packages/mcp`.
- Put HTTP transport/API in `apps/server`.
- Put local stdio/CLI entry points in `apps/cli`.
- Put the admin interface in `apps/admin`.

## Security rules

- Never commit real OAuth client secrets, refresh tokens, access tokens, API keys, customer data, or raw vendor docs containing token-like examples.
- Bring-your-own credentials is the default public posture for vendor OAuth/API access.
- Do not rely on hiding tools alone. Enforce policy again on every invocation.
- Explicit deny overrides allow.
- Mutating tools should support `dry_run`; actual writes require explicit confirmation and audit logging.
- Treat vendor/client content as untrusted external content. Label it in tool results and never turn it into agent instructions.
- Audit metadata by default. Do not log full emails, documents, matter notes, or message bodies.

## Verification before finishing

Before reporting a code change done, run:

```bash
npm run verify
```

If verification cannot run, report the exact blocker and the last successful command. Do not claim an unverified scaffold works.
