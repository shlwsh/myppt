# 基于阻抗参数预测的上肢康复机器人自适应阻抗控制技术研究

**张玉玲**<sup>1,2</sup>，**李童**<sup>1,2</sup>，**陶浩然**<sup>1,2</sup>，**刘丰臣**<sup>1,2</sup>，**胡冰山**<sup>1,2</sup>，**吴明晖**<sup>3,*</sup>，**喻洪流**<sup>1,2,*</sup>

<sup>1</sup> 上海理工大学健康科学与工程学院，中国上海  
<sup>2</sup> 上海康复器械工程技术研究中心，中国上海  
<sup>3</sup> 上海工程技术大学机械与汽车工程学院，中国上海  

---

**文章信息**
- **收稿日期**：2023年11月03日
- **接受日期**：2023年12月08日
- **发表日期**：2024年01月03日
- **通讯作者**：
  - 吴明晖, wuminghui@sues.edu.cn
  - 喻洪流, yhl_usst@outlook.com
- **引用格式**：
  Zhang Y, Li T, Tao H, Liu F, Hu B, Wu M and Yu H (2024), Research on adaptive impedance control technology of upper limb rehabilitation robot based on impedance parameter prediction. *Front. Bioeng. Biotechnol.* 11:1332689. doi: 10.3389/fbioe.2023.1332689
- **版权声明**：
  © 2024 Zhang, Li, Tao, Liu, Hu, Wu and Yu. 这是一篇根据知识共享署名许可（CC BY）条款分发的开放获取文章。

---

## 摘要

**前言（Introduction）**：随着中国人口老龄化的加剧以及脑卒中（Stroke）导致偏瘫（Hemiplegia）患者人数的不断增加，康复机器人（Rehabilitation Robot）已成为康复训练中不可或缺的一部分。然而，传统的康复机器人无法根据上肢的康复状态自动且自适应地调整训练参数，并将其有效地应用于康复训练中，这限制了康复训练疗效的进一步提高。

**方法（Methods）**：本研究搭建了一个双自由度柔性驱动关节（Two-Degree-of-Freedom Flexible Drive Joint）康复机器人平台。利用遗忘因子递推最小二乘法（Forgetting Factor Recursive Least Squares, FFRLS）来估计人上肢末端的阻抗参数（Impedance Parameters）。并建立了一个奖励函数（Reward Function），用于选择康复机器人的最优刚度参数（Optimal Stiffness Parameters）。

**结果（Results）**：实验结果证实了该自适应阻抗控制（Adaptive Impedance Control）策略的有效性。自适应阻抗控制研究的结果表明，自适应阻抗控制所获得的奖励显著高于恒定阻抗控制（Constant Impedance Control），这与变阻抗控制（Variable Impedance Control）的仿真结果相一致。此外，实验观察到可以根据受试者的不同参与度对机器人的辅助水平进行适当的调整。

**讨论（Discussion）**：该研究结果能够使康复机器人根据患肢的功能状态自适应地改变阻抗参数，从而促进脑卒中患者的上肢康复。在临床治疗中，所提出的控制策略可能有助于针对不同患者调整奖励函数，从而最终提高康复疗效。

**关键词：** 康复机器人，上肢，阻抗识别，自适应阻抗控制，最优刚度

---

## 1 引言

脑卒中（Stroke）已被全球公认为导致残疾和死亡的第二大原因 (Sun et al., 2022)。全球脑卒中的发病率已达到 1370 万新发病例，其中仅中国就占了 394 万例 (Ma et al., 2021; Vasu et al., 2021)。脑卒中的严重程度会影响偏瘫（Hemiplegia）的发生概率，并引起步速、平衡能力、痉挛状态（Spasticity）和关节活动度（Range of Motion）的变化 (Hong et al., 2018)。随着中国老龄化的加剧以及偏瘫脑卒中患者人数的增多，脑卒中的影响日益显著 (Honghai et al., 2022)。目前的康复医师和治疗师人数难以满足众多偏瘫患者的康复训练需求。康复机器人（Rehabilitation Robot）是机器人技术与康复工程融合的产物，可在很大程度上替代康复医师，辅助患者进行康复训练。Fabio 等人证实了利用康复机器人辅助进行手部康复的可行性和有效性 (Vanoglio et al., 2016)。与治疗师进行的传统疗法相比，康复机器人具有诸多优势，包括提供一致的治疗、客观定量的评估以及能够增强康复体验的虚拟现实界面 (Wang et al., 2019)。传统的上肢康复机器人只能重复执行预先编写的康复动作，在主动康复训练（Active Rehabilitation Training）中缺乏根据患肢参与度自适应调整训练参数的能力。因此，机器人辅助康复能够更有效地激发患者完成康复训练的积极性 (Islam et al., 2021)。

上肢阻抗参数（Impedance Parameter）是评估患肢在康复运动中参与程度的有效方法，而阻抗控制（Impedance Control）是康复训练中调节机器人系统所提供辅助水平的广泛应用技术 (Perez-Ibarra et al., 2015)。为了在训练中提供合适的辅助力，相关研究提出了不同的控制策略。Perez Ibarra 等人实施了两种自适应阻抗控制策略，并指出将患者的阻尼参数（Damping Parameters）引入患者阻抗模型中可以增强速度相关性 (Perez-Ibarra et al., 2019)。Krebs 等人开发了一种基于速度、时间或肌电图（Electromyography, EMG）信号等性能指标的阻抗控制算法，以自适应地调整运动过程中机器人提供辅助的持续时间和水平 (Krebs et al., 2003)。为了调整人机系统之间的交互变化，Wolbrecht 将基于模型的自适应阻抗控制与实时转矩计算结合，作为患肢的前馈控制 (Wolbrecht et al., 2008)。Losey 等人提出了一种无传感器力估计组件来评估患者的能力状态，并随后修改了康复平台的训练模式 (Pehlivan et al., 2016)。尽管针对脑卒中患者的抗阻训练已成为促进康复的流行方法，但大多数康复机器人的抗阻训练仅提供恒定阻力，缺乏对患者可变状态的适应性。

