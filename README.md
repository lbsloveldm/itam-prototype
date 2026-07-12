# ITAM 资产管理可交互原型

## 简介
基于 ITAM 资产管理系统交接包（69 份 PRD + 56 份布局 + 380 张截图 + 81 条测试用例）构建的纯前端可交互产品原型。

## 技术栈
- 纯静态 HTML + CSS + 原生 JavaScript
- Hash 路由（无后端）
- localStorage 持久化
- 仿 Ant Design 视觉风格

## 启动方式
```bash
# 方式一：Python HTTP Server
cd /workspace/ITAM/原型 && python3 -m http.server 8888
# 浏览器访问 http://localhost:8888/index.html

# 方式二：直接打开
# 浏览器打开 /workspace/ITAM/原型/index.html
```

## 目录结构
```
原型/
├── index.html               应用入口
├── styles/main.css          主样式
├── scripts/
│   ├── store.js             localStorage CRUD
│   ├── seed.js              种子数据初始化
│   ├── ui.js                通用UI组件
│   ├── router.js            Hash 路由
│   ├── relations.js         关联实体跳转
│   ├── crud-factory.js      通用 CRUD 工厂
│   ├── app.js               主入口和侧边栏
│   └── modules/             16 个业务模块
│       ├── portal.js        门户
│       ├── asset.js         资产（台账/规格/分类/映射）
│       ├── maintenance.js   资产维护
│       ├── audit.js         资产盘点
│       ├── contract.js      合同管理
│       ├── inventory.js     库存管理
│       ├── org.js           组织管理
│       ├── cost.js          成本管理
│       ├── license.js       软件License
│       ├── settings.js      设置
│       ├── resource.js      资源管理（位置）
│       ├── userCenter.js    用户中心
│       ├── cmdb.js          配置中心
│       ├── warning.js       预警管理/回收站/资产洞察
│       └── selfService.js   自服务
└── README.md
```

## 模块覆盖

| 一级模块 | 一级页面 | 详情/新建 |
|---------|---------|-----------|
| 自服务 | 7 | 5 |
| 资产管理 | 4 | 4 |
| 资产维护 | 1 | 1 |
| 资产盘点 | 3 | 3 |
| 软件对账 | 1 | 1 |
| 合同管理 | 5 | 4 |
| 库存管理 | 5 | 5 |
| 预警管理 | 2 | 0 |
| 资源管理 | 1 | 0 |
| 组织管理 | 3 | 3 |
| 成本管理 | 7 | 7 |
| 软件License | 6 | 6 |
| 设置 | 4 | 3 |
| 资产洞察 | 1 | 0 |
| 回收站 | 1 | 0 |
| 用户中心 | 3 | 2 |
| 配置中心 | 2 | 1 |
| 门户 | 1 | 0 |

## 页面跳转关系
- **一级 → 二级**：点击一级列表中的"名称"蓝链
- **二级 → 三级**：在详情页中点击关联实体蓝链（如资产详情中的"规格"蓝链跳到规格详情；合同详情中的"合同规格"跳到合同规格详情）
- **典型三级链路**：
  - 资产台账 → 资产详情 → 规格详情
  - 资产台账 → 资产详情 → 折旧方案详情
  - 合同管理 → 合同详情 → 合同规格详情
  - 盘点计划 → 盘点任务 → 查看结果弹窗
  - 库房管理 → 库房详情 → 货架详情
  - 位置管理（树+详情）

## 测试
```bash
cd /workspace/ITAM/tests
bash run-all.sh
```

## 重置数据
打开浏览器控制台执行：
```js
Store.resetAll(); location.reload();
```
