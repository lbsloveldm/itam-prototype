# ITAM 详细 PRD 编写规范与源文档映射

本文件是所有 PRD 的**统一编写规范**与**源文档→目标 PRD 映射表**。所有 PRD 均为 Markdown 编写，随后由 `tools/md_to_docx.py` 统一转换为 `.docx`。

## 一、编写规范（务必严格遵循）

参考基准：`docs/需求文档/资产管理/硬件资产增删改查.md`（已产出的样板）。每份 PRD 必须包含以下结构：

```
# <功能名> PRD

> 对应功能架构：…　｜　对应原型：<模块 → 页面>
> 文档性质：产品需求说明书（PRD）　｜　权威依据：最新系统截图 + ITAM 操作手册 + 系统原型

## 1. 前言
### 1.1 需求基本信息   （表格：交付版本/模块归属/优先级/关联原型页面/关联源文档）
### 1.2 文档变更记录   （表格：时间/变更人/变更内容）
### 1.3 名词解释       （表格：术语/含义）
### 1.4 关联需求清单   （表格：序号/需求名称/需求描述/当前进度）

## 2. 需求分析
### 2.1 业务背景
### 2.2 需求价值
#### 2.2.1 模块价值点
#### 2.2.2 调研结论及竞品分析   （多参考 ServiceNow）
### 2.3 用户故事               （作为<角色>，我希望<目标>，以便<价值>）

## 3. 需求设计
### 3.x <子模块/功能>
#### 3.x.1 涉及到的表
#### 3.x.2 功能描述            （表格：需求点/需求描述/逻辑描述）
#### 3.x.3 字段说明            （表格：字段名/数据类型/长度/备注说明）
#### 3.x.4 字段字典值说明      （表格：字段名/字典值/说明，含状态机）
### 3.y 页面功能与交互逻辑     （列表页/详情页/操作/校验）

## 4. 验收标准
```

**关键要求：**
- **字段级颗粒度**：只要源文档有字段表，必须逐字段落表（字段名·数据类型·长度·备注）。有字典值/状态机的必须落「字典值说明」表。
- **忠实源文档**：内容以 `doc/` 源 PRD 为权威依据，做结构化清洗与中文化，术语对齐当前系统原型的命名。源文档缺失的用截图/操作手册补充，不要凭空杜撰字段。
- **交互逻辑**：功能描述表要写清「逻辑描述」（后台如何实现/触发条件/与其他模块联动）。
- Markdown 表格用标准 GFM 语法（含分隔行 `| --- |`）；加粗用 `**x**`；层级标题用 `#/##/###/####`。
- 语言：中文为主，专有名词/字段名可保留英文。

## 二、提取源文档文本的方法

```bash
python3 - <<'PY'
import zipfile, re
def text(p):
    z=zipfile.ZipFile(p); xml=z.read('word/document.xml').decode('utf-8','ignore')
    xml=re.sub(r'</w:p>','\n',xml); xml=re.sub(r'<w:tab[^>]*/>','\t',xml)
    xml=re.sub(r'<[^>]+>','',xml); xml=re.sub(r'[ \t]{2,}',' ',xml); xml=re.sub(r'\n{2,}','\n',xml)
    return xml.strip()
print(text("doc/<源文件名>.docx"))
PY
```

## 三、转换为 docx

```bash
# 单文件
python3 tools/md_to_docx.py "docs/需求文档/<模块>/<功能>.md"
# 目录批量（对某模块目录内所有 .md）——统一在最后由主控执行
```

## 四、源文档 → 目标 PRD 映射表

输出路径统一为 `docs/需求文档/<模块中文名>/<功能名>.md`。

### 资产管理
| 目标 PRD | 源文档 |
| --- | --- |
| 硬件资产增删改查（样板，已完成） | Assets 硬件资产增删改查; Hardware asset--Asset Estate & Action |
| 耗材资产增删改查 | Consumable assets资产增删改查; Split 耗材资产; 耗材指派给硬件或用户后增加关联展示 |
| 软件许可资产增删改查 | Assets 软件资产License增删改查授权 |
| 捆绑资产管理 | Bundled Models; allocate bundle asset; Retire bundle asset |
| 托盘资产管理 | Pallet Asset Manipulation; Moving Pallets |
| 云资产台账管理 | 云资产-台账管理 |
| 资产属性扩展与批量修改 | 资产管理属性扩展; 台账管理-批量修改某些属性信息 |
| 资产维保管理 | Asset Warranty（资产维保） |
| 资产处置 | PRD-Dispose Asset（资产处置） |
| 资产退役 | PRD-Retire Asset（资产退役） |
| 资产借用 | PRD-ITAM-Loaner Asset（借用资产） |
| 退货授权RMA | PRD-ITAM-RMA Return Merchandise Authorization |
| 资产领用流程 | PRD-ITAM-Request（领用流程） |
| 资产移交 | 资产移交 |
| 导入导出 | Export Manipulation-导出功能; Import Manipulation |
| 附件与统一日志 | 多功能页面附件需求; 统一activity日志; 日志记录展示优化 |