一些研究考虑了机器人辅助康复中阻力的自适应调节。许国政利用在线识别的生物阻尼和刚度参数来自动监测受试者肌力的变化，并修改所需的阻力以使其与受试者肌力的变化保持一致 (Xu et al., 2017)。Ott 等人提出了一种用于被动柔性关节（Passive Flexible Joint）康复机器人的控制框架，并设计了阻抗控制器，该控制器在德国航空航天中心（DLR）轻量化机器人上进行了验证，但仅适用于恒定阻抗参数的情况 (Albu-Schaffer et al., 2007)。香港中文大学的研究人员提出了一种用于康复机器人的迭代学习阻抗控制器，为柔顺驱动康复机器人变阻抗控制中的动态稳定性提供了理论依据 (Li et al., 2018)。Mojtaba Sharifi 团队提出了一种与自适应双边阻抗控制器相关的非线性模型，该模型适用于多自由度遥操作机器人系统（Multi-Degree of Freedom Tele-robotics System）中患者与康复医师交互的各种协作遥康复（Collaborative Tele-rehabilitation） (Sharifi et al., 2017)。自适应阻抗控制也在外骨骼康复机器人（Exoskeleton Rehabilitation Robots）中发挥了作用，其采用了非线性时延扰动观测器（Nonlinear Time-Delay Disturbance Observer） (Brahmi et al., 2021)。在当前的康复机器人研究中，现有的人体阻抗参数识别方法很难实时识别出人上肢的阻抗参数，并将其动态、有效地应用于康复训练中。

在康复训练过程中，越来越多的人考虑了可变阻抗对康复训练的重要性，以及利用人机系统之间的交互力来对患者状态进行准确评估。然而，目前的训练模式仍无法充分调动患者的主动参与。如果康复机器人能够识别上肢末端的阻抗参数，并根据患者的状态通过自适应调节康复机器人的阻抗参数来修改康复策略，则可以显著提高康复效率，这更有利于患肢的康复。

在本研究中，为了提高上肢康复机器人的有效性，搭建了机器人康复平台，并提出了一种自适应阻抗控制策略，该策略可根据受试者的参与度自适应改变阻抗参数。本文的结构安排如下：第二部分描述了为后续研究构建的康复机器人机械平台及自适应阻抗控制策略。第三部分展示了仿真验证和实验结果。第四部分对结果进行了讨论，第五部分得出了研究结论。

---

**图 1** 柔性上肢康复机器人。  
（图片中文字：六维力传感器（Six-dimensional Force Sensor））

---

## 2 材料与方法

### 2.1 康复机器人系统

#### 2.1.1 机械平台与控制系统
如图 1 所示，搭建了柔性关节康复机器人平台。基于双自由度柔性关节上肢康复机器人，采用柔性驱动器（Flexible Driver）串联耦合了两个连杆。连杆 A 和 B 由碳纤维管支撑，具有轻质高强材料的优点。末端力传感器采用了宇航精工（SRI）的六轴（力和力矩）力传感器 M3714A，能够同时测量笛卡尔坐标系末端的力和力矩。机器人关节采用 Seenpin 的 XGA 系列之一。该关节集成了电机、减速器、弹性体、控制器和多种传感器。该关节具有高功率密度、高转速和高转矩输出的特点。

平台采用外部总线控制。上位机与关节通过网线连接。两个关节与上位机之间的信号传输通过以太网通信实现。控制系统支持 MATLAB 一站式开发环境，降低了实验底层硬件调试和网络构建的时间成本。关键关节参数如表 1 所示。实验中采用的关节刚度为 170 N·m/rad。

**表 1** XGA 关键关节参数。
| 配置 (Configuration) | XGA |
| :--- | :--- |
| 最大转矩 (Maximum torque) | 19 N·m |
| 最大转速 (Maximum speed) | 28.5 RPM |
| 重量 (Weight) | 550 g |
| 传动比 (Transmission ratio) | 766.222:1 |
| 通信 (Communication) | 以太网 (Ethernet) |
| 传感器 (Sensor) | 检测转矩、加速度、温度和电流 (Detect torque, acceleration, temperature and current) |

---

**图 2** 双自由度柔性关节上肢康复机器人训练示意图。

---

#### 2.1.2 机器人运动学模型
双自由度柔性关节上肢康复机器人的训练示意图可简化为图 2。该上肢康复机器人由两个连杆（连杆 A 和连杆 B）组成，其中质量 $m_1 = 1 \text{ kg}$，$m_2 = 0.7 \text{ kg}$，长度 $l_1 = l_2 = 0.4 \text{ m}$，质心距离 $l_{c1} = l_{c2} = 0.2 \text{ m}$。$l_{c1}$ 和 $l_{c2}$ 分别是两个连杆的质心。$l_1$ 和 $l_2$ 分别是两个连杆的长度。假设两个连杆质量分布均匀，连杆 A 和 B 的中点分别作为两个连杆的质心，$q_1, q_2$ 分别代表连杆 A 和连杆 B 的关节角。以点 O 为原点，建立双自由度上肢康复机器人的正运动学（Forward Kinematics）公式如下：
$$x_p = l_1 \cos q_1 + l_2 \cos(q_1 + q_2) \tag{1}$$
$$y_p = l_1 \sin q_1 + l_2 \sin(q_1 + q_2) \tag{2}$$
其中，$x_p$ 和 $y_p$ 是机器人末端笛卡尔空间的水平和垂直坐标。

由正运动学推导出的逆运动学（Inverse Kinematics）公式为：
$$q_1 = \text{atan2}\left(-l_2 s_2 x_e + (l_1 + l_2 c_2)y_e, (l_1 + l_2 c_2)x_e + l_2 s_2 y_e\right) \tag{3}$$
$$q_2 = \pm \text{acos}\left(\frac{x_p^2 + y_p^2 - l_1^2 - l_2^2}{2l_1l_2}\right) \tag{4}$$
其中 $s_2 = \sin q_2$，$c_2 = \cos q_2$，$(x_e, y_e)$ 为末端坐标位置。

### 2.2 自适应阻抗控制策略

