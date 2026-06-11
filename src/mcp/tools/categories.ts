import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
} from '../../operations/categories.js';
import { toolHandler } from '../result.js';

const getCategoryInput = z.object({
  id: z.number().int().describe('Category ID'),
});

const createCategoryInput = z.object({
  title: z.string().describe('Category title'),
  parent_id: z.number().int().optional().describe('Parent category ID'),
  is_transfer: z.boolean().optional().describe('Mark as a transfer category'),
  is_bill: z.boolean().optional().describe('Mark as a bill category'),
});

const updateCategoryInput = z.object({
  id: z.number().int().describe('Category ID'),
  title: z.string().optional().describe('Category title'),
  colour: z.string().optional().describe('Category colour'),
  is_transfer: z.boolean().optional().describe('Mark/unmark as a transfer category'),
  is_bill: z.boolean().optional().describe('Mark/unmark as a bill category'),
});

export function registerCategoriesTools(server: McpServer) {
  server.registerTool(
    'list_categories',
    {
      title: 'List Categories',
      description:
        'List all categories for the authenticated user, including parent/child structure and transfer/bill flags.',
      annotations: { readOnlyHint: true },
    },
    toolHandler(() => listCategories()),
  );

  server.registerTool(
    'get_category',
    {
      title: 'Get Category',
      description: 'Get full details for a single category by ID.',
      inputSchema: getCategoryInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof getCategoryInput>) => getCategory(args.id)),
  );

  server.registerTool(
    'create_category',
    {
      title: 'Create Category',
      description: 'Create a new category for the authenticated user.',
      inputSchema: createCategoryInput.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    toolHandler(async (args: z.infer<typeof createCategoryInput>) =>
      createCategory({
        title: args.title,
        parentId: args.parent_id,
        isTransfer: args.is_transfer,
        isBill: args.is_bill,
      }),
    ),
  );

  server.registerTool(
    'update_category',
    {
      title: 'Update Category',
      description:
        'Update fields on an existing category (title, colour, transfer flag, bill flag). Only provided fields are changed.',
      inputSchema: updateCategoryInput.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    toolHandler(async (args: z.infer<typeof updateCategoryInput>) =>
      updateCategory(args.id, {
        title: args.title,
        colour: args.colour,
        isTransfer: args.is_transfer,
        isBill: args.is_bill,
      }),
    ),
  );
}
