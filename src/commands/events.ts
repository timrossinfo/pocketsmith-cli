import { Command } from 'commander';
import { api } from '../api.js';
import { formatOutput } from '../formatter.js';
import type { Event } from '../types.js';
import { listEvents, getEvent, updateEvent } from '../operations/events.js';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'category.title', header: 'Category', width: 25 },
  { key: 'amount', header: 'Amount', align: 'right' as const },
  { key: 'date', header: 'Date' },
  { key: 'repeat_type', header: 'Repeat' },
];

export function registerEventsCommands(program: Command) {
  const events = program.command('events').description('Manage budget events');

  events
    .command('list')
    .description('List events')
    .option('--scenario <id>', 'Filter by scenario ID')
    .requiredOption('--since <date>', 'Start date (YYYY-MM-DD)')
    .requiredOption('--until <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await listEvents({
        startDate: opts.since,
        endDate: opts.until,
        scenarioId: opts.scenario,
        userId: globalOpts.userId,
      });
      console.log(formatOutput(data, { json: globalOpts.json, columns }));
    });

  events
    .command('get <id>')
    .description('Get event details')
    .action(async (id: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await getEvent(id);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  events
    .command('create <scenario-id>')
    .description('Create an event in a scenario')
    .requiredOption('--category <id>', 'Category ID')
    .requiredOption('--amount <amount>', 'Event amount')
    .requiredOption('--date <date>', 'Event date (YYYY-MM-DD)')
    .option('--repeat-type <type>', 'Repeat type (once, weekly, fortnightly, monthly, yearly)')
    .option('--repeat-interval <n>', 'Repeat interval')
    .option('--note <note>', 'Event note')
    .action(async (scenarioId: string, opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const body: Record<string, unknown> = {
        category_id: parseInt(opts.category, 10),
        amount: opts.amount,
        date: opts.date,
      };
      if (opts.repeatType) body.repeat_type = opts.repeatType;
      if (opts.repeatInterval) body.repeat_interval = parseInt(opts.repeatInterval, 10);
      if (opts.note) body.note = opts.note;

      const data = await api.post<Event>(`/scenarios/${scenarioId}/events`, body);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  events
    .command('update <id>')
    .description('Update an event')
    .option('--amount <amount>', 'Event amount')
    .option('--date <date>', 'Event date (YYYY-MM-DD)')
    .option('--repeat-type <type>', 'Repeat type')
    .option('--repeat-interval <n>', 'Repeat interval')
    .option('--note <note>', 'Event note')
    .action(async (id: string, opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await updateEvent(id, {
        amount: opts.amount,
        date: opts.date,
        repeatType: opts.repeatType,
        repeatInterval: opts.repeatInterval ? parseInt(opts.repeatInterval, 10) : undefined,
        note: opts.note,
      });
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  events
    .command('delete <id>')
    .description('Delete an event')
    .action(async (id: string) => {
      await api.delete(`/events/${id}`);
      console.log('Event deleted.');
    });
}