基于人体阻抗参数识别的自适应阻抗控制框图如图 3 所示，主要包括患肢阻抗参数估计（Impedance Parameter Estimation）、刚度优化（Stiffness Optimization）、阻抗控制器（Impedance Controller）、轨迹规划（Trajectory Planning）、逆运动学和机器人控制器等。机器人首先确定康复任务，选择任务节点，通过五次多项式插值（Quintic Polynomial Interpolation）对康复机器人进行轨迹规划，得到期望的末端轨迹 $\mathbf{X}_d$，然后通过逆运动学计算关节期望轨迹 $\mathbf{q}_d$ 作为控制器的输入。关节控制器的位置通过 PD（Proportional-Derivative）控制进行调节。接下来，利用 FFRLS 在线识别患肢的阻抗参数 $\mathbf{K}_h$。同时也获取了上肢末端的阻抗参数。最优阻抗 $\mathbf{K}_r$ 通过公式 (14) 和 (15) 计算，将 $\mathbf{K}_r$ 输入阻抗控制器得到末端位置修正量 $\Delta\mathbf{x}$，从而将期望轨迹 $\mathbf{X}_d$ 修正为参考轨迹 $\mathbf{X}_r$。上述过程即为自适应阻抗控制流程。

---

**图 3** 基于人体阻抗参数识别的自适应阻抗控制框图。  
**图 4** 人上肢的阻抗模型。  
（图 4 中文字：上臂（The Upper Arm），前臂（The Forearm））

---

#### 2.2.1 上肢阻抗参数识别
一些研究将机械阻抗控制视为人类运动控制的一种重要方法。复杂的人臂模型被简化为笛卡尔阻抗模型（Cartesian Impedance Model）。手臂的内力模型被转换到水平面内人手肢体的末端。因此，刚度（Stiffness）、阻尼（Damping）和惯性/质量（Mass）成为人上肢末端机械阻抗的三个分量，分别与力、位置、速度和加速度相关。为了利用该模型在康复系统中模拟人机交互，有必要对人手臂末端的阻抗进行估计。在本节中，建立了人上肢模型，并利用 FFRLS 对人上肢末端的阻抗进行了估计。

由于肌肉骨骼系统被假定为质量-弹簧-阻尼系统，因此采用质量-弹簧-阻尼系统的动力学运动方程作为测量上肢动态阻抗的数学模型。上肢的阻抗模型如图 4 所示，该模型可用于测量运动过程中上肢的动态阻抗。当上肢处于稳定状态时，人上肢末端在笛卡尔坐标系中的阻抗模型可以表示如下：
$$M\ddot{X} + B\dot{X} + KX = F \tag{5}$$
其中，$M, B, K \in \mathbb{R}^{3\times 3}$ 分别表示人上肢末端的惯性参数（Inertial Parameters）、阻尼参数和刚度参数，$X \in \mathbb{R}^3$ 和 $F \in \mathbb{R}^3$ 分别表示上肢末端在笛卡尔坐标系中的位置和受力。上肢末端的位置由关节编码器（Joint Encoder）测量，关节位置通过运动学方程计算，末端受力由六维力传感器测量。

在康复训练过程中，人上肢的阻抗参数是可变的。随着康复周期的变化，人上肢的阻抗参数变化较为缓慢。对于这种慢时变系统（Slow Time-varying System），递推最小二乘（Recursive Least Squares, RLS）法存在其局限性。随着 $k$ 的增加，协方差矩阵 $P(k)$ 和增益向量 $K(k)$ 的值减小，导致对参数估计值 $\hat{\theta}_k$ 的修正能力下降，新输入输出数据对对 $\hat{\theta}_k$ 的修正作用越来越小。此外，参数估计误差的精度降低，RLS 方法无法持续在线跟踪系统参数的变化。为了克服这一缺点，采用了遗忘因子递推最小二乘法（FFRLS） (Long et al., 2023)。

选取代价函数为：
$$J = \sum_{k=1}^{L} \lambda^{L-k} \left[ y(k) - \varphi^{T}(k)\hat{\theta} \right]^2 \tag{6}$$
其中，$\lambda$ 为遗忘因子（Forgetting Factor，且 $0 < \lambda \le 1$），这意味着输入和输出数据被赋予了随时间变化的权重系数。第 $k$ 组最新输入和输出数据的权重为 1，而之前所有 $n$ 组的权重系数为 $\lambda^n$。原始数据的权重系数越小，遗忘程度就越大。随着 $k$ 的增加，$P(k)$ 和 $K(k)$ 的值不会失去修正 $\hat{\theta}_k$ 的能力，即对系统参数识别的影响不会减小。

带遗忘因子的递推最小二乘法递推公式如下：
$$\begin{cases}
\hat{\theta}(k) = \hat{\theta}(k-1) + K(k)\left[ y(k) - \varphi^{T}(k)\hat{\theta}(k-1) \right] \\
K(k) = \frac{P(k-1)\varphi(k)}{\lambda + \varphi^{T}(k)P(k-1)\varphi(k)} \\
P(k) = \frac{1}{\lambda} \left[ I - K(k)\varphi^{T}(k) \right] P(k-1)
\end{cases} \tag{7}$$

初始值 $P(0)$、$\hat{\theta}(0)$ 的选择方法与 RLS 相同。遗忘因子 $\lambda$ 的值通常是接近于 1 的正实数，一般大于 0.9。在线性系统中，遗忘因子通常取为 $0.95 \le \lambda \le 1$。当 $\lambda = 1$ 时，FFRLS 退化为普通的 RLS。

#### 2.2.2 最优刚度选择
在康复的不同阶段，患者需要不同的训练模式，这就需要康复机器人提供特定的刚度 (Zou et al., 2022)。为了提高机器人辅助康复治疗的有效性，机器人控制器必须鼓励患者的主动参与 (Luo et al., 2017; Guo et al., 2022a)。同时，如果患者的运动偏离了期望的运动，就应该对其进行约束。因此，设置奖励函数来平衡患者的参与度和轨迹偏移误差。奖励函数定义为：
$$r = a_1 F_h V - \|a_2 e\|^2 = (a_1 F_x V_x - a_2^2 e_x^2) + (a_1 F_y V_y - a_2^2 e_y^2) \tag{8}$$
其中，$F_h V$ 为患者的输出功率（Output Power），用于衡量患者的努力程度；$e_x$ 和 $e_y$ 是笛卡尔空间末端的轨迹误差；$a_1$ 和 $a_2$ 是用于平衡患者努力程度与轨迹偏差的参数。奖励值越高，表明患者在康复训练中的参与度越高，且与期望轨迹的偏差越小。
$$F_x = K_{hx} (x_d - x) - B_{hx} V_x$$
$$F_y = K_{hy} (y_d - y) - B_{hy} V_y \tag{9}$$

