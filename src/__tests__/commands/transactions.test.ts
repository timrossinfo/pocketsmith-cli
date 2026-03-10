import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerTransactionsCommands } from '../../commands/transactions.js';

vi.mock('../../api.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    paginated: vi.fn(),
    fetchAll: vi.fn(),
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
  registerTransactionsCommands(program);
  return program;
}

describe('transactions commands', () => {
  describe('list', () => {
    it('lists transactions for the current user', async () => {
      vi.mocked(api.paginated).mockResolvedValue({
        data: [
          { id: 1, date: '2024-01-15', payee: 'Supermarket', amount: -45.50, category: { title: 'Food' }, status: 'posted' },
        ],
        totalPages: 1,
        currentPage: 1,
      });

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'transactions', 'list']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.paginated).toHaveBeenCalledWith(
        '/users/1/transactions',
        expect.objectContaining({}),
      );
      expect(output[0]).toContain('Supermarket');
    });

    it('routes to account endpoint when --account is provided', async () => {
      vi.mocked(api.paginated).mockResolvedValue({
        data: [],
        totalPages: 1,
        currentPage: 1,
      });

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'transactions', 'list', '--account', '42']);

      expect(api.paginated).toHaveBeenCalledWith(
        '/accounts/42/transactions',
        expect.anything(),
      );
      expect(getUserId).not.toHaveBeenCalled();
    });

    it('routes to category endpoint when --category is provided', async () => {
      vi.mocked(api.paginated).mockResolvedValue({
        data: [],
        totalPages: 1,
        currentPage: 1,
      });

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'transactions', 'list', '--category', '10']);

      expect(api.paginated).toHaveBeenCalledWith(
        '/categories/10/transactions',
        expect.anything(),
      );
    });

    it('passes date filters as params', async () => {
      vi.mocked(api.paginated).mockResolvedValue({
        data: [],
        totalPages: 1,
        currentPage: 1,
      });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'transactions', 'list',
        '--since', '2024-01-01',
        '--until', '2024-12-31',
      ]);

      expect(api.paginated).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        }),
      );
    });

    it('uses fetchAll when --all flag is set', async () => {
      vi.mocked(api.fetchAll).mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'transactions', 'list', '--all']);

      expect(api.fetchAll).toHaveBeenCalled();
      expect(api.paginated).not.toHaveBeenCalled();
    });

    it('shows page info when multiple pages exist', async () => {
      vi.mocked(api.paginated).mockResolvedValue({
        data: [{ id: 1 }],
        totalPages: 5,
        currentPage: 2,
      });

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'transactions', 'list', '--page', '2']);

      expect(output.some((line) => line.includes('Page 2 of 5'))).toBe(true);
    });
  });

  describe('get', () => {
    it('gets a single transaction', async () => {
      vi.mocked(api.get).mockResolvedValue({
        id: 1, payee: 'Coffee Shop', amount: -5.50,
      });

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'transactions', 'get', '1']);

      expect(api.get).toHaveBeenCalledWith('/transactions/1');
      expect(output[0]).toContain('Coffee Shop');
    });
  });

  describe('create', () => {
    it('creates a transaction', async () => {
      vi.mocked(api.post).mockResolvedValue({ id: 1, payee: 'Rent', amount: -1200 });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'transactions', 'create', '5',
        '--payee', 'Rent',
        '--amount', '-1200',
        '--date', '2024-01-01',
      ]);

      expect(api.post).toHaveBeenCalledWith(
        '/transaction-accounts/5/transactions',
        expect.objectContaining({
          payee: 'Rent',
          amount: -1200,
          date: '2024-01-01',
        }),
      );
    });

    it('includes optional fields when provided', async () => {
      vi.mocked(api.post).mockResolvedValue({ id: 1 });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'transactions', 'create', '5',
        '--payee', 'Transfer',
        '--amount', '500',
        '--date', '2024-01-01',
        '--note', 'Monthly transfer',
        '--category', '10',
        '--is-transfer',
      ]);

      expect(api.post).toHaveBeenCalledWith(
        '/transaction-accounts/5/transactions',
        expect.objectContaining({
          note: 'Monthly transfer',
          category_id: 10,
          is_transfer: true,
        }),
      );
    });
  });

  describe('update', () => {
    it('updates a transaction', async () => {
      vi.mocked(api.put).mockResolvedValue({ id: 1, payee: 'Updated Payee' });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'transactions', 'update', '1',
        '--payee', 'Updated Payee',
      ]);

      expect(api.put).toHaveBeenCalledWith('/transactions/1', { payee: 'Updated Payee' });
    });
  });

  describe('delete', () => {
    it('deletes a transaction', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'transactions', 'delete', '1']);

      expect(api.delete).toHaveBeenCalledWith('/transactions/1');
      expect(output[0]).toContain('Transaction deleted');
    });
  });
});
