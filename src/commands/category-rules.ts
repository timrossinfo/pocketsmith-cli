import { Command } from 'commander';
import { formatOutput } from '../formatter.js';
import { listCategoryRules, createCategoryRule } from '../operations/category-rules.js';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'category.title', header: 'Category', width: 25 },
  { key: 'category.id', header: 'Category ID' },
  { key: 'payee_matches', header: 'Payee matches', width: 40 },
];

export function registerCategoryRulesCommands(program: Command) {
  const rules = program
    .command('category-rules')
    .description(
      'Manage category rules (the API only supports list and create; edit or delete rules in the PocketSmith web app)',
    );

  rules
    .command('list')
    .description('List all category rules')
    .action(async (_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await listCategoryRules(globalOpts.userId);
      console.log(formatOutput(data, { json: globalOpts.json, columns }));
    });

  rules
    .command('create')
    .description('Create a category rule')
    .requiredOption('--category <id>', 'Category ID the rule assigns transactions to')
    .requiredOption('--payee-matches <keywords>', 'Keyword(s) to match transaction payees')
    .option('--apply-to-uncategorised', 'Apply the rule to all uncategorised transactions')
    .option('--apply-to-all', 'Apply the rule to all transactions')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await createCategoryRule({
        categoryId: parseInt(opts.category, 10),
        payeeMatches: opts.payeeMatches,
        applyToUncategorised: opts.applyToUncategorised,
        applyToAll: opts.applyToAll,
      });
      console.log(formatOutput(data, { json: globalOpts.json }));
    });
}