将公式 (9) 代入公式 (8) 得到：
$$r = \left( a_1 K_{hx} e_x V_x - a_1 B_{hx} V_x^2 - a_2^2 e_x^2 \right) + \left( a_1 K_{hy} e_y V_y - a_1 B_{hy} V_y^2 - a_2^2 e_y^2 \right) \tag{10}$$

奖励函数 $r$ 分别对 $e_x$ 和 $e_y$ 求偏导数：
$$\frac{\partial r}{\partial e_x} = a_1 K_{hx} V_x - 2 a_2^2 e_x$$
$$\frac{\partial r}{\partial e_y} = a_1 K_{hy} V_y - 2 a_2^2 e_y \tag{11}$$

为了最大化奖励函数，令 $\frac{\partial r}{\partial e_x} = 0$，$\frac{\partial r}{\partial e_y} = 0$，可得：
$$\hat{e}_x = \frac{a_1 K_{hx} V_x}{2 a_2^2}$$
$$\hat{e}_y = \frac{a_1 K_{hy} V_y}{2 a_2^2} \tag{12}$$

在康复训练过程中，康复机器人的惯性、运动加速度和速度都非常小。惯性力和科氏力（Coriolis Force）可以安全地忽略。此外，与康复机器人的关节转矩相比，摩擦力也被发现是可以忽略的。假设患肢末端在短时间内达到稳定状态，则康复机器人的力等于患者施加的力：
$$F_{rx} + F_x = 0$$
$$F_{ry} + F_y = 0 \tag{13}$$
从而有：
$$(K_{rx} + K_{hx}) e_x - (B_{rx} + B_{hx}) V_x = 0$$
$$(K_{ry} + K_{hy}) e_y - (B_{ry} + B_{hy}) V_y = 0 \tag{14}$$

将公式 (12) 代入公式 (14)，可获得康复机器人阻抗控制的最优刚度：
$$\hat{K}_{rx} = \frac{2 a_2^2 (B_{rx} + B_{hx})}{a_1 K_{hx}} - K_{hx}$$
$$\hat{K}_{ry} = \frac{2 a_2^2 (B_{ry} + B_{hy})}{a_1 K_{hy}} - K_{hy} \tag{15}$$

$\hat{K}_{rx}$ 和 $\hat{K}_{ry}$ 是康复机器人阻抗控制的最优刚度，它最大化了患肢康复训练过程中的奖励函数。如公式 (15) 所示，机器人阻抗控制的最优刚度与患肢的刚度成反比，这有利于根据患者在康复训练中的不同需求和实际状态提供相应的反馈并调整参数。当患肢的能力降低时，康复机器人的辅助力会增加。参数 $a_1$ 的值越大，康复机器人的最优刚度值就越小。换句话说，在康复训练中应更加注重患肢的主动出力，以满足奖励函数的定义。刚度参数的大小显然与康复机器人的辅助水平相关 (Honghai et al., 2022)。

当患肢的参与度极低（$K_{hx} \approx 0, K_{hy} \approx 0$）时，康复机器人的刚度会趋于无穷大。为了避免这种情况，对阻抗控制的刚度设置了以下限制。$K_{\min}$ 和 $K_{\max}$ 分别是康复机器人控制器能够提供的最小和最大刚度。
$$K_r = \max \left\{ K_{\min}, \min \left\{ K_{\max}, \hat{K}_r \right\} \right\} \tag{16}$$

---

**图 5** 阻抗识别实验平台。  
（图 5 中文字：手柄（Grip），橡皮筋（Rubber Band），六维力传感器（Six-dimensional Force Sensor））

---

## 3 实验结果

为了验证本研究提出的阻抗识别算法和自适应阻抗控制技术，本节开展了三组实验：阻抗参数识别验证实验、变阻抗控制仿真实验，以及自适应阻抗控制验证实验。

### 3.1 阻抗参数识别验证
如图 5 所示，搭建了阻抗识别实验平台。康复机器人的末端手柄连接到弹性体（橡皮筋）上。弹性体的另一端固定，且弹性体在一定范围内具有固定的刚度。与手柄相连的末端六维力传感器可以测量笛卡尔空间三个方向的力和力矩。笛卡尔坐标系建立在第一关节的旋转中心处。由于该实验平台属于桌面型上肢康复机器人，因此仅建立了 $x$ 和 $y$ 方向的坐标系。

由于关节的最大转矩为 19 N·m，因此阻抗参数识别实验中不能使用刚度过大的弹簧。因此，实验中选择的橡皮筋具有 25 N/m 的弹性刚度。通过改变橡皮筋的股数、刚度和位置来改变末端刚度参数。首先，选择两股橡皮筋进行阻抗参数识别实验。末端初始点为 (0.4 m, 0)，运动规划目标点为 (0.3 m, 0)。轨迹规划采用五次多项式插值法。在实验初始状态下，弹性橡皮筋刚好绷紧，末端的力传感器可以检测到弹性体的拉力，该弹性体与另一固定端的弹性体处于同一平面。规划的运动轨迹是从点 A (0.4 m, 0) 移动到点 B (0.3 m, 0)。

在 $x$ 方向上采用五次多项式的轨迹规划结果如图 6 所示。末端的位置、速度和加速度从上到下在图 6A 中画出。可以看出，初始状态和末期状态的速度和加速度均为 0。该方法可以成功避免康复机器人在启动和停止过程中对电机产生冲击。同时，平滑的轨迹也使康复过程更加平稳，有利于患肢的康复。通过逆运动学获得了两个关节的期望轨迹，如图 6B 所示，将 $q_{d1}$ 和 $q_{d2}$ 输入机器人的关节伺服控制器，作为两个关节控制器的位置控制量。

弹性体末端与康复机器人之间的交互力 $F$ 由力传感器检测。实时关节角 $q$ 通过康复机器人的编码器获得。两个关节的实时角度 $q$ 通过正运动学得到末端位置。末端速度通过微分获得。输入末端位置、末端速度和末端交互力，利用最小二乘法（LS）、RLS 和 FFRLS 估计了末端阻抗参数。阻抗识别实验的输入参数如图 7A 所示。通过 LS、RLS 和 FFRLS 估计的末端阻抗参数如图 7B 所示。蓝色、红色和黄色线条分别代表 LS、RLS 和 FFRLS 估计的末端刚度，而紫色线条代表实际刚度值。这表明 RLS 和 LS 在 3s 后才开始收敛，明显慢于 FFRLS。

