# 一种基于协作智能的人机协作不确定性处理方法

**Pai Zheng**<sup>a</sup>，**Shufei Li**<sup>a</sup>，**Junming Fan**<sup>a</sup>，**Chengxi Li**<sup>a</sup>，**Lihui Wang**<sup>(1)b,*</sup>

<sup>a</sup> 香港理工大学工业及系统工程学系，中国香港特别行政区  
<sup>b</sup> 瑞典皇家理工学院生产工程系  

---

## 文章信息

**文章历史：**  
2023年4月15日在线发表  

---

## 摘要

人机协作（Human-Robot Collaboration, HRC）在当今以人为中心的智能制造场景中发挥着关键作用。然而，现有研究对 HRC 不确定性的关注仍较为有限。本文通过融合人类智能与人工智能，提出一种基于协作智能（Collaborative Intelligence, CI）的方法，用于处理三类主要 HRC 不确定性，即人类不确定性、机器人不确定性与任务不确定性。引入细粒度人体数字孪生（Human Digital Twin, HDT）建模方法，以更好的人机协同辅助应对人类不确定性；同时，提出示教学习（Learning from Demonstration, LfD）方法，借助人类智能处理机器人任务不确定性。最后，在一个示意性 HRC 装配任务中验证了所提 CI 方法的可行性。

