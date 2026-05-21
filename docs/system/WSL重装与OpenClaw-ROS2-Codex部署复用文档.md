# WSL 重装与 OpenClaw / ROS 2 / Codex 部署复用文档

生成时间：2026-05-15  
适用环境：Windows 11 + WSL2 + Ubuntu 24.04 LTS

## 1. 本次目标与最终状态001

本次完成了 WSL Ubuntu 环境的重新部署，并在新环境中安装、配置和验证：

- OpenClaw
- ROS 2 Jazzy
- Codex CLI
- Windows 本地代理到 WSL 的访问链路
- APT / npm / Codex 的代理相关配置

最终验证结果：

```bash
lsb_release -a
# Ubuntu 24.04 LTS noble

openclaw --version
# OpenClaw 2026.5.12 (f066dd2)

codex --version
# codex-cli 0.130.0

. /opt/ros/jazzy/setup.bash
printenv ROS_DISTRO
# jazzy

ros2 pkg prefix rclcpp
# /opt/ros/jazzy
```

Codex 端到端验证命令：

```bash
wsl codex exec --skip-git-repo-check --sandbox read-only 'Reply with exactly OK.'
```

验证输出：

```text
OK
```

## 2. WSL 基础部署

本次目标发行版为：

```text
Ubuntu2404
```

最终系统信息：

```text
Distributor ID: Ubuntu
Description:    Ubuntu 24.04 LTS
Release:        24.04
Codename:       noble
```

`/etc/wsl.conf` 最终内容：

```ini
[boot]
systemd=true

[user]
default=root
```

说明：

- `systemd=true` 用于启用 systemd。
- 默认用户设置为 `root`。
- root 密码本次按要求设置为 `030225`。

风险提示：

- root 密码写入文档有安全风险，建议仅用于本机临时环境。
- 如果该 WSL 环境后续暴露 SSH、端口转发或共享给其他用户，应立即更换密码。

## 3. Windows 侧 WSL 网络配置

本次 Codex 依赖 Windows 侧本地代理。为了让 WSL 能访问 Windows 的 `127.0.0.1`，最终使用 mirrored 网络模式。

`C:\Users\Administrator\.wslconfig` 最终内容：

```ini
[wsl2]
localhostForwarding=true
networkingMode=mirrored
hostAddressLoopback=true
autoProxy=false
```

修改后需要执行：

```powershell
wsl --shutdown
```

重要结论：

- NAT 模式下，WSL 不一定能访问 Windows 侧只监听 `127.0.0.1` 的代理。
- mirrored 模式配合 `hostAddressLoopback=true` 后，WSL 可直接访问 Windows 的 `127.0.0.1:8327`。
- 当前环境中 WSL 启动时可能仍打印 `hostAddressLoopback` 相关提示，但实际链路已经验证可用。

## 4. 代理软件与端口约定

本次涉及两个代理端口：

| 用途 | 地址 | 说明 |
|---|---:|---|
| Codex OpenAI 兼容代理 | `http://127.0.0.1:8327/v1` | Windows 侧本地代理，模型 API 使用 |
| HTTP/HTTPS 下载代理 | `http://127.0.0.1:7897` | APT、npm、curl 等下载链路使用 |

Codex 代理模型列表验证：

```bash
curl http://127.0.0.1:8327/v1/models
```

本次模型列表包含：

```text
gpt-5
gpt-5-mini
gpt-5.5
gpt-5.4
o3
o3-mini
o4-mini
codex-mini
gpt-5.3-codex
```

下载代理验证：

```bash
curl --max-time 10 -I --proxy http://127.0.0.1:7897 http://archive.ubuntu.com/ubuntu/
```

本次返回 `HTTP/1.1 200 OK`。

## 5. APT 代理配置

`/etc/apt/apt.conf.d/99proxy` 最终内容：

```conf
Acquire::http::Proxy "http://127.0.0.1:7897";
Acquire::https::Proxy "http://127.0.0.1:7897";
```

验证命令：

```bash
apt-get update
```

本次已验证 `apt-get update` 正常。

风险点：

- 初期 NAT 网络下曾使用 WSL 网关地址作为代理，例如 `172.17.192.1:7897`。
- 切换到 mirrored 网络后，应改为 `127.0.0.1:7897`，避免旧网关地址失效。

## 6. OpenClaw 安装与验证

最终验证：

```bash
command -v openclaw
# /usr/bin/openclaw

openclaw --version
# OpenClaw 2026.5.12 (f066dd2)
```

相关运行环境：

```bash
node --version
# v24.15.0

npm --version
# 11.12.1

python3 --version
# Python 3.12.3
```

风险点：

