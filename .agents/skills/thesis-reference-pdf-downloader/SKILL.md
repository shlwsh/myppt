---
name: thesis-reference-pdf-downloader
description: >-
  从博士开题报告 Markdown 第七章「文献参考」批量提取链接、校验 URL 真实性、下载 PDF 至指定目录并生成
  download_manifest.json。适用于占位链接替换、arXiv/IEEE/PMC/Frontiers/Springer OA 等来源、pdf008
  类目录管理。当用户要求下载开题报告文献、批量获取参考文献 PDF、修正文献链接或复用 pdf00N 下载流程时使用。
---

# 开题报告文献 PDF 批量下载

## 快速开始

```bash
node .agents/skills/thesis-reference-pdf-downloader/scripts/download_refs.mjs \
  --md doctor/博士论文开题报告20260524-008.md \
  --out doctor/pdf008
```

**依赖：** Node.js ≥ 18（内置 `fetch`）。Windows 下用 `;` 连接命令，勿依赖 `python`/`py` 若未安装。

**产出：** `{outDir}/*.pdf`、`{outDir}/download_manifest.json`

## 执行前必做：链接审查

从报告 `# **七、文献参考**` 起扫描 URL。若存在以下情况，**先修正链接再下载**：

| 问题 | 处理 |
|------|------|
| `google.com/search?q=` | 删除；换真实 DOI/arXiv |
| `arxiv.org/abs/med-xxx-2025` 类 slug | 换数字 ID 或 DOI |
| `ieeexplore.../document/ros2-jazzy-...` | 换 `document/{数字}` |
| Medium / TowardsAI / EmergentMind | 换 peer-reviewed 论文；博客不作 PDF 原文 |
| 条目无 URL | 从 `博士论文开题报告20260523-003.md` 第七章对齐主题补全 |

推荐引用格式（便于解析与维护）：

```markdown
1. **Title (Year)**
   [PDF 原文 (Local)](pdf008/02_abs_2601.21011.pdf) | [在线资源链接](https://arxiv.org/abs/2601.21011)
```

## 工作流

```
审查链接 → 修正占位 URL → 运行 download_refs.mjs → 读 manifest → 补失败项 → 回写 [PDF 原文 (Local)]
```

1. **审查与修正** — 见上文；完整说明见 [reference.md](reference.md)
2. **批量下载** — 运行 `scripts/download_refs.mjs`
3. **处理失败** — 按 manifest 中 `error` 分类：404 换链、403 用 OA/机构库、非 PDF 换 `/pdf` 直链
4. **回写报告** — 成功项添加 `[PDF 原文 (Local)](相对路径)`；保留 `[在线资源链接]`
5. **可选 README** — 在 `pdf00N/README.md` 汇总成功/失败统计

## 脚本解析范围

`download_refs.mjs` 从 `--section`（默认 `七、文献参考`）之后提取：

- 行首裸 URL：`https://...`
- Markdown 链接：`[https://...](...)`
- `[在线资源链接](https://...)`

自动跳过 `google.com/search`。按域名尝试 PDF 候选 URL（arXiv `/pdf/`、IEEE stampPDF、Frontiers `/pdf`、Springer `content/pdf` 等）。

## 合规

- 仅使用开放获取、arXiv、机构合法订阅
- **禁止** Sci-Hub 等未授权站点
- 付费文献保留 DOI，manifest 标注失败原因

## 本项目约定

| 路径 | 用途 |
|------|------|
| `doctor/pdf/` | 003 版等历史 PDF |
| `doctor/pdf00N/` | 按报告版本存放（如 `pdf008`） |
| `doctor/docs/文献下载流程与要点.md` | 人类可读完整流程 |

## 延伸阅读

- 流程与案例：[doctor/docs/文献下载流程与要点.md](../../../doctor/docs/文献下载流程与要点.md)
- URL 模式与排错：[reference.md](reference.md)
- PDF 翻译（下载后）：`.agents/skills/academic-pdf-translator/`
