import { Command } from 'commander';
import { api, getUserId } from '../api.js';
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
    .option('--per-page <n>', 'Results per page')
    .option('--all', 'Fetch all pages')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();

      const params: Record<string, string | number | boolean | undefined> = {
        start_date: opts.since,
        end_date: opts.until,
        search: opts.search,
        page: opts.page,
        per_page: opts.perPage,
      };

      let path: string;
      if (opts.account) {
        path = `/accounts/${opts.account}/transactions`;
      } else if (opts.category) {
        path = `/categories/${opts.category}/transactions`;
      } else if (opts.transactionAccount) {
        path = `/transaction-accounts/${opts.transactionAccount}/transactions`;
      } else {
        const userId = await getUserId(globalOpts.userId);
        path = `/users/${userId}/transactions`;
      }

      if (opts.all) {
        const data = await api.fetchAll<Transaction>(path, params);
        console.log(formatOutput(data, { json: globalOpts.json, columns }));
      } else {
        const result = await api.paginated<Transaction>(path, params);
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
      const data = await api.get<Transaction>(`/transactions/${id}`);
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
      const body: Record<string, unknown> = {
        payee: opts.payee,
        amount: parseFloat(opts.amount),
        date: opts.date,
      };
      if (opts.note) body.note = opts.note;
      if (opts.category) body.category_id = parseInt(opts.category, 10);
      if (opts.isTransfer) body.is_transfer = true;

      const data = await api.post<Transaction>(
        `/transaction-accounts/${transactionAccountId}/transactions`,
        body,
      );
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
      const body: Record<string, unknown> = {};
      if (opts.payee) body.payee = opts.payee;
      if (opts.amount) body.amount = parseFloat(opts.amount);
      if (opts.date) body.date = opts.date;
      if (opts.note) body.note = opts.note;
      if (opts.category) body.category_id = parseInt(opts.category, 10);
      if (opts.isTransfer !== undefined) body.is_transfer = opts.isTransfer;

      const data = await api.put<Transaction>(`/transactions/${id}`, body);
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
