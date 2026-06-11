import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listCurrencies, getCurrency } from '../../operations/currencies.js';
import { toolHandler } from '../result.js';

const getCurrencyInput = z.object({
  code: z.string().describe('Currency code, e.g. nzd'),
});

export function registerCurrenciesTools(server: McpServer) {
  server.registerTool(
    'list_currencies',
    {
      title: 'List Currencies',
      description: 'List all supported currencies.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    toolHandler(async () => listCurrencies()),
  );

  server.registerTool(
    'get_currency',
    {
      title: 'Get Currency',
      description: 'Get details for a single currency by its code (e.g. nzd, usd).',
      inputSchema: getCurrencyInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof getCurrencyInput>) => getCurrency(args.code)),
  );
}
