# Deployment

## Local mode

Local mode should bind HTTP, if enabled, to `127.0.0.1` only. Stdio mode is preferred for local AI clients once the official MCP transport adapter is added.

```bash
npm install
npm run verify
npm run dev:server
```

## Self-hosted mode

Self-hosted mode should eventually use HTTPS, OIDC/JWT or scoped MCP access tokens, encrypted credential storage, Postgres, rate limits and body limits, origin validation, and audit retention controls.

## Secrets

Never put real secrets in tracked files. Use environment variables or a deployment secret manager. Vendor-specific secrets must be per deployment/org and encrypted at rest.
