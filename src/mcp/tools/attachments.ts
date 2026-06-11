import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listAttachments, getAttachment } from '../../operations/attachments.js';
import { toolHandler } from '../result.js';

const listAttachmentsInput = z.object({
  transaction_id: z
    .number()
    .int()
    .optional()
    .describe('Limit to attachments on a single transaction'),
});

const getAttachmentInput = z.object({
  id: z.number().int().describe('Attachment ID'),
});

export function registerAttachmentsTools(server: McpServer) {
  server.registerTool(
    'list_attachments',
    {
      title: 'List Attachments',
      description:
        'List attachments for the authenticated user, or for a single transaction.',
      inputSchema: listAttachmentsInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof listAttachmentsInput>) =>
      listAttachments({ transactionId: args.transaction_id }),
    ),
  );

  server.registerTool(
    'get_attachment',
    {
      title: 'Get Attachment',
      description:
        'Get details for a single attachment by ID, including its download URL.',
      inputSchema: getAttachmentInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof getAttachmentInput>) =>
      getAttachment(args.id),
    ),
  );
}
