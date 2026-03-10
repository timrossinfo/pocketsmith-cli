import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerInstitutionsCommands } from '../../commands/institutions.js';

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
  registerInstitutionsCommands(program);
  return program;
}

describe('institutions commands', () => {
  describe('list', () => {
    it('lists institutions for the current user', async () => {
      const institutions = [
        { id: 1, title: 'ANZ Bank', currency_code: 'NZD', created_at: '2024-01-01' },
        { id: 2, title: 'ASB Bank', currency_code: 'NZD', created_at: '2024-01-02' },
      ];
      vi.mocked(api.get).mockResolvedValue(institutions);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'institutions', 'list']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/users/1/institutions');
      expect(output[0]).toContain('ANZ Bank');
      expect(output[0]).toContain('ASB Bank');
    });
  });

  describe('get', () => {
    it('gets a single institution by ID', async () => {
      const institution = { id: 1, title: 'ANZ Bank', currency_code: 'NZD' };
      vi.mocked(api.get).mockResolvedValue(institution);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'institutions', 'get', '1']);

      expect(api.get).toHaveBeenCalledWith('/institutions/1');
      expect(output[0]).toContain('ANZ Bank');
    });
  });

  describe('create', () => {
    it('creates an institution', async () => {
      const created = { id: 3, title: 'Kiwibank', currency_code: 'NZD' };
      vi.mocked(api.post).mockResolvedValue(created);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'institutions', 'create', '--title', 'Kiwibank', '--currency', 'NZD']);

      expect(api.post).toHaveBeenCalledWith('/users/1/institutions', {
        title: 'Kiwibank',
        currency_code: 'NZD',
      });
    });
  });

  describe('update', () => {
    it('updates an institution', async () => {
      const updated = { id: 1, title: 'Updated Bank', currency_code: 'USD' };
      vi.mocked(api.put).mockResolvedValue(updated);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'institutions', 'update', '1', '--title', 'Updated Bank', '--currency', 'USD']);

      expect(api.put).toHaveBeenCalledWith('/institutions/1', {
        title: 'Updated Bank',
        currency_code: 'USD',
      });
    });
  });

  describe('delete', () => {
    it('deletes an institution', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'institutions', 'delete', '1']);

      expect(api.delete).toHaveBeenCalledWith('/institutions/1');
      expect(output[0]).toContain('Institution deleted');
    });
  });
});
