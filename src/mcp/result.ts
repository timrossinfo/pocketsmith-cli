import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export function jsonResult(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

export function errorResult(err: unknown): CallToolResult {
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: 'text', text: message }], isError: true };
}

export function toolHandler<Args>(fn: (args: Args) => Promise<unknown>) {
  return async (args: Args): Promise<CallToolResult> => {
    try {
      return jsonResult(await fn(args));
    } catch (err) {
      return errorResult(err);
    }
  };
}