### 资产规格与映射
| 目标 PRD | 源文档 |
| --- | --- |
| 资产规格管理 | Model Automatic_Manual manipulation; Model Lifecycle; (S)Product Process-- Asset Model Mgmt; (S)-Upgrade_Downgrade Model; H_C model compatible; H_C model substitute |
| 资产规格分类管理 | Model category-规格类别 |
| 发布到产品目录 | Publish to catalog |
| 映射管理（Field/Status Mapping） | Field Mapping; Status Mapping; 软件发现规格与台账规格映射优化 |

### 软件License
| 目标 PRD | 源文档 |
| --- | --- |
| License度量与属性 | License Metrics; Metric Attributes-Software Mgmt; software model licenses页内容及功能; software model增加license metric |
| 许可证类型与SaaS订阅 | Saas License; Software Subscriptions- License_Allocation Mgmt |
| 回收规则 | PRD-ITAM-Reclamation Rules（回收规则） |
| 软件发现映射 | Discovery map; 【优化】software model创建时新增discovery map字段&自动创建suite component |
| 软件安装 | Software installation |
| 软件使用 | Software usage |
| 黑名单与排除清单 | Blacklisted Installation; Exclusion list |
| 合规计算与补救 | Compliance calculate of Software installation; Compliance calculate of Software usage; Compliance Report of Software installation; Publisher Compliance; 合规补救措施 |
| 客户端访问合规 | Client Access-- Allocation Mgmt; Compliance of Client Access |
| 软件套件 | (S)-Software Suite 软件套件 |
| 升降级授权影响 | 【优化】downgrade&upgrade rights以及对合规的影响 |
| 软件实例有效期 | 增加软件实例有效期字段 |
| 软件对账记录 | Compliance calculate（对账口径）+ 操作手册对账 |

### 成本管理
| 目标 PRD | 源文档 |
| --- | --- |
| 资产总拥有成本TCO | TCO-Cost Mgmt; Asset Total Cost of Onwership资产总拥有成本 |
| 费用条目 | 费用条目属性扩展; 云资产账单费用 |
| 折旧方案 | Depreciation Schema-- Asset Model Mgmt |
| 人工费率卡 | Labor rate card-Cost Mgmt |
| 任务费率卡 | Task rate card-Cost Mgmt |
| 云资产成本管理 | 云资产-成本管理 |

### 合同管理
| 目标 PRD | 源文档 |
| --- | --- |
| 合同管理与合同规格 | 合同优化 |
| 合同续签 | Contract Renewal（合同续签） |

### 库存管理
| 目标 PRD | 源文档 |
| --- | --- |
| 库房与库房类型 | Stockrooms |
| 存储发现 | Storage discovery |
| 服务位置关联 | Associate a stockroom with service locations |
| 库存规则 | Stock rules 库存规则-达到阈值触发补货 |
| 库存概况 | 库存概况&展示库存信息 |
| 预分配资产 | Pre- allocated assets- Inventory mgmt |

### 资产盘点
| 目标 PRD | 源文档 |
| --- | --- |
| 盘点总览 | 资产盘点Overview |
| 盘点任务执行 | Audit Inventory--执行资产盘点任务; 盘点优化; 盘点优化-直接选定固定资产进行盘点; 预设任务-通过一个页面设置来完成 |
| 复核盘点结果 | Audit Inventory--复核盘点结果 |
| 盘点通知 | 飞书、钉钉等通知渠道，通知中增加任务链接并支持盘点 |

### 组织/资源/预警/洞察
| 目标 PRD | 源文档 |
| --- | --- |
| 组织管理（公司/供应商/产品目录） | ITAM-通用资产事务管理模块-组织管理 |
| 位置管理 | ITAM-成本管理-位置管理 |
| 到期预警与通知场景 | Asset Warranty; 通知场景梳理 |
| 资产洞察看板 | Dashboard Report |

### 设置/回收站/移动端/AI/架构
| 目标 PRD | 源文档 |
| --- | --- |
| 资产标识配置规则 | 自定义配置资产唯一编码规则 |
| 二维码标签设置 | 增加标签纸打印尺寸及二维码设置 |
| 回收站-删除与恢复 | 查看及恢复已删除资产 |
| 移动端登录与工作台 | 移动端登录; Asset lookup-Workbench for Mobile App; Create Assets-Workbench; Receive asset from PO-Workbench |
| ITAM AI 能力 | ITAM AI需求 |
| 系统架构与信息架构 | 00.ITAM架构设计; 菜单组合调整需求 |
