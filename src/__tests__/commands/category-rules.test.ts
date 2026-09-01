import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerCategoryRulesCommands } from '../../commands/category-rules.js';

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
  registerCategoryRulesCommands(program);
  return program;
}

describe('category-rules commands', () => {
  describe('list', () => {
    it('lists category rules for the current user', async () => {
      const rules = [
        {
          id: 10,
          payee_matches: 'NEW WORLD',
          category: { id: 1, title: 'Groceries' },
        },
        {
          id: 11,
          payee_matches: 'SPECSAVERS',
          category: { id: 2, title: 'Medical' },
        },
      ];
      vi.mocked(api.get).mockResolvedValue(rules);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'category-rules', 'list']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/users/1/category_rules');
      expect(output[0]).toContain('NEW WORLD');
      expect(output[0]).toContain('Groceries');
      expect(output[0]).toContain('SPECSAVERS');
      expect(output[0]).toContain('Medical');
    });

    it('outputs JSON with --json', async () => {
      const rules = [
        { id: 10, payee_matches: 'NEW WORLD', category: { id: 1, title: 'Groceries' } },
      ];
      vi.mocked(api.get).mockResolvedValue(rules);

      const program = createProgram();
      await program.parseAsync(['node', 'test', '--json', 'category-rules', 'list']);

      expect(JSON.parse(output[0])).toEqual(rules);
    });
  });

  describe('create', () => {
    it('creates a category rule', async () => {
      vi.mocked(api.post).mockResolvedValue({
        id: 12,
        payee_matches: 'MITRE 10',
        category: { id: 3, title: 'Home maintenance' },
      });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'category-rules', 'create',
        '--category', '3',
        '--payee-matches', 'MITRE 10',
      ]);

      expect(api.post).toHaveBeenCalledWith('/categories/3/category_rules', {
        payee_matches: 'MITRE 10',
      });
      expect(output[0]).toContain('MITRE 10');
    });

    it('includes apply flags only when set', async () => {
      vi.mocked(api.post).mockResolvedValue({ id: 13, payee_matches: 'KOSCO' });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'category-rules', 'create',
        '--category', '4',
        '--payee-matches', 'KOSCO',
        '--apply-to-uncategorised',
      ]);

      expect(api.post).toHaveBeenCalledWith('/categories/4/category_rules', {
        payee_matches: 'KOSCO',
        apply_to_uncategorised: true,
      });
    });

    it('includes apply_to_all with --apply-to-all', async () => {
      vi.mocked(api.post).mockResolvedValue({ id: 14, payee_matches: 'Postie' });

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'category-rules', 'create',
        '--category', '5',
        '--payee-matches', 'Postie',
        '--apply-to-all',
      ]);

      expect(api.post).toHaveBeenCalledWith('/categories/5/category_rules', {
        payee_matches: 'Postie',
        apply_to_all: true,
      });
    });
  });
});
