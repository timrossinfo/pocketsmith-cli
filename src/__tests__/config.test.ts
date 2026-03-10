import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

vi.mock('node:fs');
vi.mock('node:os');

const CONFIG_DIR = '/home/testuser/.config/pocketsmith';
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

beforeEach(() => {
  vi.mocked(os.homedir).mockReturnValue('/home/testuser');
  delete process.env.POCKETSMITH_API_KEY;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('getApiKey', () => {
  it('returns API key from environment variable', async () => {
    process.env.POCKETSMITH_API_KEY = 'env-key-123';
    const { getApiKey } = await import('../config.js');
    expect(getApiKey()).toBe('env-key-123');
  });

  it('returns API key from config file when env var is not set', async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ api_key: 'file-key-456' }));
    const { getApiKey } = await import('../config.js');
    expect(getApiKey()).toBe('file-key-456');
  });

  it('prefers environment variable over config file', async () => {
    process.env.POCKETSMITH_API_KEY = 'env-key-123';
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ api_key: 'file-key-456' }));
    const { getApiKey } = await import('../config.js');
    expect(getApiKey()).toBe('env-key-123');
  });

  it('exits when no API key is configured', async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { getApiKey } = await import('../config.js');
    getApiKey();

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockError).toHaveBeenCalledWith(
      expect.stringContaining('No API key found'),
    );
  });
});

describe('saveApiKey', () => {
  it('creates config directory and writes key', async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

    const { saveApiKey } = await import('../config.js');
    saveApiKey('new-key-789');

    expect(fs.mkdirSync).toHaveBeenCalledWith(CONFIG_DIR, { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      CONFIG_FILE,
      JSON.stringify({ api_key: 'new-key-789' }, null, 2) + '\n',
    );
  });

  it('preserves existing config when saving key', async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ api_key: 'old-key' }));
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

    const { saveApiKey } = await import('../config.js');
    saveApiKey('new-key');

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      CONFIG_FILE,
      JSON.stringify({ api_key: 'new-key' }, null, 2) + '\n',
    );
  });
});

describe('getConfigPath', () => {
  it('returns the config file path', async () => {
    const { getConfigPath } = await import('../config.js');
    expect(getConfigPath()).toBe(CONFIG_FILE);
  });
});
