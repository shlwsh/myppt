# WSL 中 Codex 配置与排障复用文档

## 1. 目标与结论

本文总结一次在 Windows + WSL2 Ubuntu 环境中配置 `codex` 的完整过程，重点沉淀以下经验：

- 如何让 WSL 中的 `codex` 通过 Windows 侧本地代理正常工作
- 如何区分 `config.toml`、环境变量、WSL 网络模式三类问题
- 如何快速定位 `stream disconnected before completion: builder error` 的真实根因
- 如何避免把临时修复做成长期隐患

本次最终可用的稳定方案是：

- WSL 使用 `mirrored` 网络模式
- 启用 `hostAddressLoopback=true`
- `codex` 在 Ubuntu 中直接访问 `http://127.0.0.1:8327/v1`
- `config.toml` 使用合法 TOML 且模型设置为代理实际支持的模型

## 2. 适用场景

适用于以下环境：

- Windows 11
- WSL2 Ubuntu
- Windows 侧运行了本地 OpenAI 兼容代理
- Ubuntu 中运行 `codex`
- 代理只监听 Windows 的 `127.0.0.1:端口`

本次代理端口为 `8327`，监听进程是 `CursorPro`。

## 3. 最终稳定配置

### 3.1 Ubuntu 中的环境变量

建议在 `~/.profile` 和 `~/.bashrc` 中同时保留以下变量，避免不同 shell 启动路径不一致：

```bash
export ANTHROPIC_AUTH_TOKEN=proxy-key
export ANTHROPIC_BASE_URL=http://127.0.0.1:8327/v1
export ANTHROPIC_MODEL=gpt-5.5
```

说明：

- `ANTHROPIC_AUTH_TOKEN` 是当前自定义 provider 依赖的关键变量
- 这里的 token 是否真实鉴权，由你的本地代理决定
- `ANTHROPIC_MODEL` 是环境变量，不一定等于 Codex 实际默认模型

验证命令：

```bash
env | grep '^ANTHROPIC_'
```

### 3.2 Ubuntu 中的 `~/.codex/config.toml`

最终稳定内容如下：

```toml
model_provider = "proxy"
model = "gpt-5.4"
disable_response_storage = true
model_reasoning_effort = "medium"

[model_providers.proxy]
name = "proxy"
base_url = "http://127.0.0.1:8327/v1"
wire_api = "responses"
env_key = "ANTHROPIC_AUTH_TOKEN"

[projects."/home/smz"]
trust_level = "trusted"
```

说明：

- `base_url` 必须是合法 URL，不能拼入其他命令输出
- `wire_api = "responses"` 表示走 OpenAI Responses 风格接口
- `env_key = "ANTHROPIC_AUTH_TOKEN"` 表示 provider 从环境变量取 token
- `model` 必须是代理真实支持的模型

### 3.3 Windows 的 `.wslconfig`

最终稳定内容如下：

```ini
[wsl2]
localhostForwarding=true
networkingMode=mirrored
hostAddressLoopback=true
autoProxy=false
```

路径：

- `C:\Users\13403\.wslconfig`

说明：

- `networkingMode=mirrored` 是关键项
- `hostAddressLoopback=true` 允许 WSL 访问 Windows 的 `127.0.0.1`
- 修改后需要执行 `wsl.exe --shutdown` 使其生效

## 4. 故障现象与真实根因

### 4.1 表面现象

在 WSL 中运行 `codex` 后输入内容，界面报错：

```text
stream disconnected before completion: builder error
```

同时顶部还提示：

```text
Codex could not find bubblewrap on PATH.
```

### 4.2 真正根因不是一个，而是分阶段暴露

本次问题一共分成三层：

1. 早期问题：缺少 `ANTHROPIC_AUTH_TOKEN`
2. 中期问题：`config.toml` 被写坏，`base_url` 变成非法地址
3. 最终问题：WSL 在 `NAT` 模式下访问不到 Windows 本机回环代理

### 4.3 为什么 `bubblewrap` 不是主因

截图里最显眼的是 `bubblewrap` 警告，但它不是导致会话失败的主因。

原因：

- Codex 在缺少系统 `bubblewrap` 时会退回 bundled bubblewrap
- 真正的失败点是模型请求发出后多次断流，最后报 `builder error`
- 日志显示请求实际已进入流式调用阶段，不是单纯启动失败

结论：

- 遇到 `bubblewrap` 警告时，不要先入为主
- 优先查日志中的请求错误和 provider 配置

## 5. 排障过程复盘

### 5.1 第一步：看截图，不猜

先读取 `D:\temp` 下的截图确认报错内容，而不是根据口述猜问题。

价值：

- 避免误把旧问题当新问题
- 能区分 UI 警告和真正阻断执行的错误

### 5.2 第二步：查 Codex 日志

重点查看：

- `~/.codex/log/codex-tui.log`

从日志中识别出两个不同阶段：

- 旧日志：`Missing environment variable: ANTHROPIC_AUTH_TOKEN`
- 新日志：多次 `stream disconnected - retrying sampling request`，最终 `builder error`

价值：

- 能把“启动问题”和“请求链路问题”分开

### 5.3 第三步：验证环境变量是否真的进入 shell

不要只看配置文件，要直接验证 shell 实际加载结果：

```bash
env | grep '^ANTHROPIC_'
```

本次经验：

- 环境变量要同时覆盖登录 shell 和交互 shell
- `.profile` 与 `.bashrc` 最好都处理
- Windows 换行会破坏 Linux shell 配置文件加载

### 5.4 第四步：检查 `config.toml` 是否被误写

本次发现：

```toml
base_url = "http://default via 172.20.160.1 dev eth0 proto kernel:8327/v1"
```

这是明显错误配置，通常来自脚本拼接失误，例如把 `ip route` 整行输出拼进 URL。

