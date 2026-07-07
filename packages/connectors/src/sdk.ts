import type { ConnectorManifest, ConnectorResult, InvokeContext } from '@legal-mcp-gateway/core';
export interface HealthResult { ok: boolean; status: 'connected' | 'not_configured' | 'error'; message?: string; }
export interface ConnectorContext { organizationId: string; connectionId?: string; }
export interface Connector { manifest: ConnectorManifest; healthCheck(ctx: ConnectorContext): Promise<HealthResult>; invokeTool(ctx: InvokeContext): Promise<ConnectorResult>; }
