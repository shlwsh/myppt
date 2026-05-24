import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'pdf008');
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/pdf,*/*',
};

const retries = [
  {
    file: '01_pmc.ncbi.nlm.nih.gov_articles_PMC12390455.pdf',
    urls: ['https://doi.org/10.3390/s25165067'],
  },
  {
    file: '04_www.preprints.org_manuscript_202410.1204.pdf',
    doi: '10.1145/3815113',
  },
  {
    file: '17_pmc.ncbi.nlm.nih.gov_articles_PMC12827268.pdf',
    doi: '10.1038/s41746-025-02145-2',
  },
];

function isPdf(buf) {
  return buf.length >= 4 && buf[0] === 0x25;
}

async function unpaywallPdf(doi) {
  const r = await fetch(`https://api.unpaywall.org/v2/${doi}?email=research@example.com`);
  if (!r.ok) return null;
  const j = await r.json();
  return j.best_oa_location?.url_for_pdf || j.best_oa_location?.url || null;
}

async function downloadUrl(url) {
  const resp = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(90000) });
  const buf = Buffer.from(await resp.arrayBuffer());
  if (!resp.ok || !isPdf(buf)) return null;
  return buf;
}

for (const r of retries) {
  const dest = path.join(outDir, r.file);
  const urls = [...(r.urls || [])];
  if (r.doi) {
    try {
      const oa = await unpaywallPdf(r.doi);
      if (oa) urls.unshift(oa);
      urls.push(`https://doi.org/${r.doi}`);
    } catch {}
  }
  console.log(`\n${r.file}`);
  let ok = false;
  for (const url of urls) {
    try {
      console.log(`  try ${url}`);
      const buf = await downloadUrl(url);
      if (buf) {
        fs.writeFileSync(dest, buf);
        console.log(`  OK ${buf.length}`);
        ok = true;
        break;
      }
      console.log('  not pdf');
    } catch (e) {
      console.log(`  ${e.message}`);
    }
  }
  if (!ok) console.log('  FAIL');
}
