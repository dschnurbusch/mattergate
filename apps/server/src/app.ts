import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mockLegalConnector } from '@legal-mcp-gateway/connectors';
import { createGateway } from '@legal-mcp-gateway/mcp';
import { GatewayError } from '@legal-mcp-gateway/core';
import { loadConfig } from './config.js';
import { subjectFromHeaders } from './subjects.js';

const gateway = createGateway({ connectors: [mockLegalConnector] });
const config = loadConfig();

interface BrokerInstallStartResponse {
  connector: 'lawmatics';
  authorize_url: string;
  expires_at: string;
  nonce: string;
}

interface BrokerRedeemResponse {
  connector: 'lawmatics';
  token?: {
    token_type?: string;
    access_token?: string;
    created_at?: number;
  };
  redeemed_at: string;
}

export function createHttpApp() {
  return createServer(async (req, res) => {
    try {
      await route(req, res);
    } catch (error) {
      sendError(res, error);
    }
  });
}

async function route(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', config.publicUrl);

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && url.pathname === '/connectors') {
    return sendJson(res, 200, {
      connectors: [
        {
          id: 'lawmatics',
          name: 'Lawmatics',
          install_mode: config.lawmaticsInstallMode,
          broker_url: config.lawmaticsInstallMode === 'broker' ? config.oauthBrokerUrl : undefined,
          status: 'not_installed',
        },
        {
          id: 'mock-legal',
          name: 'Mock Legal',
          install_mode: 'built_in',
          status: 'installed',
        },
      ],
    });
  }

  if (req.method === 'POST' && url.pathname === '/connectors/lawmatics/install/start') {
    return startLawmaticsInstall(req, res);
  }

  if (req.method === 'GET' && url.pathname === '/api/connectors/lawmatics/broker-return') {
    return sendJson(res, 200, {
      connector: 'lawmatics',
      status: url.searchParams.get('status') ?? 'unknown',
      handoff_code: url.searchParams.get('handoff_code') ? 'present' : 'missing',
      expires_at: url.searchParams.get('expires_at'),
      next_step: 'POST handoff_code and nonce to /api/connectors/lawmatics/broker-redeem from the Mattergate server.',
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/connectors/lawmatics/broker-redeem') {
    return redeemLawmaticsHandoff(req, res);
  }

  if (req.method === 'GET' && url.pathname === '/tools') {
    const subject = subjectFromHeaders(req.headers);
    return sendJson(res, 200, { subject, tools: gateway.listTools(subject) });
  }

  if (req.method === 'POST' && url.pathname === '/invoke') {
    const subject = subjectFromHeaders(req.headers);
    const body = await readJson(req);
    const result = await gateway.callTool({
      subject,
      toolName: String(body.toolName ?? ''),
      args: typeof body.args === 'object' && body.args ? body.args as Record<string, unknown> : {},
      dryRun: body.dryRun !== false,
      confirmed: body.confirmed === true,
      requestId: req.headers['x-request-id']?.toString(),
    });
    return sendJson(res, 200, result);
  }

  return sendJson(res, 404, { error: 'not_found' });
}

async function startLawmaticsInstall(req: IncomingMessage, res: ServerResponse) {
  if (config.lawmaticsInstallMode !== 'broker') {
    return sendJson(res, 409, {
      error: 'byo_oauth_enabled',
      message: 'This deployment is configured for Advanced BYO Lawmatics OAuth credentials, not the hosted broker flow.',
    });
  }

  const body = await readJson(req);
  const nonce = typeof body.nonce === 'string' && body.nonce.length >= 16 ? body.nonce : randomUUID();
  const returnUrl = typeof body.return_url === 'string'
    ? body.return_url
    : `${config.publicUrl}/api/connectors/lawmatics/broker-return`;

  const brokerResponse = await fetchJson<BrokerInstallStartResponse>(`${config.oauthBrokerUrl}/api/install/start`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      connector: 'lawmatics',
      instance_url: config.publicUrl,
      return_url: returnUrl,
      nonce,
      instance_public_key: typeof body.instance_public_key === 'string' ? body.instance_public_key : undefined,
    }),
  });

  return sendJson(res, 200, {
    connector: 'lawmatics',
    mode: 'broker',
    authorize_url: brokerResponse.authorize_url,
    expires_at: brokerResponse.expires_at,
    nonce: brokerResponse.nonce,
    broker_url: config.oauthBrokerUrl,
    callback_url: `${config.oauthBrokerUrl}/api/oauth/lawmatics/callback`,
  });
}

async function redeemLawmaticsHandoff(req: IncomingMessage, res: ServerResponse) {
  const body = await readJson(req);
  const handoffCode = typeof body.handoff_code === 'string' ? body.handoff_code : '';
  const nonce = typeof body.nonce === 'string' ? body.nonce : '';
  if (!handoffCode || !nonce) {
    return sendJson(res, 400, { error: 'missing_handoff', message: 'handoff_code and nonce are required.' });
  }

  const brokerResponse = await fetchJson<BrokerRedeemResponse>(`${config.oauthBrokerUrl}/api/install/redeem`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ handoff_code: handoffCode, nonce }),
  });

  return sendJson(res, 200, {
    connector: 'lawmatics',
    status: 'redeemed',
    redeemed_at: brokerResponse.redeemed_at,
    token: brokerResponse.token ? {
      token_type: brokerResponse.token.token_type,
      access_token: brokerResponse.token.access_token ? '[REDACTED]' : undefined,
      created_at: brokerResponse.token.created_at,
    } : undefined,
    next_step: 'Persist the token in encrypted connector storage once the persistence layer exists.',
  });
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  const payload = text ? JSON.parse(text) as unknown : {};
  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload
      ? String((payload as { message?: unknown }).message)
      : `HTTP ${response.status}`;
    throw new GatewayError(`OAuth broker request failed: ${message}`, 'external_service_error', 502);
  }
  return payload as T;
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
}

function sendJson(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(value, null, 2));
}

function sendError(res: ServerResponse, error: unknown) {
  if (error instanceof GatewayError) return sendJson(res, error.status, { error: error.code, message: error.message });
  return sendJson(res, 500, { error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' });
}