---

**图 6** (A) 笛卡尔空间中的 $X$ 方向轨迹规划。(B) 关节 1 和关节 2 的期望轨迹。

---

阻抗参数识别误差如表 2 所示。由于 RLS 和 LS 在前几秒的刚度估计是发散的，因此不具有统计学意义。表 2 中的所有数据都是根据 FFRLS、RLS 和 LS 的刚度识别曲线计算得到的。FFRLS ($\lambda = 0.95$)、RLS 和 LS 进行刚度识别的均方根误差（Root-Mean-Square Error, RMSE）分别为 1.5900 N/m、1.6075 N/m 和 2.0703 N/m。最大刚度识别误差分别为 1.5900 N/m、1.6859 N/m 和 2.6888 N/m。结果表明，FFRLS ($\lambda = 0.95$) 刚度估计的均方根误差和最大误差均小于 RLS 和 LS。因此，FFRLS 的刚度估计效果最好。

**表 2** 阻抗参数识别误差。
| 识别刚度 (Identification stiffness) | 均方根误差 (RMS(N/m)) | 最大误差 (MAX(N/m)) |
| :--- | :--- | :--- |
| FFRLS ($\lambda = 0.95$) | 1.5900 | 1.5900 |
| RLS | 1.6075 | 1.6859 |
| LS | 2.0703 | 2.6888 |

---

**图 7** (A) 阻抗识别实验的输入参数。(B) 阻抗识别结果。  
（图 7B 中文字：刚度（Stiffness(N/m)），实际值（actual），时间（Time(s)））

---

### 3.2 变阻抗控制仿真验证
上述阻抗控制的可行性在 MATLAB 2023a 中进行了仿真验证。为了验证系统在外部干扰下的刚度控制能力，我们通过修改阻抗参数模拟了健康受试者上肢末端的刚度，从而改变系统的刚度行为。这展示了其对阻抗特性的控制能力。仿真平台基于实际平台参数搭建。运动学模型的参数设置如下：$m_1 = 1 \text{ kg}$，$m_2 = 0.7 \text{ kg}$，$I_1 = 0.25 \text{ kg}\cdot\text{m}^2$，$I_2 = 0.1 \text{ kg}\cdot\text{m}^2$，$l_1 = l_2 = 0.4 \text{ m}$，$l_{c1} = l_{c2} = 0.2 \text{ m}$；其中 $m_1$ 和 $m_2$ 分别是连杆 A 和 B 的质量。$l_1$ 和 $l_2$ 分别是连杆 A 和 B 的长度。$l_{c1}$ 和 $l_{c2}$ 分别是连杆 A 和 B 的质心到旋转中心的距离。$I_1$ 和 $I_2$ 分别是连杆 A 和 B 的转动惯量（Moments of Inertia）。参数 $g$ 表示重力加速度，取为 $9.8 \text{ m/s}^2$。控制刚度参数确立如下：
$$K_d(t) = \text{diag}\{10 + 10 \sin(2t), 10 + 10 \cos(2t)\} \tag{17}$$

笛卡尔坐标系的末端负载确立如下：
$$f_{e1} = 2 \sin(2t), f_{e2} = 2 \cos(2t) \tag{18}$$

也就是说，刚度在一定范围内以固定频率变化，这反映在机械臂末端在平面内不同方向上刚度的变化。如图 8 所示，实线和虚线分别是机器人的两个不同关节随时间变化的刚度（实际对应关节力矩阻抗表现）曲线。

---

**图 8** 机器人两个不同关节的刚度。

---

在上述外部条件下，施加相应的负载力。期望由此产生的力矩输出和误差性能能够反映刚度控制性能。图 9A 和 9B 分别是由机器人两个关节阻抗控制引起的位置跟踪误差（Position Tracking Error）和误差变化率（即导数变化）曲线。如图 9A 所示，面对外部环境施加的负载，参考位置的跟踪误差 $e_1$ 收敛在以 0 为平衡点的极小邻域内，稳态误差不超过 0.06。该结果表明当平台面对可变阻抗时，自适应阻抗控制策略是有效的。如图 9B 所示，参考位置跟踪误差的一阶导数 $\dot{e}_1$ 逐渐收敛于 0，这表明平台的位置误差在可变负载力作用下逐渐稳定。

图 10 是两个关节的输出转矩随时间变化的图，它显示了关节自身输出相应的转矩以抵消外部输入的转矩。

---

**图 9** (A) 阻抗控制引起的位置跟踪误差。(B) 阻抗控制引起的误差导数变化曲线。  
**图 10** 两个关节的输出转矩。

---

### 3.3 自适应阻抗控制验证
为了验证本研究中的自适应阻抗控制系统，招募了一名健康男性受试者（24 岁，身高 1.88 m，体重 84 kg）参与实验，如图 1 所示。该研究通过了上海健康医学院伦理委员会的审查，伦理批件号为 2022-ZYXM4-04-420300197109053525。实验设计如下：康复任务要求受试者将上肢末端从 A (0.5 m, 0) 移动到 C (0.2 m, 0)，每次训练时间为 10s。在恒定阻抗控制和自适应阻抗控制条件下，针对患肢不同的参与度（即不同的阻抗参数）开展了实验。在 $x$ 方向上采用五次多项式规划的轨迹结果如图 11A 所示，包括末端自上而下的位置、速度和加速度。在起点 A 和终点 C 处，速度和加速度均为 0。这种方法有效减轻了康复机器人在启动和停止阶段对电机的冲击。此外，设计良好的轨迹增强了整个康复过程的稳定性，从而促进了患肢的恢复。两个关节的期望轨迹通过逆运动学确定，如图 11B 所示。将 $q_{d1}$ 和 $q_{d2}$ 输入康复机器人的关节伺服控制器，作为两个关节控制器的位置控制量。

