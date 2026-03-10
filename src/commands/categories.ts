import { Command } from 'commander';
import { api, getUserId } from '../api.js';
import { formatOutput } from '../formatter.js';
import type { Category } from '../types.js';

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
      const userId = await getUserId(globalOpts.userId);
      const data = await api.get<Category[]>(`/users/${userId}/categories`);
      console.log(formatOutput(data, { json: globalOpts.json, columns }));
    });

  categories
    .command('get <id>')
    .description('Get category details')
    .action(async (id: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await api.get<Category>(`/categories/${id}`);
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
      const userId = await getUserId(globalOpts.userId);
      const body: Record<string, unknown> = { title: opts.title };
      if (opts.parentId) body.parent_id = parseInt(opts.parentId, 10);
      if (opts.isTransfer) body.is_transfer = true;
      if (opts.isBill) body.is_bill = true;

      const data = await api.post<Category>(`/users/${userId}/categories`, body);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  categories
    .command('update <id>')
    .description('Update a category')
    .option('--title <title>', 'Category title')
    .option('--colour <colour>', 'Category colour')
    .option('--is-transfer', 'Mark as transfer category')
    .option('--is-bill', 'Mark as bill category')
    .action(async (id: string, opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const body: Record<string, unknown> = {};
      if (opts.title) body.title = opts.title;
      if (opts.colour) body.colour = opts.colour;
      if (opts.isTransfer !== undefined) body.is_transfer = opts.isTransfer;
      if (opts.isBill !== undefined) body.is_bill = opts.isBill;

      const data = await api.put<Category>(`/categories/${id}`, body);
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
