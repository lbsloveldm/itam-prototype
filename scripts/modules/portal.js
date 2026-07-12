// ========================================
// ITAM 原型 - 门户模块（应用中心）
// ========================================
(function(global) {
  'use strict';

  // 应用中心（首页）
  function renderApps({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '门户', path: '/portal/apps' }, { label: '应用中心' }]);
    const apps = [
      { name: '配置中心', icon: '🛠', desc: '配置项台账与CI类型管理', color: '#1890ff', path: '/cmdb/ci' },
      { name: '用户中心', icon: '👤', desc: '组织机构、用户与角色管理', color: '#52c41a', path: '/user-center/users' },
      { name: '报告报表', icon: '📑', desc: '资产洞察与数据分析看板', color: '#faad14', path: '/insight/dashboard' },
      { name: '服务管理中心', icon: '🛎', desc: '自服务门户与个人工作台', color: '#eb2f96', path: '/self-service/portal' },
      { name: '资产管理', icon: '⚙', desc: '资产全生命周期管理', color: '#722ed1', path: '/asset/ledger' }
    ];
    pageEl.innerHTML = `
      <div class="page-header">
        <div class="page-title">应用中心</div>
        <div class="page-actions">
          <button class="btn">系统配置</button>
          <button class="btn">添加分组</button>
        </div>
      </div>
      <div class="card"><div class="card-header"><div class="card-title">常用应用 (${apps.length})</div></div>
        <div class="card-body">
          <div class="app-grid">
            ${apps.map(a => `
              <div class="app-card" data-nav="${UI.esc(a.path)}">
                <div class="app-icon" style="color:${UI.esc(a.color)}">${UI.esc(a.icon)}</div>
                <div class="app-name">${UI.esc(a.name)}</div>
                <div class="app-desc" style="font-size:12px;color:#999;margin-top:4px">${UI.esc(a.desc)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="card"><div class="card-header"><div class="card-title">更多应用 (0)</div></div>
        <div class="card-body"><div class="empty"><div class="empty-text">暂无更多应用</div></div></div>
      </div>
    `;
  }

  function registerRoutes() {
    Router.register('/portal/apps', renderApps);
  }
  global.PortalModule = { registerRoutes };
})(window);
