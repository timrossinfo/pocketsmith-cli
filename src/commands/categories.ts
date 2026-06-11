import { Command } from 'commander';
import { api } from '../api.js';
import { formatOutput } from '../formatter.js';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
} from '../operations/categories.js';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'title', header: 'Title', width: 30 },
  { key: 'parent_id', header: 'Parent ID' },
  { key: 'is_transfer', header: 'Transfer' },
  { key: 'is_bill', header: 'Bill' },
];

export function registerCategoriesCommands(program: Command) {
  const categories = program.command('categories').description('Manage categories');

  categories
    .command('list')
    .description('List all categories')
    .action(async (_opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await listCategories(globalOpts.userId);
      console.log(formatOutput(data, { json: globalOpts.json, columns }));
    });

  categories
    .command('get <id>')
    .description('Get category details')
    .action(async (id: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await getCategory(id);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  categories
    .command('create')
    .description('Create a category')
    .requiredOption('--title <title>', 'Category title')
    .option('--parent-id <id>', 'Parent category ID')
    .option('--is-transfer', 'Mark as transfer category')
    .option('--is-bill', 'Mark as bill category')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await createCategory(
        {
          title: opts.title,
          parentId: opts.parentId ? parseInt(opts.parentId, 10) : undefined,
          isTransfer: opts.isTransfer,
          isBill: opts.isBill,
        },
        globalOpts.userId,
      );
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  categories
    .command('update <id>')
    .description('Update a category')
    .option('--title <title>', 'Category title')
    .option('--colour <colour>', 'Category colour')
    .option('--is-transfer', 'Mark as transfer category')
    .option('--no-is-transfer', 'Unmark as transfer category')
    .option('--is-bill', 'Mark as bill category')
    .option('--no-is-bill', 'Unmark as bill category')
    .action(async (id: string, opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await updateCategory(id, {
        title: opts.title,
        colour: opts.colour,
        isTransfer: opts.isTransfer,
        isBill: opts.isBill,
      });
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  categories
    .command('delete <id>')
    .description('Delete a category')
    .action(async (id: string) => {
      await api.delete(`/categories/${id}`);
      console.log('Category deleted.');
    });
}
