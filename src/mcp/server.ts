import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMeTools } from './tools/me.js';

export function createServer(): McpServer {
  const server = new McpServer({ name: 'pocketsmith', version: '0.1.0' });
  registerMeTools(server);
  return server;
}
