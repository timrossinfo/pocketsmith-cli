import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerLabelsCommands } from '../../commands/labels.js';

vi.mock('../../api.js', () => ({
  api: {
    get: vi.fn(),
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
  registerLabelsCommands(program);
  return program;
}

describe('labels commands', () => {
  describe('list', () => {
    it('lists labels for the current user', async () => {
      const labels = ['groceries', 'rent', 'salary'];
      vi.mocked(api.get).mockResolvedValue(labels);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'labels', 'list']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/users/1/labels');
      expect(output).toContain('groceries');
      expect(output).toContain('rent');
      expect(output).toContain('salary');
    });

    it('shows message when no labels found', async () => {
      vi.mocked(api.get).mockResolvedValue([]);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'labels', 'list']);

      expect(output[0]).toContain('No labels found');
    });

    it('outputs JSON when --json flag is set', async () => {
      const labels = ['groceries', 'rent'];
      vi.mocked(api.get).mockResolvedValue(labels);

      const program = createProgram();
      await program.parseAsync(['node', 'test', '--json', 'labels', 'list']);

      const parsed = JSON.parse(output[0]);
      expect(parsed).toEqual(labels);
    });
  });
});
