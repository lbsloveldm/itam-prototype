# License度量与属性 PRD

> 对应功能架构：软件许可与授权管理｜　对应原型：软件License → License配置 / 许可证类型（`/license/config`、`/license/type`）
> 文档性质：产品需求说明书（PRD）　｜　权威依据：源 许可证 Metrics、Metric Attributes-软件 Mgmt、软件规格 licenses 页内容及功能、软件规格 增加 license metric+ 最新系统截图 + ITAM 操作手册 + 系统原型

## 1. 前言

### 1.1 需求基本信息

| 项目 | 内容 |
| --- | --- |
| 交付版本 | 标品 Demo 版本 |
| 模块归属 | 软件License / 许可证 配置基础数据 |
| 优先级 | P0 |
| 关联原型页面 | `/license/config`（许可证 配置）、`/license/type`（许可证类型），Setting → 许可证 二级导航（许可证 类型 / 许可证 Metric / Metric 分组 / 软件 Product Definition / 发现映射） |
| 关联源文档 | 《许可证 Metrics- License_SW Entitlements mgmt》《Metric Attributes-软件 Mgmt》《软件规格 licenses页内容及功能-对应功能架构model mgmt》《software model增加license metric》 |

### 1.2 文档变更记录

| 时间 | 变更人 | 变更内容 |
| --- | --- | --- |
| 初版 | 产品（Vivian） | 新建 许可证 度量与属性需求：许可证 类型 / 许可证 Metric / Metric 分组 / 软件 Product Definition 四表管理及内置数据 |
| 迭代 | 产品 | 软件 规格 增加 许可证 Metric 必填字段，联动 许可证 类型；分配类型 自动填充 许可证 Metric、类型 value 自动填充 名称 |
| 迭代 | 产品 | 新增 Metric Attributes 管理；补充 软件 规格 licenses 页卡关联展示逻辑 |

### 1.3 名词解释

| 术语 / 缩略词 | 说明 |
| --- | --- |
| 许可证度量 | 计算软件 许可证 的指标维度，例如 Per 用户、Per Device，是合规计算的授权维度 |
| 许可证类型 | 计算 许可证 数量的维度分类，树形结构（如 `Commercial/By CPU`），创建软件规格 规格 时选择 |
| 度量组 | 逻辑分类概念，标明许可归属的发行商，如 Microsoft、VMware、Oracle、Red Hat |
| 指标属性 | 细化 许可证 Metric 计算规则的参数，用于处理不同供应商复杂授权规则差异（如最少用户数、每处理器最少核心数） |
| 软件产品定义 | 固定 metric 定义，通过 发布商+Product+版本号 唯一定位授权计算方式 |
| 权利/权益 | 用户或设备被授予的软件使用权，一个 许可证 Pack 含若干 授权数 |
| 权利数 | 许可证权利数量，许可证 消耗以 授权数 计量 |
| 软件规格 | 软件的标准化规格模型，实例化后产生软件 许可证 台账记录 |

### 1.4 关联需求清单

| 序号 | 需求名称 | 需求描述 | 当前进度 |
| --- | --- | --- | --- |
| 1 | 软件许可资产增删改查 | 基于 软件 规格 实例化软件 许可证 台账 | 已实现 |
| 2 | 软件发现映射（发现映射） | 软件 Product Definition 中 Entitlement 引用 发现映射 数据 | 关联需求 |
| 3 | 许可证类型与 SaaS 订阅 | 软件 Product 定义是否可订阅，联动订阅型 许可证 | 关联需求 |
| 4 | 合规计算与对账 | 依据 许可证 Metric + Metric Attributes 计算合规 | 关联需求 |

## 2. 需求分析

### 2.1 业务背景

企业管理软件许可，首先要建立一套可计算的度量体系：每个软件发行商（发布商）都有特定的许可证指标（许可证 Metric），通过度量组（Metric 分组）归类。创建软件规格 规格 时需选择 许可证 类型，作为计算 许可证 数量的维度。系统需要沉淀 许可证 类型、许可证 Metric、Metric 分组、软件 Product Definition 等基础数据表，并支持 软件 规格 引用这些度量，从而在后续合规计算中按用户数、设备数、CPU 核心数等维度精确判定授权消耗与合规性。

**本期范围界定**：本期只完成 许可证 Metric / Metric Attributes 等度量数据的管理（建表 + 内置/演示数据 + 表页面与详情页），暂不实际执行软件合规性计算及图表生成（合规计算见《软件对账记录》）。

### 2.2 需求价值

