// ========================================
// ITAM 原型 - 主应用入口
// ========================================
(function(global) {
  'use strict';

  // 顶级导航配置（按截图顺序）
  const NAV = [
    {
      key: 'self-service', label: '自服务', icon: '🛎',
      children: [
        { key: 'self-service-portal', label: '自服务门户', path: '/self-service/portal' },
        { key: 'self-service-tickets', label: '我的工单', path: '/self-service/tickets' },
        { key: 'self-service-my-assets', label: '我的资产', path: '/self-service/my-assets' },
        { key: 'self-service-my-audits', label: '我的盘点', path: '/self-service/my-audits' },
        { key: 'self-service-my-maintenance', label: '我的维护', path: '/self-service/my-maintenance' },
        { key: 'self-service-my-contracts', label: '我的合同', path: '/self-service/my-contracts' },
        { key: 'self-service-stock-request', label: '库存不足预警', path: '/self-service/stock-request' }
      ]
    },
    {
      key: 'asset', label: '资产管理', icon: '📦',
      children: [
        { key: 'asset-ledger', label: '资产台账', path: '/asset/ledger' },
        { key: 'asset-model', label: '资产规格管理', path: '/asset/model' },
        { key: 'asset-model-category', label: '资产规格分类管理', path: '/asset/model-category' },
        { key: 'asset-ci-mapping', label: '映射管理', path: '/asset/ci-mapping' }
      ]
    },
    {
      key: 'maintenance', label: '资产维护', icon: '🔧',
      children: [
        { key: 'maintenance-order', label: '维护工单', path: '/maintenance/order' }
      ]
    },
    {
      key: 'audit', label: '资产盘点', icon: '📋',
      children: [
        { key: 'audit-template', label: '盘点模板', path: '/audit/template' },
        { key: 'audit-plan', label: '盘点计划', path: '/audit/plan' },
        { key: 'audit-task', label: '盘点任务', path: '/audit/task' }
      ]
    },
    {
      key: 'reconciliation', label: '软件对账', icon: '🔄',
      children: [
        { key: 'reconciliation-record', label: '对账记录', path: '/reconciliation/record' }
      ]
    },
    {
      key: 'contract', label: '合同管理', icon: '📄',
      children: [
        { key: 'contract-list', label: '合同管理', path: '/contract/list' },
        { key: 'contract-spec', label: '合同规格', path: '/contract/spec' },
        { key: 'contract-approval', label: '我的审批', path: '/contract/approval' },
        { key: 'contract-renewal', label: '续签记录', path: '/contract/renewal' },
        { key: 'contract-change', label: '调整记录', path: '/contract/change' }
      ]
    },
    {
      key: 'inventory', label: '库存管理', icon: '🏬',
      children: [
        { key: 'inventory-stockroom-type', label: '库房类型管理', path: '/inventory/stockroom-type' },
        { key: 'inventory-stockroom', label: '库房管理', path: '/inventory/stockroom' },
        { key: 'inventory-shelf', label: '货架管理', path: '/inventory/shelf' },
        { key: 'inventory-service-location', label: '服务位置', path: '/inventory/service-location' },
        { key: 'inventory-stock-rule', label: '库存规则配置', path: '/inventory/stock-rule' }
      ]
    },
    {
      key: 'warning', label: '预警管理', icon: '⚠',
      children: [
        { key: 'warning-expiry', label: '资产到期预警', path: '/warning/expiry' },
        { key: 'warning-notification', label: '消息通知', path: '/warning/notification' }
      ]
    },
    {
      key: 'resource', label: '资源管理', icon: '🌐',
      children: [
        { key: 'resource-location', label: '位置管理', path: '/resource/location' }
      ]
    },
    {
      key: 'org', label: '组织管理', icon: '🏢',
      children: [
        { key: 'org-company', label: '公司管理', path: '/org/company' },
        { key: 'org-vendor', label: '供应商目录', path: '/org/vendor' },
        { key: 'org-product', label: '产品目录', path: '/org/product' }
      ]
    },
    {
      key: 'cost', label: '成本管理', icon: '💰',
      children: [
        { key: 'cost-fixed-asset', label: '固定资产', path: '/cost/fixed-asset' },
        { key: 'cost-expense-line', label: '费用条目', path: '/cost/expense-line' },
        { key: 'cost-cost-center', label: '成本中心', path: '/cost/cost-center' },
        { key: 'cost-depreciation', label: '折旧方案', path: '/cost/depreciation' },
        { key: 'cost-labor-rate', label: '人工费率卡', path: '/cost/labor-rate' },
        { key: 'cost-task-rate', label: '任务费率卡', path: '/cost/task-rate' },
        { key: 'cost-software-license', label: '软件License', path: '/cost/software-license' }
      ]
    },
    {
      key: 'license', label: '软件License', icon: '🔑',
      children: [
        { key: 'license-config', label: 'License配置', path: '/license/config' },
        { key: 'license-type', label: '许可证类型', path: '/license/type' },
        { key: 'license-reclaim-rule', label: '回收规则', path: '/license/reclaim-rule' },
        { key: 'license-discovery-mapping', label: '软件资产发现映射', path: '/license/discovery-mapping' },
        { key: 'license-installation', label: '软件安装', path: '/license/installation' },
        { key: 'license-usage', label: '软件使用', path: '/license/usage' }
      ]
    },
    {
      key: 'insight', label: '资产洞察', icon: '📊',
      children: [
        { key: 'insight-dashboard', label: '资产洞察看板', path: '/insight/dashboard' }
      ]
    },
    {
      key: 'recycle', label: '回收站', icon: '🗑',
      children: [
        { key: 'recycle-bin', label: '已删除资产', path: '/recycle/bin' }
      ]
    },
    {
      key: 'settings', label: '设置', icon: '⚙',
      children: [
        { key: 'settings-class', label: 'Class管理', path: '/asset/settings/class' },
        { key: 'settings-identifier-rule', label: '资产标识配置规则', path: '/asset/settings/identifier-rule' },
        { key: 'settings-qr-label', label: '二维码标签设置', path: '/asset/settings/qr-label' },
        { key: 'settings-permission', label: '权限管理', path: '/asset/settings/permission' }
      ]
    },
    // 关联产品（用户中心/CMDB/门户）
    {
      key: 'user-center', label: '用户中心', icon: '👤',
      children: [
        { key: 'uc-org', label: '组织机构', path: '/user-center/org' },
        { key: 'uc-users', label: '用户管理', path: '/user-center/users' },
        { key: 'uc-roles', label: '角色管理', path: '/user-center/roles' }
      ]
    },
    {
      key: 'cmdb', label: '配置中心', icon: '🔌',
      children: [
        { key: 'cmdb-ci', label: '配置台账', path: '/cmdb/ci' },
        { key: 'cmdb-ci-type', label: 'CI类型', path: '/cmdb/ci-type' }
      ]
    },
    {
      key: 'portal', label: '门户', icon: '🏠',
      children: [
        { key: 'portal-apps', label: '应用中心', path: '/portal/apps' }
      ]
    }
  ];

  function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const currentPath = location.hash.replace(/^#/, '') || '/portal/apps';
    // 默认展开第一个匹配项
    let activeGroup = null;
    for (const g of NAV) {
      if (!g.children) continue;
      if (g.children.some(c => currentPath.startsWith(c.path.split('/').slice(0, 3).join('/')))) {
        activeGroup = g.key;
        break;
      }
    }
    if (!activeGroup) {
      // 根据一级路径匹配
      const segs = currentPath.split('/').filter(Boolean);
      if (segs[0]) activeGroup = segs[0];
    }
    sidebar.innerHTML = NAV.map(group => {
      const isExpanded = group.key === activeGroup;
      const childHtml = (group.children || []).map(c => {
        const active = currentPath.startsWith(c.path) || (c.path === currentPath);
        return `<div class="sidebar-child ${active ? 'active' : ''}" data-nav="${UI.esc(c.path)}">${UI.esc(c.label)}</div>`;
      }).join('');
      return `
        <div class="sidebar-group">
          <div class="sidebar-item ${isExpanded ? 'expanded' : ''}" data-toggle-group="${UI.esc(group.key)}">
            <span class="sidebar-icon">${UI.esc(group.icon)}</span>
            <span>${UI.esc(group.label)}</span>
            ${group.children ? '<span class="caret">▶</span>' : ''}
          </div>
          <div class="sidebar-children">${childHtml}</div>
        </div>
      `;
    }).join('') + `
      <div class="sidebar-group" style="margin-top:24px; padding:8px 20px; font-size:12px; color:#999;">
        <div>版本 6.1.0</div>
      </div>
    `;
    // 绑定折叠
    sidebar.querySelectorAll('[data-toggle-group]').forEach(el => {
      el.onclick = () => {
        el.classList.toggle('expanded');
        const next = el.nextElementSibling;
        if (next) next.style.display = el.classList.contains('expanded') ? 'block' : 'none';
      };
      // 默认展开
      if (el.classList.contains('expanded')) {
        const next = el.nextElementSibling;
        if (next) next.style.display = 'block';
      } else {
        const next = el.nextElementSibling;
        if (next) next.style.display = 'none';
      }
    });
  }

  function init() {
    // 1. 种子数据
    SeedBuilder.ensureSeeded();
    // 2. 注册路由
    if (global.AssetModule) AssetModule.registerRoutes();
    if (global.MaintenanceModule) MaintenanceModule.registerRoutes();
    if (global.AuditModule) AuditModule.registerRoutes();
    if (global.ContractModule) ContractModule.registerRoutes();
    if (global.InventoryModule) InventoryModule.registerRoutes();
    if (global.OrgModule) OrgModule.registerRoutes();
    if (global.CostModule) CostModule.registerRoutes();
    if (global.LicenseModule) LicenseModule.registerRoutes();
    if (global.SettingsModule) SettingsModule.registerRoutes();
    if (global.ResourceModule) ResourceModule.registerRoutes();
    if (global.UserCenterModule) UserCenterModule.registerRoutes();
    if (global.CmdbModule) CmdbModule.registerRoutes();
    if (global.WarningModule) WarningModule.registerRoutes();
    if (global.SelfServiceModule) SelfServiceModule.registerRoutes();
    if (global.PortalModule) PortalModule.registerRoutes();
    // 3. 全局事件代理
    UI.bindGlobalDelegation(document);
    // 4. 渲染侧边栏
    renderSidebar();
    // 5. 监听 hash 变化
    window.addEventListener('hashchange', () => {
      renderSidebar();
      Router.handle();
    });
    // 6. 首次加载
    if (!location.hash || location.hash === '#') {
      location.hash = '#/portal/apps';
    } else {
      Router.handle();
    }
  }

  global.App = { init, renderSidebar, NAV };
  document.addEventListener('DOMContentLoaded', init);
})(window);
