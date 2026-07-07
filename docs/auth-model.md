# Auth Model

## Decision

Use user login to the MCP gateway as the stable identity layer. Vendor OAuth/API credentials are connection credentials, not the source of truth for team-member permissions.

A user's permissions should be the same whether they connect through Hermes, Claude, ChatGPT, Cursor, or another MCP-capable client because every client receives an access token for the same gateway user and organization. The gateway enforces policy on every tool call.

## Mental model

There are three different identities:

1. **MCP client identity** — ChatGPT, Claude, Hermes, Cursor, etc. This is the OAuth client.
2. **Gateway user identity** — the employee/team member logging into Legal MCP Gateway. This controls job-title presets, groups, and policy rules.
3. **Vendor connection identity** — the Lawmatics/Clio/Filevine account or app credentials used by the connector. This may be an admin-authenticated account, service account, or per-user vendor OAuth token depending on the vendor.

Do not collapse these into one thing. Lawmatics is the clearest example: the vendor token may be broad/full CRUD, so the gateway user identity must carry the least-privilege policy.

## Remote HTTP MCP flow

For hosted/self-hosted HTTP MCP, implement the MCP authorization spec using OAuth 2.1 patterns:

1. User adds the MCP server URL to an agent client.
2. Client calls the MCP endpoint without a token.
3. Gateway returns `401 Unauthorized` with a `WWW-Authenticate` challenge pointing to protected resource metadata.
4. Client reads `/.well-known/oauth-protected-resource` to discover the authorization server.
5. Client registers or identifies itself using one of:
   - Client ID Metadata Documents (CIMD)
   - Dynamic Client Registration (DCR)
   - preregistered OAuth client
6. Client opens the user's browser to the gateway authorization server.
7. User logs into the gateway and consents to the MCP client connection.
8. Authorization server issues access token, usually plus refresh token, bound to:
   - gateway user
   - organization
   - MCP client/application
   - audience/resource = this MCP server
   - scopes such as `mcp:tools:read`, `lawmatics:read`, `lawmatics:write:draft`
9. MCP client sends `Authorization: Bearer <access-token>` on every MCP request.
10. Gateway validates token audience, expiry, issuer, subject, org, client, and scopes on every request, then applies the internal policy engine before listing or invoking tools.

## Stable cross-client permissions

Permissions live in the gateway database:

- `users`
- `organizations`
- `memberships`
- `job_title_preset`
- `groups`
- `policy_rules`
- `mcp_client_grants`
- `mcp_access_tokens`

Each agent client gets a separate grant/token for the same user. The effective permissions come from the user/member/policy records, not from the client. That means revoking or changing a user's Paralegal preset affects all connected clients.

## Client-specific grants

Track each agent/harness separately:

- user: `alice@example.com`
- org: `firm_123`
- client: `chatgpt`, `claude`, `hermes-local`, etc.
- grant ID
- token hash / token family
- scopes granted
- refresh token hash if issued
- last used
- revoked at

This lets an admin revoke one harness without disabling the employee everywhere.

## Local stdio mode

The MCP authorization spec is for HTTP transports. Stdio clients usually do not run a browser OAuth flow through the server. For local mode, support one of:

1. `legal-mcp-gateway login` opens browser, logs the user into the gateway, and stores a local token securely.
2. The stdio MCP process reads a local token from the OS keychain or config file.
3. The server still resolves the token to the same gateway user and applies the same policy engine.

Local mode should not mint broad admin tokens just because the process runs on the user's machine.

## Lawmatics connector implication

For Lawmatics first:

- Admin connects the firm's Lawmatics account/app credentials.
- Store Lawmatics tokens encrypted.
- Treat Lawmatics access as broad until proven otherwise.
- Gateway maps team users to gateway policy, not Lawmatics OAuth scopes.
- All Lawmatics write tools should start as dry-run or draft/preview tools.
- Every Lawmatics result containing CRM/matter/client text must be labeled as untrusted external content.

## Security requirements

- Access tokens must be audience-bound to this MCP server.
- Tokens must not be accepted in query strings.
- Validate issuer, audience/resource, expiry, subject, client, and scopes.
- Return 401 for missing/invalid/expired tokens.
- Return 403 for valid token but insufficient internal policy.
- Do not trust tool-list filtering alone. Enforce again at invocation.
- Keep vendor tokens server-side. Never pass Lawmatics tokens to the MCP client.
- Admin UI should show active client grants and allow revocation per user/per client.
