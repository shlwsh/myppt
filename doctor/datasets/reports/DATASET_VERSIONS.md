# 数据集版本记录

论文实验引用本表中的 `batch_id` 与 `split_seed`，保证可复现。

| batch_id | 数据集 | 版本/来源 | 下载日期 | split_seed | 划分比例 | 备注 |
|----------|--------|-----------|----------|------------|----------|------|
| exp-2026-06-p0 | tcm-tongue | GitHub `cec2d7f` + demo 14 张 | 2026-05-24 | 42 | 70/15/15 random | 完整集待百度网盘，见 raw/DOWNLOAD.md |
| exp-2026-06-p0 | tcm-fd | IEEE DataPort @ ______ | | 43 | 70/15/15 | P0 面诊 |
| exp-2026-06-p0 | mendeley-iiwa | Mendeley v3 | | — | — | 控制离线标定 |

## 变更日志

- **2026-05-24**：克隆 GitHub 元数据仓库；demo 14 张随机划分；`manifests/tcm-tongue-meta.json` 已填写。
