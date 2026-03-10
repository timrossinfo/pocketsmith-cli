import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerCategoriesCommands } from '../../commands/categories.js';

vi.mock('../../api.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
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
  registerCategoriesCommands(program);
  return program;
}

describe('categories commands', () => {
  describe('list', () => {
    it('lists categories for the current user', async () => {
      const categories = [
        { id: 1, title: 'Food', parent_id: null, is_transfer: false, is_bill: false },
        { id: 2, title: 'Transport', parent_id: null, is_transfer: false, is_bill: false },
      ];
      vi.mocked(api.get).mockResolvedValue(categories);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'categories', 'list']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/users/1/categories');
      expect(output[0]).toContain('Food');
      expect(output[0]).toContain('Transport');
    });
  });

  describe('get', () => {
    it('gets a single category', async () => {
      vi.mocked(api.get).mockResolvedValue({ id: 1, title: 'Food' });

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'categories', 'get', '1']);

      expect(api.get).toHaveBeenCalledWith('/categories/1');
      expect(output[0]).toContain('Food');
    });
  });

  describe('create', () => {
    it('creates a category', async () => {
      vi.mocked(api.post).mockResolvedValue({ id: 3, title: 'Entertainment' });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'categories', 'create',
        '--title', 'Entertainment',
      ]);

      expect(api.post).toHaveBeenCalledWith(
        '/users/1/categories',
        expect.objectContaining({ title: 'Entertainment' }),
      );
    });

    it('includes parent ID when provided', async () => {
      vi.mocked(api.post).mockResolvedValue({ id: 4, title: 'Groceries' });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'categories', 'create',
        '--title', 'Groceries',
        '--parent-id', '1',
      ]);

      expect(api.post).toHaveBeenCalledWith(
        '/users/1/categories',
        expect.objectContaining({ title: 'Groceries', parent_id: 1 }),
      );
    });
  });

  describe('update', () => {
    it('updates a category', async () => {
      vi.mocked(api.put).mockResolvedValue({ id: 1, title: 'Updated' });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'categories', 'update', '1',
        '--title', 'Updated',
      ]);

      expect(api.put).toHaveBeenCalledWith('/categories/1', { title: 'Updated' });
    });
  });

  describe('delete', () => {
    it('deletes a category', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'categories', 'delete', '1']);

      expect(api.delete).toHaveBeenCalledWith('/categories/1');
      expect(output[0]).toContain('Category deleted');
    });
  });
});
