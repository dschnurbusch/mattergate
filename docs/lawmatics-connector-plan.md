# Lawmatics Connector Plan

## Decision

Lawmatics is the first real connector.

Reasons:

- Dan can test against an existing Lawmatics account.
- Existing internal Railway MCP tools already prove useful Lawmatics workflows.
- Lawmatics OAuth appears broad: current public/local notes say Lawmatics does not support OAuth scopes and returns a non-expiring bearer `access_token`, with no refresh token. Treat the token as full-account access unless Lawmatics proves otherwise.
- The connector is exactly the kind of upstream API where Mattergate's own user/policy layer matters.

## Existing internal MCP tools to carry forward

Source inspected: `~/Code/railway-mcp-server/src/tools/lawmatics` plus local MCP notes in `~/.hermes/skills/mcp/mcporter/references/lawmatics-mcp-tooling.md`.

| Tool | Type | Carry-forward priority | Notes |
| --- | --- | --- | --- |
| `lm_whoami` | read/auth check | P0 | Credential/install health check. Uses `GET /users/me`. |
| `lm_list_resources` | read/reference | P0 | Reference data for sources, practice areas, stages, pipelines, users, tags, statuses, custom fields. |
| `lm_get_schema` | read/reference | P0 | Compact environment map for IDs. Useful after install and for admin mapping screens. |
| `lm_find_matter` | read/search | P0 | Matters are Lawmatics `prospects`. Supports finder endpoints and one server-side filter plus client-side filtering. |
| `lm_get_matter` | read/detail | P0 | Uses Lawmatics prospect ID. Existing tool takes `id`, not `matter_id`. Normalize in new connector API. |
| `lm_find_contact` | read/search | P0 | Search contacts by email/name/phone or filters. |
| `lm_get_matter_context` | read/composition | P0 | High-value agent tool: compact sales/intake context plus optional financials. |
| `lm_get_matter_timeline` | read/composition | P1 | Notes/tasks/activities/interactions. Needs endpoint-specific filter caution. |
| `lm_financial_summary` | read/financial | P1 | Invoices, transactions, expenses, time entries. Avoid unsupported matter filters. |
| `lm_pipeline_snapshot` | read/analytics | P1 | Sales pipeline by status/source/practice/stage/campaign. |
| `lm_source_performance` | read/analytics | P1 | Source/campaign performance. Useful for firm dashboards, less critical to first auth/connectivity slice. |
| `lm_stale_leads` | read/sales ops | P1 | Sales follow-up triage. Good later after policy/resource filters exist. |
| `lm_add_matter_note` | write/low-risk | P2 | Keep dry-run first. Useful but should wait until write confirmation/audit path is real. |
| `lm_manage_sales_tasks` | write/workflow | P2 | List/create/complete sales tasks. Writes need dry-run and policy gates. |
| `lm_create_hourly_time_entry` | write/billing | P3 | Financial write. Needs stricter confirmation and maybe separate billing permission. |
| `lm_create_flat_fee_time_entry` | write/billing | P3 | Financial write. Existing finding: flat-fee amount belongs in `rate_cents`, `rate_flat_fee=true`. |
| `lm_create_expense` | write/billing | P3 | Financial write. Existing finding: Lawmatics totals `cost_cents × quantity`; quantity is required. |
| `lm_update_expense` | write/billing | P3 | Allowlisted field update only, with before/after/dry-run. |

Do not start with raw generic Lawmatics request tools. They defeat the point of a policy gateway.

## Recommended implementation phases

### Phase L0: auth/install skeleton

- Connector manifest for Lawmatics.
- Admin install screen with **Integrate Lawmatics** button.
- OAuth state storage and callback route.
- Server-side token exchange.
- Encrypted storage of Lawmatics access token.
- Health check using `GET /users/me`.
- Admin-facing warning: Lawmatics may grant broad account access; Mattergate policies provide least privilege.

### Phase L1: safe read tools

Port and reshape:

