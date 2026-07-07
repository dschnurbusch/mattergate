import type { GatewaySubject } from '@legal-mcp-gateway/core';
import { ConnectorRegistry } from '@legal-mcp-gateway/connectors';
import type { Connector } from '@legal-mcp-gateway/connectors';
import { rulesForPreset } from '@legal-mcp-gateway/policy';
import type { PolicyRule } from '@legal-mcp-gateway/policy';
import { filterVisibleTools } from './toolFiltering.js';
import { invokeWithPolicy } from './invokeWithPolicy.js';
export interface GatewayOptions { connectors: Connector[]; extraRules?: PolicyRule[]; }
export function createGateway(options: GatewayOptions) { const registry = new ConnectorRegistry(); for (const connector of options.connectors) registry.register(connector); function rulesForSubject(subject: GatewaySubject): PolicyRule[] { return [...rulesForPreset(subject.jobTitlePreset ?? 'read-only'), ...(options.extraRules ?? [])]; } return { registry, listTools(subject: GatewaySubject) { return filterVisibleTools({ subject, tools: registry.listTools(), rules: rulesForSubject(subject) }); }, callTool(params: { subject: GatewaySubject; toolName: string; args?: Record<string, unknown>; dryRun?: boolean; confirmed?: boolean; requestId?: string; }) { return invokeWithPolicy({ registry, subject: params.subject, toolName: params.toolName, args: params.args, rules: rulesForSubject(params.subject), dryRun: params.dryRun, confirmed: params.confirmed, requestId: params.requestId }); } }; }
