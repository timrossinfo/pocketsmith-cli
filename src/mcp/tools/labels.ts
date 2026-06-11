import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listLabels } from '../../operations/labels.js';
import { toolHandler } from '../result.js';

export function registerLabelsTools(server: McpServer) {
  server.registerTool(
    'list_labels',
    {
      title: 'List Labels',
      description: 'List all transaction labels for the authenticated user.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    toolHandler(async () => listLabels()),
  );
}