结论：

- 自动改配置时，不要直接拼命令整行输出
- 只提取需要的字段
- TOML 写入后必须再读回验证

### 5.5 第五步：验证代理到底在哪一侧监听

Windows 侧验证发现：

- `127.0.0.1:8327` 正在监听
- 监听进程是 `CursorPro`

WSL 侧验证发现：

- `127.0.0.1:8327` 连不上
- `172.20.160.1:8327` 也连不上

这说明：

- 代理只绑定在 Windows 回环地址
- WSL 当前网络模式无法直接访问该回环端口

### 5.6 第六步：识别 WSL 网络模式是关键拦截点

读取 `.wslconfig` 后确认：

```ini
networkingMode=NAT
```

这就是关键差异。

在 NAT 模式下：

- Windows `127.0.0.1` 不一定对 WSL 可达
- 即使 Windows 本机能访问代理，WSL 也未必能访问

最终修正为：

```ini
networkingMode=mirrored
hostAddressLoopback=true
```

然后执行：

```powershell
wsl.exe --shutdown
```

使网络配置生效。

### 5.7 第七步：重新做最小链路验证

不要一上来就先开 TUI，先验证最小网络链路：

```bash
curl http://127.0.0.1:8327/v1/models
```

本次切换网络模式后，WSL 已成功拿到模型列表。

随后再做 Codex 非交互验证：

```bash
codex exec --skip-git-repo-check --sandbox read-only "Reply with exactly OK."
```

本次执行成功，说明问题已经闭环解决。

## 6. 最终验证清单

建议按以下顺序验证：

### 6.1 验证环境变量

```bash
env | grep '^ANTHROPIC_'
```

### 6.2 验证代理连通性

```bash
curl http://127.0.0.1:8327/v1/models
```

### 6.3 验证 Codex 配置

```bash
cat ~/.codex/config.toml
```

### 6.4 验证 Codex 非交互调用

```bash
codex exec --skip-git-repo-check --sandbox read-only "Reply with exactly OK."
```

### 6.5 最后再验证交互式 TUI

```bash
codex
```

## 7. 高风险点与经验结论

### 7.1 风险点：把 warning 当 root cause

典型误区：

- 看到 `bubblewrap` 警告，就认为这一定是主因

风险：

- 容易花时间在次要问题上
- 忽略 provider 请求链路才是真正的阻断点

经验：

- 优先看日志中的 turn error 和请求重试信息

### 7.2 风险点：配置文件写入后不回读

本次 `config.toml` 曾被写坏两次：

- 一次把路由输出拼进 URL
- 一次因 shell 引号处理导致 TOML 引号丢失

经验：

- 配置文件写完后必须立刻 `cat` 回读
- 自动化写 TOML 时要格外小心引号与换行

### 7.3 风险点：只验证 Windows 端口，不验证 WSL 端口

Windows 上监听正常，不代表 WSL 一定能访问。

经验：

- 一定要从 Ubuntu 内部执行 `curl`
- 从消费者所在侧验证，才有意义

### 7.4 风险点：模型名和代理能力不匹配

虽然环境里设置过 `ANTHROPIC_MODEL=gpt-5.5`，但代理实际返回的模型列表中没有 `gpt-5.5`。

经验：

- 默认模型要以 `/v1/models` 返回结果为准
- 本次最终改为 `gpt-5.4`

### 7.5 风险点：临时端口转发容易留下脏状态

排障中曾尝试通过 Windows 用户态脚本转发端口，但这类方案有几个问题：

- 进程生命周期不稳定
- 重启后不一定自动恢复
- 容易和后续正式方案冲突

经验：

- 能从 WSL 网络模式根治时，不要长期依赖临时转发器

### 7.6 风险点：WSL shell 文件换行格式错误

如果从 Windows 侧直接改 `.profile`、`.bashrc`，有可能把文件写成 CRLF。

风险：

- 登录 shell 加载异常
- 环境变量失效

经验：

- Linux shell 配置文件应保持 LF 换行

## 8. 推荐的标准处理顺序

以后遇到类似问题，建议固定按以下顺序处理：

1. 先看截图或实际报错，不凭印象猜
2. 查 `~/.codex/log/codex-tui.log`
3. 验证环境变量是否真的进了 shell
4. 检查 `~/.codex/config.toml` 是否合法
5. 从 WSL 内部 `curl` 代理接口
6. 如果 Windows 代理只监听 `127.0.0.1`，检查 `.wslconfig` 是否为 mirrored
7. 用 `codex exec` 做非交互 smoke test
8. 最后再开交互式 `codex`

## 9. 可直接复用的命令清单

### 查看环境变量

```bash
env | grep '^ANTHROPIC_'
```

### 查看 Codex 日志

```bash
tail -n 120 ~/.codex/log/codex-tui.log
```

### 查看模型列表

```bash
curl http://127.0.0.1:8327/v1/models
```

### 查看 Codex 配置

```bash
cat ~/.codex/config.toml
```

### 非交互验证

```bash
codex exec --skip-git-repo-check --sandbox read-only "Reply with exactly OK."
```

### 重启 WSL

```powershell
wsl.exe --shutdown
```

## 10. 后续建议

建议后续再补一项：

- 在 Ubuntu 中安装系统 `bubblewrap`

这样可以消掉顶部 warning，减少误判干扰。但即使不装，只要 bundled bubblewrap 可用，也不影响当前主链路工作。

如果以后更换代理程序，也建议重新做两件事：

- 重新检查 `/v1/models` 返回的模型列表
- 重新确认代理是否仍只监听 Windows `127.0.0.1`

---

本文档基于本次实际排障过程沉淀，适合作为后续在同类 Windows + WSL + 本地代理环境中配置 Codex 的复用手册。
