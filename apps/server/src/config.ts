export interface ServerConfig {
  host: string;
  port: number;
  mode: 'local' | 'hosted';
  publicUrl: string;
  oauthBrokerUrl: string;
  lawmaticsInstallMode: 'broker' | 'byo';
}

export function loadConfig(env = process.env): ServerConfig {
  const mode = env.LEGAL_MCP_MODE === 'hosted' ? 'hosted' : 'local';
  const host = env.LEGAL_MCP_HOST ?? '127.0.0.1';
  const port = Number(env.LEGAL_MCP_PORT ?? 4317);
  const publicUrl = stripTrailingSlash(env.MATTERGATE_PUBLIC_URL ?? env.LEGAL_MCP_PUBLIC_URL ?? `http://${host}:${port}`);

  return {
    mode,
    host,
    port,
    publicUrl,
    oauthBrokerUrl: stripTrailingSlash(env.MATTERGATE_OAUTH_BROKER_URL ?? 'https://mattergate-oauth-broker-production.up.railway.app'),
    lawmaticsInstallMode: env.LAWMATICS_INSTALL_MODE === 'byo' ? 'byo' : 'broker',
  };
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}
