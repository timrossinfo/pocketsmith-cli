import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
} from '../../operations/transactions.js';
import { toolHandler } from '../result.js';

const listTransactionsInput = z.object({
  account_id: z.number().int().optional().describe('Filter by account ID'),
  category_id: z.number().int().optional().describe('Filter by category ID'),
  transaction_account_id: z.number().int().optional().describe('Filter by transaction account ID'),
  start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  search: z.string().optional().describe('Search term matched against payee, note, and labels'),
  page: z.number().int().min(1).optional().describe('Page number'),
  per_page: z.number().int().min(10).max(100).optional().describe('Results per page (10-100)'),
});

const getTransactionInput = z.object({
  id: z.number().int().describe('Transaction ID'),
});

const createTransactionInput = z.object({
  transaction_account_id: z
    .number()
    .int()
    .describe('Transaction account ID to create the transaction in'),
  payee: z.string().describe('Payee name'),
  amount: z.number().describe('Amount (negative for spending, positive for income)'),
  date: z.string().describe('Transaction date (YYYY-MM-DD)'),
  note: z.string().optional().describe('Note'),
  category_id: z.number().int().optional().describe('Category ID'),
  is_transfer: z.boolean().optional().describe('Mark as a transfer'),
});

const updateTransactionInput = z.object({
  id: z.number().int().describe('Transaction ID'),
  payee: z.string().optional().describe('Payee name'),
  amount: z.number().optional().describe('Amount (negative for spending, positive for income)'),
  date: z.string().optional().describe('Transaction date (YYYY-MM-DD)'),
  note: z.string().optional().describe('Note'),
  category_id: z.number().int().optional().describe('Category ID'),
  is_transfer: z.boolean().optional().describe('Mark as a transfer'),
});

export function registerTransactionsTools(server: McpServer) {
  server.registerTool(
    'list_transactions',
    {
      title: 'List Transactions',
      description:
        'List transactions, optionally filtered by account, category, transaction account, date range, or search term. Paginated: returns data, current_page, and total_pages.',
      inputSchema: listTransactionsInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof listTransactionsInput>) => {
      const result = await listTransactions({
        accountId: args.account_id,
        categoryId: args.category_id,
        transactionAccountId: args.transaction_account_id,
        startDate: args.start_date,
        endDate: args.end_date,
        search: args.search,
        page: args.page,
        perPage: args.per_page,
      });
      return { data: result.data, current_page: result.currentPage, total_pages: result.totalPages };
    }),
  );

  server.registerTool(
    'get_transaction',
    {
      title: 'Get Transaction',
      description: 'Get full details for a single transaction by ID.',
      inputSchema: getTransactionInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof getTransactionInput>) => getTransaction(args.id)),
  );

  server.registerTool(
    'create_transaction',
    {
      title: 'Create Transaction',
      description: 'Create a new transaction in a transaction account.',
      inputSchema: createTransactionInput.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    toolHandler(async (args: z.infer<typeof createTransactionInput>) =>
      createTransaction(args.transaction_account_id, {
        payee: args.payee,
        amount: args.amount,
        date: args.date,
        note: args.note,
        categoryId: args.category_id,
        isTransfer: args.is_transfer,
      }),
    ),
  );

  server.registerTool(
    'update_transaction',
    {
      title: 'Update Transaction',
      description:
        'Update fields on an existing transaction (payee, amount, date, note, category, transfer flag). Only provided fields are changed.',
      inputSchema: updateTransactionInput.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    toolHandler(async (args: z.infer<typeof updateTransactionInput>) =>
      updateTransaction(args.id, {
        payee: args.payee,
        amount: args.amount,
        date: args.date,
        note: args.note,
        categoryId: args.category_id,
        isTransfer: args.is_transfer,
      }),
    ),
  );
}
