// ========================================
// ITAM 原型 - 自服务模块
// 门户 / 我的工单 / 我的资产 / 我的盘点 / 我的维护 / 我的合同 / 库存不足预警
// ========================================
(function(global) {
  'use strict';

  // ===== 自服务门户 =====
  function renderPortal({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '自服务', path: '/self-service/portal' }, { label: '自服务门户' }]);
    const me = 'user-3';
    const myAssets = Store.listAll('assets').filter(a => a.assignedTo === me);
    const myTickets = Store.listAll('myTickets').filter(t => t.createdBy === me);
    const myAudits = Store.listAll('auditTasks').filter(t => t.assignee === me);
    const stockReqs = Store.listAll('stockRequests').filter(s => s.createdBy === me);

    pageEl.innerHTML = `
      <div class="page-header"><div class="page-title">自服务门户</div></div>
      <div class="statistics">
        <div class="statistic-card"><div class="statistic-title">我的资产</div><div class="statistic-value">${myAssets.length}</div></div>
        <div class="statistic-card"><div class="statistic-title">进行中工单</div><div class="statistic-value">${myTickets.filter(t => t.status !== '已完成').length}</div></div>
        <div class="statistic-card"><div class="statistic-title">待盘点任务</div><div class="statistic-value">${myAudits.filter(t => t.status !== 'Completed').length}</div></div>
        <div class="statistic-card"><div class="statistic-title">待审批申请</div><div class="statistic-value">${stockReqs.filter(s => s.status === '待审批').length}</div></div>
      </div>
      <div class="card"><div class="card-header"><div class="card-title">常用应用</div></div>
        <div class="card-body">
          <div class="app-grid">
            <div class="app-card" data-nav="/self-service/tickets/new"><div class="app-icon">📝</div><div class="app-name">提交工单</div></div>
            <div class="app-card" data-nav="/self-service/my-assets"><div class="app-icon">💼</div><div class="app-name">我的资产</div></div>
            <div class="app-card" data-nav="/self-service/my-audits"><div class="app-icon">📋</div><div class="app-name">我的盘点</div></div>
            <div class="app-card" data-nav="/self-service/my-maintenance"><div class="app-icon">🔧</div><div class="app-name">我的维护</div></div>
            <div class="app-card" data-nav="/self-service/my-contracts"><div class="app-icon">📄</div><div class="app-name">我的合同</div></div>
            <div class="app-card" data-nav="/self-service/stock-request"><div class="app-icon">📦</div><div class="app-name">库存申请</div></div>
          </div>
        </div>
      </div>
    `;
  }

  // ===== 我的工单 =====
  function getUserName(id) { const u = Store.getById('users', id); return u ? u.name : id; }
  const ticketMod = CrudFactory.createCrud({
    storeKey: 'myTickets', title: '我的工单', listPath: '/self-service/tickets',
    columns: [
      { title: '工单号', field: 'no' },
      { title: '主题', field: 'subject' },
      { title: '类型', field: 'type' },
      { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
      { title: '优先级', field: 'priority', render: (r) => UI.tag(r.priority, r.priority === '高' ? 'red' : r.priority === '中' ? 'orange' : 'blue') },
      { title: '创建人', field: 'createdBy', render: (r) => UI.esc(getUserName(r.createdBy)) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '工单号', name: 'no', value: d.no, required: true, placeholder: '保存时自动生成' }) + UI.field({ label: '主题', name: 'subject', value: d.subject, required: true }) },
      { html: UI.field({ label: '类型', name: 'type', value: d.type, type: 'select', required: true, options: ['故障报修', '资产申领', '软件申请', '权限申请', '其他'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '状态', name: 'status', value: d.status || '待处理', type: 'select', options: ['待处理', '处理中', '已完成', '已关闭'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '优先级', name: 'priority', value: d.priority || '中', type: 'select', options: ['高', '中', '低'].map(v => ({ value: v, label: v })) }) },
      { colspan: 1, html: UI.field({ label: '描述', name: 'description', value: d.description, type: 'textarea', rows: 3 }) }
    ],
    breadcrumbs: {
      list: [{ label: '自服务', path: '/self-service/portal' }, { label: '我的工单' }],
      detail: [{ label: '自服务', path: '/self-service/portal' }, { label: '我的工单', path: '/self-service/tickets' }]
    }
  });

  // ===== 我的资产（只读列表） =====
  function renderMyAssets({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '自服务', path: '/self-service/portal' }, { label: '我的资产' }]);
    const me = 'user-3';
    const all = Store.listAll('assets').filter(a => a.assignedTo === me);
    pageEl.innerHTML = UI.renderListPage({
      title: '我的资产', subtitle: `共 ${all.length} 条`,
      toolbarLeft: '<input class="input search-box" placeholder="请输入资产标识">',
      toolbarRight: '<button class="btn">🔄</button>',
      columns: [
        { title: '资产标识', field: 'assetTag', render: (r) => `<a class="link" data-nav="/asset/ledger/${UI.esc(r.id)}">${UI.esc(r.assetTag)}</a>` },
        { title: '名称', field: 'displayName' },
        { title: '类型', field: 'assetType', render: (r) => UI.statusTag(AssetModule.ASSET_TYPES.find(t => t.key === r.assetType)?.label || r.assetType) },
        { title: '状态', field: 'state', render: (r) => UI.statusTag(r.state) },
        { title: '使用人', field: 'assignedTo', render: (r) => UI.esc(getUserName(r.assignedTo)) },
        { title: '位置', field: 'location', render: (r) => r.location ? UI.esc((Store.getById('locations', r.location) || {}).fullPath || r.location) : '-' }
      ],
      data: all,
      pagination: { total: all.length, page: 1, pageSize: 30 }
    });
  }

  // ===== 我的盘点 =====
  function renderMyAudits({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '自服务', path: '/self-service/portal' }, { label: '我的盘点' }]);
    const me = 'user-3';
    const all = Store.listAll('auditTasks').filter(t => t.assignee === me);
    pageEl.innerHTML = UI.renderListPage({
      title: '我的盘点', subtitle: `共 ${all.length} 条`,
      toolbarLeft: '<input class="input search-box" placeholder="请输入任务名">',
      toolbarRight: '<button class="btn">🔄</button>',
      columns: [
        { title: '任务名', field: 'name', render: (r) => `<a class="link" data-nav="/self-service/my-audits/${UI.esc(r.id)}">${UI.esc(r.name)}</a>` },
        { title: '编号', field: 'code' },
        { title: '盘点计划', field: 'plan' },
        { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
        { title: '启动时间', field: 'bootTime' }
      ],
      data: all,
      pagination: { total: all.length, page: 1, pageSize: 30 }
    });
  }

  // 盘点提交表单（自服务子页）
  function renderMyAuditDetail({ pageEl, crumbEl, params }) {
    const t = Store.getById('auditTasks', params.id);
    if (!t) { pageEl.innerHTML = UI.render404('/self-service/my-audits'); return; }
    Router.setCrumb(crumbEl, [{ label: '自服务', path: '/self-service/portal' }, { label: '我的盘点', path: '/self-service/my-audits' }, { label: t.name }]);
    pageEl.innerHTML = `
      <div class="page-header"><div class="page-title">${UI.esc(t.name)}</div><div class="page-actions"><button class="btn" data-act="cancel">返回</button><button class="btn btn-primary" data-act="submit">提交盘点结果</button></div></div>
      <div class="card"><div class="card-body">
        ${UI.renderHeadInfo([
          { label: '编号', value: t.code },
          { label: '盘点计划', value: t.plan },
          { label: '状态', value: '', render: () => UI.statusTag(t.status) }
        ])}
        ${UI.field({ label: '盘点结果', name: 'result', value: t.result, type: 'textarea', rows: 3 })}
        ${UI.field({ label: '盘点说明', name: 'note', value: '', type: 'textarea', rows: 3 })}
      </div></div>
    `;
    pageEl.querySelector('[data-act=submit]').onclick = () => {
      const r = pageEl.querySelector('[name=result]').value;
      Store.update('auditTasks', t.id, { result: r || '已提交', status: 'Completed' });
      UI.toast('盘点结果已提交', 'success');
      Router.go('/self-service/my-audits');
    };
    pageEl.querySelector('[data-act=cancel]').onclick = () => Router.go('/self-service/my-audits');
  }

  // ===== 我的维护（只读列表） =====
  function renderMyMaintenance({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '自服务', path: '/self-service/portal' }, { label: '我的维护' }]);
    const all = Store.listAll('maintenanceOrders');
    pageEl.innerHTML = UI.renderListPage({
      title: '我的维护', subtitle: `共 ${all.length} 条`,
      toolbarLeft: '<input class="input search-box" placeholder="请输入工单名">',
      toolbarRight: '<button class="btn">🔄</button>',
      columns: [
        { title: '工单名', field: 'name' },
        { title: '类型', field: 'type' },
        { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
        { title: '处理人', field: 'assignee', render: (r) => UI.esc(getUserName(r.assignee)) }
      ],
      data: all,
      pagination: { total: all.length, page: 1, pageSize: 30 }
    });
  }

  // ===== 我的合同（只读） =====
  function renderMyContracts({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '自服务', path: '/self-service/portal' }, { label: '我的合同' }]);
    const all = Store.listAll('contracts');
    pageEl.innerHTML = UI.renderListPage({
      title: '我的合同', subtitle: `共 ${all.length} 条`,
      toolbarLeft: '<input class="input search-box" placeholder="请输入合同名">',
      toolbarRight: '<button class="btn">🔄</button>',
      columns: [
        { title: '合同编号', field: 'code' },
        { title: '名称', field: 'name' },
        { title: '类型', field: 'type' },
        { title: '阶段', field: 'stage', render: (r) => UI.statusTag(r.stage) },
        { title: '开始日期', field: 'startDate' },
        { title: '结束日期', field: 'endDate' }
      ],
      data: all,
      pagination: { total: all.length, page: 1, pageSize: 30 }
    });
  }

  // ===== 库存不足预警 =====
  function getModelName(id) { const x = Store.getById('assetModels', id); return x ? x.name : id; }
  const srMod = CrudFactory.createCrud({
    storeKey: 'stockRequests', title: '库存不足预警', listPath: '/self-service/stock-request',
    columns: [
      { title: '主题', field: 'subject' },
      { title: '资产类型', field: 'assetType', render: (r) => UI.statusTag(AssetModule.ASSET_TYPES.find(t => t.key === r.assetType)?.label || r.assetType) },
      { title: '规格', field: 'model', render: (r) => r.model ? UI.esc(getModelName(r.model)) : '-' },
      { title: '当前库存', field: 'currentStock' },
      { title: '阈值', field: 'threshold' },
      { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '主题', name: 'subject', value: d.subject, required: true }) + UI.field({ label: '资产类型', name: 'assetType', type: 'select', required: true, options: AssetModule.ASSET_TYPES.filter(t => t.key !== 'all').map(t => ({ value: t.key, label: t.label })) }) },
      { html: UI.field({ label: '规格', name: 'model', type: 'select', options: Store.listAll('assetModels').map(m => ({ value: m.id, label: m.name })) }) + UI.field({ label: '当前库存', name: 'currentStock', value: d.currentStock, type: 'number' }) + UI.field({ label: '阈值', name: 'threshold', value: d.threshold, type: 'number' }) },
      { html: UI.field({ label: '状态', name: 'status', value: d.status || '待审批', type: 'select', options: ['待审批', '已批准', '已拒绝'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '自服务', path: '/self-service/portal' }, { label: '库存不足预警' }],
      detail: [{ label: '自服务', path: '/self-service/portal' }, { label: '库存不足预警', path: '/self-service/stock-request' }]
    }
  });

  function registerRoutes() {
    Router.register('/self-service/portal', renderPortal);
    Router.register('/self-service/tickets', ticketMod.renderList.bind(ticketMod));
    Router.register('/self-service/tickets/:id', ticketMod.renderDetail.bind(ticketMod));
    Router.register('/self-service/my-assets', renderMyAssets);
    Router.register('/self-service/my-audits', renderMyAudits);
    Router.register('/self-service/my-audits/:id', renderMyAuditDetail);
    Router.register('/self-service/my-maintenance', renderMyMaintenance);
    Router.register('/self-service/my-contracts', renderMyContracts);
    Router.register('/self-service/stock-request', srMod.renderList.bind(srMod));
    Router.register('/self-service/stock-request/:id', srMod.renderDetail.bind(srMod));
  }
  global.SelfServiceModule = { registerRoutes };
})(window);
