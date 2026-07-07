#!/usr/bin/env node
import { mockLegalConnector } from '@legal-mcp-gateway/connectors';
import { createGateway } from '@legal-mcp-gateway/mcp';
const command = process.argv[2] ?? 'help';
const gateway = createGateway({ connectors: [mockLegalConnector] });
const subject = { organizationId: 'org_demo', userId: 'demo-paralegal', jobTitlePreset: 'paralegal' };
if (command === 'stdio') console.log(JSON.stringify({ note: 'Official MCP stdio transport will be wired in Phase 2. This smoke command proves the gateway core is reachable.', tools: gateway.listTools(subject).map((tool) => tool.name) }, null, 2));
else console.log('Usage: legal-mcp-gateway stdio');
