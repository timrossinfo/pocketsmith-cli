import { Command } from 'commander';
import { api, getUserId } from '../api.js';
import { formatOutput } from '../formatter.js';

export function registerLabelsCommands(program: Command) {
  const labels = program.command('labels').description('View labels');

  labels
    .command('list')
    .description('List all labels')
    .action(async (_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const userId = await getUserId(globalOpts.userId);
      const data = await api.get<string[]>(`/users/${userId}/labels`);

      if (globalOpts.json) {
        console.log(JSON.stringify(data, null, 2));
      } else if (data.length === 0) {
        console.log('No labels found.');
      } else {
        data.forEach((label) => console.log(label));
      }
    });
}
