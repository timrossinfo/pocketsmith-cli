import { Command } from 'commander';
import { api, getUserId } from '../api.js';
import { formatOutput } from '../formatter.js';
import type { BudgetEvent, BudgetSummary, TrendAnalysis } from '../types.js';

const budgetColumns = [
  { key: 'category.title', header: 'Category', width: 25 },
  { key: 'amount', header: 'Amount', align: 'right' as const },
  { key: 'currency_code', header: 'Currency' },
  { key: 'date', header: 'Date' },
  { key: 'repeat_type', header: 'Repeat' },
];

const summaryColumns = [
  { key: 'category.title', header: 'Category', width: 25 },
  { key: 'total_budgeted', header: 'Budgeted', align: 'right' as const },
  { key: 'total_actual', header: 'Actual', align: 'right' as const },
  { key: 'currency_code', header: 'Currency' },
];

export function registerBudgetCommands(program: Command) {
  const budgets = program.command('budgets').description('View budget data');

  budgets
    .command('list')
    .description('List budget events')
    .option('--rollup', 'Include rolled-up amounts')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const userId = await getUserId(globalOpts.userId);
      const params: Record<string, string | number | boolean | undefined> = {};
      if (opts.rollup) params.roll_up = true;
      const data = await api.get<BudgetEvent[]>(`/users/${userId}/budget`, params);
      console.log(formatOutput(data, { json: globalOpts.json, columns: budgetColumns }));
    });

  budgets
    .command('summary')
    .description('Get budget summary')
    .requiredOption('--period <period>', 'Period: weeks, months, or years')
    .requiredOption('--interval <n>', 'Number of periods')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const userId = await getUserId(globalOpts.userId);
      const params: Record<string, string | number | boolean | undefined> = {
        period: opts.period,
        interval: opts.interval,
        start_date: opts.startDate,
        end_date: opts.endDate,
      };
      const data = await api.get<BudgetSummary[]>(`/users/${userId}/budget-summary`, params);
      console.log(formatOutput(data, { json: globalOpts.json, columns: summaryColumns }));
    });

  budgets
    .command('trend-analysis')
    .description('Get trend analysis')
    .requiredOption('--period <period>', 'Period: weeks, months, or years')
    .requiredOption('--interval <n>', 'Number of periods')
    .option('--categories <ids>', 'Comma-separated category IDs')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const userId = await getUserId(globalOpts.userId);
      const params: Record<string, string | number | boolean | undefined> = {
        period: opts.period,
        interval: opts.interval,
        categories: opts.categories,
        start_date: opts.startDate,
        end_date: opts.endDate,
      };
      const data = await api.get<TrendAnalysis[]>(`/users/${userId}/trend-analysis`, params);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  budgets
    .command('clear-cache')
    .description('Clear forecast cache')
    .action(async (_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const userId = await getUserId(globalOpts.userId);
      await api.delete(`/users/${userId}/forecast-cache`);
      console.log('Forecast cache cleared.');
    });
}
