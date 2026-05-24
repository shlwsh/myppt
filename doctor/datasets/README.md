# 博士论文实验数据集目录

对应开题报告：[博士论文开题报告20260523-003.md](../博士论文开题报告20260523-003.md) **§3.5 / §6.0**。

遵循 **L1 公开数据仿真 → L2 实验室实机 → L3 模拟/临床** 三级验证；原始数据不入 Git，仅提交目录结构、清单、划分脚本与评测记录。

## 目录结构

```
doctor/datasets/
├── README.md                 # 本文件
├── P0_CHECKLIST.md           # P0 数据集获取与验收清单（可打印执行）
├── manifests/                # 数据清单与划分索引（JSON/CSV，可提交）
├── scripts/                  # 初始化、划分、统计脚本
├── vision/                   # 舌诊 / 面诊（TCM-Tongue、TCM-FD 等）
├── control/                  # 协作机器人阻抗（Mendeley 等）
├── emr/                      # 语音 / 病历（Voice EHR、MIMIC）
├── kg/                       # 知识图谱导出（PrimeKG 子图等）
└── sim/                      # ROSbag、仿真日志
```

每个子目录建议包含：

| 子路径 | 说明 |
|--------|------|
| `raw/` | 下载的原始数据（.gitignore） |
| `processed/` | 清洗、裁剪、标注对齐后（.gitignore） |
| `splits/` | `train.json` / `val.json` / `test.json` 索引 |
| `reports/` | 统计报告、版本记录（可提交 Markdown） |

## 优先级与模块映射

| 优先级 | 数据集 | 目录 | 对应 Agent / 模块 |
|--------|--------|------|-------------------|
| **P0** | TCM-Tongue | `vision/tcm-tongue/` | Vision Agent、Edge-IQA |
| **P0** | TCM-FD | `vision/tcm-fd/` | 面诊特征、Edge-IQA |
| **P0** | Mendeley Collaborative Robotics | `control/mendeley-iiwa/` | 自适应阻抗控制 |
| **P0** | ROS 2 / Gazebo 仿真 | `sim/ros2-gazebo/` | Skills、DDS/gRPC 时延 |
| **P1** | Tongue + Inquiry 多模态 | `vision/tongue-inquiry/` | Vision ↔ Symptom 对齐 |
| **P1** | Voice EHR | `emr/voice-ehr/` | Symptom Agent |
| **P1** | MIMIC-III/IV | `emr/mimic/` | EMR Architect Agent |
| **P1** | PrimeKG / ClinGraph | `kg/primekg/` | KG 校验、防幻觉 |
| **P2** | TMC-Tongue (Dryad) | `vision/tmc-tongue/` | 检测泛化 |
| **P2** | OpenH、INSPECT、RoboCup ROSbag | `sim/` | 扩展评测 |

## 快速开始

```bash
# 1. 创建子目录与清单模板
bun run datasets:setup

# 2. 按 P0_CHECKLIST.md 下载数据到对应 raw/ 目录

# 3. 填写 manifests/*.json 后生成划分（示例脚本）
bun run datasets:vision-split -- --dataset tcm-tongue
```

## 合规说明

- **PhysioNet（MIMIC、Voice EHR）**：须完成 CITI 培训并签署 [Data Use Agreement (DUA)](https://physionet.org/settings/credentialing/)；不得将含 PHI 的数据上传至公有云 LLM API。
- **IEEE DataPort / Dryad / GitHub 公开集**：遵守各平台许可与引用要求；论文中注明版本与 DOI。
- **院内临床数据**：与公开数据物理隔离，单独伦理审批，存放路径不得与 `raw/` 混用。

## 版本记录

在 `reports/DATASET_VERSIONS.md` 中记录每次下载的日期、版本、哈希（可选）与划分种子，保证 SCI 论文可复现。

## 相关文档

- 开题报告 §3.5：公开数据集与仿真验证体系
- 执行清单：[P0_CHECKLIST.md](./P0_CHECKLIST.md)
- 清单模板：[manifests/](./manifests/)
