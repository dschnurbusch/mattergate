# Security Policy

This project is a control plane for legal systems. Treat every connector as privileged infrastructure.

## Reporting

Do not open public issues for vulnerabilities involving credentials, authorization bypass, tenant isolation, or write-tool side effects. Use a private maintainer channel until a public security contact is configured.

## Baseline rules

- Never commit real OAuth client secrets, access tokens, refresh tokens, API keys, or customer data.
- Local research files under `docs/research/` are gitignored because they may contain volatile notes or vendor-doc excerpts.
- Real connector credentials must be encrypted at rest and redacted from logs and errors.
- All mutating tools should support dry-run and require explicit confirmation before side effects.
- Tool outputs containing emails, notes, documents, matter facts, messages, or vendor records must be labeled as untrusted external content.
- Audit logs should store metadata, hashes, IDs, actor, action, and outcome. Do not store raw legal content by default.
