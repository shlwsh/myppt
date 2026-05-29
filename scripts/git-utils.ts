/**
 * Git 工具函数模块
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const DEFAULT_TIMEOUT_MS = 30_000;
const NETWORK_TIMEOUT_MS = 90_000;

/** mygit 自动提交时排除的路径前缀 */
export const AUTO_COMMIT_EXCLUDE_PREFIXES = ["logs/"] as const;

/** .env、.env.example、.env.local 等环境配置文件（始终纳入提交） */
export function isEnvRelatedFile(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  return /(^|\/)\.env(\.[^/]+)?$/.test(normalized);
}

export function isExcludedFromAutoCommit(filePath: string): boolean {
  if (isEnvRelatedFile(filePath)) return false;
  const normalized = filePath.replace(/\\/g, "/");
  return AUTO_COMMIT_EXCLUDE_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix),
  );
}

/** 内网 Git 远程：推送时绕过本地 HTTP 代理 */
function isInternalGitRemote(url: string): boolean {
  return /\.winning\.com\.cn/i.test(url);
}

/** GitHub 等公网远程：推送时绕过可能干扰连接的本地代理 */
function shouldBypassProxyForRemote(url: string): boolean {
  return (
    isInternalGitRemote(url) ||
    /github\.com/i.test(url) ||
    /githubusercontent\.com/i.test(url)
  );
}

function parsePorcelainPath(line: string): string {
  const match = line.match(/^.. (.+)$/);
  return (match?.[1] ?? line.slice(3)).trim();
}

interface ExecGitOptions {
  timeoutMs?: number;
  /** 远程 fetch/push 等网络操作：禁用交互式凭据弹窗并延长超时 */
  network?: boolean;
}

