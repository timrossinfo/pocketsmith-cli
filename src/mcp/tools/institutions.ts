import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listInstitutions, getInstitution } from '../../operations/institutions.js';
import { toolHandler } from '../result.js';

const getInstitutionInput = z.object({
  id: z.number().int().describe('Institution ID'),
});

export function registerInstitutionsTools(server: McpServer) {
  server.registerTool(
    'list_institutions',
    {
      title: 'List Institutions',
      description: 'List all financial institutions for the authenticated user.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    toolHandler(async () => listInstitutions()),
  );

  server.registerTool(
    'get_institution',
    {
      title: 'Get Institution',
      description: 'Get full details for a single financial institution by ID.',
      inputSchema: getInstitutionInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof getInstitutionInput>) =>
      getInstitution(args.id),
    ),
  );
}
