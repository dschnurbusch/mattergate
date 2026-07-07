import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { mockLegalConnector } from '@legal-mcp-gateway/connectors';
import { createGateway } from '@legal-mcp-gateway/mcp';
import { GatewayError } from '@legal-mcp-gateway/core';
import { subjectFromHeaders } from './subjects.js';
const gateway = createGateway({ connectors: [mockLegalConnector] });
export function createHttpApp() { return createServer(async (req, res) => { try { await route(req, res); } catch (error) { sendError(res, error); } }); }
async function route(req: IncomingMessage, res: ServerResponse) { if (req.method === 'GET' && req.url === '/health') return sendJson(res, 200, { status: 'ok' }); if (req.method === 'GET' && req.url === '/tools') { const subject = subjectFromHeaders(req.headers); return sendJson(res, 200, { subject, tools: gateway.listTools(subject) }); } if (req.method === 'POST' && req.url === '/invoke') { const subject = subjectFromHeaders(req.headers); const body = await readJson(req); const result = await gateway.callTool({ subject, toolName: String(body.toolName ?? ''), args: typeof body.args === 'object' && body.args ? body.args as Record<string, unknown> : {}, dryRun: body.dryRun !== false, confirmed: body.confirmed === true, requestId: req.headers['x-request-id']?.toString() }); return sendJson(res, 200, result); } return sendJson(res, 404, { error: 'not_found' }); }
async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> { const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(Buffer.from(chunk)); if (!chunks.length) return {}; return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>; }
function sendJson(res: ServerResponse, status: number, value: unknown) { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(value, null, 2)); }
function sendError(res: ServerResponse, error: unknown) { if (error instanceof GatewayError) return sendJson(res, error.status, { error: error.code, message: error.message }); return sendJson(res, 500, { error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' }); }
