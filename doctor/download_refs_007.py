#!/usr/bin/env python3
"""Download PDFs from literature URLs in 博士论文开题报告20260524-007.md"""

import json
import re
import time
from pathlib import Path
from urllib.parse import urlparse

import requests

MD_FILE = Path(__file__).parent / "博士论文开题报告20260524-007.md"
OUT_DIR = Path(__file__).parent / "PDF007"
MANIFEST = OUT_DIR / "download_manifest.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/pdf,*/*",
}

# Match markdown link text that is a direct URL (not google search)
URL_PATTERN = re.compile(r"\[(https?://[^\]]+)\]\(https?://www\.google\.com/search")


def slug_from_url(url: str, index: int) -> str:
    parsed = urlparse(url)
    path = parsed.path.strip("/").replace("/", "_")
    if path.endswith(".pdf"):
        name = path
    else:
        name = f"{parsed.netloc.split('.')[0]}_{path}" if path else parsed.netloc
    name = re.sub(r"[^\w.\-]+", "_", name)[:80]
    return f"{index:02d}_{name}.pdf"


def arxiv_pdf_url(url: str) -> str | None:
    m = re.match(r"https?://arxiv\.org/abs/([\d.]+(?:v\d+)?)", url)
    if m:
        return f"https://arxiv.org/pdf/{m.group(1)}.pdf"
    return None


def candidate_urls(url: str) -> list[str]:
    urls = [url]
    if url.endswith(".pdf"):
        return urls
    apdf = arxiv_pdf_url(url)
    if apdf:
        urls.insert(0, apdf)
    if "arxiv.org/abs/" in url:
        aid = url.rsplit("/", 1)[-1]
        urls.insert(0, f"https://arxiv.org/pdf/{aid}.pdf")
    return urls


def is_pdf_content(resp: requests.Response) -> bool:
    ct = (resp.headers.get("Content-Type") or "").lower()
    if "pdf" in ct:
        return True
    return resp.content[:4] == b"%PDF"


def download_one(session: requests.Session, url: str, dest: Path) -> dict:
    last_err = None
    for try_url in candidate_urls(url):
        try:
            resp = session.get(try_url, headers=HEADERS, timeout=60, allow_redirects=True)
            if resp.status_code != 200:
                last_err = f"HTTP {resp.status_code}"
                continue
            if not is_pdf_content(resp):
                last_err = f"not PDF (content-type: {resp.headers.get('Content-Type')})"
                continue
            dest.write_bytes(resp.content)
            return {"ok": True, "file": str(dest.name), "bytes": len(resp.content), "from": try_url}
        except Exception as e:
            last_err = str(e)
    return {"ok": False, "error": last_err or "unknown"}


def main():
    text = MD_FILE.read_text(encoding="utf-8")
    # Only section 7 URLs
    sec7 = text.split("# **七、文献参考**", 1)[-1]
    urls = URL_PATTERN.findall(sec7)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    results = []

    for i, url in enumerate(urls, 1):
        url = url.replace("\\#", "#")
        dest = OUT_DIR / slug_from_url(url, i)
        print(f"[{i}/{len(urls)}] {url}")
        info = download_one(session, url, dest)
        info["index"] = i
        info["url"] = url
        results.append(info)
        status = "OK" if info["ok"] else f"FAIL: {info.get('error')}"
        print(f"  -> {status}")
        time.sleep(0.5)

    ok = sum(1 for r in results if r["ok"])
    summary = {"total": len(urls), "success": ok, "failed": len(urls) - ok, "items": results}
    MANIFEST.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDone: {ok}/{len(urls)} saved to {OUT_DIR}")
    print(f"Manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
