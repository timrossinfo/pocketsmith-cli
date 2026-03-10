import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerConfigCommands } from '../../commands/config.js';

vi.mock('../../config.js', () => ({
  saveApiKey: vi.fn(),
  getConfigPath: vi.fn(() => '/home/user/.config/pocketsmith/config.json'),
}));

import { saveApiKey, getConfigPath } from '../../config.js';
import fs from 'node:fs';

let output: string[];

beforeEach(() => {
  output = [];
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    output.push(args.join(' '));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.POCKETSMITH_API_KEY;
});

function createProgram(): Command {
  const program = new Command().exitOverride();
  registerConfigCommands(program);
  return program;
}

describe('config commands', () => {
  describe('set-key', () => {
    it('saves the API key', async () => {
      const program = createProgram();
      await program.parseAsync(['node', 'test', 'config', 'set-key', 'my-api-key']);

      expect(saveApiKey).toHaveBeenCalledWith('my-api-key');
      expect(output[0]).toContain('API key saved');
    });
  });

  describe('show', () => {
    it('shows config from environment variable', async () => {
      process.env.POCKETSMITH_API_KEY = 'abcdef1234ghij';

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'config', 'show']);

      expect(output[0]).toContain('environment variable');
      expect(output[1]).toContain('abcdef...ghij');
    });

    it('shows config from file', async () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ api_key: 'abcdef1234ghij' }));

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'config', 'show']);

      expect(output[0]).toContain(getConfigPath());
      expect(output[1]).toContain('abcdef...ghij');
    });

    it('shows message when no config file exists', async () => {
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('ENOENT');
      });

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'config', 'show']);

      expect(output[0]).toContain('No configuration file found');
    });

    it('shows message when config file has no api_key', async () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({}));

      const program = createProgram();
      await program.parseAsync(['node', 'test', 'config', 'show']);

      expect(output[0]).toContain('No API key configured');
    });
  });
});
