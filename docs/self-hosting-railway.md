# Self-hosting on Railway: one-click deploy plan

## Goal

Provide a future one-click Railway deploy path for firms, consultants, and self-hosters who want to run Legal MCP Gateway without cloning the repo or manually wiring infrastructure. The target experience is a `Deploy on Railway` template button that provisions the app, a managed Postgres database, generated secrets, and clear post-deploy setup steps.

This is a project plan, not a promise that the current scaffold is production-ready. The current implementation still needs persistence, auth, secret storage, real MCP transports, migrations, and a production connector before this can be offered as a safe public template.

## Target deployment shape

Railway template resources:

1. **Gateway web service**
   - Builds the monorepo and starts the production HTTP/MCP server.
   - Serves API routes required by the admin UI, MCP HTTP transport, OAuth callbacks, health checks, and connector setup flows.
2. **Admin UI**
   - Prefer serving the built admin UI from the gateway service if practical.
   - If split hosting is cleaner, make it a second Railway service with the same public domain/callback guidance.
3. **Postgres**
   - Railway managed Postgres add-on as the default database.
   - Required for orgs, users, policies, connector installs, OAuth state, encrypted credential envelopes, audits, and migrations.
4. **Optional background/worker process**
   - Only add if needed for audit export, token refresh, async connector sync, or retention jobs.
   - Avoid adding a worker until the runtime needs it.

## Railway template button

Future public docs should include a Railway template button similar to:

```md
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/<template-id>)
```

Template requirements before publishing:

- Repository is public and template-safe.
- No tracked secrets, no sample production credentials, and no maintainer-owned vendor client secret in the template.
- Health check route exists and fails closed when required configuration is missing.
- Production build/start commands are documented and tested on Railway.
- Database migrations run in a repeatable, idempotent release step.
- Bootstrap admin flow is safe for first-run deployment.
- Post-deploy checklist explains public URL, callback URLs, vendor OAuth setup, and hardening.

## Required services and variables

Minimum Railway variables for the gateway service:

| Variable | Source | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Railway Postgres reference | Primary Postgres connection string. |
| `APP_URL` | User/Railway public URL | Canonical external URL used for OAuth redirects, links, and allowed origins. |
| `SESSION_SECRET` | Generated | Signs/encrypts browser session cookies or equivalent session state. |
| `TOKEN_SIGNING_SECRET` or `JWT_PRIVATE_KEY` | Generated | Signs gateway-issued MCP/OIDC/JWT access tokens. Prefer asymmetric keys if external verification is needed. |
| `ENCRYPTION_KEY` | Generated | Encrypts OAuth refresh tokens and vendor credentials at rest. Must be high entropy and rotation-aware. |
| `BOOTSTRAP_ADMIN_EMAIL` | User-supplied | First admin identity for initial setup. |
| `BOOTSTRAP_ADMIN_TOKEN` | Generated | One-time bootstrap secret used to claim the first admin account. |
| `OAUTH_STATE_SECRET` | Generated | Protects vendor OAuth state/PKCE/session correlation. May be folded into `SESSION_SECRET` if the implementation supports it safely. |
| `NODE_ENV` | Template | `production`. |
| `LOG_LEVEL` | Template/user | Default `info`; avoid verbose logs in production. |

Connector-specific variables should be optional and clearly marked. For Lawmatics BYO OAuth, expected variables are likely:

| Variable | Source | Purpose |
| --- | --- | --- |
| `LAWMATICS_CLIENT_ID` | Self-hoster's Lawmatics developer/OAuth app | OAuth client ID. |
| `LAWMATICS_CLIENT_SECRET` | Self-hoster's Lawmatics developer/OAuth app | OAuth client secret; store only in Railway secrets. |
| `LAWMATICS_REDIRECT_URI` | Derived from `APP_URL` | Callback URL registered in the Lawmatics app, for example `${APP_URL}/api/connectors/lawmatics/oauth/callback`. |

Prefer deriving connector callback URLs from `APP_URL` and documenting the exact value in the admin setup screen. Do not require users to hand-maintain duplicate URL variables unless a vendor demands a static registered value.

## Generated secrets

The Railway template should generate strong random values for all gateway secrets it can own:

- `SESSION_SECRET`
- `TOKEN_SIGNING_SECRET` or `JWT_PRIVATE_KEY`
- `ENCRYPTION_KEY`
- `BOOTSTRAP_ADMIN_TOKEN`
- `OAUTH_STATE_SECRET`

Secret handling rules:

- Never print full generated secrets in logs after first provisioning.
- Never commit generated values to the repo or docs.
- Expose rotation guidance before the template is recommended for production.
- Support key versioning for encrypted vendor credentials before encouraging long-lived production use.
- Make the bootstrap token one-time-use, expire it after claim, and recommend deletion from Railway after setup.

## Public URL and callback URLs

The deploy flow must make the public Railway domain explicit because OAuth providers require exact redirect/callback URLs.

Post-deploy setup should instruct the self-hoster to:

1. Open the Railway service's public domain.
2. Set `APP_URL` to the final HTTPS URL, such as `https://legal-mcp-gateway-production.up.railway.app` or a custom domain.
3. Redeploy if Railway does not automatically inject the final value before boot.
4. Register connector callback URLs in each vendor app.
5. Confirm the admin UI displays the same callback URL that was registered with the vendor.

Expected callback URL pattern:

```text
${APP_URL}/api/connectors/:connectorId/oauth/callback
```

For Lawmatics, plan to document the exact callback path once the connector route is implemented.

## OAuth app model: broker by default, BYO in Advanced setup

### Preferred convenience path: Railway-hosted OAuth broker

The normal public/self-hosted UX should use a maintainer-hosted OAuth broker deployed on Railway from a separate GitHub repo.

Target user flow:

```text
Connectors → Lawmatics → Integrate Lawmatics
```

The self-hosted Mattergate deployment redirects the admin through the broker. The broker owns the maintainer-approved Lawmatics OAuth app credentials, exchanges the authorization code, and hands the resulting token material back to the self-hosted Mattergate instance through a short-lived one-time handoff. The self-hosted instance then stores the vendor token encrypted in its own database.

Why Railway:

- Dan already runs multiple Railway apps, so Railway's monthly floor is not a blocker.
- GitHub → Railway auto-deploy is the normal operational path.
- The broker is low-volume install-time infrastructure, not a hot-path API proxy, so incremental usage should be small.
- Keeping it on Railway avoids adding another platform unless there is a concrete reason.

Broker responsibilities:

- Hold the maintainer-owned Lawmatics OAuth `client_secret` as a Railway secret.
- Use one stable broker callback URL registered with Lawmatics.
- Validate self-hosted instance registration and redirect destinations.
- Create short-lived OAuth state and one-time handoff codes.
- Exchange the Lawmatics authorization code server-side.
- Deliver token material only to the requesting Mattergate instance, preferably encrypted to that instance's public key.
- Delete short-lived handoff material after redemption or expiry.
- Record minimal audit metadata without logging access tokens, client secrets, matter data, or raw OAuth codes.

Broker deployment should be a separate repo/service, likely `mattergate-oauth-broker`, because it is a different trust boundary from the open-source self-hosted gateway. The broker code may be public, but its Railway variables hold maintainer-owned OAuth secrets. It should not be included in the one-click self-hosted Railway template.

See `docs/oauth-broker-railway.md` for the dedicated broker plan.

### Advanced setup fallback: bring your own vendor OAuth app

BYO vendor credentials should remain available under an **Advanced setup** section for firms that do not want to trust the broker, need their own vendor review screen, or have compliance reasons to own every OAuth app.

For Lawmatics, this means the self-hoster configures `LAWMATICS_CLIENT_ID` and `LAWMATICS_CLIENT_SECRET` server-side. Once those OAuth app credentials exist, the admin UX can still be a clean button:

```text
Connectors → Lawmatics → Advanced setup → Use my own OAuth app → Integrate Lawmatics
```

That button should start the OAuth redirect and token exchange. The user should not paste a Lawmatics access token.

BYO credential model:

- Each firm or consultant creates/registers their own vendor developer app.
- They paste the vendor client ID/secret into Railway variables or the gateway's encrypted connector setup flow.
- The deployment owns its own tokens and audit boundaries.
- The project does not ship shared OAuth client secrets.

This avoids relying on a maintainer-hosted broker, but it has limitations:

- Some vendors may restrict app creation, require manual approval, or only grant developer access to existing customers.
- Self-hosters must understand exact callback URLs and app configuration.
- Vendor review screens and app names will belong to the self-hoster, not the Mattergate maintainers.
- Support burden is higher because each deployment can have different vendor app settings.

## Lawmatics OAuth admin click flow

Because Lawmatics is the first planned real connector and appears to grant broad account access without fine-grained OAuth scopes, the admin flow should be explicit and conservative:

1. Admin deploys the Railway template and completes first-run bootstrap.
2. Admin opens **Connectors → Lawmatics** in the gateway admin UI.
3. UI shows:
   - The required Lawmatics callback URL.
   - BYO client ID/client secret fields or instructions for Railway secret variables.
   - A warning that Lawmatics authorization may grant broad/full-account access and that gateway policies enforce least privilege above Lawmatics.
4. Admin clicks **Connect Lawmatics**.
5. Gateway creates OAuth state/PKCE data, stores only short-lived state, and redirects to Lawmatics.
6. Admin approves in Lawmatics.
7. Lawmatics redirects back to the gateway callback URL.
8. Gateway exchanges the code server-side, encrypts refresh/access token material, records connector install metadata, and writes an audit event.
9. Gateway runs a minimal connection test that reads only harmless metadata needed to confirm the install.
10. Admin maps the Lawmatics connection to gateway groups/job-title presets before any end user receives tool access.

The UI should not imply Lawmatics scopes provide least privilege unless the connector implementation verifies that capability.

## Migrations

Before publishing a Railway template, the app needs a reliable migration path:

- Use Postgres-backed migrations committed to the repo.
- Run migrations automatically as a Railway release/pre-start step, or document a one-click/manual Railway command.
- Make migrations idempotent and safe to retry.
- Block server startup if the schema is too old/new for the running app.
- Include rollback/restore guidance for production upgrades.
- Document how to inspect migration status from Railway logs or the admin UI.

## Seed and bootstrap admin

The template must support a secure first-run path without hardcoded credentials.

Recommended flow:

1. Railway generates `BOOTSTRAP_ADMIN_TOKEN` and the user supplies `BOOTSTRAP_ADMIN_EMAIL`.
2. On first boot, the gateway creates no reusable default password.
3. The admin visits `${APP_URL}/setup` and enters the bootstrap token, or follows a one-time setup link displayed only in Railway deployment instructions.
4. Gateway verifies the token, creates/claims the first admin, records an audit event, and disables bootstrap.
5. Admin configures login/OIDC or passkey/passwordless auth before inviting users.
6. Docs instruct the user to delete or rotate `BOOTSTRAP_ADMIN_TOKEN` after setup.

If email/OIDC is not ready when Railway support lands, keep the template clearly labeled as preview and restrict it to a single bootstrap admin until production auth is implemented.

## Security hardening checklist

The Railway plan should not be marketed as production-ready until these hardening items are addressed or explicitly documented:

- HTTPS-only `APP_URL`; reject non-HTTPS external callback URLs outside local development.
- Secure, HTTP-only, same-site cookies for browser sessions.
- CSRF protection for admin mutations and connector OAuth setup.
- OIDC/JWT or scoped MCP access tokens for remote MCP clients.
- Per-client grants so Claude, ChatGPT, Cursor, Hermes, and other MCP clients can be revoked independently.
- Encrypt vendor secrets and refresh tokens at rest using a rotation-aware key strategy.
- Enforce policy on every invocation, not just tool listing.
- Explicit deny overrides allow; mutating tools require confirmation and audit logging.
- Rate limits, body limits, origin validation, and request timeouts.
- Redacted logs; never log full client matters, emails, documents, notes, OAuth codes, tokens, or secrets.
- Audit retention controls and export/delete process.
- Health checks that do not leak secrets or sensitive configuration.
- Admin-only connector install and token revocation flows.
- Clear backup/restore guidance for Postgres before upgrades.
- Dependency update and vulnerability review process before public template promotion.

## Documentation deliverables before launch

Before adding the Railway button to the README or project homepage, create/update:

- `docs/deployment.md` with the supported production start command and Railway-specific references.
- Public self-hosting guide with screenshots of Railway variables and callback URL setup.
- Connector-specific setup pages, starting with Lawmatics.
- Upgrade guide covering migrations and secret rotation.
- Security notes covering BYO OAuth credentials and Lawmatics broad-access warnings.
- Troubleshooting page for common Railway deploy, Postgres, callback URL, and OAuth approval failures.

## Open implementation questions

- Should the admin UI be served by the gateway or as a separate Railway service?
- Which auth provider/path should be the first production-ready admin login option?
- Which migration tool will be used with Postgres?
- Can Lawmatics developer apps be created self-service by all customers, or is approval/manual support required?
- Will Railway generated variables support every required secret shape, especially asymmetric JWT keys, or should the app generate and persist key material on first boot?
- What is the minimum safe preview mode before a real secret vault and production auth exist?
