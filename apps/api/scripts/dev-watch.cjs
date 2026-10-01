'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');

const apiRoot = path.join(__dirname, '..');
const args = [
  '--watch',
  '--watch-path',
  path.join(apiRoot, 'src'),
  '--watch-preserve-output',
  '-r',
  'ts-node/register',
  '-r',
  './src/register-prisma-ts.cjs',
  'src/main.ts',
];

const child = spawn(process.execPath, args, {
  cwd: apiRoot,
  env: {
    ...process.env,
    FORCE_COLOR: process.env.FORCE_COLOR ?? '1',
  },
  stdio: ['inherit', 'pipe', 'pipe'],
});

const RESTARTING = /Restarting ['"]/;

/**
 * @param {import('node:stream').Readable | null} src
 * @param {NodeJS.WriteStream} dest
 */
function pipeFiltered(src, dest) {
  if (!src) return;

  let pending = '';
  src.on('data', (chunk) => {
    pending += chunk.toString();
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? '';
    for (const line of lines) {
      if (RESTARTING.test(line)) continue;
      dest.write(`${line}\n`);
    }
  });
  src.on('end', () => {
    if (pending.length > 0 && !RESTARTING.test(pending)) {
      dest.write(pending);
    }
  });
}

pipeFiltered(child.stdout, process.stdout);
pipeFiltered(child.stderr, process.stderr);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}
