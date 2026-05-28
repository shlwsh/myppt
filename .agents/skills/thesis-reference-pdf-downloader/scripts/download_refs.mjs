#!/usr/bin/env node
/**
 * Batch-download PDFs from thesis proposal "文献参考" section.
 *
 * Usage:
 *   node download_refs.mjs --md <report.md> --out <outputDir> [--section <heading>]
 *
 * Example:
 *   node download_refs.mjs --md doctor/博士论文开题报告20260524-008.md --out doctor/pdf008
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { section: '七、文献参考' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--md' && argv[i + 1]) args.md = argv[++i];
    else if (argv[i] === '--out' && argv[i + 1]) args.out = argv[++i];
    else if (argv[i] === '--section' && argv[i + 1]) args.section = argv[++i];
    else if (argv[i] === '--help' || argv[i] === '-h') args.help = true;
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node download_refs.mjs --md <report.md> --out <dir> [--section "七、文献参考"]

Options:
  --md       Path to thesis proposal Markdown (required)
  --out      Output directory for PDFs (required)
  --section  Section heading marker before references (default: 七、文献参考)
`);
}

function isPdf(buf) {
  return buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
}

function slugFromUrl(url, index) {
  const u = new URL(url);
  let name = u.pathname.replace(/^\//, '').replace(/\//g, '_');
  if (!name || name === '_') name = u.hostname;
  name = name.replace(/[^\w.\-]+/g, '_').slice(0, 70);
  return `${String(index).padStart(2, '0')}_${name}.pdf`;
}

function candidateUrls(url) {
  const list = [];
  const u = new URL(url);

  const arxiv = url.match(/arxiv\.org\/abs\/([\d.]+(?:v\d+)?)/);
  if (arxiv) list.push(`https://arxiv.org/pdf/${arxiv[1]}.pdf`);

  if (u.hostname.includes('pmc.ncbi.nlm.nih.gov') && url.includes('/articles/PMC')) {
    const pmc = url.match(/PMC\d+/i)?.[0];
    if (pmc) list.push(`https://pmc.ncbi.nlm.nih.gov/articles/${pmc}/pdf/`);
  }

  if (u.hostname.includes('frontiersin.org') && url.includes('/articles/')) {
    list.push(url.replace(/\/full\/?$/, '/pdf').replace(/\/$/, '') + '/pdf');
    const doi = url.match(/10\.\d+\/[^\s/]+/)?.[0];
    if (doi) list.push(`https://www.frontiersin.org/articles/${doi}/pdf`);
  }

  if (u.hostname.includes('preprints.org') && url.includes('/manuscript/')) {
    list.push(url.replace(/\/?$/, '/download'));
    if (!url.includes('/v2')) list.push(url.replace(/\/?$/, '/v2/download'));
  }

  if (u.hostname.includes('link.springer.com') && url.includes('/article/10.')) {
    const doi = url.match(/10\.\d+\/[^\s/?#]+/)?.[0];
    if (doi) {
      list.push(`https://link.springer.com/content/pdf/${doi}.pdf`);
      list.push(`https://link.springer.com/article/${doi}.pdf`);
    }
  }

  if (u.hostname.includes('ieeexplore.ieee.org') && /document\/\d+/.test(url)) {
    const doc = url.match(/document\/(\d+)/)?.[1];
    if (doc) list.push(`https://ieeexplore.ieee.org/stampPDF/getPDF.jsp?arnumber=${doc}`);
  }

  if (url.endsWith('.pdf')) list.unshift(url);
  list.push(url);
  return [...new Set(list)];
}

function extractUrls(secText) {
  const urlSet = new Set();
  for (const m of secText.matchAll(/^\s*(https?:\/\/\S+)/gm)) {
    let u = m[1].replace(/\s*\(updated\)\s*$/i, '').replace(/[)\],.;]+$/, '');
    if (!u.includes('google.com/search')) urlSet.add(u);
  }
  for (const m of secText.matchAll(/\[(https?:\/\/[^\]]+)\]\(/g)) {
    let u = m[1].replace(/\\#/g, '#');
    if (!u.includes('google.com/search')) urlSet.add(u);
  }
  for (const m of secText.matchAll(/\[在线资源链接\]\((https?:\/\/[^)]+)\)/g)) {
    urlSet.add(m[1]);
  }
  return [...urlSet];
}

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/pdf,*/*',
};

const args = parseArgs(process.argv);
if (args.help || !args.md || !args.out) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const mdFile = path.resolve(args.md);
const outDir = path.resolve(args.out);
const manifestPath = path.join(outDir, 'download_manifest.json');

if (!fs.existsSync(mdFile)) {
  console.error(`Error: markdown not found: ${mdFile}`);
  process.exit(1);
}

const text = fs.readFileSync(mdFile, 'utf8');
const marker = `# **${args.section}**`;
const sec7 = text.split(marker)[1] ?? text.split(args.section)[1] ?? text;
const urls = extractUrls(sec7);

fs.mkdirSync(outDir, { recursive: true });

const results = [];
for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const dest = path.join(outDir, slugFromUrl(url, i + 1));
  console.log(`[${i + 1}/${urls.length}] ${url}`);
  const info = { index: i + 1, url, ok: false };

  for (const tryUrl of candidateUrls(url)) {
    try {
      const resp = await fetch(tryUrl, { headers, redirect: 'follow', signal: AbortSignal.timeout(90000) });
      if (!resp.ok) {
        info.error = `HTTP ${resp.status}`;
        continue;
      }
      const buf = Buffer.from(await resp.arrayBuffer());
      const ct = (resp.headers.get('content-type') || '').toLowerCase();
      if (!isPdf(buf) && !ct.includes('pdf')) {
        info.error = `not PDF (${ct || `${buf.length}b`})`;
        continue;
      }
      fs.writeFileSync(dest, buf);
      info.ok = true;
      info.file = path.basename(dest);
      info.bytes = buf.length;
      info.from = tryUrl;
      console.log(`  -> OK ${buf.length} bytes`);
      break;
    } catch (e) {
      info.error = e.message;
    }
  }
  if (!info.ok) console.log(`  -> FAIL: ${info.error}`);
  results.push(info);
  await new Promise((r) => setTimeout(r, 400));
}

const ok = results.filter((r) => r.ok).length;
const summary = {
  source: mdFile,
  output: outDir,
  total: urls.length,
  success: ok,
  failed: urls.length - ok,
  items: results,
};
fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2), 'utf8');
console.log(`\nDone: ${ok}/${urls.length} -> ${outDir}`);
console.log(`Manifest: ${manifestPath}`);
