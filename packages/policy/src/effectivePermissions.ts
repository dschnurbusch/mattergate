import type { GatewaySubject, ToolManifest } from '@legal-mcp-gateway/core';
import { evaluatePolicy } from './evaluator.js';
import type { PolicyRule } from './types.js';
export function visibleToolsForSubject(params: { subject: GatewaySubject; tools: ToolManifest[]; rules: PolicyRule[]; }): ToolManifest[] { return params.tools.filter((tool) => evaluatePolicy({ subject: params.subject, tool, rules: params.rules, context: { dryRun: true, confirmed: false } }).allowed); }
