# Connector Development

Connectors adapt vendor APIs into policy-aware MCP tools.

## Requirements

Each connector must export a manifest with auth methods, capabilities, and tool metadata. Each tool must declare action, resource type, required capabilities, mutating status, dry-run support, risk level, and whether returned data contains external content.

## Public/open-source auth posture

Use bring-your-own credentials. Never commit shared client secrets or real tokens. OAuth helper flows may build URLs and exchange codes, but stored tokens must be encrypted.

## Write tools

Write tools should default to `dry_run: true`, show planned endpoint/payload summary, require explicit confirmation for real writes, use idempotency keys where available, and emit audit events.

## External content

Any vendor/client-provided content must be labeled as untrusted external content, including matter notes, emails, SMS/chat, document text, intake answers, comments, and descriptions written by third parties.