#### 2.2.1 模块价值点

- **管理软件权限**：跟踪并管理购买的软件权限——组织购买了多少权限、成本多少、分配给了谁；支持单条创建/更新，也支持批量导入。
- **权利计算规则**：按实际使用自动计算许可证消耗，例如分配给用户两个权利但只有一条活跃订阅记录时，仅消耗一个权利。
- **使用发行商包**：不同发行商使用不同许可模型，发行商包扩展平台与第三方软件发行商功能，跟踪并优化指定发行商的许可。
- **合规基础**：为许可证工作台与仪表板提供计算维度，识别过度使用/未充分利用，给出优化建议。

#### 2.2.2 调研结论及竞品分析

参考 ServiceNow SAM（软件 资产 Management）：以 许可证 Metric、Metric 分组、软件 Product Definition、发现映射 等基础表构建许可计量体系；创建软件 规格 时选择 许可证 类型 作为计算维度；许可证工作台集中展示合规情况并给出补救选项。本期对齐其数据结构，落地基础数据与配置页，暂不做合规计算与图表。

### 2.3 用户故事

- 作为**软件资产管理员**，我希望维护 许可证 类型 / 许可证 Metric / Metric 分组 基础数据，以便创建软件规格时可选择正确的计算维度。
- 作为**软件资产管理员**，我希望为软件规格配置 如每处理器最少用户数、每 许可证 最大安装数，以便后续合规计算能处理复杂授权规则。
- 作为**合规专员**，我希望通过 软件 Product Definition 唯一定位某软件的许可类型与度量，以便判断该规格是否订阅、如何计算消耗。

## 3. 需求设计

### 3.1 许可证类型表

#### 3.1.1 涉及到的表

- `cmdb_sw_license_calculation`（许可证 类型 表，含内置数据）
- `license_metric`（被引用，见 3.2）

#### 3.1.2 功能描述

| 需求点 | 需求描述 | 逻辑描述 |
| --- | --- | --- |
| 创建 许可证 类型 表及内置数据 | 定义软件 规格 中引用字段 许可证 类型，通过表管理数据 | 基于要求字段建表，并导入内置数据（内置 14 个节点，见附件 `cmdb_sw_license_calculation.xlsx`） |
| 表页面 | Setting 页面增加 许可证 入口，进入后显示二级导航；点击某表对象后最右侧展示默认字段及值 | 默认显示字段在 class 中配置；以 名称 搜索；其余功能与当前系统一致（排序、展示字段设置、More、Action） |
| 详情页跳转 | 点击 父级 及 名称 可进入固定对象详情页 | 引用字段可点击进入对应对象详情 |
| 名称 自动填充（优化） | 名称 字段改为系统默认填写，当用户选择 类型 value 时用该值填充 名称 | 类型 value 字典：By number of users、Usage(用户)、By CPU cores、By number of CPUs、Per workstation、By CPU、Per installation- IBM PVU |

#### 3.1.3 字段说明

| 字段名 | 数据类型 | 长度 | 备注说明 |
| --- | --- | --- | --- |
| 全称 | 字符串 | 200 | 显示树形完整结构，由根节点至叶子结点（如 `Commercial/By CPU`）；需做唯一性校验 |
| 安装字段 | 字符串 | 100 | CI 上用来表述 CPU 数的字段，后续从 CMDB 获取；下拉框，见字典值 |
| 许可证 field | 字符串 | 100 | 指定与特定软件许可证相关的许可证字段；字典值 `Rights / 空数据` |
| 名称 | 字符串 | 40 | 许可证 类型 的名称；必填项（可由 类型 value 自动填充） |
| 父级 | 引用 | 32 | 许可证 类型 的父级节点；下拉框，显示已有 许可证 类型 的 名称 |
| 查询类型 | 字符串 | 40 | 字典值，代表 CMDB 中预定义的查询类型，对应特定查询逻辑或计算方法 |

#### 3.1.4 字段字典值说明

| 字段名 | 字典值 | 说明 |
| --- | --- | --- |
| 安装字段 | cpu_core_count / cpu_count / processor_mapping / empty | CI 上 CPU 数字段来源 |
| 许可证 field | 授权数 / 空数据 | 关联许可证字段 |
| 查询类型 | CPU / Usage (CPU) / IBM PVU / Named user / 用户 / Usage (用户) / 空数据 | CMDB 预定义查询类型 |
| 内置数据 | 14 个内置节点之一 | 内置数据以附件 `cmdb_sw_license_calculation.xlsx` 为准 |

### 3.2 许可证度量表

