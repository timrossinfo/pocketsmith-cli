import { Command } from 'commander';
import { registerConfigCommands } from './commands/config.js';
import { registerMeCommands } from './commands/me.js';
import { registerAccountsCommands } from './commands/accounts.js';
import { registerTransactionsCommands } from './commands/transactions.js';
import { registerCategoriesCommands } from './commands/categories.js';
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
registerInstitutionsCommands(program);
registerBudgetCommands(program);
registerEventsCommands(program);
registerAttachmentsCommands(program);
registerLabelsCommands(program);
registerCurrenciesCommands(program);

program.parse();
