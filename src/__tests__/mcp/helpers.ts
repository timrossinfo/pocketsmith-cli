import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../mcp/server.js';

export async function createClient(): Promise<Client> {
  const server = createServer();
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

export function textPayload(result: { [key: string]: unknown }): unknown {
  const content = result['content'] as { type: string; text: string }[];
  return JSON.parse(content[0].text);
}

export function errorText(result: { [key: string]: unknown }): string {
  const content = result['content'] as { type: string; text: string }[];
  return content[0].text;
}
