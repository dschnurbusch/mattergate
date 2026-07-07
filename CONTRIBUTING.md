# Contributing

This project is early. Keep contributions small, tested, and security-conscious.

## Connector contributions

A connector must include:

1. A manifest describing tools, capabilities, auth type, risk level, and whether each tool mutates data.
2. Tests for tool inventory and dry-run behavior.
3. No real credentials, API responses containing private data, or vendor docs with token-like examples.
4. External-content labeling for any returned vendor/client text.
5. Documentation explaining how a user brings their own vendor credentials.

## Verification

Run before opening a PR:

```bash
npm run verify
```