#### 3.2.1 涉及到的表

- `samp_sw_license_metric`（许可证 Metric 表，含内置数据）
- `samp_sw_metric_group`（Metric 分组 表，引用）

#### 3.2.2 功能描述

| 需求点 | 需求描述 | 逻辑描述 |
| --- | --- | --- |
| 创建 许可证 Metric 表及内置数据 | 定义计算软件 许可证 的指标维度 | 基于要求字段建表并导入内置数据（`samp_sw_license_metric.xlsx`）；唯一性由 许可证 metric + 度量组 组成 |
| 表页面 | Setting → 许可证 二级导航中展示 | 以 许可证 metric 搜索；其余功能与当前系统一致 |
| 详情页跳转 | 点击 许可证 metric 进入固定对象详情页 | — |

#### 3.2.3 字段说明

| 字段名 | 数据类型 | 长度 | 备注说明 |
| --- | --- | --- | --- |
| 许可证 metric | Translated Text | 40 | 系统或人工定义的指标名称；必填项 |
| 度量组 | 列表 | 16,777,215 | 指标组逻辑概念归属，如 Microsoft、Red Hat；必填项 |
| 值 | 字符串 | 40 | 许可证指标的具体值，例如每个用户或每个设备所需的许可证数量 |
| Class | 系统 Class 名称 | 40 | 代表 Metric 是系统定义或人工定义 |
| Reconciliation order - unallocated | 整数 | 40 | 存在多个未分配许可证时按该字段确定分配顺序，值越小优先级越高 |
| Reconciliation order - allocated | 整数 | 40 | 已分配许可证的分配优先级，数值越小优先级越高 |
| 分配类型 | 字符串 | 40 | 许可证如何分配，三个固定值 Other / Device / 用户 |
| 描述 | Translated Text | 4,000 | 描述信息 |

#### 3.2.4 字段字典值说明

| 字段名 | 字典值 | 说明 |
| --- | --- | --- |
| Class | 许可证 Metric / 自定义 许可证 Metric | 系统定义 / 人工定义 |
| 分配类型 | Other / Device / 用户 | 分配维度固定值 |

### 3.3 度量组表

#### 3.3.1 涉及到的表

- `samp_sw_metric_group`（Metric 分组 表，含内置数据）

#### 3.3.2 功能描述

| 需求点 | 需求描述 | 逻辑描述 |
| --- | --- | --- |
| 创建 Metric 分组 表及内置数据 | 定义软件 许可证 对应的 metric group | 基于要求字段建表并导入内置数据（`samp_sw_metric_group.xlsx`） |
| 表页面 | Setting → 许可证 二级导航中展示 | 以 名称 搜索；点击 名称 进入固定对象详情页 |

#### 3.3.3 字段说明

| 字段名 | 数据类型 | 长度 | 备注说明 |
| --- | --- | --- | --- |
| 名称 | 字符串 | 40 | 指标组名称（如 Red Hat）；必填且唯一 |

### 3.4 软件产品定义表

#### 3.4.1 涉及到的表

- `samp_sw_product_definition`（软件产品定义表，含内置数据）
- `license_metric` / `discovery_map` / `manufacture` / `software_product`（引用）

#### 3.4.2 功能描述

| 需求点 | 需求描述 | 逻辑描述 |
| --- | --- | --- |
| 创建 软件 Product Definition 表及内置数据 | 定义软件 许可证 对应规格的固定 metric | 基于要求字段建表并导入内置数据（`samp_sw_product_definition.xlsx`） |
| 表页面 | Setting → 许可证 二级导航中展示 | 以 Stage license type、Stage license metric 搜索；引用字段值均可点击进入固定对象详情页 |
| 后续迭代提示 | 列表页需补充展示 发布商、Product | 当前创建页与展示列未含 发布商、引用型，定义在 发现映射，待 发现映射 定义完善后补充 |

#### 3.4.3 字段说明

