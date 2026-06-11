import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getUser } from '../../operations/me.js';
import { toolHandler } from '../result.js';

export function registerMeTools(server: McpServer) {
  server.registerTool(
    'get_user',
    {
      title: 'Get User',
      description:
        'Get the authenticated PocketSmith user, including id, login, name, email, and base currency.',
      annotations: { readOnlyHint: true },
    },
    toolHandler(() => getUser()),
  );
}
