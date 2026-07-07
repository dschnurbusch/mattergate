# Policy Model

The permission model is hybrid RBAC + ABAC.

## RBAC

Job-title presets provide a reasonable starting point: Firm Admin, Partner, Attorney, Associate, Paralegal, Legal Assistant, Intake, Billing, IT Admin, Compliance Auditor, and Read-only.

Presets expand into ordinary policy rules.

## ABAC

Rules can match subject user IDs, job-title presets, connector keys, tool names, actions, resource types, capabilities, risk levels, and future record conditions such as assigned matters, practice group, tags, or owner.

## Evaluation

- Explicit deny wins.
- If no allow rule matches, deny.
- Mutating tools can require dry-run or confirmation.
- Tool listing filters by policy, but invocation re-checks every time.
