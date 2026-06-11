import { Command } from 'commander';
import { getUser } from '../operations/me.js';
import { formatOutput } from '../formatter.js';

export function registerMeCommands(program: Command) {
  program
    .command('me')
    .description('Show the authenticated user')
    .action(async (_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await getUser();
      console.log(formatOutput(data, { json: globalOpts.json }));
    });
}