© 2023 The Authors. Published by Elsevier Ltd on behalf of CIRP. This is an open access article under the CC BY license (http://creativecommons.org/licenses/by/4.0/)

**关键词：**  
人机协作  
制造系统  
协作智能  

---

## 1. 引言

现有自动化系统在应对各类柔性制造任务时已接近瓶颈，例如频繁变更的复杂产品装配或拆解作业 [1]。为满足此类工况下以人为中心的需求，人机协作（HRC）正成为将机器人力量、重复性与精度与人类认知柔性相结合、以实现高水平柔性自动化的活跃研究方向 [2]。尤其近年来，主动式 HRC 研究将互认知、可预测乃至自组织等要素融入人机执行闭环 [3]。在此框架下，人类与机器人智能体能够理解双向操作意图、学习任务操作序列，并以自组织方式执行自适应操作 [4]。尽管如此，真实 HRC 制造场景中仍存在诸多不确定性，阻碍其成功且有效地落地实施。据作者所知，这些 HRC 不确定性可进一步划分为三大类型，即人类不确定性、任务不确定性与机器人不确定性。

人类不确定性最为常见，因为人类具有更高程度的自主性与自发性。其主要表现为异常人类行为 [5]（例如手势突变、与预定义机器人轨迹发生碰撞等），对机器人协作者构成重大挑战。

任务不确定性在许多 HRC 制造场景中亦较普遍，尤其在废旧产品拆解/检测过程中，由于形状、尺寸及物理状态不确定（如锈蚀、松动与缺陷部件、表面污渍及几何变化等）而尤为突出 [6]。

机器人不确定性指其在非结构化工作空间中的失控运动，可能在作业安排上造成混乱，并在人机物理交互中引发安全问题。

为应对上述问题，本文提出一种基于协作智能（CI）的方法，在相应容差设置下处理 HRC 系统中的工业不确定性。根据 Wilson 与 Daugherty [7] 的观点，CI 旨在从“人类辅助机器”与“机器辅助人类”两个视角联合人类智能与人工智能。在 HRC 场景中，所提 CI 方法主要体现在：1）**人类辅助机器人（human-assisting-robot）**——人类训练机器人如何针对新情境调整操作、解释所采纳的决策，并维持任务与机器人不确定性下的知识更新；2）**机器人辅助人类（robot-assisting-human）**——机器人可改善人类作业条件，使人类以灵活决策与工件交互，并在面对人类不确定性时体现以人为中心的需求。依此思路，本文其余部分组织如下：第 2 节阐述基于 CI 的 HRC 系统方法论；第 3 节给出验证可行性的案例研究；第 4 节总结结论与未来工作。

---

## 2. 基于 CI 的 HRC 不确定性处理

为处理各类 HRC 不确定性，所提基于 CI 的系统框架及核心流程如图 1 所示。

首先，可从整体场景感知（包括目标检测、人类动作识别 [8] 及周围环境点云分割）生成自适应 HRC 任务规划。任务规划策略由 HRC 知识图谱（Knowledge Graph, KG）表示，其利用动态图嵌入方法推断不同阶段的人机关系与任务结构，实现团队工作的互理解。在特定情形下，自适应任务规划模块从三方面分配操作：（1）以机器人为中心模式；（2）以人类为中心模式；（3）自适应模式。前两种模式分别将权限赋予机器人与人类，使其基于自身能力执行不同类型任务；最后一种自适应模式允许人类与机器人协同执行操作。在不确定情形下，将触发人体数字孪生（HDT）模型与机器人学习方法。HDT 用于在执行过程中重建细粒度人手与全身姿态。当操作者发现任务不确定性或机器人失控运动时，可通过所提 LfD 方法以灵活示教方式训练机器人并更新其操作技能。当 HDT 在任务过程中捕获人类不确定活动后，机器人可通过基于深度强化学习（Deep Reinforcement Learning, DRL）的方法自优化轨迹，以适应人类异常行为，实现安全高效协作。由此，基于 CI 的 HRC 最大化人机互补性并抵御任务中的不确定情形。

### 2.1. 基于动态图嵌入的自适应 HRC 任务规划

自适应任务规划算法使现有 HRC 系统摆脱预定义指令，增强其在多种制造场景中的适应性。我们前期工作已引入场景图（Scene Graph, SG）与 KG 方法 [4] 为 HRC 系统生成任务规划策略。同时，Raatz 等 [9] 基于 HRC 中的能力与时间假设，利用遗传算法优化任务调度。然而，这些方法侧重于提炼 HRC 配置的时序知识表示，而忽略将信息更新至下一阶段任务安排。

在感知结果基础上，采用 DynGraphGAN 模型 [10] 时序构建并更新 HRC KG，以实现按需任务分配，如图 2 所示。考虑人类行为、检测目标与任务结构等输入，人机-任务-工件-环境（Human-Robot-Task-Workpiece-Environment, HRTWE）节点间存在大量可能关系配置。首先，生成器生成邻接矩阵以表示 HRTWE 节点间关系随时间的演化；更新后的 HRTWE 连接可能引入虚假边。因此，采用连续判别器，通过门控循环单元（Gated Recurrent Unit, GRU）算法区分 HRTWE 节点间的真实与虚假链接。通过连接具有更新嵌入的 HRTWE 节点获得优化后的作业安排与顺序，实现 HRC KG 更新。从机器人节点到任务节点的连接表示机器人动作类型，而从任务节点到工件节点的后续边表示机器人端点与操作目标。多种任务规划策略以可解释的图形式表示。

### 2.2. 基于视觉的细粒度 HDT 建模

基于自适应 HRC 任务规划结果，持续感知并建模人体亦至关重要，可为协作机器人在 HRC 过程中进一步应对人类相关不确定性提供必要信息。既有 HRC 文献致力于感知人体骨架以实现主动碰撞规避 [11]，或识别人类动作意图 [12] 以支持机器人决策。然而，这些方法仅能相对粗粒度地建模操作者，表示保真度不足或识别精度有限。为此，提出并给出一种基于视觉的细粒度 HDT 建模方案（图 3），主要包括两部分：1）细粒度人体姿态重建；2）时空人类行为意图识别。

**细粒度人体姿态重建。** 在 HDT 第一部分，提出一种可同时重建人体细粒度三维稠密网格与骨架关节的深度学习模型。具体而言，操作者的 RGB-D 图像经 ResNet-50 骨干网络提取几何特征，用于回归姿态参数 $\mathbf{u}_{\mathrm{body}} \in \mathbb{R}^{3 \times K}$、形状参数 $\boldsymbol{\beta}_{\mathrm{body}} \in \mathbb{R}^{M}$、三维旋转 $\mathbf{R}_{\mathrm{body}} \in \mathbb{R}^{3 \times 3}$ 及三维平移 $\mathbf{T}_{\mathrm{body}} \in \mathbb{R}^{3}$。姿态与形状参数随后输入 SMPL（Skinned Multi-Person Linear model）人体模型——一种可微函数，输出三角网格 $\mathcal{M}(\mathbf{u}, \boldsymbol{\beta}) \in \mathbb{R}^{3 \times N}$。采用 SMPL 模型可大幅简化重建流程，依托先验模板人体网格，根据估计的姿态与形状参数弯曲、拉伸至目标人体姿态，从而实现实时性能。将预测的全局三维旋转与平移应用于获得正确姿态的人体网格。最终网格顶点经线性回归进一步得到三维骨架点 $\mathbf{X}(\mathbf{u}, \boldsymbol{\beta}) \in \mathbb{R}^{3 \times K}$。为细化操作者手部姿态，ResNet-50 骨干亦回归手部参数，包括姿态参数 $\mathbf{u}_{\mathrm{hand}} \in \mathbb{R}^{3 \times K}$、形状参数 $\boldsymbol{\beta}_{\mathrm{hand}} \in \mathbb{R}^{M}$ 及三维平移 $\mathbf{T}_{\mathrm{hand}} \in \mathbb{R}^{3}$，经 MANO（hand Model with Articulated and Non-rigid defOrmations）处理以增强 SMPL 模型，并促进人类辅助机器人的 LfD。细粒度人体网格重建后，可表示人体精确几何占用，从而显著降低 HRC 过程中的人体感知误差。

**时空人类行为意图识别。** 时空人类行为意图估计属于更高语义层次，对 HRC 场景中构建完整 HDT 至关重要。该模块将 RGB 视频流及关联骨架流作为输入。对 RGB 流，采用 3D ResNet-50 在统一卷积结构中处理时空特征并提取图像特征；同时，骨架流分为头、躯干、臂、腿四个分支，各分支由 ST-GCN（Spatial Temporal Graph Convolutional Network）模型处理。局部身体部位时空特征提取后，聚合网络将其融合为全局骨架特征，再与图像特征融合以判别当前人类行为类型及其是否异常。由于模型仅在正常行为数据上训练，对未见异常行为序列仅能以极低置信度随机猜测，通过对置信度设定容差可消除误检。对正常人类行为，识别的动作意图将传递至机器人以提前进行动作与运动规划；对系统无法正确解析的异常行为，将发出警告通知人类纠正行为，或可选触发 LfD 协议。

### 2.3. 基于 LfD 的人类辅助机器人

针对机器人与任务不确定性，操作者可通过 LfD 将自身经验转化为机器人操作技能，实现灵活自适应的任务执行。

**人在回路机器人控制。** 为更好传递人类专家的工程实践经验，引入从 HDT 提取的手部姿态，实现无缝手势驱动机器人控制系统。如图 4 所示，该方法提取作业者手部姿态并映射至机器人末端执行器位姿，直观使机器人模仿手部运动。作业者左手姿态可通过手掌位置/姿态精确提取，并相应变换为机器人末端执行器位姿。

**示教学习与数据集聚合。** 除显式模仿外，专家演示的机器人运动轨迹被记录为数据集并输入 LfD 算法——一种有望提升机器人技能的学习方法。借助数据集，可隐式提取作业者模式，驱动机器人学习面向不确定性的控制策略，用于后续自适应机器人程序。

本工作中，为近似控制策略函数 $\pi_{\theta}(a|s)$，采用行为克隆（Behavioural Cloning, BC）算法。为适配 LfD 设定，数据轨迹即 $\tau_1, \tau_2, \ldots, \tau_m$ 由环境观测 $s_1^i$ 与机器人运动动作 $a_1^i$ 组成。$s$ 的元素包括任务信息、工作环境、任务条件、人类信息等，$a$ 为人类专家针对相应案例演示的机器人运动。每条示教表示为 $\tau_i = \langle s_1^i, a_1^i, s_2^i, a_2^i, \ldots, s_{n+1}^i \rangle$，整个数据集 $D$ 记为 $D = \{(S_1, A_1), (S_2, A_2), (S_3, A_3), \ldots\}$。本质上，BC 学习旨在近似策略函数的最大似然估计，使模型生成的状态-动作轨迹概率分布（机器人控制策略）与输入轨迹概率分布（人类专家策略）差异最小：

$$\max_{\theta} \mathbb{E}_{(s,a) \sim D}\left[\pi_{\theta}(a|s)\right] \tag{1}$$

$$\text{s.t.} \quad \sum_{a \in \mathcal{A}} \pi_{\theta}(a|s) = 1, \quad \forall s \in \mathcal{S}$$

在最大似然估计的参数优化过程中，训练策略 $\pi_{\theta}(s)$ 以目标函数 $\mathbb{E}_{(s,a) \sim D}\|\pi_{\theta}(s) - a\|^2$ 最小化机器人行为模式与人类示教之间的差异。实践中，$\pi_{\theta}(s)$ 通过深度神经网络近似专家策略，经梯度下降优化以获得最优机器人控制策略函数。

然而，由于样本多样性，LfD 的有效性受专家示教数量与方差限制。因此，经 BC 训练的机器人策略对新出现的任务或机器人不确定性仍缺乏灵活性与适应性。为此，在 LfD 过程中引入带数据集聚合（Dataset Aggregation, DAgger）机制的在线学习方法，其流程如算法 1 所示。借助 DAgger 机制，不仅可处理已有不确定性，亦可应对相似但新的不确定性，使机器人更高效地借助专家智能解决动态制造任务。

### 2.4. 基于 DRL 的机器人辅助人类

针对人类不确定性引起的异常行为，机器人可动态重规划运动以完成 HRC KG 分配的任务，并保障人类安全。本文引入基于 DRL 的方法，实现人类不确定性感知的机器人控制，以达成安全、自适应的 HRC。

从 HDT 检测到的人类不确定性因素嵌入于全身骨架位置、异常行为警告及意图中。实现中，DRL 方法将不确定性因素、运动规划成功率及 HRC 场景安全约束作为优化指标。据此，机器人运动规划过程可表述为马尔可夫决策过程（Markov Decision Process），以优化控制策略 $\pi^*$，强化机器人在状态 $s_t \in \mathcal{S}$ 下选择使累积奖励最大的动作 $a_t \in \mathcal{A}$。DRL 设置如下：

**观测状态（O）** 为人机工作场景的状态表示，由上述 HDT 提取的人类数据组成，包括全身骨架位置（P）、异常行为警告（B）、人类意图（I）及机器人自身状态（M），信息可拼接为状态向量 $O = (P, B, I, M)$。

**动作空间（A）** 指机器人的可达性。实验中结合逆运动学将机器人关节空间变换为末端执行器三维空间坐标 $A = (X, Y, Z) \in \mathbb{R}^3$，使 DRL 算法探索可行轨迹。

**奖励（R）** 综合多项安全运动规划容差设置，包括安全性（如人机距离 $\geq 10\,\mathrm{mm}$）及任务完成指标评价（如执行时间 $\leq 30\,\mathrm{s}$）、任务完成进度与成功率（如目标到达偏差 $\leq 1\,\mathrm{mm}$），记为 $R = (R_s, R_t)$。

同时，采用 Actor-Critic 学习并控制相应动作，最大化期望回报 $J(\theta)$，并在安全意义上优化运动路径：

$$J(\theta) = \mathbb{E}_{\tau \sim p_{\theta}(\tau)}\left[\sum_{t=0}^{T} \gamma^t r_t\right] \tag{2}$$

其中 $p_{\theta}(\tau) = p(s_0)\prod_{t=0}^{T-1}\left[p(s_{t+1}|s_t, a_t)\pi_{\theta}(a_t|s_t)\right]$ 为所有可能状态-动作轨迹 $\tau = (s_0, a_0, s_1, \ldots, a_{T-1}, s_T)$ 上的概率分布；$\gamma_t \in [0, 1]$ 为时刻 $t$ 的折扣因子；$d_{\theta}(s_t)$ 为策略 $\pi_{\theta}$ 下的状态分布。

---

## 3. 案例研究

为说明 HRC 系统应对各类不确定性的性能，在本实验室环境中针对若干 HRC 装配任务开展对比实验，配置包括视觉传感器（Azure Kinect 与 Intel D435）、GPU 服务器（RTX 3080）、一名操作者与协作机器人（UR5）。首先，评估所提 HDT 模型相对其他基线方法在发现人类异常行为与辅助机器人方面的有效性；随后，在若干人类辅助机器人与机器人辅助人类的不确定任务中演示并评估 LfD 与 DRL 控制策略，机器人不确定性则通过急停与人工检查手动处理。

### 3.1. 细粒度 HDT 建模实现精确机器人辅助

所提 HDT 模型性能评估主要包括两部分：（1）人类行为识别精度；（2）三维人体姿态重建误差。对前者，通过 Azure Kinect 采集 RGB-D 数据，捕获包括 5 类以人为中心的 HRC 子任务的活动：（1）拆卸；（2）零件拾取；（3）机器人交接；（4）机器人引导；（5）机器人停止。原始数据修剪清洗后，共保留 939 条有效动作片段用于评估，其中 751 条用于训练、188 条用于测试。对细粒度人体姿态重建评估，分别采用 MPJPE（Mean Per Joint Position Error，平均关节位置误差）指标评价身体与手部姿态重建误差。对比结果列于表 1，表明所提 HDT 建模方案在行为识别与人体姿态重建两方面均优于仅针对单一识别任务的既有方法。评估结果表明，所提 HDT 模型能够基于人类活动识别开展后续机器人辅助动作规划。

### 3.2. 面向 HRC 不确定性的 LfD 与 DRL 实验

**人类辅助机器人：** 基于 RoboMimic [15] 数据集开展 LfD 机器人控制实验，评估集成 DAgger 的 BC 处理 HRC 任务不确定性的有效性，任务包括轴承与底座的拾取、分拣与装配。给定 20 次有效任务试验，将不同数量的专家示教（即 50、100、150、180）输入 DAgger，对应成功率见表 2。结果表明，BC 可有效提取人类操作模式以驱动机器人完成任务；同时，DAgger 与 BC 结合可随人类示教增加显著提升机器人控制策略的鲁棒性。

**机器人辅助人类：** 以安全机器人运动规划成功率识别应对人类不确定性的有效性，具体依据操作者与机器人工作包络之间的重叠距离评估。本研究中，在 Unity3D 高保真环境中设计并执行 Actor-Critic 算法进行机器人安全运动规划，训练 200 万步。不同重叠距离下的成功率见表 3，可大幅改善 HRC 作业的安全运动规划。

---

## 4. 结论与未来工作

为确保 HRC 活动成功实施，本研究提出系统的基于 CI 的方法，整体处理人类、任务与机器人不确定性。主要科学贡献包括：1）所提基于动态图嵌入的自适应 HRC 任务规划方法；2）面向人类不确定性的新型基于视觉 HDT 建模方法；3）分别用于处理任务/机器人不确定性与人类不确定性的 LfD 与 DRL 方法。所提 CI 在若干 HRC 装配任务不确定性处理中的性能已通过初步实验结果报告。未来可探索多模态智能驱动的 HDT 与先进机器人学习机制，以应对含不确定性的多种 HRC 场景。

---

## 利益冲突声明

作者声明，不存在已知的可能影响本文所报告工作的竞争性经济利益或个人关系。

---

## 补充材料

与本文相关的补充材料可在线获取：doi:10.1016/j.cirp.2023.04.057。

---

## 参考文献

[1] Wang L (2022) A Futuristic Perspective on Human-Centric Assembly. Journal of Manufacturing Systems 62:199–201.

[2] Wang L, Gao R, Váncza J, Krüger J, Wang XV, Makris S, Chryssolouris G (2019) Symbiotic Human-Robot Collaborative Assembly. CIRP Annals 68:701–726.

[3] Li S, Zheng P, Liu S, Wang Z, Wang XV, Zheng L, Wang L (2023) Proactive Human-Robot Collaboration: Mutual-Cognitive, Predictable, and Self-Organising Perspectives. Robotics and Computer-Integrated Manufacturing 81:1–30.

[4] Zheng P, Li S, Xia L, Wang L, Nassehi A (2022) A Visual Reasoning-Based Approach for Mutual-Cognitive Human-Robot Collaboration. CIRP Annals 71:377–380.

[5] Fan J, Zheng P, Li S (2021) Vision-Based Holistic Scene Understanding Towards Proactive Human-Robot Collaboration. Robotics and Computer-Integrated Manufacturing 75:102304.

[6] Meng K, Xu G, Peng X, Youcef-Toumi K, Li J (2022) Intelligent Disassembly of Electric-Vehicle Batteries: A Forward-Looking Overview. Resources, Conservation and Recycling 182:106207.

[7] James Wilson H, Daugherty PR (2018) Collaborative Intelligence: Humans and AI are Joining Forces. Harvard Business Review 96(4):114–123.

[8] Li S, Zheng P, Fan J, Wang L (2021) Towards Proactive Human Robot Collaborative Assembly: A Multimodal Transfer Learning-Enabled Action Prediction Approach. IEEE Transactions on Industrial Electronics 69:8579–8588.

[9] Raatz A, Blankemeyer S, Recker T, Pischke D, Nyhuis P (2020) Task Scheduling Method for HRC Workplaces Based on Capabilities and Execution Time Assumptions for Robots. CIRP Annals 69:13–16.

[10] Xiong Y, Zhang Y, Fu H, Wang W, Zhu Y, Yu PS (2019) DynGraphGAN: Dynamic Graph Embedding via Generative Adversarial Networks. Database Systems for Advanced Applications 24:536–552.

[11] Bilberg A, Malik AA (2019) Digital Twin Driven Human-Robot Collaborative Assembly. CIRP Annals 68(1):499–502.

[12] Liu S, Wang XV, Wang L (2022) Digital Twin-Enabled Advance Execution for Human-Robot Collaborative Assembly. CIRP Annals 71(1):25–28.

[13] Kanazawa A, Black MJ, Jacobs DW, Malik J (2018) End-to-End Recovery of Human Shape and Pose. IEEE Conference on Computer Vision and Pattern Recognition, 7122–7131.

[14] Hasson Y, Tekin B, Bogo F, Laptev I, Pollefeys M, Schmid C (2020) Leveraging Photometric Consistency Over Time for Sparsely Supervised Hand-Object Reconstruction. IEEE/CVF Conference on Computer Vision and Pattern Recognition, 571–580.

[15] Mandlekar A., Xu D., Wong J., Nasiriany S., Wang C., Kulkarni R., Fei-Fei L., Savarese S., Zhu Y., Martín-Martín R. (2021) What Matters in Learning From Offline Human Demonstrations for Robot Manipulation. arXiv preprint arXiv:2108.03298.

---

**表 1** 采集 HRC 数据上的对比实验结果

| 方法 | 身体姿态误差 (mm) | 手部姿态误差 (mm) | 行为识别准确率 | 示例 |
|------|------------------|------------------|---------------|------|
| Kanazawa 等 [13] | 67.19 | — | 97.89% | |
| 本文 | 52.14 | — | 98.94% | |
| Hasson 等 [14] | — | 50.95 | — | |
| 本文 | — | 38.41 | — | |

**表 2** 基于 DAgger 的 LfD 对比实验结果

| 演示任务/试验次数 | 50 | 100 | 150 | 180 |
|------------------|-----|-----|-----|-----|
| **成功率** | | | | |
| 拾取 (Picking) | 90% | 96% | 100% | 100% |
| 分拣 (Sorting) | 60% | 82% | 86% | 88% |
| 装配 (Assembly) | 50% | 72% | 82% | 88% |

**表 3** 基于 DRL 的安全运动规划实验结果

| 重叠距离 | 成功率 |
|---------|--------|
| 无重叠 | 98.7% |
| 0–15 cm（蓝色） | 91.7% |
| 15–30 cm（红色） | 85.8% |

---

**算法 1** DAgger 算法伪代码

```
输入：原始数据集 D
输出：最优更新策略 π̂_update，聚合数据集 D_agg
初始化：原始策略 π_0
1  π_i ← π_0
2  For episode i = 1, 2, …, T do
3      使用训练策略 π_i 采样 T 步轨迹
4      对 π_i 未能解决的案例（由专家判定），通过专家 π* 生成/演示数据集 D_i = {(s, π*(s))}
5      聚合数据集 D ← D ∪ D_i
6      通过行为克隆重新训练控制策略函数 π_{i+1}
7  End For
8  Return 根据任务成功率评估确定的最优策略 π_i
```

---

*通讯作者。*  
*电子邮箱：lihui.wang@iip.kth.se (L. Wang)*  
https://doi.org/10.1016/j.cirp.2023.04.057  
0007-8506/© 2023 The Authors. Published by Elsevier Ltd on behalf of CIRP. This is an open access article under the CC BY license (http://creativecommons.org/licenses/by/4.0/)  
CIRP Annals - Manufacturing Technology 72 (2023) 1–4

**图 1** 所提基于 CI 的 HRC 不确定性处理方法  
**图 2** 基于动态图嵌入的自适应 HRC 任务规划  
**图 3** 基于视觉的细粒度 HDT 建模方案  
**图 4** 人手与机器人末端执行器映射示例
