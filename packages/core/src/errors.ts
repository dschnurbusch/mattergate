export class GatewayError extends Error { constructor(message: string, public readonly code: string, public readonly status = 500) { super(message); this.name = 'GatewayError'; } }
export class ForbiddenToolError extends GatewayError { constructor(message: string) { super(message, 'FORBIDDEN_TOOL', 403); this.name = 'ForbiddenToolError'; } }
export class UnknownToolError extends GatewayError { constructor(toolName: string) { super(`Unknown tool: ${toolName}`, 'UNKNOWN_TOOL', 404); this.name = 'UnknownToolError'; } }
export class ConnectorError extends GatewayError { constructor(message: string) { super(message, 'CONNECTOR_ERROR', 502); this.name = 'ConnectorError'; } }
