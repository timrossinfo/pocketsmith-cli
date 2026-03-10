import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerMeCommands } from '../../commands/me.js';

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
  registerMeCommands(program);
  return program;
}

describe('me command', () => {
  it('shows the authenticated user', async () => {
    const user = { id: 1, login: 'testuser', name: 'Test User', email: 'test@example.com' };
    vi.mocked(api.get).mockResolvedValue(user);

    const program = createProgram();
    await program.parseAsync(['node', 'test', 'me']);

    expect(api.get).toHaveBeenCalledWith('/me');
    expect(output[0]).toContain('testuser');
  });

  it('outputs JSON when --json flag is set', async () => {
    const user = { id: 1, login: 'testuser', name: 'Test User' };
    vi.mocked(api.get).mockResolvedValue(user);

    const program = createProgram();
    await program.parseAsync(['node', 'test', '--json', 'me']);

    const parsed = JSON.parse(output[0]);
    expect(parsed).toEqual(user);
  });
});
