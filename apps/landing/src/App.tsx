const repoUrl = 'https://github.com/dschnurbusch/mattergate';
const docsUrl = 'https://github.com/dschnurbusch/mattergate/tree/main/docs';

const trustSignals = ['Open source', 'Self-hostable', 'Policy enforced twice', 'Audit metadata by default'];

const capabilities = [
  {
    title: 'Provision every MCP user deliberately',
    eyebrow: 'Identity control',
    description:
      'Create firm users, issue MCP access tokens, and map each person to the job-title toolset that matches their real responsibilities.',
    details: ['Admin, attorney, paralegal, intake, billing, read-only', 'Per-user exceptions without forking a vendor integration'],
  },
  {
    title: 'Shrink vendor API blast radius',
    eyebrow: 'Policy gateway',
    description:
      'Hide tools users cannot invoke and enforce the same policy again when a request reaches the gateway.',
    details: ['Explicit deny beats allow', 'Dry-run posture for mutating actions'],
  },
  {
    title: 'Keep a defensible trail',
    eyebrow: 'Audit layer',
    description:
      'Record who invoked which legal-tech action, against which connector, and why the gateway allowed or blocked it.',
    details: ['Metadata-first audit logs', 'External vendor content stays labeled as untrusted data'],
  },
];

const workflow = [
  ['01', 'Connect vendors once', 'Bring your own OAuth app or API credentials into a self-hosted gateway. Lawmatics is the first production connector target.'],
  ['02', 'Publish scoped tools', 'Expose only the MCP tools a job title or named user is allowed to see.'],
  ['03', 'Broker every invocation', 'Evaluate per-user policy, connector capabilities, deny rules, and confirmation state before any write.'],
  ['04', 'Review audit events', 'Keep firm admins close to permission changes, token issuance, and vendor actions without storing raw matter content.'],
];

const policyRows = [
  {
    role: 'Intake specialist',
    tools: 'search contacts, create lead, read intake notes',
    guardrail: 'No billing export; matter writes start as dry-run.',
  },
  {
    role: 'Paralegal',
    tools: 'matter context, task creation, document checklist',
    guardrail: 'Can prepare updates, but attorney confirmation can be required.',
  },
  {
    role: 'Billing',
    tools: 'invoice lookup, payment status, client balance',
    guardrail: 'No privileged notes or unrelated matter records.',
  },
];

const auditEvents = [
  { state: 'allow', label: 'ALLOW', text: 'demo-paralegal invoked mock_get_matter_context', meta: 'policy: paralegal preset' },
  { state: 'deny', label: 'DENY', text: 'intake-user attempted billing_export', meta: 'reason: explicit deny' },
  { state: 'review', label: 'DRY RUN', text: 'attorney queued Lawmatics matter update', meta: 'awaiting confirmation' },
];

const connectorMilestones = ['Lawmatics first', 'Mock Legal scaffold today', 'Filevine / Clio / MyCase via connector SDK', 'Bring-your-own credentials'];