将参数设置为 $a_1 = 10, a_2 = 2$，使人上肢在康复策略中所做工作的权重更高。最优刚度的上限设为 $K_{\max} = 400 \text{ N/m}$，下限设为 $K_{\min} = 10 \text{ N/m}$。阻抗限制可以更好地保护患肢，提高康复训练的安全性。不同参与度条件下的实验结果如图 12 所示，包括末端轨迹、人机交互力、辨识出的上肢末端阻尼、上肢末端刚度以及机器人的最优刚度。图 12A 和 12B 分别是受试者高参与度和低参与度的结果。当受试者在上肢康复训练中的参与度较高时，其上肢末端的刚度较高，而机器人的最优刚度较低，这表明机器人的辅助程度较低。相反，当上肢康复训练中的参与度较低、上肢末端刚度较低时，机器人的最优刚度较高，这表明需要更大程度的机器人辅助。

---

**图 11** (A) $X$ 方向轨迹规划。(B) 关节 1 和关节 2 的期望轨迹。  
**图 12** 不同参与度条件下的实验结果。(A) 高参与度实验结果。(B) 低参与度实验结果。

---

恒定阻抗控制（$K_d = 100 \text{ N/m}$）和自适应阻抗控制的末端轨迹和交互力如图 13A 所示。在这两项实验中，自适应阻抗和恒定阻抗的交互力一致显示出患肢的高水平参与。如图 13B 中的奖励函数所示，这证明了在康复训练过程中，自适应阻抗控制获得的奖励显著高于恒定阻抗控制（$K_d = 100 \text{ N/m}$）获得的奖励。这证实了本研究提出的自适应阻抗控制策略的有效性和鲁棒性。

奖励函数的分析如表 3 所示。恒定阻抗控制（$K_d = 100 \text{ N/m}$）和自适应阻抗控制的平均奖励分别为 0.0152 和 0.8514，最大奖励分别为 0.0471 和 13.3437。

**表 3** 奖励函数分析。
| 控制策略 (Control strategy) | 平均奖励 (The average reward) | 最大奖励 (The maximum reward) |
| :--- | :--- | :--- |
| 恒定阻抗控制 ($K_d = 100 \text{ N/m}$) | 0.0152 | 0.0471 |
| 自适应阻抗控制 | 0.8514 | 13.3437 |

---

**图 13** (A) 末端轨迹与交互力。(B) 奖励函数。

---

## 4 讨论

在仿真实验中观察到，当平台面对变化的外部负载力且误差被控制在狭窄范围内时，机械臂末端相应的转矩输出可以抵抗对应的负载力，证明了自适应阻抗控制策略的有效性。该仿真的局限性在于，我们自己设定了刚度变化规律来模拟实际情况。然而，按需辅助（Assist-As-Needed）策略的输出刚度值是根据患肢的刚度进行优化的。在随后的研究中，我们将把按需辅助康复程序纳为考量，以优化实验设置。

由于阻抗控制通过在交互力和参考轨迹之间建立数学关系来实现机器人运动的调节和稳定 (Al-Shuka et al., 2018)，因此我们对比了自适应阻抗控制与恒定阻抗控制以进行实验验证。通过设置不同的参数来模拟不同水平的参与度，获得的结果与健康受试者参与的实验一致。我们还发现，在 $K_d = 100 \text{ N/m}$ 时，自适应阻抗控制的平均奖励和最大奖励均高于恒定阻抗控制。Luo、Duan 和 Berenice 对恒定阻抗控制和可变阻抗控制进行了对比仿真实验 (Luo et al., 2017; Maldonado et al., 2015; Duan et al., 2018)。在这些研究中，Luo 使用了不同水平的模拟刚度值，Duan 对比了不同环境下的两种方法，而 Berenice 模拟了不同任务模式下受试者的情况。他们的研究结果表明，与恒定阻抗控制相比，自适应阻抗控制具有更好的力跟踪性能和促进奖励的潜力。自适应阻抗控制技术可应用于各种条件下的机器人辅助康复系统，这进一步证明了自适应阻抗控制在康复训练中的有效性。Ibarra 和 Wang 也提出了自适应阻抗控制策略，考虑了患者对踝关节康复机器人的影响，并实时调整机器人辅助力 (Perez-Ibarra et al., 2015; Wang et al., 2019)。在外骨骼（Exoskeleton）的训练过程中也考虑了介入控制 (Guo et al., 2022b)。

该控制策略为实现最佳主动训练效果以及为患者创造可控的阻抗环境提供了巨大潜力。自适应控制策略可以提高人机交互性能以及上肢康复机器人控制系统的有效性。此外，所提出的策略也可以应用于不同的康复机器人。在我们的后续研究中，我们将在更多的健康受试者和患者中测试所提出的方法，以便根据不同的参与度准确识别差异，并且我们还将把该控制系统应用于可穿戴辅助设备（Wearing Assistive Devices）以测试其有效性，最终提高康复疗效。

---

## 5 结论

本研究提出了一种新型上肢康复机器人自适应阻抗策略。通过在康复过程中对不同上肢参与度下的表现进行对比，证实了最优刚度控制的有效性。此外，还对自适应阻抗控制和恒定阻抗控制的康复表现进行了对比。仿真和实验充分验证了该自适应阻抗控制策略的有效性。

### 数据可用性声明（Data availability statement）
本研究所展示的原始贡献已包含在文章/补充材料（Supplementary Material）中，进一步的问询可直接联系通讯作者。

### 伦理声明（Ethics statement）
涉及人类受试者的研究已获得上海健康医学院伦理委员会的审查批准。该研究按照当地立法和机构要求进行。参与本研究的受试者的法定监护人/近亲提供了书面知情同意书。已获得个人书面知情同意，允许发表本文中包含的任何可能识别身份的图像或数据。

### 作者贡献（Author contributions）
- **YZ**（张玉玲）：项目管理，监督，撰写-审校与编辑。
- **TL**（李童）：数据管理，形式分析，验证，撰写-初稿。
- **HT**（陶浩然）：数据管理，形式分析，方法学，撰写-初稿。
- **FL**（刘丰臣）：形式分析，撰写-审校与编辑。
- **BH**（胡冰山）：资金获取，项目管理，撰写-审校与编辑。
- **MW**（吴明晖）：监督，撰写-审校与编辑。
- **HY**（喻洪流）：项目管理，资源提供，监督，撰写-审校与编辑。

### 资助（Funding）
作者声明本研究、撰写及/或发表获得了资助支持。

### 致谢（Acknowledgments）
作者衷心感谢国家重点研发计划（项目编号：2022YFC3601400）和上海市生物医药科技支撑项目（项目编号：22S31901400）的资助支持。

