# 文献下载技能 — 详细参考

## URL 有效性速查

### 无效（需替换）

| 模式 | 示例 | 说明 |
|------|------|------|
| Google 包装 | `google.com/search?q=https://...` | 占位 |
| arXiv 描述 slug | `arxiv.org/abs/med-dialogue-2025` | 非真实编号 |
| IEEE 描述 slug | `document/ros2-jazzy-perf-2024` | 应为纯数字 |
| 厂商假路径 | `docker.com/res/robotic-microservices-2024.pdf` | 常 404 |
| 博客/教程 | `medium.com`, `towardsai.net`, `emergentmind.com` | 无学术论文 PDF |

### 有效

| 类型 | 正则/特征 |
|------|-----------|
| arXiv | `arxiv.org/abs/\d{4}\.\d{4,5}` |
| IEEE | `document/\d{6,}` |
| DOI | `doi.org/10.` 或 `link.springer.com/article/10.` |
| PMC | `PMC\d+` |
| Frontiers | `10.3389/` |

## candidateUrls 扩展

在 `scripts/download_refs.mjs` 的 `candidateUrls()` 中按域名追加。新增出版商时：

1. 用浏览器/DevTools 找到 PDF 直链模式
2. 在函数开头 `list.push(直链)`（优先级高的放前面）
3. 保留 `list.push(url)` 作为兜底
4. 始终用 `isPdf()` 校验 magic bytes `%PDF`

## Unpaywall（仅合法 OA）

```http
GET https://api.unpaywall.org/v2/{doi}?email=your@email.com
```

使用返回的 `best_oa_location.url_for_pdf`。勿用于 Sci-Hub。

## manifest.json 字段

```json
{
  "source": "绝对路径/report.md",
  "output": "绝对路径/pdf008",
  "total": 46,
  "success": 12,
  "failed": 34,
  "items": [
    {
      "index": 1,
      "url": "原始链接",
      "ok": true,
      "file": "01_xxx.pdf",
      "bytes": 1153898,
      "from": "实际下载 URL"
    }
  ]
}
```

## 从 pdf/ 复制已有文件

当下载失败但 `doctor/pdf/paper_xx_*.pdf` 已存在时：

1. 在报告中写 `[PDF 原文 (Local)](pdf/paper_xx....pdf)`
2. 可选复制到 `pdf00N/` 统一目录：`copy pdf\paper_13_*.pdf pdf008\`

## 报告链接模板

```markdown
N. **Title (Year)**
   [PDF 原文 (Local)](pdf008/NN_slug.pdf) | [在线资源链接](https://arxiv.org/abs/XXXX.XXXXX)
```

多来源时追加 `| [DOI](https://doi.org/...) | [PMC](...)`

## 故障排除

| 症状 | 操作 |
|------|------|
| 全部 404 | 检查是否为 007 式占位链接，对照 003 版替换 |
| PMC 返回 HTML | 改 Frontiers/Nature/MDPI 期刊 PDF 链 |
| preprints 403 | 用 `.../v2` 页面或 ACM DOI `10.1145/3815113` |
| Python 不可用 | 使用 Node 脚本 |
| PowerShell 中文路径乱码 | `[IO.File]::ReadAllText` 或 Node `readFileSync` UTF-8 |

## 相关文件

- 流程文档：`doctor/docs/文献下载流程与要点.md`
- 003 版已验证文献：`doctor/博士论文开题报告20260523-003.md` 第七章
- 翻译技能：`.agents/skills/academic-pdf-translator/`