- `lawmatics_whoami`
- `lawmatics_list_resources`
- `lawmatics_get_schema`
- `lawmatics_find_matter`
- `lawmatics_get_matter`
- `lawmatics_find_contact`
- `lawmatics_get_matter_context`

These can power real agent use while keeping side-effect risk low.

### Phase L2: timeline and financial read tools

Port:

- `lawmatics_get_matter_timeline`
- `lawmatics_financial_summary`
- `lawmatics_pipeline_snapshot`
- `lawmatics_source_performance`
- `lawmatics_stale_leads`

Keep output compact. Label matter notes, interactions, messages, descriptions, and user-authored text as untrusted external content.

### Phase L3: write tools

Add writes only after the gateway has:

- per-user MCP auth
- persistent policies
- audit events
- dry-run/confirmation obligations
- idempotency keys where possible
- explicit write and financial-write permission sets

Candidate writes:

- add matter note
- create/complete sales task
- create hourly time entry
- create flat-fee time entry
- create/update expense
- carefully allowlisted matter-field update, if needed later

## Lawmatics OAuth flow as understood

Existing internal setup used a one-time local flow and then set `LAWMATICS_ACCESS_TOKEN` on Railway. Mattergate should productize that into an admin click flow.

Known current flow:

1. Admin opens Mattergate **Connectors → Lawmatics**.
2. Gateway creates an OAuth state record and computes callback URL:

   ```text
   https://<gateway-app-url>/api/connectors/lawmatics/oauth/callback
   ```

3. Gateway redirects admin to:

   ```text
   https://app.lawmatics.com/oauth/authorize?client_id=<CLIENT_ID>&redirect_uri=<ENCODED_CALLBACK>&response_type=code&state=<STATE>
   ```

4. Lawmatics redirects back with:

   ```text
   ?code=<AUTH_CODE>&state=<STATE>
   ```

5. Gateway exchanges code server-side:

   ```http
   POST https://api.lawmatics.com/oauth/token
   Content-Type: application/x-www-form-urlencoded
   Accept: application/json

   client_id=<CLIENT_ID>
   client_secret=<CLIENT_SECRET>
   grant_type=authorization_code
   code=<AUTH_CODE>
   redirect_uri=<EXACT_CALLBACK_USED_IN_AUTHORIZE>
   ```

6. Successful response shape from existing notes:

   ```json
   {
     "token_type": "bearer",
     "access_token": "...",
     "created_at": 1539723267
   }
   ```

7. Gateway encrypts the access token, records installation metadata, writes an audit event, and validates with `GET https://api.lawmatics.com/v1/users/me`.

Important details:

- The `redirect_uri` in authorize, token exchange, and Lawmatics app configuration must match exactly.
- Existing notes say Lawmatics access tokens are non-expiring and Lawmatics does not issue refresh tokens.
- If token exchange returns `invalid_client`, suspect copied/OCR'd client credentials first.
- Base API URL: `https://api.lawmatics.com/v1`.

## The “no API keys or client tokens needed” goal

For an internal Mattergate deployment, Dan can have a smooth **Integrate Lawmatics** button once the deployment has Lawmatics OAuth client credentials configured server-side.

For a public open-source self-hosted deployment, the harder truth is:

- A Lawmatics OAuth app has a `client_id` and `client_secret`.
- We cannot safely ship a shared `client_secret` in an open-source repo or Railway template.
- Therefore pure self-hosting requires one of these options:

### Option A: BYO Lawmatics OAuth app credentials

Default open-source posture.

- Firm creates/gets its Lawmatics developer app.
- Firm enters client ID/secret into Mattergate admin UI or Railway variables.
- Then admins get the desired one-click **Integrate Lawmatics** flow.

This is secure and self-contained, but not literally zero credential setup.

### Option B: maintainer-hosted OAuth broker

Future convenience layer.

- Mattergate maintainers operate an approved Lawmatics OAuth app and secure broker.
- Self-hosted deployments redirect admins through the broker.
- Broker handles the client secret and relays an installation result back to the self-hosted instance.

