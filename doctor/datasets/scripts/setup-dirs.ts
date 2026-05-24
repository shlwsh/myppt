/**
 * 初始化 doctor/datasets 目录结构（不下载数据）
 * 用法: bun run doctor/datasets/scripts/setup-dirs.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

const DATASET_DIRS = [
  "vision/tcm-tongue/raw",
  "vision/tcm-tongue/processed",
  "vision/tcm-tongue/splits",
  "vision/tcm-tongue/reports",
  "vision/tcm-fd/raw",
  "vision/tcm-fd/processed",
  "vision/tcm-fd/splits",
  "vision/tcm-fd/reports",
  "vision/tongue-inquiry/raw",
  "vision/tmc-tongue/raw",
  "control/mendeley-iiwa/raw",
  "control/mendeley-iiwa/processed",
  "control/mendeley-iiwa/reports",
  "emr/voice-ehr/raw",
  "emr/mimic/raw",
  "kg/primekg/raw",
  "kg/primekg/processed",
  "sim/ros2-gazebo/logs",
  "sim/ros2-gazebo/reports",
  "manifests",
  "reports",
  "scripts",
] as const;

async function ensureDir(rel: string) {
  const dir = join(ROOT, rel);
  await mkdir(dir, { recursive: true });
  const keep = join(dir, ".gitkeep");
  try {
    await writeFile(keep, "", { flag: "wx" });
  } catch {
    // 已存在则忽略
  }
}

async function main() {
  for (const rel of DATASET_DIRS) {
    await ensureDir(rel);
  }
  console.log(`[datasets:setup] 已初始化 ${DATASET_DIRS.length} 个目录于:\n  ${ROOT}`);
  console.log("\n下一步: 打开 doctor/datasets/P0_CHECKLIST.md 按清单下载数据。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
