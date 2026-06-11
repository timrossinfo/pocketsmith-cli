import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listEvents, getEvent, updateEvent } from '../../operations/events.js';
import { toolHandler } from '../result.js';

const listEventsInput = z.object({
  start_date: z.string().describe('Start date (YYYY-MM-DD)'),
  end_date: z.string().describe('End date (YYYY-MM-DD)'),
  scenario_id: z.number().int().optional().describe('Limit to a single scenario'),
});

const getEventInput = z.object({
  id: z.number().int().describe('Event ID'),
});

const updateEventInput = z.object({
  id: z.number().int().describe('Event ID'),
  amount: z.number().optional().describe('Event amount'),
  date: z.string().optional().describe('Event date (YYYY-MM-DD)'),
  repeat_type: z
    .string()
    .optional()
    .describe('once, weekly, fortnightly, monthly, or yearly'),
  repeat_interval: z.number().int().optional().describe('Repeat interval'),
  note: z.string().optional().describe('Event note'),
});

export function registerEventsTools(server: McpServer) {
  server.registerTool(
    'list_events',
    {
      title: 'List Events',
      description:
        'List budget calendar events in a date range, optionally scoped to a scenario.',
      inputSchema: listEventsInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof listEventsInput>) =>
      listEvents({
        startDate: args.start_date,
        endDate: args.end_date,
        scenarioId: args.scenario_id,
      }),
    ),
  );

  server.registerTool(
    'get_event',
    {
      title: 'Get Event',
      description: 'Get full details for a single budget calendar event by ID.',
      inputSchema: getEventInput.shape,
      annotations: { readOnlyHint: true },
    },
    toolHandler(async (args: z.infer<typeof getEventInput>) => getEvent(args.id)),
  );

  server.registerTool(
    'update_event',
    {
      title: 'Update Event',
      description:
        'Update fields on a budget calendar event (amount, date, repeat type, repeat interval, note). Only provided fields are changed.',
      inputSchema: updateEventInput.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    toolHandler(async (args: z.infer<typeof updateEventInput>) =>
      updateEvent(args.id, {
        amount: args.amount,
        date: args.date,
        repeatType: args.repeat_type,
        repeatInterval: args.repeat_interval,
        note: args.note,
      }),
    ),
  );
}