| 字段名 | 数据类型 | 长度 | 备注说明 |
| --- | --- | --- | --- |
| Class | 系统 Class 名称 | 40 | 系统/自定义类别，字典 `自定义 Part 编号 / Software Product Definition` |
| Stage license type | 字符串 | 40 | 软件许可证类型（永久、订阅等），见字典值 |
| Stage license metric | 引用 | 32 | 软件许可证指标，引用 许可证 Metric 数据；点击进入 许可证 Metric 详情页 |
| Stage entitlement definition | 引用 | 32 | 定义许可证特定阶段的权利（如试用、维护、升级）；源数据在 Discovery Maps 表（先穷举，以导入数据为准） |
| 授权数 per license pack | 整数 | 40 | 每个许可证包中包含的权利集合 |
| 发布商 part number | 字符串 | 150 | 软件发布者提供的部件编号，用于区分版本；必填且唯一 |
| 许可证 type | 字符串 | 40 | 许可证具体类别或版本；下拉框，字典值以导入数据为准 |
| 许可证 metric | 引用 | 32 | 引用 许可证 Metric 表中的 许可证 metric 字段值；点击进入 许可证 Metric 详情页 |
| Entitlement Definition Id | 整数 | 40 | 权利定义唯一标识；由创建页选择 授权定义 后，在 发现映射 中找到唯一记录取其 Entitlement Definition Id |
| 授权定义 | 引用 | 32 | 描述用户根据许可证可做什么的具体权利；引用 Discovery Maps 表 编号 字段（先穷举） |
| 内容版本 | 字符串 | 8 | 软件的内容版本 |
| 启用 | 是/否 | 40 | 是否处于激活状态；创建页默认 True |
| 发布商 | 引用 | 32 | 发布厂商名称，取 Manufacture 表 名称 值；点击进入 Manufacture 详情页 |
| Product | 引用 | 32 | 软件产品名称，取 软件 Product 表 Product 字段值；点击进入 软件 Product 详情页 |

#### 3.4.4 字段字典值说明

| 字段名 | 字典值 | 说明 |
| --- | --- | --- |
| Class | 自定义 Part 编号 / 软件 Product Definition | 系统/自定义类别 |
| Stage license type | empty / 永久 / Maintenance / 永久 + Maintenance / 永久 + 软件 Assurance / 软件 Assurance / Step-up / 订阅 / Upgrade | 阶段许可证类型 |
| Stage license metric | empty / Device CAL / Per Core / Per Core (with CAL) / Per Device / Per Named 用户 等 | 阶段许可证指标（以导入数据为准） |
| 许可证 type | 以导入数据为准 | 商业版/教育版/免费版等 |

### 3.5 指标属性

#### 3.5.1 涉及到的表

- `metric_attributes`（指标属性表）
- `license_metric` / `metric_group` / `software_model`（引用）

#### 3.5.2 功能描述

Metric Attributes 是细化 许可证 Metric 计算规则的关键参数，用于解决不同供应商、不同软件产品的复杂授权规则差异，确保合规核对精确。它属于 软件 规格 的一部分，与 许可证 Metric 共同构成许可管理的计算逻辑。**本期只完成 Metric Attributes 的管理，暂不实际计算合规。**

| 需求点 | 需求描述 | 逻辑描述 |
| --- | --- | --- |
| 创建 Metric Attributes | 基于要求字段建表并支持创建 | 通过创建详情页录入 Attribute、取值、描述及关联 许可证 metric / 度量组 / 软件 规格 |
| 关联 软件 规格 | 软件 规格 为必填引用 | 展示当前系统已有 软件 规格，供选择关联 |

常见 Metric Attributes 类型（业务参考）：按用户数、并发用户数、活跃会话数、CPU 核心数、内存消耗、存储消耗。示例约束：最少 25 个用户；WebLogic 云端部署最少 NUPs 10 个；WebLogic 本地部署最少 NUPs 10 个。

#### 3.5.3 字段说明

| 字段名 | 数据类型 | 长度 | 备注说明 |
| --- | --- | --- | --- |
| Attribute | 字符串 | 40 | 定义指标的特定特征或维度；下拉字典，必填 |
| 属性值 | 整数 | 10 | 属性的具体取值 |
| 属性值 is unlimited | 是/否 | 10 | 表示该属性取值范围没有限制（使用量无上限） |
| 描述 | 字符串 | 1,000 | 对指标的详细描述 |
| 许可证 metric | 引用 | 32 | 引用；展示当前系统已有 许可证 metric 名称 |
| 度量组 | 引用 | 32 | 引用；展示当前系统已有 度量组 |
| 软件 规格 | 引用 | 32 | 引用；展示当前系统已有 软件 规格；必填 |

#### 3.5.4 字段字典值说明

| 字段名 | 字典值 | 说明 |
| --- | --- | --- |
| Attribute | Minimum NUPs for WebLogic on-premise deployments / Minimum NUPs for WebLogic cloud deployments / 最小用户数 per processor / Maximum installs per right / Minimum cores per VM / Minimum cores per processor / Maximum installs per OSE / Maximum active OSEs per server / Minimum cores per server / Maximum cores per processor | 指标属性下拉字典值（2025.05.09 修订） |

