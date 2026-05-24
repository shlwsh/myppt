# pdf008 文献目录

对应文档：`博士论文开题报告20260524-008.md` 第七章（已更新为真实 DOI / arXiv / PMC 链接）。

## 本地 PDF（`pdf008/`）

| 文件 | 文献 |
|------|------|
| `02_abs_2601.21011.pdf` | Meta-ROS |
| `05_document_11048919.pdf` | ROS2 空地协同机器人 |
| `09_pmc...PMC12748213.pdf` | Agentic Graph RAG |
| `14_abs_2507.18288.pdf` | TCM-Tongue 数据集 |
| `15_...frai.2024.1501184...pdf` | 数字舌象分析 |
| `18_article_10.1186...pdf` | 舌诊 AI（BMC） |

其余条目 PDF 见 `pdf/` 目录（文中已标注 `[PDF 原文 (Local)](pdf/...)`）。

## 批量下载

```bash
node download_refs_008.mjs
```

脚本会解析 `[在线资源链接](...)` 与独立 `https://` 行，并尝试 arXiv / Frontiers / IEEE 等 PDF 直链。
