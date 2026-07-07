# Legal MCP Gateway

A self-hostable MCP permissions gateway for legal-tech systems.

The goal is simple: connect legal apps once, then expose only the MCP tools each team member should actually use. It is not a data lake. It is a thin policy and audit layer over vendor APIs.

## Current status

This is a scaffold. It includes:

- TypeScript npm workspace project
- Policy engine with job-title presets and deny precedence
- Connector SDK with a mock legal connector
- MCP gateway core that filters visible tools and enforces permissions on invocation
- Minimal HTTP server and CLI placeholders
- Lightweight admin UI scaffold
- Research and planning docs

Real Lawmatics/Filevine/Clio/MyCase/etc. connectors come later.

## Why this exists

Legal-tech APIs are inconsistent. Some vendors enforce the authenticated user's in-app permissions. Others expose broad account-level API access, weak scopes, service-account access, or docs that are silent. Lawmatics is the clearest reason to build a policy gateway: its public OAuth docs state that it does not support scopes and authorization grants full CRUD access to the account.

## Quick start

```bash
npm install
npm run verify
npm run dev:server
```

In another shell:

```bash
curl http://127.0.0.1:4317/health
curl -H 'x-legal-mcp-user-id: demo-paralegal' http://127.0.0.1:4317/tools
```

Admin UI scaffold:

```bash
npm run dev:admin
```

## Repository layout

```txt
apps/
  server/     Minimal HTTP gateway API scaffold
  cli/        Local stdio/CLI scaffold
  admin/      Lightweight admin UI scaffold
packages/
  core/       Shared domain types, errors, audit helpers, external-content labels
  policy/     RBAC/ABAC evaluator and job-title presets
  connectors/ Connector SDK and mock legal connector
  mcp/        Tool filtering and policy-enforced invocation core
docs/
  architecture.md
  connector-development.md
  deployment.md
  policy-model.md
  project-plan.md
  project-tracker.md
  research/   Ignored local research markdown files
```

## Security posture

- Bring-your-own vendor OAuth app/client credentials. Do not ship shared client secrets.
- Encrypt OAuth refresh tokens, API keys, and vendor client secrets before any real connector work.
- Hide tools a user cannot invoke, but also enforce permission checks on every invocation.
- Default writes to dry-run where possible.
- Label external vendor content as untrusted data.
- Audit metadata, not raw legal content.

## License

MIT.
