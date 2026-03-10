import { Command } from 'commander';
import { api, getUserId } from '../api.js';
import { formatOutput } from '../formatter.js';
import type { Account } from '../types.js';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'title', header: 'Title', width: 30 },
  { key: 'type', header: 'Type', width: 15 },
  { key: 'current_balance', header: 'Balance', align: 'right' as const },
  { key: 'currency_code', header: 'Currency' },
];

export function registerAccountsCommands(program: Command) {
  const accounts = program.command('accounts').description('Manage accounts');

  accounts
    .command('list')
    .description('List all accounts')
    .action(async (_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const userId = await getUserId(globalOpts.userId);
      const data = await api.get<Account[]>(`/users/${userId}/accounts`);
      console.log(formatOutput(data, { json: globalOpts.json, columns }));
    });

  accounts
    .command('get <id>')
    .description('Get account details')
    .action(async (id: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await api.get<Account>(`/accounts/${id}`);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  accounts
    .command('update <id>')
    .description('Update an account')
    .option('--title <title>', 'Account title')
    .option('--currency <code>', 'Currency code')
    .option('--type <type>', 'Account type')
    .action(async (id: string, opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const body: Record<string, unknown> = {};
      if (opts.title) body.title = opts.title;
      if (opts.currency) body.currency_code = opts.currency;
      if (opts.type) body.type = opts.type;
      const data = await api.put<Account>(`/accounts/${id}`, body);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  accounts
    .command('delete <id>')
    .description('Delete an account')
    .action(async (id: string) => {
      await api.delete(`/accounts/${id}`);
      console.log('Account deleted.');
    });
}
