import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'pocketsmith');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface Config {
  api_key?: string;
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

function readConfig(): Config {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function getApiKey(): string {
  const envKey = process.env.POCKETSMITH_API_KEY;
  if (envKey) return envKey;

  const config = readConfig();
  if (config.api_key) return config.api_key;

  console.error('No API key found. Run `pocketsmith config set-key` or set POCKETSMITH_API_KEY.');
  return process.exit(1) as never;
}

export function saveApiKey(key: string): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const config = readConfig();
  config.api_key = key;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}