async function execGit(
  command: string,
  cwd: string = process.cwd(),
  options: ExecGitOptions = {},
): Promise<string> {
  const timeoutMs =
    options.timeoutMs ??
    (options.network ? NETWORK_TIMEOUT_MS : DEFAULT_TIMEOUT_MS);

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      env: options.network
        ? {
            ...process.env,
            GIT_TERMINAL_PROMPT: "0",
            GCM_INTERACTIVE: "Never",
          }
        : process.env,
    });
    if (stderr && !stderr.includes("warning")) {
      console.warn("Git 警告:", stderr);
    }
    return stdout.trim();
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { killed?: boolean; signal?: string };
    if (err.killed || err.code === "ETIMEDOUT") {
      throw new Error(
        `Git 命令超时（${timeoutMs / 1000}s），可能是网络不可达或凭据交互被阻塞: ${command}`,
      );
    }
    throw new Error(
      `Git 命令执行失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getGitStatus(): Promise<{
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
  excluded: string[];
  hasChanges: boolean;
}> {
  const output = await execGit("git status --porcelain");

  const modified: string[] = [];
  const added: string[] = [];
  const deleted: string[] = [];
  const untracked: string[] = [];
  const excluded: string[] = [];

  if (!output) {
    return { modified, added, deleted, untracked, excluded, hasChanges: false };
  }

  const lines = output.split("\n");
  for (const line of lines) {
    if (!line) continue;

    const status = line.substring(0, 2);
    const file = parsePorcelainPath(line);

    if (isExcludedFromAutoCommit(file)) {
      excluded.push(file);
      continue;
    }

    if (status.includes("M")) {
      modified.push(file);
    } else if (status.includes("A")) {
      added.push(file);
    } else if (status.includes("D")) {
      deleted.push(file);
    } else if (status === "??") {
      untracked.push(file);
    }
  }

  const hasChanges =
    modified.length > 0 ||
    added.length > 0 ||
    deleted.length > 0 ||
    untracked.length > 0;

  return { modified, added, deleted, untracked, excluded, hasChanges };
}

export async function getGitDiff(files?: string[]): Promise<string> {
  try {
    await execGit("git rev-parse HEAD");
    let command = "git diff --no-ext-diff HEAD";
    if (files && files.length > 0) {
      command += " " + files.join(" ");
    }

    try {
      return await execGit(command);
    } catch {
      console.warn("⚠️  完整 diff 获取失败，使用统计信息代替");
      return await execGit(command.replace("git diff", "git diff --stat"));
    }
  } catch {
    let command = "git diff --no-ext-diff --cached";
    if (files && files.length > 0) {
      command += " " + files.join(" ");
    }

    try {
      return await execGit(command);
    } catch {
      console.warn("⚠️  完整 diff 获取失败，使用统计信息代替");
      return await execGit(command.replace("git diff", "git diff --stat"));
    }
  }
}

export async function getStagedGitDiff(): Promise<string> {
  try {
    return await execGit("git diff --no-ext-diff --cached");
  } catch {
    console.warn("⚠️  完整 diff 获取失败，使用统计信息代替");
    return await execGit("git diff --no-ext-diff --cached --stat");
  }
}

async function stageEnvRelatedFiles(): Promise<void> {
  const output = await execGit("git status --porcelain");
  const envFiles: string[] = [];

  for (const line of output.split("\n")) {
    if (!line) continue;
    const file = parsePorcelainPath(line);
    if (isEnvRelatedFile(file)) envFiles.push(file);
  }

  if (envFiles.length === 0) return;

  const fileList = envFiles.map((f) => JSON.stringify(f)).join(" ");
  await execGit(`git add -f ${fileList}`);
}

export async function gitAdd(files: string[] = ["."]): Promise<void> {
  if (files.length === 1 && files[0] === ".") {
    await execGit("git add -A");
    for (const prefix of AUTO_COMMIT_EXCLUDE_PREFIXES) {
      try {
        await execGit(`git reset HEAD -- ${prefix}`);
      } catch {
        // 该前缀下无已暂存文件时可忽略
      }
    }
    await stageEnvRelatedFiles();
    return;
  }

  const toAdd = files.filter((f) => !isExcludedFromAutoCommit(f));
  if (toAdd.length === 0) return;

  const fileList = toAdd.map((f) => JSON.stringify(f)).join(" ");
  await execGit(`git add ${fileList}`);
}

export async function gitCommit(message: string): Promise<void> {
  const paragraphs = message
    .split(/\n\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    throw new Error("提交信息为空");
  }

  const args = paragraphs.map((p) => `-m ${JSON.stringify(p)}`).join(" ");
  await execGit(`git commit ${args}`);
}

export async function gitPush(
  remote: string = "origin",
  branch?: string,
): Promise<void> {
  if (!branch) {
    branch = await execGit("git rev-parse --abbrev-ref HEAD");
  }

  const remotes = await getRemoteInfo();
  const remoteUrl = remotes.find((r) => r.name === remote)?.url ?? "";
  const bypassProxy = shouldBypassProxyForRemote(remoteUrl);
  const networkConfig = [
    "-c http.lowSpeedLimit=1000",
    "-c http.lowSpeedTime=20",
    ...(bypassProxy ? ["-c http.proxy=", "-c https.proxy="] : []),
  ].join(" ");
  const pushCmd = `git ${networkConfig} push ${remote} ${branch}`;

  if (bypassProxy) {
    console.log("ℹ️  远程仓库推送时绕过本地 HTTP 代理");
  }

  await execGit(pushCmd, process.cwd(), { network: true });
}

export async function getRemoteInfo(): Promise<
  { name: string; url: string }[]
> {
  const output = await execGit("git remote -v");
  const remotes: { name: string; url: string }[] = [];

  const lines = output.split("\n");
  const seen = new Set<string>();

  for (const line of lines) {
    if (!line) continue;
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const key = `${parts[0]}-${parts[1]}`;
      if (!seen.has(key)) {
        seen.add(key);
        remotes.push({ name: parts[0], url: parts[1] });
      }
    }
  }

  return remotes;
}

export async function isGitRepository(): Promise<boolean> {
  try {
    await execGit("git rev-parse --git-dir");
    return true;
  } catch {
    return false;
  }
}

export async function hasUnpushedCommits(): Promise<boolean> {
  try {
    const output = await execGit("git cherry -v");
    return output.trim().length > 0;
  } catch {
    return false;
  }
}
