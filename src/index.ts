import { Command } from 'commander';
import { ApiError, ConnectionError } from './api.js';
import { ConfigError } from './config.js';
import { registerConfigCommands } from './commands/config.js';
import { registerMeCommands } from './commands/me.js';
import { registerAccountsCommands } from './commands/accounts.js';
import { registerTransactionsCommands } from './commands/transactions.js';
import { registerCategoriesCommands } from './commands/categories.js';
import { registerCategoryRulesCommands } from './commands/category-rules.js';
import { registerInstitutionsCommands } from './commands/institutions.js';
import { registerBudgetCommands } from './commands/budgets.js';
import { registerEventsCommands } from './commands/events.js';
import { registerAttachmentsCommands } from './commands/attachments.js';
import { registerLabelsCommands } from './commands/labels.js';
import { registerCurrenciesCommands } from './commands/currencies.js';

const program = new Command()
  .name('pocketsmith')
  .description('CLI tool for interacting with the PocketSmith API')
  .version('0.1.0')
  .option('--json', 'Output as JSON', false)
  .option('--user-id <id>', 'Override user ID (default: auto-detect from /me)');

registerConfigCommands(program);
registerMeCommands(program);
registerAccountsCommands(program);
registerTransactionsCommands(program);
registerCategoriesCommands(program);
registerCategoryRulesCommands(program);
registerInstitutionsCommands(program);
registerBudgetCommands(program);
registerEventsCommands(program);
registerAttachmentsCommands(program);
registerLabelsCommands(program);
registerCurrenciesCommands(program);

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    if (err instanceof ApiError || err instanceof ConnectionError || err instanceof ConfigError) {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
