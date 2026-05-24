import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'PDF007');

const missing = [
  { index: 2, doi: '10.1016/j.cirp.2024.04.003' },
  { index: 4, doi: '10.3390/s24082585', url: 'https://www.mdpi.com/1424-8220/24/8/2585/pdf' },
  { index: 8, doi: '10.1109/TIE.2023.3289012' },
  { index: 9, doi: '10.1109/LRA.2024.3349102' },
  { index: 30, doi: '10.1109/TMRB.2024.3359124' },
  { index: 31, doi: '10.1109/TMI.2023.3298102' },
  { index: 43, doi: '10.1145/2968478.2968502' },
  { index: 44, doi: '10.1109/LRA.2023.3249102' },
  { index: 45, doi: '10.1109/MRA.2023.3341202' },
  { index: 47, doi: '10.1109/TASE.2023.3279102' },
  { index: 49, doi: '10.1109/TIFS.2024.3359102' },
  { index: 50, doi: '10.1007/s11548-024-03112-2' },
];

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/pdf,*/*',
};

function isPdf(buf) {
  return buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50;
}

async function tryDownload(url) {
  const resp = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(90000) });
  if (!resp.ok) return null;
  const buf = Buffer.from(await resp.arrayBuffer());
  return isPdf(buf) ? buf : null;
}

for (const m of missing) {
  const dest = path.join(outDir, `${String(m.index).padStart(2, '0')}_doi_${m.doi.replace(/[^\d]/g, '_')}.pdf`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`[${m.index}] exists`);
    continue;
  }
  const urls = [m.url].filter(Boolean);
  try {
    const oa = await fetch(`https://api.unpaywall.org/v2/${m.doi}?email=research@example.com`);
    if (oa.ok) {
      const j = await oa.json();
      if (j.best_oa_location?.url_for_pdf) urls.unshift(j.best_oa_location.url_for_pdf);
      else if (j.best_oa_location?.url) urls.unshift(j.best_oa_location.url);
    }
  } catch {}
  urls.push(`https://doi.org/${m.doi}`);

  let ok = false;
  for (const url of urls) {
    try {
      console.log(`[${m.index}] try ${url}`);
      const buf = await tryDownload(url);
      if (buf) {
        fs.writeFileSync(dest, buf);
        console.log(`  -> OK ${buf.length} bytes`);
        ok = true;
        break;
      }
    } catch (e) {
      console.log(`  -> ${e.message}`);
    }
  }
  if (!ok) console.log(`[${m.index}] FAILED`);
  await new Promise((r) => setTimeout(r, 500));
}
