# Brand Direction

## Recommendation

**Recommended product name: Mattergate**

**Descriptive line:** Mattergate is an open-source, self-hostable MCP permissions gateway for legal teams.

**Tagline:** Let AI agents work your legal stack without giving them the keys.

Mattergate should feel like infrastructure, not another AI assistant. The brand promise is simple: connect legal systems once, then give each person and each agent only the tools they are allowed to use.

Keep the repository/package description close to the category term for discoverability: **Mattergate — Legal MCP Gateway**. Do a trademark/domain check before public launch; until then, treat this as a working brand direction.

## Name candidates

| Name | Direction | Notes |
| --- | --- | --- |
| **Mattergate** | Legal work + access control | Recommended. Plain, memorable, and accurate: matters pass through a gate before agents act. Works for Lawmatics now and broader legal systems later. |
| **Gatebrief** | Secure entry + legal brief | Short and distinctive. Feels more productized, but slightly less obvious than Mattergate. |
| **Docketrail** | Ordered legal workflow | Good for audit/logging and workflow control. Less clearly about permissions. |
| **Writlock** | Legal instrument + lock | Strong security signal. Slightly harsher and narrower; could feel like a secrets manager. |
| **Clerkline** | Legal operations routing | Friendly and operational. Risk: “Clerk” is crowded in developer tooling/auth. |
| **Lexport** | Legal port/gateway | Compact and infrastructure-oriented. More abstract; needs the descriptive subtitle. |

Avoid names that sound like generic AI wrappers: LegalAI, CounselGPT, LawBot, JusticeAgent, SmartLegal, AgentLaw, etc. This project is the control layer for agents, not the agent.

## Positioning

**For** law firms, legal-tech operators, and developers who want AI agents to use practice-management and CRM systems safely, **Mattergate** is an open-source MCP permissions gateway that sits between agent clients and legal apps. It maps firm users to job-title presets and policy rules, filters the tools each user can see, enforces permission again on every invocation, and records audit metadata.

**Unlike** direct vendor connectors or broad service-account access, Mattergate gives firms one least-privilege policy layer across Hermes, Claude, ChatGPT, Cursor, and other MCP clients.

**First wedge:** Lawmatics, because Lawmatics access should be treated as broad/full-account access unless the vendor proves otherwise. Mattergate makes that kind of connector safe enough for real firm workflows by adding policy, dry-run writes, confirmation, and auditability above the vendor API.

## Audience

Primary audiences:

- **Firm owners and managing attorneys** who want AI productivity without uncontrolled access to client and matter data.
- **Firm administrators / operations leads** who provision staff, job roles, and tool access.
- **Legal-tech consultants and MSPs** who set up self-hosted or local infrastructure for firms.
- **Developers building legal MCP connectors** who need a shared permissions and audit layer.

Secondary audiences:

- Security reviewers, privacy-conscious firms, and open-source MCP contributors.

## Messaging pillars

1. **Least privilege for legal agents** — users only see and invoke the tools their role permits.
2. **One policy across every MCP client** — Hermes, Claude, ChatGPT, Cursor, and local agents all resolve to the same gateway user permissions.
3. **Self-hostable by default** — firm-controlled credentials, tokens, policies, and audit metadata.
4. **Built for messy legal APIs** — normalize inconsistent vendor auth models behind one policy layer.
5. **Safe writes, visible accountability** — dry-run mutating actions, explicit confirmation, deny precedence, and audit logs.

## Voice and tone

**Tone:** calm, practical, security-literate, and attorney-compatible.

Use:

- Plain language over hype.
- “AI agents” and “MCP clients,” not magical autonomous workers.
- Concrete security claims: least privilege, deny precedence, audit metadata, self-hosted credentials.
- Honest limits: connector support starts with Lawmatics; more systems come later.

Avoid:

- “Revolutionize legal work.”
- “Fully autonomous law firm.”
- “Military-grade security.”
- Promising compliance certifications the project does not have.
- Overusing gavels, scales, robots, or glowing AI imagery.

