import { Command } from 'commander';
import { api } from '../api.js';
import {
  listTransactions,
  listAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
} from '../operations/transactions.js';
import { formatOutput } from '../formatter.js';
import type { Transaction } from '../types.js';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'date', header: 'Date' },
  { key: 'payee', header: 'Payee', width: 30 },
  { key: 'amount', header: 'Amount', align: 'right' as const },
  { key: 'category.title', header: 'Category', width: 20 },
  { key: 'status', header: 'Status' },
];

export function registerTransactionsCommands(program: Command) {
  const transactions = program.command('transactions').description('Manage transactions');

  transactions
    .command('list')
    .description('List transactions')
    .option('--account <id>', 'Filter by account ID')
    .option('--category <id>', 'Filter by category ID')
    .option('--transaction-account <id>', 'Filter by transaction account ID')
    .option('--since <date>', 'Start date (YYYY-MM-DD)')
    .option('--until <date>', 'End date (YYYY-MM-DD)')
    .option('--search <term>', 'Search term')
    .option('--page <n>', 'Page number')
    .option('--per-page <n>', 'Results per page (10-100)')
    .option('--all', 'Fetch all pages')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();

      if (opts.perPage) {
        const perPage = parseInt(opts.perPage, 10);
        if (perPage < 10 || perPage > 100) {
          console.error('--per-page must be between 10 and 100.');
          return process.exit(1) as never;
        }
      }

      const filters = {
        accountId: opts.account,
        categoryId: opts.category,
        transactionAccountId: opts.transactionAccount,
        startDate: opts.since,
        endDate: opts.until,
        search: opts.search,
        perPage: opts.perPage,
        userId: globalOpts.userId,
      };

      if (opts.all) {
        const data = await listAllTransactions(filters);
        console.log(formatOutput(data, { json: globalOpts.json, columns }));
      } else {
        const result = await listTransactions({ ...filters, page: opts.page });
        console.log(formatOutput(result.data, { json: globalOpts.json, columns }));
        if (!globalOpts.json && result.totalPages > 1) {
          console.log(`\nPage ${result.currentPage} of ${result.totalPages}`);
        }
      }
    });

  transactions
    .command('get <id>')
    .description('Get transaction details')
    .action(async (id: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await getTransaction(id);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  transactions
    .command('create <transaction-account-id>')
    .description('Create a transaction')
    .requiredOption('--payee <payee>', 'Payee name')
    .requiredOption('--amount <amount>', 'Transaction amount')
    .requiredOption('--date <date>', 'Transaction date (YYYY-MM-DD)')
    .option('--note <note>', 'Transaction note')
    .option('--category <id>', 'Category ID')
    .option('--is-transfer', 'Mark as transfer')
    .action(async (transactionAccountId: string, opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await createTransaction(transactionAccountId, {
        payee: opts.payee,
        amount: parseFloat(opts.amount),
        date: opts.date,
        note: opts.note,
        categoryId: opts.category ? parseInt(opts.category, 10) : undefined,
        isTransfer: opts.isTransfer,
      });
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  transactions
    .command('update <id>')
    .description('Update a transaction')
    .option('--payee <payee>', 'Payee name')
    .option('--amount <amount>', 'Transaction amount')
    .option('--date <date>', 'Transaction date (YYYY-MM-DD)')
    .option('--note <note>', 'Transaction note')
    .option('--category <id>', 'Category ID')
    .option('--is-transfer', 'Mark as transfer')
    .action(async (id: string, opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await updateTransaction(id, {
        payee: opts.payee,
        amount: opts.amount ? parseFloat(opts.amount) : undefined,
        date: opts.date,
        note: opts.note,
        categoryId: opts.category ? parseInt(opts.category, 10) : undefined,
        isTransfer: opts.isTransfer,
      });
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  transactions
    .command('delete <id>')
    .description('Delete a transaction')
    .action(async (id: string) => {
      await api.delete(`/transactions/${id}`);
      console.log('Transaction deleted.');
    });
}
