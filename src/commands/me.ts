import { Command } from 'commander';
import { api } from '../api.js';
import { formatOutput } from '../formatter.js';
import type { User } from '../types.js';

export function registerMeCommands(program: Command) {
  program
    .command('me')
    .description('Show the authenticated user')
    .action(async (_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await api.get<User>('/me');
      console.log(formatOutput(data, { json: globalOpts.json }));
    });
}
