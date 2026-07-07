# Architecture

Legal MCP Gateway is a thin control plane over legal-tech APIs.

## Runtime layers

1. Transport layer: local stdio mode and HTTP mode, both calling the same gateway core.
2. Subject resolution: resolves each request to a user and organization.
3. Policy engine: evaluates user, job-title preset, connector, tool, action, resource type, risk level, and context.
4. Connector registry: exposes connector manifests and invokes connector tools after policy approval.
5. Audit layer: logs metadata for allow/deny/write/dry-run events without raw legal content.
6. Admin interface: manages users, groups, job presets, connector installs, policies, and audit review.

## Package boundaries

- `packages/core`: shared types, errors, external-content labels, audit event helpers
- `packages/policy`: policy rules, evaluator, job-title presets
- `packages/connectors`: connector SDK, registry, mock connector
- `packages/mcp`: tool filtering and invoke-time policy enforcement
- `apps/server`: HTTP API/transport
- `apps/cli`: local CLI/stdio entry points
- `apps/admin`: browser admin UI scaffold

## Design principles

- The gateway does not trust vendor API permissions to be consistent.
- Tool visibility is a UX feature, not a security boundary.
- Invocation-time checks are mandatory.
- Vendor/client data is external untrusted content.
- Secrets stay server-side and encrypted.
- Writes need dry-run, confirmation, idempotency, and audit trails where possible.
