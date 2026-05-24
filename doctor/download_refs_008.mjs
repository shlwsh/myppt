import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdFile = path.join(__dirname, '博士论文开题报告20260524-008.md');
const outDir = path.join(__dirname, 'pdf008');
const manifestPath = path.join(outDir, 'download_manifest.json');

const text = fs.readFileSync(mdFile, 'utf8');
const sec7 = text.split('# **七、文献参考**')[1] ?? text;

const urlSet = new Set();
// Plain URLs on their own line
for (const m of sec7.matchAll(/^\s*(https?:\/\/\S+)/gm)) {
  let u = m[1].replace(/\s*\(updated\)\s*$/i, '').replace(/[)\],.;]+$/, '');
  urlSet.add(u);
}
// Markdown link targets (exclude google search hrefs)
for (const m of sec7.matchAll(/\[(https?:\/\/[^\]]+)\]\(/g)) {
  let u = m[1].replace(/\\#/g, '#');
  if (!u.includes('google.com/search')) urlSet.add(u);
}

const urls = [...urlSet];
fs.mkdirSync(outDir, { recursive: true });

function slugFromUrl(url, index) {
  const u = new URL(url);
  let name = u.pathname.replace(/^\//, '').replace(/\//g, '_');
  if (!name || name === '_') name = u.hostname;
  name = name.replace(/[^\w.\-]+/g, '_').slice(0, 70);
  return `${String(index).padStart(2, '0')}_${name}.pdf`;
}

function isPdf(buf) {
  return buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
}

function candidateUrls(url) {
  const list = [];
  const u = new URL(url);

  if (url.match(/arxiv\.org\/abs\/([\d.]+(?:v\d+)?)/)) {
    const id = url.match(/arxiv\.org\/abs\/([\d.]+(?:v\d+)?)/)[1];
    list.push(`https://arxiv.org/pdf/${id}.pdf`);
  }

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
      const resp = await fetch(tryUrl, { headers, redirect: 'follow', signal: AbortSignal.timeout(90000) });
      if (!resp.ok) {
        info.error = `HTTP ${resp.status}`;
        continue;
      }
      const buf = Buffer.from(await resp.arrayBuffer());
      const ct = (resp.headers.get('content-type') || '').toLowerCase();
      if (!isPdf(buf) && !ct.includes('pdf')) {
        info.error = `not PDF (${ct || buf.length + 'b'})`;
        continue;
      }
      fs.writeFileSync(dest, buf);
      info.ok = true;
      info.file = path.basename(dest);
      info.bytes = buf.length;
      info.from = tryUrl;
      console.log(`  -> OK ${buf.length} bytes (${tryUrl})`);
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
const summary = { total: urls.length, success: ok, failed: urls.length - ok, items: results };
fs.writeFileSync(manifestPath, JSON.stringify(summary, null, 2), 'utf8');
console.log(`\nDone: ${ok}/${urls.length} -> ${outDir}`);
console.log(`Manifest: ${manifestPath}`);
