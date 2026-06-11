import { api, getUserId } from '../api.js';
import type { BudgetEvent, BudgetSummary, TrendAnalysis } from '../types.js';

export async function listBudget(
  options: { rollUp?: boolean; userId?: string } = {},
): Promise<BudgetEvent[]> {
  const userId = await getUserId(options.userId);
  const params: Record<string, string | number | boolean | undefined> = {};
  if (options.rollUp) params.roll_up = true;
  return api.get<BudgetEvent[]>(`/users/${userId}/budget`, params);
}

export interface BudgetSummaryParams {
  period: string;
  interval: number | string;
  startDate: string;
  endDate: string;
  userId?: string;
}

export async function getBudgetSummary(p: BudgetSummaryParams): Promise<BudgetSummary> {
  const userId = await getUserId(p.userId);
  return api.get<BudgetSummary>(`/users/${userId}/budget_summary`, {
    period: p.period,
    interval: p.interval,
    start_date: p.startDate,
    end_date: p.endDate,
  });
}

export interface TrendAnalysisParams {
  period: string;
  interval: number | string;
  categories: string;
  scenarios: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export async function getTrendAnalysis(p: TrendAnalysisParams): Promise<TrendAnalysis[]> {
  const userId = await getUserId(p.userId);
  return api.get<TrendAnalysis[]>(`/users/${userId}/trend_analysis`, {
    period: p.period,
    interval: p.interval,
    categories: p.categories,
    scenarios: p.scenarios,
    start_date: p.startDate,
    end_date: p.endDate,
  });
}