### 利益冲突（Conflict of interest）
作者声明，该研究是在不存在任何可能被解释为潜在利益冲突的商业或财务关系的情况下进行的。

### 出版商说明（Publisher’s note）
本文中表达的所有观点仅代表作者个人观点，并不一定代表其附属机构、出版商、编辑或审稿人的观点。本文中可能评估的任何产品，或其制造商可能做出的任何声明，均不受出版商的保证或认可。

### 补充材料（Supplementary material）
本文的补充材料可以在以下网址在线获取：[Supplementary Material](https://www.frontiersin.org/articles/10.3389/fbioe.2023.1332689/full#supplementary-material)

---

## 参考文献 (References)

- Albu-Schaffer, A., Ott, C., and Hirzinger, G. (2007). A unified passivity based control framework for position, torque and impedance control of flexible joint robots [一种用于柔性关节机器人位置、转矩和阻抗控制的统一无源性控制框架]. *Springer Trac. Adv. Ro* 28, 5–21. doi:10.1177/0278364907073776
- Al-Shuka, H. F. N., Leonhardt, S., Zhu, W.-H., Song, R., Ding, C., and Li, Y. (2018). Active impedance control of bioinspired motion robotic manipulators: an overview [仿生运动机器人机械臂的主动阻抗控制：综述]. *Appl. Bionics Biomechanics* 2018, 1–19. doi:10.1155/2018/8203054
- Brahmi, B., Driscoll, M., El Bojairami, I. K., Saad, M., and Brahmi, A. (2021). Novel adaptive impedance control for exoskeleton robot for rehabilitation using a nonlinear time-delay disturbance observer [基于非线性时延扰动观测器的康复外骨骼机器人新型自适应阻抗控制]. *Isa T* 108, 381–392. doi:10.1016/j.isatra.2020.08.036
- Duan, J., Gan, Y., Chen, M., and Dai, X. (2018). Adaptive variable impedance control for dynamic contact force tracking in uncertain environment [不确定环境下动态接触力跟踪的自适应变阻抗控制]. *Robotics Aut. Syst.* 102, 54–65. doi:10.1016/j.robot.2018.01.009
- Guo, Y. D., Wang, H. P., Tian, Y., and Caldwell, D. G. (2022a). Task performance-based adaptive velocity assist-as-needed control for an upper limb exoskeleton [基于任务性能的上肢外骨骼自适应速度按需辅助控制]. *Biomed. Signal Proces.*, 73. doi:10.1016/j.bspc.2021.103474
- Guo, Y. D., Wang, H. P., Tian, Y., and Xu, J. Z. (2022b). Position/force evaluation based assist-as-needed control strategy design for upper limb rehabilitation exoskeleton [基于位置/力评估的上肢康复外骨骼按需辅助控制策略设计]. *Neural Comput. Appl.* 34 (15), 13075–13090. doi:10.1007/s00521-022-07180-x
- Hong, Z., Sui, M., Zhuang, Z., Liu, H., Zheng, X., Cai, C., et al. (2018). Effectiveness of neuromuscular electrical stimulation on lower limbs of patients with hemiplegia after chronic stroke: a systematic review [神经肌肉电刺激对慢性脑卒中后偏瘫患者下肢疗效的系统综述]. *Archivees Phys. Med. rehabilitation*, 1532–1821. doi:10.1016/j.apmr.2017.12.019
- Honghai, L., Zhouping, Y., and Lianqing, L. (2022). “Intelligent robotics and applications” [“智能机器人及其应用”], in *15th International Conference, ICIRA 2022*, Harbin, China, August, 2022.
- Hussain, S., Xie, S. Q., and Jamwal, P. K. (2013). Adaptive impedance control of a robotic orthosis for gait rehabilitation [用于步态康复机器人矫形器的自适应阻抗控制]. *Ieee T Cybern.* 43 (3), 1025–1034. doi:10.1109/tsmcb.2012.2222374
- Islam, M. R., Assad-Uz-Zaman, M., Brahmi, B., Bouteraa, Y., Wang, I., and Rahman, M. H. (2021). Design and development of an upper limb rehabilitative robot with dual functionality [具有双重功能上肢康复机器人的设计与开发]. *Micromachines* 12, 870. doi:10.3390/mi12080870
- Kawahira, K., Shimodozono, M., Etoh, S., Kamada, K., Noma, T., and Tanaka, N. (2010). Effects of intensive repetition of a new facilitation technique on motor functional recovery of the hemiplegic upper limb and hand [新型促通技术强化重复对偏瘫上肢及手运动功能恢复的影响]. *Brain Inj.* 24 (10), 1202–1213. doi:10.3109/02699052.2010.506855
- Krebs, H. I., Palazzolo, J. J., Dipietro, L., Volpe, B. T., Hogan, N., Rannekleiv, K., et al. (2003). Rehabilitation robotics: performance-based progressive robot-assisted therapy [康复机器人学：基于性能的渐进式机器人辅助治疗]. *Auton. Robot.* 15 (1), 7–20. doi:10.1023/a:1024494031121
- Li, X., Liu, Y. H., and Yu, H. Y. (2018). Iterative learning impedance control for rehabilitation robots driven by series elastic actuators [串联弹性驱动器驱动的康复机器人迭代学习阻抗控制]. *Automatica* 90, 1–7. doi:10.1016/j.automatica.2017.12.031
- Long, T., Wang, S. L., Cao, W., Zhou, H., and Fernandez, C. (2023). An improved variable forgetting factor recursive least square-double extend Kalman filtering based on global mean particle swarm optimization algorithm for collaborative state of energy and state of health estimation of lithium-ion batteries [一种基于全局均值粒子群优化算法的改进变遗忘因子递推最小二乘-双扩展卡尔曼滤波，用于锂离子电池能量状态和健康状态的协同估计]. *Electrochim Acta*, 450. doi:10.1016/j.electacta.2023.142270
- Luo, L., Peng, L., Hou, Z., and Wang, W. (2017). “An adaptive impedance controller for upper limb rehabilitation based on estimation of patients’ stiffness” [“基于患者刚度估计的自适应上肢康复阻抗控制器”], in *2017 IEEE International Conference on Robotics and Biomimetics (ROBIO)*, Macau, Macao, December, 2017, 532–537.
- Ma, Q., Li, R., Wang, L., Yin, P., Wang, Y., Yan, C., et al. (2021). Temporal trend and attributable risk factors of stroke burden in China, 1990-2019: an analysis for the Global Burden of Disease Study 2019 [1990-2019年中国脑卒中疾病负担的随时间变化趋势及归因危险因素：2019年全球疾病负担研究分析]. *Lancet Public Health* 6 (12), e897–e906. doi:10.1016/s2468-2667(21)00228-0
- Maldonado, B., Mendoza, M., Bonilla, I., and Reyna-Gutiérrez, I. (2015). “Stiffness-based tuning of an adaptive impedance controller for robot-assisted rehabilitation of upper limbs” [“基于刚度调节的机器人辅助上肢康复自适应阻抗控制器”], in *2015 37th Annual International Conference of the IEEE Engineering in Medicine and Biology Society (EMBC)*, Milan, Italy, August 2015, 3578–3581.
- Pawlak, N. D., Serafin, L., and Czarkowska-Pączek, B. (2022). Relationship between patients’ subjective involvement in postoperative rehabilitation and quality of life after arthroscopic treatment for osteoarthritic knee – cross-sectional study [膝骨关节炎关节镜治疗后患者主动参与康复的程度与生活质量的关系——横断面研究]. *Med. Og. Nauk. Zdr.* 28 (1), 63–69. doi:10.26444/monz/143835
- Pehlivan, A. U., Losey, D. P., and O’Malley, M. K. (2016). Minimal assist-as-needed controller for upper limb robotic rehabilitation [上肢机器人康复的最小按需辅助控制器]. *Ieee T Robot.* 32 (1), 113–124. doi:10.1109/tro.2015.2503726
- Perez-Ibarra, J. C., Siqueira, A. A. G., and Krebs, H. I. (2015). Assist-as-needed ankle rehabilitation based on adaptive impedance control [基于自适应阻抗控制的按需辅助踝关节康复]. *Int. C Rehab Robot.*, 723–728. doi:10.1109/ICORR.2015.7281287
- Perez-Ibarra, J. C., Siqueira, A. A. G., Silva-Couto, M. A., de Russo, T. L., and Krebs, H. I. (2019). Adaptive impedance control applied to robot-aided neuro-rehabilitation of the ankle [机器人辅助踝关节神经康复中的自适应阻抗控制应用]. *Ieee Robot. Autom. Let.* 4 (2), 185–192. doi:10.1109/lra.2018.2885165
- Riener, R., Lunenburger, L., Jezernik, S., Anderschitz, M., Colombo, G., and Dietz, V. (2005). Patient-cooperative strategies for robot-aided treadmill training: first experimental results [机器人辅助跑步机训练的患者协作策略：初步实验结果]. *Ieee Trans. Neural Syst. Rehabilitation Eng.* 13 (3), 380–394. doi:10.1109/tnsre.2005.848628
- Sharifi, M., Behzadipour, S., Salarieh, H., and Tavakoli, M. (2017). Cooperative modalities in robotic tele-rehabilitation using nonlinear bilateral impedance control [基于非线性双边阻抗控制的机器人遥康复协作模式]. *Control Eng. Pract.* 67, 52–63. doi:10.1016/j.conengprac.2017.07.002
- Sun, T., Wang, Z., He, C., and Yang, L. (2022). Adaptive robust admittance control of robots using duality principle-based impedance selection [基于对偶原理阻抗选择的机器人自适应鲁棒导纳控制]. *Appl. Sci.* 12, 12222. doi:10.3390/app122312222
- Vanoglio, F., Bernocchi, P., Mulè, C., Garofali, F., Mora, C., Taveggia, G., et al. (2016). Feasibility and efficacy of a robotic device for hand rehabilitation in hemiplegic stroke patients: a randomized pilot controlled study [偏瘫脑卒中患者手部康复机器人设备的科学性与有效性：随机初步对照研究]. *Clin. Rehabil.* 31 (3), 351–360. doi:10.1177/0269215516642606
- Vasu, S., Luis, G., and Dileep, R. Y. (2021). Global epidemiology of stroke and access to acute ischemic stroke interventions [脑卒中全球流行病学及急性缺血性脑卒中干预的可及性]. *Neurology* 97 (20 Suppl. 2), S6–S16. doi:10.1212/wnl.0000000000012781
- Wang, C., Peng, L., Hou, Z. G., Wang, W. Q., and Su, T. T. (2019). “A novel assist-as-needed controller based on fuzzy-logic inference and human impedance identification for upper-limb rehabilitation” [“一种基于模糊逻辑推理和人体阻抗识别的新型上肢康复按需辅助控制器”], in *2019 Ieee Symposium Series on Computational Intelligence*, Xiamen, China, December 2019, 1133–1139.
- Wolbrecht, E. T., Chan, V., Reinkensmeyer, D. J., and Bobrow, J. E. (2008). Optimizing compliant, model-based robotic assistance to promote neurorehabilitation [优化基于模型的柔顺机器人辅助以促进神经康复]. *IEEE Trans. Neural Syst. Rehabilitation Eng.* 16 (3), 286–297. doi:10.1109/tnsre.2008.918389
- Xu, G. Z., Gao, X., Chen, S., Wang, Q., Zhu, B., and Li, J. F. (2017). A novel approach for robot-assisted upper-limb rehabilitation: progressive resistance training as a paradigm [机器人辅助上肢康复的新方法：以渐进式阻力训练为范式]. *Int. J. Adv. Robot. Syst.* 14 (6), 1729881417736670. doi:10.1177/1729881417736670
- Yang, R., Shen, Z., Lyu, Y., Zhuang, Y., Li, L., and Song, R. (2023). Voluntary assist-as-needed controller for an ankle power-assist rehabilitation robot [踝关节动力辅助康复机器人的自主按需辅助控制器]. *IEEE Trans. Biomed. Eng.* 70 (6), 1795–1803. doi:10.1109/tbme.2022.3228070
- Zou, Y., Wu, X., Zhang, B., Zhang, Q., Zhang, A., and Qin, T. (2022). Stiffness analysis of parallel cable-driven upper limb rehabilitation robot [并联绳驱动上肢康复机器人的刚度分析]. *Micromachines* 13, 253. doi:10.3390/mi13020253
