# Project Plan: Legal MCP Gateway

## Decision

Build the scaffold. Dan's OAuth suspicion is accurate enough to justify it.

The clean version: legal-tech APIs are inconsistent. Clio appears to enforce both OAuth scopes and in-app user permissions. MyCase likely enforces authorized user/firm privileges. Filevine often works through service/API users whose permissions matter, but integrations commonly use broad service accounts. Lawmatics is the problem child: its public docs state that it does not support OAuth scopes and that authorizing an app grants full CRUD access to the account.

That makes a separate MCP permission layer useful. Not because every vendor is broken, but because cross-app AI access needs consistent policy, audit, dry-run writes, and prompt-injection boundaries regardless of the upstream vendor's model.

## MVP goal

A thin, secure policy-enforcing MCP gateway:

- Runs locally or self-hosted.
- Lets an admin connect vendor accounts later.
- Provisions team users.
- Assigns job-title presets.
- Filters MCP tool visibility per user.
- Enforces permission on every tool invocation.
- Logs audit metadata.
- Provides a connector SDK for future legal-tech integrations.

## Non-goals for the scaffold

- No real Lawmatics/Filevine/Clio/MyCase connectors yet.
- No real OAuth storage yet.
- No multi-tenant SaaS control plane yet.
- No raw customer data storage.
- No connector marketplace.

## Stack

- TypeScript
- npm workspaces
- Node HTTP server for initial scaffold
- Vite + React admin UI scaffold
- Vitest tests
- Future: official MCP TypeScript SDK transport adapters, Postgres + Drizzle, OIDC/JWT auth, encrypted secret vault

## Build phases

1. Scaffold: monorepo, shared types, policy engine, mock connector, MCP core, HTTP/CLI/admin placeholders, docs, tests.
2. Real MCP transport: official MCP SDK, stdio, Streamable HTTP, auth context resolution.
3. Persistence/admin API: Postgres + Drizzle, orgs, users, memberships, policies, audits, connector installs.
4. Secret vault/OAuth: encrypted credentials, BYO vendor app credentials, callback flow.
5. First vendor connector: Lawmatics, because Dan can test against an existing account and Lawmatics has the clearest OAuth-scope gap.

## Auth direction

See `docs/auth-model.md`.

The durable identity for permissions is the Legal MCP Gateway user, not the agent harness and not the vendor token. Hermes, Claude, ChatGPT, Cursor, and other MCP clients should each get their own OAuth grant/token for the same gateway user. The gateway then applies the same job-title preset, groups, policy rules, and audit rules on every tool call.

For Lawmatics specifically, assume the vendor connection is broad/full-account access until proven otherwise. The gateway must enforce least privilege above Lawmatics.

## Open questions

- Project name before public GitHub repo creation.
- Local-first SQLite/PGlite vs self-host-first Postgres.
- Neutral OSS project vs Schnurbusch Law internal-first branding.