export function App() {
  return (
    <main>
      <header className="nav-shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Mattergate home">
          <span className="brand-mark" aria-hidden="true">MG</span>
          <span>
            <strong>Mattergate</strong>
            <small>Policy infrastructure for legal tools</small>
          </span>
        </a>
        <nav>
          <a href="#capabilities">Capabilities</a>
          <a href="#architecture">Architecture</a>
          <a href={docsUrl}>Docs</a>
          <a className="nav-cta" href={repoUrl}>GitHub</a>
        </nav>
      </header>

      <section id="top" className="hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow">Open-source MCP control plane for legal tech</p>
          <h1>Expose legal-tech tools to MCP clients without handing over the whole firm.</h1>
          <p className="hero-lede">
            Mattergate is a self-hostable policy and audit layer for vendor APIs: user provisioning,
            job-title toolsets, per-user policy, audit logs, and connector enforcement with Lawmatics first.
          </p>
          <div className="hero-actions" aria-label="Project links">
            <a className="button primary" href={repoUrl}>View on GitHub</a>
            <a className="button secondary" href={docsUrl}>Read the docs</a>
          </div>
          <ul className="trust-list" aria-label="Project qualities">
            {trustSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </div>

        <aside className="gateway-card" aria-label="Gateway request flow preview">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
            <strong>gateway.policy.ts</strong>
          </div>
          <div className="flow-stack">
            <div className="flow-row active">
              <span>Subject</span>
              <strong>paralegal@firm.local</strong>
            </div>
            <div className="flow-row">
              <span>Toolset</span>
              <strong>matter_context + task_create</strong>
            </div>
            <div className="flow-row">
              <span>Connector</span>
              <strong>Lawmatics OAuth app</strong>
            </div>
            <div className="flow-row decision">
              <span>Decision</span>
              <strong>allow with audit metadata</strong>
            </div>
          </div>
          <pre aria-label="Policy example"><code>{`deny: billing_export
allow: matter.read where assigned
write: dry_run until confirmed
audit: user + connector + tool + reason`}</code></pre>
        </aside>
      </section>

      <section id="capabilities" className="section-shell capabilities">
        <div className="section-heading">
          <p className="eyebrow">Built for firm operators and developers</p>
          <h2>A narrow gateway that makes broad vendor access safer.</h2>
          <p>
            The project is intentionally not a data lake. It is the thin layer between MCP clients and legal-tech APIs,
            where identity, policy, connector behavior, and audit decisions belong.
          </p>
        </div>
        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article className="capability-card" key={capability.title}>
              <p>{capability.eyebrow}</p>
              <h3>{capability.title}</h3>
              <span>{capability.description}</span>
              <ul>
                {capability.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="architecture" className="section-shell architecture">
        <div className="panel dark-panel">
          <p className="eyebrow">Request path</p>
          <h2>One broker between MCP clients and legal systems.</h2>
          <div className="workflow-grid">
            {workflow.map(([step, title, description]) => (
              <article key={step}>
                <strong>{step}</strong>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell split-section">
        <div>
          <p className="eyebrow">Job-title toolsets</p>
          <h2>Start with roles. Tune down to a single user.</h2>
          <p>
            Legal work is permissioned by responsibility. The gateway models that directly, then lets admins add exceptions,
            denials, and confirmation requirements when a vendor API is broader than a user should be.
          </p>
        </div>
        <div className="policy-table" role="table" aria-label="Example policy matrix">
          <div className="policy-row policy-head" role="row">
            <span role="columnheader">Role</span>
            <span role="columnheader">Visible tools</span>
            <span role="columnheader">Guardrail</span>
          </div>
          {policyRows.map((row) => (
            <div className="policy-row" role="row" key={row.role}>
              <strong role="cell">{row.role}</strong>
              <span role="cell">{row.tools}</span>
              <span role="cell">{row.guardrail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell audit-section">
        <div className="audit-copy">
          <p className="eyebrow">Defensible by default</p>
          <h2>Audit the gateway decision, not the client file.</h2>
          <p>
            Keep sensitive legal content out of logs while still recording the operational facts that matter: user,
            connector, tool, decision, and policy reason.
          </p>
        </div>
        <div className="audit-log" aria-label="Audit log examples">
          {auditEvents.map((event) => (
            <article className={`audit-event ${event.state}`} key={event.text}>
              <strong>{event.label}</strong>
              <span>{event.text}</span>
              <small>{event.meta}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell connector-section">
        <div className="connector-card">
          <p className="eyebrow">Connector roadmap</p>
          <h2>Lawmatics first, vendor-neutral by design.</h2>
          <p>
            Lawmatics is the clearest early target because broad account access needs a firm-owned policy boundary.
            The connector SDK keeps the gateway extensible for other legal systems without weakening the enforcement model.
          </p>
          <div className="connector-list">
            {connectorMilestones.map((milestone) => (
              <span key={milestone}>{milestone}</span>
            ))}
          </div>
        </div>
        <div className="code-card" aria-label="Connector manifest example">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
            <strong>connector manifest</strong>
          </div>
          <pre><code>{`tools:
  lawmatics.search_matters:
    read: true
  lawmatics.create_task:
    mutates: true
    default: dry_run
policy:
  explicit_deny_overrides_allow: true`}</code></pre>
        </div>
      </section>

      <section className="section-shell final-cta">
        <p className="eyebrow">Open infrastructure for careful firms</p>
        <h2>Run it locally, inspect the policy path, and help shape the connector layer.</h2>
        <div className="hero-actions">
          <a className="button primary" href={repoUrl}>Star or fork the repo</a>
          <a className="button secondary" href={docsUrl}>Browse project docs</a>
        </div>
      </section>
    </main>
  );
}