- OpenClaw 依赖 Node/npm 环境，重装 WSL 后应先确认 Node.js 和 npm 是否可用。
- 如果 Windows PATH 被 WSL 继承，可能出现 Linux 命令误命中 Windows 侧 shim 的问题，Codex 中已经实际遇到。

## 7. ROS 2 Jazzy 安装与验证

本次安装 ROS 2 Jazzy：

```bash
apt-get install -y ros-jazzy-ros-base ros-dev-tools
```

环境加载写入 `/root/.bashrc`：

```bash
source /opt/ros/jazzy/setup.bash
```

验证命令：

```bash
. /opt/ros/jazzy/setup.bash
printenv ROS_DISTRO
ros2 pkg prefix rclcpp
ros2 pkg prefix rclpy
```

验证结果：

```text
jazzy
/opt/ros/jazzy
/opt/ros/jazzy
```

注意：

- `ros2 --version` 不是有效的 ROS 2 CLI 版本检查方式，会报 `unrecognized arguments: --version`。
- 推荐使用 `ROS_DISTRO`、`ros2 pkg prefix`、`ros2 doctor --report` 验证。

## 8. Codex 安装与最终配置

### 8.1 安装内容

本次安装 Linux 侧 Codex：

```bash
npm install -g @openai/codex
apt-get install -y bubblewrap
```

最终版本：

```bash
codex --version
# codex-cli 0.130.0

command -v bwrap
# /usr/bin/bwrap
```

### 8.2 Codex 配置文件

`/root/.codex/config.toml` 当前内容：

```toml
model_provider = "proxy"
model = "gpt-5.5"
disable_response_storage = true
model_reasoning_effort = "high"
personality = "pragmatic"

[model_providers.proxy]
name = "proxy"
base_url = "http://127.0.0.1:8327/v1"
wire_api = "responses"
env_key = "ANTHROPIC_AUTH_TOKEN"

[projects."/home/smz"]
trust_level = "trusted"

[projects."/mnt/d/temp"]
trust_level = "trusted"

[projects."/root"]
trust_level = "trusted"

[tui.model_availability_nux]
"gpt-5.5" = 1
```

说明：

- `base_url` 指向 Windows 侧 OpenAI 兼容代理。
- `wire_api = "responses"` 表示使用 OpenAI Responses API 风格。
- `env_key = "ANTHROPIC_AUTH_TOKEN"` 表示从环境变量读取 token。
- 当前实际使用模型为 `gpt-5.5`，已通过 smoke test。

### 8.3 Codex 环境变量

`/etc/profile.d/codex-proxy.sh`：

```bash
export ANTHROPIC_AUTH_TOKEN=proxy-key
export ANTHROPIC_BASE_URL=http://127.0.0.1:8327/v1
export ANTHROPIC_MODEL=gpt-5.5
export NO_PROXY=127.0.0.1,localhost${NO_PROXY:+,$NO_PROXY}
export no_proxy=127.0.0.1,localhost${no_proxy:+,$no_proxy}
```

验证命令：

```bash
env | grep '^ANTHROPIC_'
```

### 8.4 Codex 包装器

为避免 WSL 误命中 Windows 侧 npm shim，最终将 `/usr/bin/codex` 和 `/usr/local/bin/codex` 固定为 Linux 包装器。

`/usr/bin/codex` 内容：

```bash
#!/usr/bin/env bash
export ANTHROPIC_AUTH_TOKEN="${ANTHROPIC_AUTH_TOKEN:-proxy-key}"
export ANTHROPIC_BASE_URL="${ANTHROPIC_BASE_URL:-http://127.0.0.1:8327/v1}"
export ANTHROPIC_MODEL="${ANTHROPIC_MODEL:-gpt-5.5}"
export NO_PROXY="127.0.0.1,localhost${NO_PROXY:+,$NO_PROXY}"
export no_proxy="127.0.0.1,localhost${no_proxy:+,$no_proxy}"
exec /usr/bin/node /usr/lib/node_modules/@openai/codex/bin/codex.js "$@"
```

`/etc/profile.d/00-codex-path.sh`：

```bash
# Keep Linux Codex/Node ahead of Windows npm shims.
case ":$PATH:" in
  *:/usr/bin:*) ;;
  *) export PATH="/usr/bin:$PATH" ;;
esac
hash -r 2>/dev/null || true
```

必要原因：

- WSL 会继承 Windows PATH。
- 当前 Windows 侧存在 `/mnt/c/Users/Administrator/AppData/Roaming/npm/codex`。
- 如果交互 shell 命中该 Windows shim，会报：

```text
/mnt/c/Users/Administrator/AppData/Roaming/npm/codex: 15: exec: node: not found
```

修复原则：

- 不依赖 Windows 侧 codex。
- Linux 内部固定使用 `/usr/bin/node` 和 Linux npm 包入口：

```text
/usr/lib/node_modules/@openai/codex/bin/codex.js
```

