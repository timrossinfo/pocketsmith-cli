import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMeTools } from './tools/me.js';
import { registerAccountsTools } from './tools/accounts.js';
import { registerTransactionsTools } from './tools/transactions.js';
import { registerCategoriesTools } from './tools/categories.js';
import { registerBudgetsTools } from './tools/budgets.js';

export function createServer(): McpServer {
  const server = new McpServer({ name: 'pocketsmith', version: '0.1.0' });
  registerMeTools(server);
  registerAccountsTools(server);
  registerTransactionsTools(server);
  registerCategoriesTools(server);
  registerBudgetsTools(server);
  return server;
}
