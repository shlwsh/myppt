# P0 数据集获取与验收清单

**目标时间：** 2026.06 – 2026.08  
**负责人：** _____________  
**最后更新：** _____________

勾选表示已完成；`验收标准` 列用于论文/开题阶段检查点。

---

## A. 环境与目录（第 1 周）

- [ ] 运行 `bun run datasets:setup`，确认 `vision/`、`control/`、`sim/` 等子目录已创建
- [ ] 阅读 [README.md](./README.md) 合规条款，确认不含 PHI 的数据不进入公有云训练 API
- [ ] 在 `reports/DATASET_VERSIONS.md` 填写本次实验批次 ID（如 `exp-2026-06-p0`）

**验收：** `doctor/datasets/` 目录结构完整，`.gitignore` 已忽略 `raw/`。

---

## B. 视觉 P0 — TCM-Tongue（第 1–2 周）

| 步骤 | 操作 | 验收标准 |
|------|------|----------|
| B1 | 克隆/下载 [Intelligent-tongue-diagnosis-detection-dataset](https://github.com/btbuIntelliSense/Intelligent-tongue-diagnosis-detection-dataset) 至 `vision/tcm-tongue/raw/` | `raw/images/` 下图像数量 ≥ 6,000 |
| B2 | 核对标注格式（20 类多标签 / 检测框）并写入 `manifests/tcm-tongue-meta.json` | meta 含 `classes`、`label_format`、`download_date` |
| B3 | 运行 `bun run datasets:vision-split -- --dataset tcm-tongue` | 生成 `splits/train.json`、`val.json`、`test.json`（建议 70/15/15） |
| B4 | 统计类别分布，输出 `vision/tcm-tongue/reports/stats.md` | 报告含每类样本数、缺失标签比例 |
| B5 | （可选）训练 YOLO/分类基线，记录 mAP / F1 | 数值写入 `reports/stats.md`，供 Vision Agent 对照 |

---

## C. 视觉 P0 — TCM-FD（第 2 周）

| 步骤 | 操作 | 验收标准 |
|------|------|----------|
| C1 | 从 [IEEE DataPort - TCM-FD](https://ieee-dataport.org/) 申请并下载至 `vision/tcm-fd/raw/` | 可申请访问权限或已获批准 |
| C2 | 填写 `manifests/tcm-fd-meta.json`（11 类面诊指标） | meta 与开题报告 §3.5.1 一致 |
| C3 | 划分 train/val/test 并记录 `reports/stats.md` | 与 TCM-Tongue 划分种子独立记录 |

---

## D. 控制 P0 — Mendeley Collaborative Robotics（第 2–3 周）

| 步骤 | 操作 | 验收标准 |
|------|------|----------|
| D1 | 下载 [Mendeley: 4fr33dkrjt](https://data.mendeley.com/datasets/4fr33dkrjt/3) 至 `control/mendeley-iiwa/raw/` | 含力/扭矩与阻抗模式相关文件 |
| D2 | 编写 `control/mendeley-iiwa/reports/schema.md`：列名、采样率、序列数（≈450） | 文档可供阻抗算法复现 |
| D3 | 离线绘制力-位移/力-时间曲线样本图 | 至少 3 条序列可视化存档 |
| D4 | 提取虚拟刚度/阻尼调参初值表 `control/mendeley-iiwa/processed/impedance-init.csv` | 供 ros2_control 实机迁移对照 |

---

## E. 仿真 P0 — ROS 2 / Gazebo（第 3–4 周）

| 步骤 | 操作 | 验收标准 |
|------|------|----------|
| E1 | 安装 ROS 2 Jazzy + Gazebo（或 Webots） | `ros2 topic list` 正常 |
| E2 | 运行 TurtleBot3 或 Franka 官方 demo | 日志存 `sim/ros2-gazebo/logs/` |
| E3 | 测量 DDS 话题往返时延（脚本或 `ros2 doctor`） | 记录 P50/P95 时延至 `sim/ros2-gazebo/reports/latency.md` |
| E4 | 验证 Skills 占位接口：`go_to_face_pose` / `go_to_tongue_pose` 仿真调用 | 截图或 bag 文件索引写入 manifest |

---

## F. PhysioNet 预申请（与 P0 并行，供 P1 使用）

- [ ] 注册 [PhysioNet](https://physionet.org/) 账号并完成 CITI 培训
- [ ] 提交 **MIMIC-IV** DUA
- [ ] 提交 **Voice EHR (Bridge2AI)** 相关项目 DUA（如适用）
- [ ] 在 `emr/physionet-dua.md` 记录审批状态与批准日期（勿提交凭证文件）

**验收：** DUA 状态为 Approved 或 Pending（注明预计可用时间）。

---

## G. P0 阶段总验收（2026.08 末）

| 模块 | 必达项 |
|------|--------|
| Vision | TCM-Tongue 划分完成 + `stats.md`；TCM-FD 已下载或 DUA/申请中 |
| Control | Mendeley schema 文档 + 阻抗初值表 |
| Sim | DDS 时延报告 + Skills 仿真一次成功调用 |
| 合规 | PhysioNet 申请已提交；无 PHI 进入公有云 |

**签字 / 日期：** _____________

---

## 参考链接（速查）

| 资源 | URL |
|------|-----|
| TCM-Tongue (GitHub) | https://github.com/btbuIntelliSense/Intelligent-tongue-diagnosis-detection-dataset |
| TCM-FD | https://ieee-dataport.org/ （检索 TCM-FD） |
| Mendeley 协作机器人 | https://data.mendeley.com/datasets/4fr33dkrjt/3 |
| PhysioNet 认证 | https://physionet.org/settings/credentialing/ |
| ROS 2 Jazzy 文档 | https://docs.ros.org/en/jazzy/ |