## 9. 本次关键故障与处理

### 9.1 APT 下载失败

现象：

- `apt-get update` 或安装 ROS 包时出现连接 reset、超时或下载失败。

原因：

- WSL NAT / mirrored 网络切换期间，APT 代理地址不稳定。

处理：

- 在 NAT 模式下曾使用 WSL 网关代理。
- 最终 mirrored 模式下统一改为：

```text
http://127.0.0.1:7897
```

### 9.2 ROS 安装命令退出码异常

现象：

- ROS 包基本装完，但命令退出码为 1。

原因：

- 安装主流程已完成，后续追加 `.bashrc` 的命令路径或权限细节导致非零退出。

处理：

- 执行：

```bash
dpkg --configure -a
apt-get -f install -y
```

- 再用 `ROS_DISTRO` 和 `ros2 pkg prefix` 验证。

### 9.3 Codex 误用 Windows shim

现象：

```text
/mnt/c/Users/Administrator/AppData/Roaming/npm/codex: 15: exec: node: not found
```

原因：

- WSL PATH 包含 Windows npm 目录。
- Linux 侧 Codex 未固定到更优先入口，或 shell 缓存了旧路径。

处理：

- 安装 Linux 侧 `@openai/codex`。
- 将 `/usr/bin/codex` 替换为包装器。
- 包装器显式调用 `/usr/bin/node` 和 Linux Codex 入口。
- 新 shell 自动 `hash -r`。

如果用户当前 shell 仍然异常，可执行：

```bash
hash -r
type -a codex
codex --version
```

### 9.4 Codex 包入口曾被误覆盖

现象：

```text
file:///usr/lib/node_modules/@openai/codex/bin/codex.js:2
export ANTHROPIC_AUTH_TOKEN=...
SyntaxError: Unexpected token 'export'
```

原因：

- `/usr/bin/codex` 原本是 symlink，复制包装器时跟随 symlink，导致真实 `codex.js` 被覆盖。

处理：

```bash
npm install -g @openai/codex
rm /usr/bin/codex
install -m 755 /mnt/d/temp/codex-wrapper.sh /usr/bin/codex
```

经验：

- 替换 symlink 前必须确认 `ls -l /usr/bin/codex`。
- 不要对 symlink 目标不明的路径直接 `cp` 覆盖。

## 10. 标准验收清单

建议后续重装或迁移时按以下顺序验收。

### 10.1 WSL 与系统

```powershell
wsl --list --verbose
```

```bash
lsb_release -a
ps -p 1 -o comm=
whoami
```

预期：

```text
Ubuntu 24.04 LTS
systemd
root
```

### 10.2 代理

```bash
curl http://127.0.0.1:8327/v1/models
curl --max-time 10 -I --proxy http://127.0.0.1:7897 http://archive.ubuntu.com/ubuntu/
```

### 10.3 OpenClaw

```bash
openclaw --version
```

### 10.4 ROS 2

```bash
. /opt/ros/jazzy/setup.bash
printenv ROS_DISTRO
ros2 pkg prefix rclcpp
ros2 pkg prefix rclpy
```

### 10.5 Codex

```bash
type -a codex
codex --version
env | grep '^ANTHROPIC_'
codex exec --skip-git-repo-check --sandbox read-only 'Reply with exactly OK.'
```

预期：

```text
codex-cli 0.130.0
OK
```

## 11. 维护建议

1. Codex 模型名应以 `http://127.0.0.1:8327/v1/models` 返回结果为准。
2. 如果更换代理软件或端口，需要同步修改：
   - `/root/.codex/config.toml`
   - `/etc/profile.d/codex-proxy.sh`
   - `/usr/bin/codex`
3. 如果 WSL 网络模式变回 NAT，`127.0.0.1:8327` 可能不可达，应重新检查 `.wslconfig`。
4. 如果 npm 升级重写 `/usr/bin/codex`，需要重新检查包装器是否仍存在。
5. 如果交互 shell 报旧路径错误，先执行：

```bash
hash -r
type -a codex
```

6. 不建议长期依赖临时端口转发脚本。能通过 WSL mirrored 网络解决时，应优先使用 mirrored。

## 12. 本次最终关键文件索引

Windows：

```text
C:\Users\Administrator\.wslconfig
D:\temp\WSL中Codex配置与排障复用文档.md
D:\temp\WSL重装与OpenClaw-ROS2-Codex部署复用文档.md
```

WSL：

```text
/etc/wsl.conf
/etc/apt/apt.conf.d/99proxy
/root/.bashrc
/root/.codex/config.toml
/etc/profile.d/codex-proxy.sh
/etc/profile.d/00-codex-path.sh
/usr/bin/codex
/usr/local/bin/codex
/opt/ros/jazzy/setup.bash
```
