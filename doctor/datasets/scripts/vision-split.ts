/**
 * 按文件名列表生成 train/val/test 划分（JSON）
 * 用法:
 *   bun run doctor/datasets/scripts/vision-split.ts -- --dataset tcm-tongue
 *   bun run doctor/datasets/scripts/vision-split.ts -- --dataset tcm-tongue --seed 42 --train 0.7 --val 0.15
 */
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { join, extname, relative } from "node:path";

const ROOT = join(import.meta.dir, "..");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".bmp", ".webp"]);

const DATASET_ROOTS: Record<string, string> = {
  "tcm-tongue": "vision/tcm-tongue",
  "tcm-fd": "vision/tcm-fd",
};

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--" && i + 1 < argv.length) {
      const rest = argv.slice(i + 1);
      for (let j = 0; j < rest.length; j++) {
        if (rest[j]?.startsWith("--")) {
          const key = rest[j]!.slice(2);
          const val = rest[j + 1] && !rest[j + 1]!.startsWith("--") ? rest[++j] : "true";
          args[key] = val;
        }
      }
      break;
    }
  }
  return args;
}

/** 可复现的 Fisher-Yates 洗牌 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const SKIP_DIRS = new Set([".git", "node_modules"]);

async function collectImages(dir: string, base = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    if (e.isDirectory() && SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await collectImages(full, base)));
    } else if (IMAGE_EXT.has(extname(e.name).toLowerCase())) {
      files.push(relative(base, full).replace(/\\/g, "/"));
    }
  }
  return files;
}

/** YOLO/COCO 解压后常见的官方划分目录 */
const OFFICIAL_SPLIT_DIRS: [string, string, string][] = [
  ["images/train", "images/val", "images/test"],
  ["train/images", "val/images", "test/images"],
];

async function tryOfficialSplit(rawDir: string): Promise<{
  train: string[];
  val: string[];
  test: string[];
} | null> {
  for (const [trainRel, valRel, testRel] of OFFICIAL_SPLIT_DIRS) {
    const trainDir = join(rawDir, trainRel);
    const valDir = join(rawDir, valRel);
    const testDir = join(rawDir, testRel);
    try {
      const train = await collectImages(trainDir, rawDir);
      const val = await collectImages(valDir, rawDir);
      const test = await collectImages(testDir, rawDir);
      if (train.length + val.length + test.length > 0) {
        return { train, val, test };
      }
    } catch {
      // 目录不存在，尝试下一组路径
    }
  }
  return null;
}

async function main() {
  const args = parseArgs(process.argv);
  const dataset = args.dataset ?? "tcm-tongue";
  const seed = Number(args.seed ?? 42);
  const trainRatio = Number(args.train ?? 0.7);
  const valRatio = Number(args.val ?? 0.15);

  const relRoot = DATASET_ROOTS[dataset];
  if (!relRoot) {
    console.error(`未知数据集: ${dataset}，可选: ${Object.keys(DATASET_ROOTS).join(", ")}`);
    process.exit(1);
  }

  const rawDir = join(ROOT, relRoot, "raw");
  const official = await tryOfficialSplit(rawDir);

  let split: {
    dataset_id: string;
    seed: number | null;
    split_mode: "official" | "random";
    ratios: Record<string, number> | null;
    counts: { total: number; train: number; val: number; test: number };
    train: string[];
    val: string[];
    test: string[];
  };

  if (official) {
    const n = official.train.length + official.val.length + official.test.length;
    split = {
      dataset_id: dataset,
      seed: null,
      split_mode: "official",
      ratios: null,
      counts: {
        total: n,
        train: official.train.length,
        val: official.val.length,
        test: official.test.length,
      },
      train: official.train.sort(),
      val: official.val.sort(),
      test: official.test.sort(),
    };
    console.log(`[vision-split] 使用官方 train/val/test 目录`);
  } else {
    let images: string[];
    try {
      images = await collectImages(rawDir);
    } catch (err) {
      console.error(`无法读取 ${rawDir}，请先下载数据到 raw/ 目录。`);
      console.error(err);
      process.exit(1);
    }

    if (images.length === 0) {
      console.error(`在 ${rawDir} 下未找到图像文件。`);
      console.error(`完整集请从百度网盘解压至 raw/images/{train,val,test}/，见 raw/DOWNLOAD.md`);
      process.exit(1);
    }

    const shuffled = seededShuffle(images, seed);
    const n = shuffled.length;
    const nTrain = Math.floor(n * trainRatio);
    const nVal = Math.floor(n * valRatio);

    split = {
      dataset_id: dataset,
      seed,
      split_mode: "random",
      ratios: { train: trainRatio, val: valRatio, test: 1 - trainRatio - valRatio },
      counts: { total: n, train: nTrain, val: nVal, test: n - nTrain - nVal },
      train: shuffled.slice(0, nTrain),
      val: shuffled.slice(nTrain, nTrain + nVal),
      test: shuffled.slice(nTrain + nVal),
    };
    if (n < 100) {
      console.warn(`[vision-split] 警告: 仅 ${n} 张图像（可能仅为 demo）。完整数据请见 raw/DOWNLOAD.md`);
    }
  }

  const outDir = join(ROOT, relRoot, "splits");
  await mkdir(outDir, { recursive: true });

  await writeFile(join(outDir, "train.json"), JSON.stringify(split.train, null, 2));
  await writeFile(join(outDir, "val.json"), JSON.stringify(split.val, null, 2));
  await writeFile(join(outDir, "test.json"), JSON.stringify(split.test, null, 2));
  await writeFile(join(outDir, "split-meta.json"), JSON.stringify({
    dataset_id: split.dataset_id,
    split_mode: split.split_mode,
    seed: split.seed,
    ratios: split.ratios,
    counts: split.counts,
    generated_at: new Date().toISOString(),
  }, null, 2));

  console.log(`[vision-split] ${dataset}: mode=${split.split_mode} total=${split.counts.total} train=${split.counts.train} val=${split.counts.val} test=${split.counts.test}`);
  console.log(`  输出: ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
