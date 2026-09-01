import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listCategoryRules, createCategoryRule } from '../../operations/category-rules.js';
import { toolHandler } from '../result.js';

const createCategoryRuleInput = z.object({
  category_id: z.number().int().describe('Category ID the rule assigns transactions to'),
  payee_matches: z.string().describe('Keyword(s) to match transaction payees'),
  apply_to_uncategorised: z
    .boolean()
    .optional()
    .describe('Apply the rule to all uncategorised transactions'),
  apply_to_all: z.boolean().optional().describe('Apply the rule to all transactions'),
});

export function registerCategoryRulesTools(server: McpServer) {
  server.registerTool(
    'list_category_rules',
    {
      title: 'List Category Rules',
      description:
        'List all category rules for the authenticated user. Each rule maps a payee keyword to a category.',
      annotations: { readOnlyHint: true },
    },
    toolHandler(() => listCategoryRules()),
  );

  server.registerTool(
    'create_category_rule',
    {
      title: 'Create Category Rule',
      description:
        'Create a rule that assigns a category to transactions whose payee contains the given keyword(s). The API only supports listing and creating rules; editing or deleting rules must be done in the PocketSmith web app.',
      inputSchema: createCategoryRuleInput.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    toolHandler(async (args: z.infer<typeof createCategoryRuleInput>) =>
      createCategoryRule({
        categoryId: args.category_id,
        payeeMatches: args.payee_matches,
        applyToUncategorised: args.apply_to_uncategorised,
        applyToAll: args.apply_to_all,
      }),
    ),
  );
}
