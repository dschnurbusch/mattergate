import type { GatewaySubject, ToolManifest } from '@legal-mcp-gateway/core';
import { visibleToolsForSubject } from '@legal-mcp-gateway/policy';
import type { PolicyRule } from '@legal-mcp-gateway/policy';
export function filterVisibleTools(params: { subject: GatewaySubject; tools: ToolManifest[]; rules: PolicyRule[]; }) { return visibleToolsForSubject(params).map((tool) => ({ name: tool.name, title: tool.title, description: tool.description, inputSchema: tool.inputSchema, annotations: { connectorKey: tool.connectorKey, action: tool.action, resourceType: tool.resourceType, riskLevel: tool.riskLevel, mutates: tool.mutates, dryRunSupported: tool.dryRunSupported, externalContent: tool.externalContent } })); }
