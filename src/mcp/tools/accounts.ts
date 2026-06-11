import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listAccounts, getAccount } from '../../operations/accounts.js';
import { toolHandler } from '../result.js';

const getAccountInput = z.object({
  id: z.number().int().describe('Account ID'),
});

export function registerAccountsTools(server: McpServer) {
  server.registerTool(
    'list_accounts',
    {
      title: 'List Accounts',
      description: 'List all accounts for the authenticated user, including balances and currency.',
      annotations: { readOnlyHint: true },
    },
    toolHandler(() => listAccounts()),
  );

  server.registerTool(
    'get_account',
    {
      title: 'Get Account',
      description: 'Get full details for a single account by ID.',
      inputSchema: getAccountInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof getAccountInput>) => getAccount(args.id)),
  );
}
