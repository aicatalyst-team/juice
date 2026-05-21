#!/usr/bin/env node
import { runHttp, runStdio } from './mcp.js';
const mode = process.argv[2] ?? process.env.JUICE_MODE ?? 'stdio';
if (mode === 'http') await runHttp();
else if (mode === 'stdio') await runStdio();
else {
  console.error('Usage: juice [stdio|http]');
  process.exit(1);
}
