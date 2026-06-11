import { Command } from 'commander';
import { api, getUserId } from '../api.js';
import { formatOutput } from '../formatter.js';
import { listBudget, getBudgetSummary, getTrendAnalysis } from '../operations/budgets.js';

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
      const data = await listBudget({ rollUp: opts.rollup, userId: globalOpts.userId });
      console.log(formatOutput(data, { json: globalOpts.json, columns: budgetColumns }));
    });

  budgets
    .command('summary')
    .description('Get budget summary')
    .requiredOption('--period <period>', 'Period: weeks, months, or years')
    .requiredOption('--interval <n>', 'Number of periods')
    .requiredOption('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .requiredOption('--end-date <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await getBudgetSummary({
        period: opts.period,
        interval: opts.interval,
        startDate: opts.startDate,
        endDate: opts.endDate,
        userId: globalOpts.userId,
      });
      console.log(formatOutput(data, { json: globalOpts.json, columns: summaryColumns }));
    });

  budgets
    .command('trend-analysis')
    .description('Get trend analysis')
    .requiredOption('--period <period>', 'Period: weeks, months, or years')
    .requiredOption('--interval <n>', 'Number of periods')
    .requiredOption('--categories <ids>', 'Comma-separated category IDs')
    .requiredOption('--scenarios <ids>', 'Comma-separated scenario IDs')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await getTrendAnalysis({
        period: opts.period,
        interval: opts.interval,
        categories: opts.categories,
        scenarios: opts.scenarios,
        startDate: opts.startDate,
        endDate: opts.endDate,
        userId: globalOpts.userId,
      });
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
