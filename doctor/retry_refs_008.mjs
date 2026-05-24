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
    urls: [
      'https://www.mdpi.com/2504-4467/25/16/5067/pdf',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC12390455/pdf/',
    ],
  },
  {
    file: '04_www.preprints.org_manuscript_202410.1204.pdf',
    urls: [
      'https://www.preprints.org/manuscript/202410.1204/v2/download',
      'https://www.preprints.org/manuscript/202410.1204/v2',
    ],
  },
  {
    file: '09_pmc.ncbi.nlm.nih.gov_articles_PMC12748213.pdf',
    urls: [
      'https://www.frontiersin.org/articles/10.3389/fmed.2025.1716327/pdf',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC12748213/pdf/',
    ],
  },
  {
    file: '17_pmc.ncbi.nlm.nih.gov_articles_PMC12827268.pdf',
    urls: [
      'https://www.nature.com/articles/s41746-025-02145-2.pdf',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC12827268/pdf/',
    ],
  },
];

function isPdf(buf) {
  return buf.length >= 4 && buf[0] === 0x25;
}

for (const r of retries) {
  const dest = path.join(outDir, r.file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 50000 && isPdf(fs.readFileSync(dest).subarray(0, 4))) {
    console.log(`SKIP ${r.file} (already valid)`);
    continue;
  }
  let ok = false;
  for (const url of r.urls) {
    try {
      console.log(`TRY ${r.file} <- ${url}`);
      const resp = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(90000) });
      const buf = Buffer.from(await resp.arrayBuffer());
      if (resp.ok && isPdf(buf)) {
        fs.writeFileSync(dest, buf);
        console.log(`  OK ${buf.length}`);
        ok = true;
        break;
      }
      console.log(`  ${resp.status} ${resp.headers.get('content-type')} ${buf.length}b`);
    } catch (e) {
      console.log(`  ERR ${e.message}`);
    }
  }
  if (!ok) console.log(`FAIL ${r.file}`);
}
