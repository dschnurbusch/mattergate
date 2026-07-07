import type { GatewaySubject, RiskLevel, ToolAction, ToolManifest } from '@legal-mcp-gateway/core';
export type PolicyEffect = 'allow' | 'deny';
export interface SubjectSelector { userIds?: string[]; jobTitlePresets?: string[]; groupIds?: string[]; }
export interface ToolSelector { connectorKeys?: string[]; toolNames?: string[]; actions?: ToolAction[]; resourceTypes?: string[]; capabilities?: string[]; riskLevels?: RiskLevel[]; mutates?: boolean; }
export interface PolicyRule { id: string; description: string; effect: PolicyEffect; subjects?: SubjectSelector; tools?: ToolSelector; obligations?: { dryRunRequired?: boolean; confirmationRequired?: boolean; }; }
export interface PermissionPreset { key: string; title: string; description: string; rules: PolicyRule[]; }
export interface PolicyEvaluationInput { subject: GatewaySubject; tool: ToolManifest; rules: PolicyRule[]; context?: { dryRun?: boolean; confirmed?: boolean; }; }
