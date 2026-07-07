import { createHttpApp } from './app.js';
import { loadConfig } from './config.js';
const config = loadConfig();
const app = createHttpApp();
app.listen(config.port, config.host, () => { console.log(`Legal MCP Gateway server listening on http://${config.host}:${config.port} (${config.mode})`); });
