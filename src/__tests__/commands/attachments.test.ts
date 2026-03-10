import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerAttachmentsCommands } from '../../commands/attachments.js';

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
  registerAttachmentsCommands(program);
  return program;
}

describe('attachments commands', () => {
  describe('list', () => {
    it('lists attachments for the current user', async () => {
      const attachments = [
        { id: 1, title: 'Receipt', file_name: 'receipt.pdf', content_type: 'application/pdf' },
      ];
      vi.mocked(api.get).mockResolvedValue(attachments);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'attachments', 'list']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/users/1/attachments');
      expect(output[0]).toContain('Receipt');
    });

    it('lists attachments for a transaction', async () => {
      const attachments = [
        { id: 1, title: 'Invoice', file_name: 'invoice.pdf', content_type: 'application/pdf' },
      ];
      vi.mocked(api.get).mockResolvedValue(attachments);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'attachments', 'list', '--transaction', '42']);

      expect(getUserId).not.toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/transactions/42/attachments');
    });
  });

  describe('get', () => {
    it('gets a single attachment by ID', async () => {
      const attachment = { id: 1, title: 'Receipt', file_name: 'receipt.pdf' };
      vi.mocked(api.get).mockResolvedValue(attachment);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'attachments', 'get', '1']);

      expect(api.get).toHaveBeenCalledWith('/attachments/1');
      expect(output[0]).toContain('Receipt');
    });
  });

  describe('update', () => {
    it('updates an attachment', async () => {
      const updated = { id: 1, title: 'Updated Receipt' };
      vi.mocked(api.put).mockResolvedValue(updated);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'attachments', 'update', '1', '--title', 'Updated Receipt']);

      expect(api.put).toHaveBeenCalledWith('/attachments/1', { title: 'Updated Receipt' });
    });
  });

  describe('assign', () => {
    it('assigns an attachment to a transaction', async () => {
      const result = { id: 1, title: 'Receipt' };
      vi.mocked(api.post).mockResolvedValue(result);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'attachments', 'assign', '1', '42']);

      expect(api.post).toHaveBeenCalledWith('/transactions/42/attachments', { attachment_id: 1 });
    });
  });

  describe('unassign', () => {
    it('unassigns an attachment from a transaction', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'attachments', 'unassign', '1', '42']);

      expect(api.delete).toHaveBeenCalledWith('/transactions/42/attachments/1');
      expect(output[0]).toContain('Attachment unassigned');
    });
  });

  describe('delete', () => {
    it('deletes an attachment', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'attachments', 'delete', '1']);

      expect(api.delete).toHaveBeenCalledWith('/attachments/1');
      expect(output[0]).toContain('Attachment deleted');
    });
  });
});
