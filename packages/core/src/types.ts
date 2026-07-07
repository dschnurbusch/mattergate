export type ToolAction = 'search' | 'read' | 'create' | 'update' | 'delete' | 'export';
export type RiskLevel = 'low' | 'medium' | 'high';
export type AuthMethod = 'oauth2' | 'apiKey' | 'none';
export interface JsonSchemaLike { type?: string; title?: string; description?: string; properties?: Record<string, JsonSchemaLike>; required?: string[]; additionalProperties?: boolean; enum?: string[]; items?: JsonSchemaLike; default?: unknown; }
export interface GatewaySubject { userId: string; organizationId: string; email?: string; jobTitlePreset?: string; groupIds?: string[]; }
export interface ConnectorManifest { key: string; displayName: string; version: string; auth: AuthMethod[]; capabilities: string[]; tools: ToolManifest[]; }
export interface ToolManifest { name: string; title: string; description: string; connectorKey: string; action: ToolAction; resourceType: string; requiredCapabilities: string[]; mutates: boolean; dryRunSupported: boolean; riskLevel: RiskLevel; externalContent: boolean; inputSchema: JsonSchemaLike; }
export interface InvokeContext { subject: GatewaySubject; tool: ToolManifest; args: Record<string, unknown>; dryRun?: boolean; confirmed?: boolean; requestId?: string; }
export interface ConnectorResult<TData = unknown> { data: TData; externalContent: boolean; resourceHints?: ResourceHint[]; auditSummary?: Record<string, unknown>; }
export interface ResourceHint { connectorKey: string; resourceType: string; resourceId?: string; ownerUserId?: string; assignedUserIds?: string[]; tags?: string[]; practiceGroup?: string; }
export interface PolicyDecision { allowed: boolean; reason: string; matchedRuleIds: string[]; obligations?: { dryRunRequired?: boolean; confirmationRequired?: boolean; }; }