### 3.6 软件 规格 增加 许可证 Metric 字段

#### 3.6.1 涉及到的表

- `software_model`（软件规格表，新增 许可证 metric、许可证 type 字段）

#### 3.6.2 功能描述

| 需求点 | 需求描述 | 逻辑描述 |
| --- | --- | --- |
| 软件 规格 创建增加 许可证 metric | 创建软件规格时增加 许可证 metric 字段，必填 | 用户选择 许可证 metric 后给出关联选项 许可证 type；未选 许可证 metric 时 许可证 type 为空 |
| 许可证 metric 优化 | 分配类型 值自动填充 许可证 Metric | 许可证 Metric 改为系统默认填写，用户选择 分配类型 时用该值填充 许可证 Metric |
| software entitlement 关联页卡展示限制 | 依据 许可证 metric 控制实例关联页卡显示 | 见下方展示规则 |

**许可证 Metric → 许可证 type 关联关系：**

| 许可证 Metric | 关联 许可证 type | 备注 |
| --- | --- | --- |
| 用户 CAL | By number of users、Usage(用户) | 每个用户消耗一个 right |
| Device CAL | By CPU cores、By number of CPUs、Per workstation、By CPU、Per installation- IBM PVU | 每个设备消耗的 rights 数量按 许可证 type 计算（如 By CPU cores(8)：每设备消耗 8） |
| 用户/Device CAL | Other | 混合模式，默认按单个用户、单个设备授权计算；实际消耗 rights = Max(device, user) |

**software entitlement 关联页卡展示规则：**

- 许可证 metric 选 用户 CAL 时，软件实例不显示 Device entitlements 页卡；
- 许可证 metric 选 Device CAL 时，软件实例不显示 用户 entitlements 页卡；
- 许可证 metric 选 用户/Device CAL 时，软件实例同时显示 用户 entitlements、Device entitlements 页卡。

#### 3.6.3 字段字典值说明

| 字段名 | 字典值 | 说明 |
| --- | --- | --- |
| 分配类型 | 用户 CAL / Device CAL / 用户/Device CAL | 自动填充 许可证 Metric 字段 |
| 类型 value | By number of users / Usage(用户) / By CPU cores / By number of CPUs / Per workstation / By CPU / Per installation- IBM PVU | 自动填充 许可证 类型 的 名称 字段 |

### 3.7 软件 规格 licenses 页卡关联展示

#### 3.7.1 涉及到的表

- `software_model`（软件规格）
- `software_license`（软件 许可证 实例）

#### 3.7.2 功能描述

| 需求点 | 需求描述 | 逻辑描述 |
| --- | --- | --- |
| licenses 页卡数据关联 | 将对应 software asset 实例数据挂在对应 软件 规格 的 licenses 页卡展示 | 触发条件：创建 software license 实例数据时选择已有软件 规格；该 规格 对应的 licenses 页卡展示对应实例化数据 |
| 展示校验 | 数量显示正确、列表页显示实例化数据字段及关联值 | — |

### 3.8 页面功能与交互逻辑

- **入口**：Setting 页面增加 许可证 入口，进入后显示二级导航（许可证 类型 / 许可证 Metric / Metric 分组 / 软件 Product Definition / 发现映射）。
- **表页面**：点击某个表对象后，最右侧展示默认显示字段及值（默认字段在 class 中配置）；支持搜索、排序、展示字段设置、More、Action，功能与当前系统一致。
- **引用字段跳转**：所有引用字段值均可点击，点击后进入对应固定对象详情页。
- **详情页**：各对象均有固定详情页展示字段与关联信息。
- **移动端**：需考虑移动端适配。

## 4. 验收标准

- 许可证 类型 / 许可证 Metric / Metric 分组 / 软件 Product Definition 四表可正常建表、导入内置数据、搜索与详情跳转。
- 许可证 类型 的 全称 唯一校验、许可证 Metric 的 许可证 metric + 度量组 组合唯一校验生效。
- 软件 规格 创建时 许可证 metric 必填，选择后正确联动 许可证 type；分配类型 自动填充 许可证 Metric、类型 value 自动填充 名称 生效。
- 软件实例关联页卡（用户/Device entitlements）按 许可证 metric 规则正确显隐。
- Metric Attributes 可创建并正确关联 许可证 metric / 度量组 / 软件 规格；Attribute 下拉字典值符合本文定义。
- 软件 规格 licenses 页卡正确展示关联实例化数据且数量准确。
