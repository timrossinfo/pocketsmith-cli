import { Command } from 'commander';
import { api, getUserId } from '../api.js';
import { formatOutput } from '../formatter.js';
import type { Institution } from '../types.js';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'title', header: 'Title', width: 30 },
  { key: 'currency_code', header: 'Currency' },
  { key: 'created_at', header: 'Created' },
];

export function registerInstitutionsCommands(program: Command) {
  const institutions = program.command('institutions').description('Manage institutions');

  institutions
    .command('list')
    .description('List all institutions')
    .action(async (_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const userId = await getUserId(globalOpts.userId);
      const data = await api.get<Institution[]>(`/users/${userId}/institutions`);
      console.log(formatOutput(data, { json: globalOpts.json, columns }));
    });

  institutions
    .command('get <id>')
    .description('Get institution details')
    .action(async (id: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await api.get<Institution>(`/institutions/${id}`);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  institutions
    .command('create')
    .description('Create an institution')
    .requiredOption('--title <title>', 'Institution title')
    .requiredOption('--currency <code>', 'Currency code')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const userId = await getUserId(globalOpts.userId);
      const body = { title: opts.title, currency_code: opts.currency };
      const data = await api.post<Institution>(`/users/${userId}/institutions`, body);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  institutions
    .command('update <id>')
    .description('Update an institution')
    .option('--title <title>', 'Institution title')
    .option('--currency <code>', 'Currency code')
    .action(async (id: string, opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const body: Record<string, unknown> = {};
      if (opts.title) body.title = opts.title;
      if (opts.currency) body.currency_code = opts.currency;
      const data = await api.put<Institution>(`/institutions/${id}`, body);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  institutions
    .command('delete <id>')
    .description('Delete an institution')
    .action(async (id: string) => {
      await api.delete(`/institutions/${id}`);
      console.log('Institution deleted.');
    });
}
