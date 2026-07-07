# Project Tracker

## Current status

Phase 1 scaffold created locally in `~/Code/legal-mcp-gateway`.

## Completed

- [x] Research legal-tech OAuth/user-permission behavior.
- [x] Research legal-tech API/developer access paths.
- [x] Document Weave Legal positioning from public pages.
- [x] Create npm workspace scaffold.
- [x] Add shared core types.
- [x] Add policy evaluator and presets.
- [x] Add mock legal connector.
- [x] Add MCP gateway core for tool filtering and invoke-time enforcement.
- [x] Add minimal server, CLI, and admin UI scaffolds.
- [x] Add tracked architecture and planning docs.
- [x] Add gitignored local research docs.
- [x] Add AGENTS.md with research/tracker instructions.

## Next actions

- [ ] Decide public repo name and GitHub organization/account.
- [ ] Add official MCP SDK transport adapters.
- [ ] Add persistence layer.
- [ ] Add secret vault.
- [ ] Add real admin CRUD endpoints.
- [ ] Pick first real connector.
- [ ] Request developer/sandbox access for selected vendors.

## Important decisions

- Use BYO vendor OAuth/API credentials. Do not ship shared OAuth client secrets in open source.
- Treat `docs/research/` as local ignored research notes. Distill stable decisions into tracked docs.
- Start with a mock connector and policy engine before vendor-specific work.
- Hide unauthorized tools and enforce policy again at invocation time.
- Default mutating tools toward dry-run and confirmation.

## Research files

Ignored local files:

- `docs/research/oauth-permissions-research.md`
- `docs/research/legal-tech-integration-catalog.md`
- `docs/research/weave-legal-notes.md`

These are useful for implementation planning but should not be assumed present in a fresh clone.
