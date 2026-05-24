import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdFile = path.join(__dirname, '博士论文开题报告20260524-007.md');
const outDir = path.join(__dirname, 'PDF007');
const manifestPath = path.join(outDir, 'download_manifest.json');

const text = fs.readFileSync(mdFile, 'utf8');
const sec7 = text.split('# **七、文献参考**')[1] ?? text;
const urlRe = /\[(https?:\/\/[^\]]+)\]\(https?:\/\/www\.google\.com\/search/g;
const urls = [...sec7.matchAll(urlRe)].map((m) => m[1].replace(/\\#/g, '#'));

fs.mkdirSync(outDir, { recursive: true });

function slugFromUrl(url, index) {
  const u = new URL(url);
  let name = u.pathname.endsWith('.pdf')
    ? u.pathname.slice(1)
    : `${u.hostname.split('.')[0]}_${u.pathname.replace(/^\//, '').replace(/\//g, '_')}`;
  name = name.replace(/[^\w.\-]+/g, '_').slice(0, 80);
  return `${String(index).padStart(2, '0')}_${name}.pdf`;
}

function candidateUrls(url) {
  const list = [url];
  const m = url.match(/arxiv\.org\/abs\/([\d.]+(?:v\d+)?)/);
  if (m) list.unshift(`https://arxiv.org/pdf/${m[1]}.pdf`);
  else if (url.includes('arxiv.org/abs/')) {
    const id = url.split('/').pop();
    list.unshift(`https://arxiv.org/pdf/${id}.pdf`);
  }
  return list;
}

function isPdf(buf) {
  return buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
}

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/pdf,*/*',
};

const results = [];
for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const dest = path.join(outDir, slugFromUrl(url, i + 1));
  console.log(`[${i + 1}/${urls.length}] ${url}`);
  const info = { index: i + 1, url, ok: false };

  for (const tryUrl of candidateUrls(url)) {
    try {
      const resp = await fetch(tryUrl, { headers, redirect: 'follow', signal: AbortSignal.timeout(60000) });
      if (!resp.ok) {
        info.error = `HTTP ${resp.status}`;
        continue;
      }
      const buf = Buffer.from(await resp.arrayBuffer());
      const ct = (resp.headers.get('content-type') || '').toLowerCase();
      if (!isPdf(buf) && !ct.includes('pdf')) {
        info.error = `not PDF (${ct || buf.length + ' bytes'})`;
        continue;
      }
      fs.writeFileSync(dest, buf);
      info.ok = true;
      info.file = path.basename(dest);
      info.bytes = buf.length;
      info.from = tryUrl;
      console.log(`  -> OK (${buf.length} bytes)`);
      break;
    } catch (e) {
      info.error = e.message;
    }
  }
  if (!info.ok) console.log(`  -> FAIL: ${info.error}`);
  results.push(info);
  await new Promise((r) => setTimeout(r, 500));
}

const ok = results.filter((r) => r.ok).length;
const summary = { total: urls.length, success: ok, failed: urls.length - ok, items: results };
fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2), 'utf8');
console.log(`\nDone: ${ok}/${urls.length} -> ${outDir}`);
console.log(`Manifest: ${manifestPath}`);
