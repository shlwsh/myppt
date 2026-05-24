# Download PDFs from literature URLs in 博士论文开题报告20260524-007.md
$ErrorActionPreference = "Continue"
$baseDir = "d:\work\myppt\doctor"
$mdFile = Join-Path $baseDir "博士论文开题报告20260524-007.md"
$outDir = Join-Path $baseDir "PDF007"
$manifestPath = Join-Path $outDir "download_manifest.json"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$text = [IO.File]::ReadAllText($mdFile, [Text.Encoding]::UTF8)
$parts = $text -split '# \*\*七、文献参考\*\*', 2
$sec7 = if ($parts.Length -gt 1) { $parts[1] } else { $text }
$matches = [regex]::Matches($sec7, '\[(https?://[^\]]+)\]\(https?://www\.google\.com/search')

$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Accept"     = "application/pdf,*/*"
}

function Get-Slug($url, $index) {
    $uri = [Uri]$url
    $path = $uri.AbsolutePath.Trim('/').Replace('/', '_')
    if ($path -match '\.pdf$') { $name = $path }
    elseif ($path) { $name = ($uri.Host.Split('.')[0] + '_' + $path) }
    else { $name = $uri.Host }
    $name = ($name -replace '[^\w.\-]+', '_').Substring(0, [Math]::Min(80, ($name -replace '[^\w.\-]+', '_').Length))
    return ('{0:D2}_{1}.pdf' -f $index, $name)
}

function Get-CandidateUrls($url) {
    $list = @($url)
    if ($url -match 'arxiv\.org/abs/([\d.]+)') {
        $list = @("https://arxiv.org/pdf/$($Matches[1]).pdf") + $list
    }
    elseif ($url -match 'arxiv\.org/abs/(.+)$') {
        $id = $Matches[1]
        $list = @("https://arxiv.org/pdf/${id}.pdf") + $list
    }
    return $list
}

function Test-PdfBytes($bytes) {
    return ($bytes.Length -ge 4) -and ($bytes[0] -eq 0x25) -and ($bytes[1] -eq 0x50) -and ($bytes[2] -eq 0x44) -and ($bytes[3] -eq 0x46)
}

$results = @()
$i = 0
foreach ($m in $matches) {
    $i++
    $url = $m.Groups[1].Value -replace '\\#', '#'
    $dest = Join-Path $outDir (Get-Slug $url $i)
    Write-Host "[$i/$($matches.Count)] $url"

    $info = [ordered]@{ index = $i; url = $url; ok = $false }
    $wc = New-Object System.Net.WebClient
    foreach ($h in $headers.GetEnumerator()) { $wc.Headers[$h.Key] = $h.Value }
    foreach ($tryUrl in (Get-CandidateUrls $url)) {
        try {
            $bytes = $wc.DownloadData($tryUrl)
            if (Test-PdfBytes $bytes) {
                [IO.File]::WriteAllBytes($dest, $bytes)
                $info.ok = $true
                $info.file = Split-Path $dest -Leaf
                $info.bytes = $bytes.Length
                $info.from = $tryUrl
                Write-Host "  -> OK ($($bytes.Length) bytes)"
                break
            }
            $info.error = "not PDF ($($bytes.Length) bytes)"
        }
        catch {
            $info.error = $_.Exception.Message
        }
    }
    $wc.Dispose()
    if (-not $info.ok) { Write-Host "  -> FAIL: $($info.error)" }
    $results += [pscustomobject]$info
    Start-Sleep -Milliseconds 500
}

$ok = @($results | Where-Object { $_.ok }).Count
$summary = @{
    total   = $matches.Count
    success = $ok
    failed  = $matches.Count - $ok
    items   = $results
}
$summary | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "`nDone: $ok/$($matches.Count) -> $outDir"
Write-Host "Manifest: $manifestPath"
