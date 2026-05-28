#!/usr/bin/env node
/** Convenience wrapper — see .agents/skills/thesis-reference-pdf-downloader/ */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillScript = path.resolve(
  __dirname,
  '../.agents/skills/thesis-reference-pdf-downloader/scripts/download_refs.mjs'
);

const child = spawn(
  process.execPath,
  [
    skillScript,
    '--md',
    path.join(__dirname, '博士论文开题报告20260524-008.md'),
    '--out',
    path.join(__dirname, 'pdf008'),
  ],
  { stdio: 'inherit', cwd: __dirname }
);

child.on('exit', (code) => process.exit(code ?? 1));
