import { Command } from 'commander';
import { getConfigPath, saveApiKey } from '../config.js';
import fs from 'node:fs';

export function registerConfigCommands(program: Command) {
  const config = program.command('config').description('Manage CLI configuration');

  config
    .command('set-key <key>')
    .description('Save your PocketSmith API key')
    .action((key: string) => {
      saveApiKey(key);
      console.log(`API key saved to ${getConfigPath()}`);
    });

  config
    .command('show')
    .description('Show current configuration')
    .action(() => {
      const configPath = getConfigPath();
      const envKey = process.env.POCKETSMITH_API_KEY;

      if (envKey) {
        console.log(`Source:   environment variable (POCKETSMITH_API_KEY)`);
        console.log(`API key:  ${envKey.slice(0, 6)}...${envKey.slice(-4)}`);
        return;
      }

      try {
        const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (data.api_key) {
          console.log(`Source:   ${configPath}`);
          console.log(`API key:  ${data.api_key.slice(0, 6)}...${data.api_key.slice(-4)}`);
        } else {
          console.log('No API key configured.');
        }
      } catch {
        console.log('No configuration file found.');
        console.log(`Run 'pocketsmith config set-key <key>' to configure.`);
      }
    });
}