This could provide the “no API keys/client tokens” user experience, but it creates a serious trust boundary and may require Lawmatics approval. It needs tenant isolation, redirect allowlists, short-lived handoff codes, revocation, audit, abuse controls, and clear privacy terms.

### Option C: hosted Mattergate

Future hosted/SaaS version.

- The hosted service owns the Lawmatics OAuth app.
- Firms click **Integrate Lawmatics** with no self-host credential setup.
- This is operationally simpler for the user but no longer purely self-hosted.

## Endpoint and behavior notes from existing tools

- Matters are API `prospects`, not `/matters`.
- List matters: `GET /prospects`.
- Get matter: `GET /prospects/:prospect_id`.
- Matter finders:
  - `GET /prospects/find_by_phone/:phone_number`
  - `GET /prospects/find_by_email/:email_address`
  - `GET /prospects/find_by_name/:name`
- Contact finders:
  - `GET /contacts/find_by_phone/:phone_number`
  - `GET /contacts/find_by_email/:email_address`
  - `GET /contacts/find_by_name/:name`
- `GET /users/me` verifies credentials.
- Reference resources include `sources`, `campaigns`, `practice_areas`, `pipelines`, `stages`, `sub_statuses`, `users`, `task_statuses`, `custom_fields`, `custom_contact_types`, `tags`, `relationship_types`, `event_types`.
- Financial resources include `invoices`, `transactions`, `expenses`, and `time_entries`.
- Timeline resources include `notes`, `tasks`, `activities`, `interactions`, and possibly `files`.
- Lawmatics supports one server-side filter at a time. Multi-criteria tools should choose one server-side filter and apply cautious bounded client-side filtering.
- Some plausible filters are rejected. Existing known pitfalls:
  - `/invoices` rejects `filter_by=matter_id`.
  - `/interactions` rejects `filter_by=matter_id`.
  - Do not assume financial endpoints support matter filters; fetch bounded pages and match client-side.

## Policy mapping

Initial Mattergate capabilities:

- `lawmatics.auth.read`
- `lawmatics.schema.read`
- `lawmatics.contact.read`
- `lawmatics.matter.read`
- `lawmatics.timeline.read`
- `lawmatics.financial.read`
- `lawmatics.analytics.read`
- `lawmatics.note.write`
- `lawmatics.task.write`
- `lawmatics.billing.write`

Suggested preset mapping:

| Preset | Initial Lawmatics capabilities |
| --- | --- |
| Firm Admin | all read; connector install/manage; writes only with confirmation |
| Partner/Attorney | matter/contact/timeline read; note/task write dry-run or confirmed; financial read if policy grants |
| Paralegal | assigned matter/contact/timeline read; task/note dry-run; no billing writes by default |
| Intake | lead/contact/matter read for intake/sales; pipeline/stale lead tools; no financial read by default |
| Billing | financial read and billing writes with confirmation; limited matter metadata |
| Read-only/Auditor | selected read tools only; no writes |

Record-level filters are future work. Until record filters are reliable, do not represent Mattergate as enforcing true assigned-matter visibility for Lawmatics.

## Output shaping requirements

- Return compact shaped records, not raw Lawmatics JSON by default.
- Include IDs, names, statuses, dates, assigned users, source/campaign, practice area, and money fields in cents and formatted dollars.
- Label notes, interactions, document text, descriptions, custom fields, and user-entered content as untrusted external data.
- For write dry-runs, return planned endpoint, payload summary, required permissions, and whether the action would mutate data.
- For live writes, return the created/updated record ID, before/after diff when possible, and audit metadata. Do not return or log tokens.

## Implementation source notes

The old `railway-mcp-server` repo currently has Lawmatics tool source, but its checked-out tree did not contain the expected `api_docs/` folder. Existing skill notes say the Postman collection was previously found in `lm-dashboard` git history at:

```text
api_docs/lawmatics/Lawmatics OAuth API v1.21.0.postman_collection.json
```

If detailed endpoint docs are needed, search available repo history or ask Dan where the old `lm-dashboard` checkout lives. Do not guess endpoint body shapes for write tools.
