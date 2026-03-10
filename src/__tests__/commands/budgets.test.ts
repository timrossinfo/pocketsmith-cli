import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerBudgetCommands } from '../../commands/budgets.js';

vi.mock('../../api.js', () => ({
  api: {
    get: vi.fn(),
    delete: vi.fn(),
  },
  getUserId: vi.fn(() => Promise.resolve(1)),
}));

import { api, getUserId } from '../../api.js';

let output: string[];

beforeEach(() => {
  output = [];
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    output.push(args.join(' '));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createProgram(): Command {
  const program = new Command()
    .option('--json', 'Output as JSON', false)
    .option('--user-id <id>', 'Override user ID')
    .exitOverride();
  registerBudgetCommands(program);
  return program;
}

describe('budgets commands', () => {
  describe('list', () => {
    it('lists budget events', async () => {
      const budgets = [
        { category: { title: 'Groceries' }, amount: 500, currency_code: 'NZD', date: '2024-01-01', repeat_type: 'monthly' },
      ];
      vi.mocked(api.get).mockResolvedValue(budgets);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'budgets', 'list']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/users/1/budget', {});
      expect(output[0]).toContain('Groceries');
    });

    it('passes rollup parameter', async () => {
      vi.mocked(api.get).mockResolvedValue([]);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'budgets', 'list', '--rollup']);

      expect(api.get).toHaveBeenCalledWith('/users/1/budget', { roll_up: true });
    });
  });

  describe('summary', () => {
    it('gets budget summary', async () => {
      const summary = [
        { category: { title: 'Groceries' }, total_budgeted: 500, total_actual: 450, currency_code: 'NZD' },
      ];
      vi.mocked(api.get).mockResolvedValue(summary);

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'budgets', 'summary',
        '--period', 'months', '--interval', '1',
        '--start-date', '2024-01-01', '--end-date', '2024-01-31',
      ]);

      expect(api.get).toHaveBeenCalledWith('/users/1/budget_summary', {
        period: 'months',
        interval: '1',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });
    });
  });

  describe('trend-analysis', () => {
    it('gets trend analysis', async () => {
      const trends = [{ period: '2024-01', amount: 500 }];
      vi.mocked(api.get).mockResolvedValue(trends);

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'budgets', 'trend-analysis',
        '--period', 'months', '--interval', '3',
        '--categories', '1,2', '--scenarios', '5',
        '--start-date', '2024-01-01', '--end-date', '2024-03-31',
      ]);

      expect(api.get).toHaveBeenCalledWith('/users/1/trend_analysis', {
        period: 'months',
        interval: '3',
        categories: '1,2',
        scenarios: '5',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
      });
    });
  });

  describe('clear-cache', () => {
    it('clears the forecast cache', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'budgets', 'clear-cache']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.delete).toHaveBeenCalledWith('/users/1/forecast-cache');
      expect(output[0]).toContain('Forecast cache cleared');
    });
  });
});
