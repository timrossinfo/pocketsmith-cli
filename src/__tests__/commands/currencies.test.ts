import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerCurrenciesCommands } from '../../commands/currencies.js';

vi.mock('../../api.js', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '../../api.js';

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
    .exitOverride();
  registerCurrenciesCommands(program);
  return program;
}

describe('currencies commands', () => {
  describe('list', () => {
    it('lists all currencies', async () => {
      const currencies = [
        { id: 'NZD', name: 'New Zealand Dollar', symbol: '$', decimal_places: 2 },
        { id: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2 },
      ];
      vi.mocked(api.get).mockResolvedValue(currencies);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'currencies', 'list']);

      expect(api.get).toHaveBeenCalledWith('/currencies');
      expect(output[0]).toContain('New Zealand Dollar');
      expect(output[0]).toContain('US Dollar');
    });

    it('outputs JSON when --json flag is set', async () => {
      const currencies = [{ id: 'NZD', name: 'New Zealand Dollar' }];
      vi.mocked(api.get).mockResolvedValue(currencies);

      const program = createProgram();
      await program.parseAsync(['node', 'test', '--json', 'currencies', 'list']);

      const parsed = JSON.parse(output[0]);
      expect(parsed).toEqual(currencies);
    });
  });

  describe('get', () => {
    it('gets a single currency by code', async () => {
      const currency = { id: 'NZD', name: 'New Zealand Dollar', symbol: '$', decimal_places: 2 };
      vi.mocked(api.get).mockResolvedValue(currency);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'currencies', 'get', 'NZD']);

      expect(api.get).toHaveBeenCalledWith('/currencies/NZD');
      expect(output[0]).toContain('New Zealand Dollar');
    });
  });
});
