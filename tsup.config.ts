import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', 'mcp-server': 'src/mcp/index.ts' },
  format: ['esm'],
  target: 'node22',
  clean: true,
  splitting: false,
  noExternal: ['@modelcontextprotocol/sdk', 'zod'],
  banner: { js: '#!/usr/bin/env node' },
});
