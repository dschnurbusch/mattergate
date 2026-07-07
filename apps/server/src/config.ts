export interface ServerConfig { host: string; port: number; mode: 'local' | 'hosted'; }
export function loadConfig(env = process.env): ServerConfig { const mode = env.LEGAL_MCP_MODE === 'hosted' ? 'hosted' : 'local'; return { mode, host: env.LEGAL_MCP_HOST ?? '127.0.0.1', port: Number(env.LEGAL_MCP_PORT ?? 4317) }; }