## Visual direction

**Brand feel:** trusted infrastructure for modern law firms — more security console than legal chatbot.

**Logo ideas:**

- A matter folder passing through a gate/checkpoint.
- A simple gate mark built from two vertical bars and a permission check.
- A routed line from “agent” to “legal system” with a clear policy checkpoint in the middle.

**Color palette:**

- Deep ink navy: `#111827` for primary text and serious infrastructure feel.
- Warm paper: `#F8F4EC` for legal-document warmth without looking old-fashioned.
- Signal blue: `#2563EB` for links, CTAs, and active states.
- Permission green: `#16A34A` for allowed/approved actions.
- Deny amber/red: `#D97706` / `#DC2626` for risk and blocked actions.

**Typography:**

- UI/docs: Inter, IBM Plex Sans, or Source Sans 3.
- Optional editorial accent: Source Serif 4 for short landing-page headlines only.

**Imagery:**

Use diagrams, product UI, connector cards, permission matrices, and audit timelines. Avoid stock photos of lawyers, courthouse columns, neon robot heads, and generic “AI brain” art.

## Landing-page copy blocks

### Hero

**Headline:** AI agents for legal work, with firm-grade permissions.

**Subhead:** Mattergate is an open-source MCP gateway that lets law firms connect tools like Lawmatics, provision team users, assign job-title presets, and expose only the actions each person is allowed to use.

**Primary CTA:** Deploy locally

**Secondary CTA:** View on GitHub

**Support line:** Self-hostable. Bring your own vendor credentials. No broad agent access by default.

### Problem

**Headline:** Legal APIs were not designed for agent permissions.

Some systems enforce user permissions well. Others rely on broad account tokens, service users, weak scopes, or unclear access rules. When an AI client connects directly, the firm can end up giving an assistant more power than the employee using it.

### Solution

**Headline:** Put a policy checkpoint between agents and your legal stack.

Mattergate sits between MCP clients and legal-tech connectors. It hides unauthorized tools, checks every invocation, defaults risky writes toward preview/confirmation, and logs audit metadata so firms can see what happened without storing raw client content.

### How it works

1. **Connect a legal system** — start with Lawmatics; add more connectors over time.
2. **Provision firm users** — map each person to a gateway identity.
3. **Assign job-title presets** — attorney, paralegal, intake, admin, or custom policy.
4. **Expose safe MCP tools** — each agent client sees only what that user may run.
5. **Enforce and audit** — deny still wins at invocation time, and actions produce audit metadata.

### Lawmatics first

**Headline:** Built for the exact gap Lawmatics leaves open.

Lawmatics is the first real connector target because its OAuth model should be treated as broad account access. Mattergate adds the missing firm-level permission layer above that connection: least privilege, dry-run writes, confirmation, and audit trails.

### For admins

**Headline:** Manage agent access like staff access.

Create users, assign presets, revoke client grants, and control whether an assistant can read contacts, inspect matters, draft updates, or perform write actions.

### For developers

**Headline:** A connector SDK with policy built in.

Build legal-tech MCP tools without reinventing RBAC, ABAC, deny precedence, tool filtering, external-content labeling, and audit metadata for every connector.

### Security posture

**Headline:** Firm-controlled by design.

- Self-hostable/local deployment.
- Bring-your-own vendor OAuth/API credentials.
- Vendor tokens stay server-side.
- Unauthorized tools are hidden and blocked on invocation.
- Mutating actions should support dry-run and confirmation.
- Audit metadata is captured without logging full legal content.

### Open source

**Headline:** Open infrastructure for legal MCP.

Mattergate should be understandable, inspectable, and extendable. Firms and consultants can run it themselves, review the policy model, and add connectors without depending on a closed SaaS control plane.

### Final CTA

**Headline:** Give agents a gate, not the master key.

**CTA:** Start with Mattergate on GitHub.
