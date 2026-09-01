import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMeTools } from './tools/me.js';
import { registerAccountsTools } from './tools/accounts.js';
import { registerTransactionsTools } from './tools/transactions.js';
import { registerCategoriesTools } from './tools/categories.js';
import { registerCategoryRulesTools } from './tools/category-rules.js';
import { registerBudgetsTools } from './tools/budgets.js';
import { registerEventsTools } from './tools/events.js';
import { registerInstitutionsTools } from './tools/institutions.js';
import { registerLabelsTools } from './tools/labels.js';
import { registerCurrenciesTools } from './tools/currencies.js';
import { registerAttachmentsTools } from './tools/attachments.js';

export function createServer(): McpServer {
  const server = new McpServer({ name: 'pocketsmith', version: '0.1.0' });
  registerMeTools(server);
  registerAccountsTools(server);
  registerTransactionsTools(server);
  registerCategoriesTools(server);
  registerCategoryRulesTools(server);
  registerBudgetsTools(server);
  registerEventsTools(server);
  registerInstitutionsTools(server);
  registerLabelsTools(server);
  registerCurrenciesTools(server);
  registerAttachmentsTools(server);
  return server;
}
