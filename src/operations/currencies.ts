import { api } from '../api.js';
import type { Currency } from '../types.js';

export function listCurrencies(): Promise<Currency[]> {
  return api.get<Currency[]>('/currencies');
}

export function getCurrency(code: string): Promise<Currency> {
  return api.get<Currency>(`/currencies/${code}`);
}
