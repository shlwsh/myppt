# MacBook Pro Cirrus 音频驱动 (snd_hda_macbookpro) 修复与安装文档

本文档总结了在 MacBook Pro (13,3) 上安装 Cirrus 声卡驱动时遇到的问题、原因分析以及成功的修复与编译步骤。

---

## 一、 遇到问题与现象

在运行驱动安装脚本 `sudo ./install.cirrus.driver.sh` 时，系统输出以下错误中断了执行：
```bash
Ubuntu linux kernel source not found in /usr/src: /usr/src/linux-source-6.17.0.tar.bz2
assuming the linux kernel source package is not installed
please install the linux kernel source package:
sudo apt install linux-source-6.17.0
```
当尝试使用 `apt` 安装 `linux-source-6.17.0` 时，系统提示找不到该软件包。

---

## 二、 根本原因分析

1. **HWE (Hardware Enablement) 内核特性**：
   - 当前系统的运行内核是 `6.17.0-29-generic`，属于 Ubuntu 的 **HWE 内核**（硬件启用内核），专门为较新硬件提供支持。
   - Ubuntu 的软件源仓库中，**不会**为 HWE 内核打包对应的二进制 `linux-source-6.17.0` 包。这导致脚本直接去寻找 `/usr/src/linux-source-6.17.0.tar.bz2` 时发生错误。

2. **脚本的发行版判断逻辑局限性**：
   - `install.cirrus.driver.sh` 脚本在检测到当前系统为 `Ubuntu` 分支后，强制要求使用 Ubuntu 自带的 `linux-source` 软件包。
   - 若系统是非 Ubuntu 分支（如 Arch, Fedora 等），脚本则会聪明地从 Linux Kernel 官方网站 (`cdn.kernel.org`) 下载对应版本的主线源码包 `linux-6.17.tar.xz` 自行解压。

---

## 三、 解决方案与实施步骤

为了绕过 HWE 内核没有官方源码包的限制，我们直接改变了脚本的执行路径，使其像其他非 Ubuntu 发行版一样，**自动从 kernel.org 官方下载主线 6.17.0 内核源码进行打补丁和编译**。这在 HWE 内核上是完美兼容的。

### 1. 修改安装脚本
我们编辑了 `/home/smz/snd_hda_macbookpro/install.cirrus.driver.sh`，注释了 Ubuntu 的检测逻辑，强制设置 `isubuntu=0`：
```bash
isubuntu=0
# Check if we are dealing with Ubuntu (已绕过以对 HWE 内核使用主线内核源码)
# if [ $(grep '^NAME=' /etc/os-release | grep -c Ubuntu) -eq 1 ]; then
#         isubuntu=1
...
# fi
```

### 2. 运行编译安装
脚本修改后，我们重新在 `snd_hda_macbookpro` 目录下运行了安装命令：
```bash
sudo ./install.cirrus.driver.sh
```

- **脚本自动执行流程**：
  1. 识别到内核版本为 `6.17.0-29-generic`。
  2. 尝试从 kernel.org 下载 `linux-6.17.0.tar.xz`，在发现该版本命名不存在后，**自动回退并成功下载 `linux-6.17.tar.xz` 基础源码包**。
  3. 解压出 `sound/hda` 音频子系统核心源码。
  4. 应用 `patch_cs8409.c.diff` 和 `patch_cs8409.h.diff` 驱动补丁。
  5. 自动调用 GCC 和 Make 编译出 out-of-tree 的 `snd-hda-codec-cs8409.ko` 驱动模块。
  6. 成功将其安装到系统内核模块目录：`/lib/modules/6.17.0-29-generic/updates/codecs/cirrus/`。
  7. 运行 `depmod -a` 刷新内核模块依赖关系。

---

## 四、 编译与安装结果

编译过程极其顺利，无任何报错：
- **安装路径**：`/lib/modules/6.17.0-29-generic/updates/codecs/cirrus/snd-hda-codec-cs8409.ko`
- **模块大小**：约 2.6 MB
- **生效情况**：内核模块依赖关系已刷新。

---

## 五、 后续配置与启用建议

为了让驱动完美生效并驱动您 MacBook Pro 的 Cirrus 音频芯片，请执行以下操作：

1. **重启系统**：
   - 重启系统以自动加载新编译的声卡驱动模块：
     ```bash
     sudo reboot
     ```

2. **验证驱动加载状态**：
   - 重启后，您可以通过以下命令检查驱动是否成功加载：
     ```bash
     lsmod | grep cs8409
     ```
   - 若输出包含 `snd_hda_codec_cs8409`，说明驱动已成功工作！
