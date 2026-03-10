import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerEventsCommands } from '../../commands/events.js';

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
  registerEventsCommands(program);
  return program;
}

describe('events commands', () => {
  describe('list', () => {
    it('lists events for the current user', async () => {
      const events = [
        { id: 1, category: { title: 'Rent' }, amount: 1200, date: '2024-01-01', repeat_type: 'monthly' },
      ];
      vi.mocked(api.get).mockResolvedValue(events);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'events', 'list', '--since', '2024-01-01', '--until', '2024-12-31']);

      expect(getUserId).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/users/1/events', {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });
      expect(output[0]).toContain('Rent');
    });

    it('lists events by scenario ID', async () => {
      const events = [{ id: 1, category: { title: 'Savings' }, amount: 500, date: '2024-01-01', repeat_type: 'monthly' }];
      vi.mocked(api.get).mockResolvedValue(events);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'events', 'list', '--since', '2024-01-01', '--until', '2024-12-31', '--scenario', '5']);

      expect(getUserId).not.toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/scenarios/5/events', {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });
    });
  });

  describe('get', () => {
    it('gets a single event by ID', async () => {
      const event = { id: 1, amount: 1200, date: '2024-01-01' };
      vi.mocked(api.get).mockResolvedValue(event);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'events', 'get', '1']);

      expect(api.get).toHaveBeenCalledWith('/events/1');
      expect(output[0]).toContain('1200');
    });
  });

  describe('create', () => {
    it('creates an event', async () => {
      const created = { id: 2, category: { title: 'Rent' }, amount: 1200, date: '2024-01-01' };
      vi.mocked(api.post).mockResolvedValue(created);

      const program = createProgram();
      await program.parseAsync([
        'node', 'test', 'events', 'create', '5',
        '--category', '10', '--amount', '1200', '--date', '2024-01-01',
        '--repeat-type', 'monthly', '--note', 'Monthly rent',
      ]);

      expect(api.post).toHaveBeenCalledWith('/scenarios/5/events', {
        category_id: 10,
        amount: '1200',
        date: '2024-01-01',
        repeat_type: 'monthly',
        note: 'Monthly rent',
      });
    });
  });

  describe('update', () => {
    it('updates an event', async () => {
      const updated = { id: 1, category: { title: 'Rent' }, amount: 1300 };
      vi.mocked(api.put).mockResolvedValue(updated);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'events', 'update', '1', '--amount', '1300', '--note', 'Increased']);

      expect(api.put).toHaveBeenCalledWith('/events/1', {
        amount: '1300',
        note: 'Increased',
      });
    });
  });

  describe('delete', () => {
    it('deletes an event', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'events', 'delete', '1']);

      expect(api.delete).toHaveBeenCalledWith('/events/1');
      expect(output[0]).toContain('Event deleted');
    });
  });
});
