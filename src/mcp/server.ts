import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMeTools } from './tools/me.js';
import { registerAccountsTools } from './tools/accounts.js';
import { registerTransactionsTools } from './tools/transactions.js';

export function createServer(): McpServer {
  const server = new McpServer({ name: 'pocketsmith', version: '0.1.0' });
  registerMeTools(server);
  registerAccountsTools(server);
  registerTransactionsTools(server);
  return server;
}
