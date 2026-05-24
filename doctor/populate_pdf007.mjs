import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const md003 = path.join(__dirname, '博士论文开题报告20260523-003.md');
const pdfSrc = path.join(__dirname, 'pdf');
const outDir = path.join(__dirname, 'PDF007');
const manifestPath = path.join(outDir, 'download_manifest.json');

const text = fs.readFileSync(md003, 'utf8');

// paper_NN_local.pdf paths and arxiv/doi links in order of appearance in section 7
const localRe = /\[PDF 原文 \(Local\)\]\(pdf\/(paper_\d+[^)]+\.pdf)\)/g;
const arxivRe = /https:\/\/arxiv\.org\/abs\/([\d.]+(?:v\d+)?)/g;

const locals = [...text.matchAll(localRe)].map((m) => m[1]);
const arxivIds = [...text.matchAll(arxivRe)].map((m) => m[1]);

// Build ordered list: walk lines in section 7, assign index per reference block
const sec7 = text.split('# **七、文献参考**')[1] ?? '';
const blocks = sec7.split(/\n(?=\d+\. )/);
const entries = [];
let arxivIdx = 0;
let localIdx = 0;

for (const block of blocks) {
  const num = block.match(/^(\d+)\./);
  if (!num) continue;
  const idx = parseInt(num[1], 10);
  const local = block.match(/pdf\/(paper_\d+[^)]+\.pdf)/);
  const arxiv = block.match(/arxiv\.org\/abs\/([\d.]+(?:v\d+)?)/);
  entries.push({
    index: idx,
    local: local?.[1] ?? null,
    arxiv: arxiv?.[1] ?? null,
  });
}

fs.mkdirSync(outDir, { recursive: true });

function destName(index, suffix = 'paper') {
  return `${String(index).padStart(2, '0')}_${suffix}.pdf`;
}

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

const results = [];

for (const e of entries) {
  const dest = path.join(outDir, destName(e.index, e.local?.replace('.pdf', '') || `ref_${e.index}`));
  const info = { index: e.index, ok: false, local: e.local, arxiv: e.arxiv };

  if (e.local) {
    const src = path.join(pdfSrc, e.local);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      info.ok = true;
      info.method = 'copy';
      info.file = path.basename(dest);
      info.bytes = fs.statSync(dest).size;
      console.log(`[${e.index}] COPY ${e.local}`);
      results.push(info);
      continue;
    }
    info.note = 'local missing';
  }

  if (e.arxiv) {
    const url = `https://arxiv.org/pdf/${e.arxiv}.pdf`;
    try {
      const resp = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(120000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = Buffer.from(await resp.arrayBuffer());
      if (buf[0] !== 0x25) throw new Error('not PDF');
      fs.writeFileSync(dest, buf);
      info.ok = true;
      info.method = 'arxiv';
      info.file = path.basename(dest);
      info.bytes = buf.length;
      info.from = url;
      console.log(`[${e.index}] DL arxiv:${e.arxiv} (${buf.length} bytes)`);
      results.push(info);
      continue;
    } catch (err) {
      info.error = err.message;
      console.log(`[${e.index}] FAIL arxiv:${e.arxiv} - ${err.message}`);
    }
  } else {
    info.error = info.error || 'no arxiv, no local';
    console.log(`[${e.index}] SKIP (doi only, no local pdf)`);
  }
  results.push(info);
  await new Promise((r) => setTimeout(r, 300));
}

const ok = results.filter((r) => r.ok).length;
const summary = {
  source: '博士论文开题报告20260523-003.md (real URLs; 007 placeholders unusable)',
  note: '007 report links are illustrative placeholders (404/403). Populated PDF007 from v003 bibliography.',
  total: entries.length,
  success: ok,
  failed: entries.length - ok,
  items: results,
};
fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2), 'utf8');
console.log(`\nDone: ${ok}/${entries.length} in ${outDir}`);
