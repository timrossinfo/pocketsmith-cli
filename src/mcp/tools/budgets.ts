import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listBudget, getBudgetSummary, getTrendAnalysis } from '../../operations/budgets.js';
import { toolHandler } from '../result.js';

const listBudgetsInput = z.object({
  roll_up: z.boolean().optional().describe('Include rolled-up amounts from child categories'),
});

const getBudgetSummaryInput = z.object({
  period: z.enum(['weeks', 'months', 'years']).describe('Period unit'),
  interval: z.number().int().min(1).describe('Number of periods per interval'),
  start_date: z.string().describe('Start date (YYYY-MM-DD)'),
  end_date: z.string().describe('End date (YYYY-MM-DD)'),
});

const getBudgetTrendAnalysisInput = z.object({
  period: z.enum(['weeks', 'months', 'years']).describe('Period unit'),
  interval: z.number().int().min(1).describe('Number of periods per interval'),
  categories: z.string().describe('Comma-separated category IDs'),
  scenarios: z.string().describe('Comma-separated scenario IDs'),
  start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
});

export function registerBudgetsTools(server: McpServer) {
  server.registerTool(
    'list_budgets',
    {
      title: 'List Budgets',
      description:
        'List budget events for the authenticated user (the per-category budget lines).',
      inputSchema: listBudgetsInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof listBudgetsInput>) =>
      listBudget({ rollUp: args.roll_up }),
    ),
  );

  server.registerTool(
    'get_budget_summary',
    {
      title: 'Get Budget Summary',
      description: 'Get budgeted vs actual amounts per category over a date range.',
      inputSchema: getBudgetSummaryInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof getBudgetSummaryInput>) =>
      getBudgetSummary({
        period: args.period,
        interval: args.interval,
        startDate: args.start_date,
        endDate: args.end_date,
      }),
    ),
  );

  server.registerTool(
    'get_budget_trend_analysis',
    {
      title: 'Get Budget Trend Analysis',
      description:
        'Get budget trend analysis for specific categories and scenarios over time.',
      inputSchema: getBudgetTrendAnalysisInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof getBudgetTrendAnalysisInput>) =>
      getTrendAnalysis({
        period: args.period,
        interval: args.interval,
        categories: args.categories,
        scenarios: args.scenarios,
        startDate: args.start_date,
        endDate: args.end_date,
      }),
    ),
  );
}
