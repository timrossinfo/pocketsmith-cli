import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerAccountsCommands } from '../../commands/accounts.js';

vi.mock('../../api.js', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
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
  registerAccountsCommands(program);
  return program;
}

describe('accounts commands', () => {
  describe('list', () => {
    it('lists accounts for the current user', async () => {
      const accounts = [
        { id: 1, title: 'Checking', type: 'bank', current_balance: 1500, currency_code: 'NZD' },
        { id: 2, title: 'Savings', type: 'bank', current_balance: 5000, currency_code: 'NZD' },
      ];
      vi.mocked(api.get).mockResolvedValue(accounts);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'accounts', 'list']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/users/1/accounts');
      expect(output[0]).toContain('Checking');
      expect(output[0]).toContain('Savings');
    });

    it('outputs JSON when --json flag is set', async () => {
      const accounts = [{ id: 1, title: 'Checking' }];
      vi.mocked(api.get).mockResolvedValue(accounts);

      const program = createProgram();
      await program.parseAsync(['node', 'test', '--json', 'accounts', 'list']);

      const parsed = JSON.parse(output[0]);
      expect(parsed).toEqual(accounts);
    });
  });

  describe('get', () => {
    it('gets a single account by ID', async () => {
      const account = { id: 1, title: 'Checking', current_balance: 1500 };
      vi.mocked(api.get).mockResolvedValue(account);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'accounts', 'get', '1']);

      expect(api.get).toHaveBeenCalledWith('/accounts/1');
      expect(output[0]).toContain('Checking');
    });
  });

  describe('update', () => {
    it('updates an account', async () => {
      const updated = { id: 1, title: 'Updated Account' };
      vi.mocked(api.put).mockResolvedValue(updated);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'accounts', 'update', '1', '--title', 'Updated Account']);

      expect(api.put).toHaveBeenCalledWith('/accounts/1', { title: 'Updated Account' });
    });
  });

  describe('delete', () => {
    it('deletes an account', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'accounts', 'delete', '1']);

      expect(api.delete).toHaveBeenCalledWith('/accounts/1');
      expect(output[0]).toContain('Account deleted');
    });
  });
});
