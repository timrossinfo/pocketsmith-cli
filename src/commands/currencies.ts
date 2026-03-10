import { Command } from 'commander';
import { api } from '../api.js';
import { formatOutput } from '../formatter.js';
import type { Currency } from '../types.js';

const columns = [
  { key: 'id', header: 'Code' },
  { key: 'name', header: 'Name', width: 30 },
  { key: 'symbol', header: 'Symbol' },
  { key: 'decimal_places', header: 'Decimals' },
];

export function registerCurrenciesCommands(program: Command) {
  const currencies = program.command('currencies').description('View currencies');

  currencies
    .command('list')
    .description('List all supported currencies')
    .action(async (_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await api.get<Currency[]>('/currencies');
      console.log(formatOutput(data, { json: globalOpts.json, columns }));
    });

  currencies
    .command('get <code>')
    .description('Get currency details')
    .action(async (code: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await api.get<Currency>(`/currencies/${code}`);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });
}
