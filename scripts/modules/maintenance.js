// ========================================
// ITAM 原型 - 资产维护模块（维护工单）
// ========================================
(function(global) {
  'use strict';

  let moKw = '', moPage = 1, moSize = 30;
  function renderMaintenanceList({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [
      { label: '资产维护', path: '/maintenance/order' },
      { label: '维护工单' }
    ]);
    const all = Store.listAll('maintenanceOrders');
    const filtered = moKw ? all.filter(m => (m.name + m.type + m.status).toLowerCase().includes(moKw.toLowerCase())) : all;
    const start = (moPage - 1) * moSize;
    const data = filtered.slice(start, start + moSize);
    pageEl.innerHTML = UI.renderListPage({
      title: '维护工单', subtitle: `共 ${all.length} 条`,
      toolbarLeft: `<input class="input search-box" placeholder="请输入名称" value="${UI.esc(moKw)}" data-search-input><button class="btn" data-search-btn>搜索</button>`,
      toolbarRight: `<button class="btn">🔄</button><button class="btn">▼ 筛选</button><button class="btn">保存视图</button><button class="btn btn-primary" data-act="new">+ 新建</button><button class="btn">更多 ▾</button>`,
      columns: [
        { title: '工单号', field: 'name', render: (row) => `<a class="link" data-nav="/maintenance/order/${UI.esc(row.id)}">${UI.esc(row.name)}</a>` },
        { title: '资产', field: 'asset', render: (row) => row.asset ? `<a class="link" data-nav="/asset/ledger/${UI.esc(row.asset)}">${UI.esc(getAssetName(row.asset))}</a>` : '-' },
        { title: '类型', field: 'type' },
        { title: '优先级', field: 'priority', render: (row) => UI.tag(row.priority, row.priority === '高' ? 'red' : row.priority === '中' ? 'orange' : 'blue') },
        { title: '状态', field: 'status', render: (row) => UI.statusTag(row.status) },
        { title: '处理人', field: 'assignee', render: (row) => UI.esc(getUserName(row.assignee)) },
        { title: '创建时间', field: 'createdTime' },
        { title: '操作', render: (row) => `<a class="link" data-act="del" data-id="${UI.esc(row.id)}">删除</a>` }
      ],
      data,
      pagination: { total: filtered.length, page: moPage, pageSize: moSize },
      onPageChange: (p) => { moPage = p; renderMaintenanceList({ pageEl, crumbEl }); },
      onPageSizeChange: (s) => { moSize = s; moPage = 1; renderMaintenanceList({ pageEl, crumbEl }); }
    });
    root_event_bind(pageEl);
  }
  function root_event_bind(root) {
    const searchBtn = root.querySelector('[data-search-btn]');
    if (searchBtn) searchBtn.onclick = () => { moKw = root.querySelector('[data-search-input]').value; moPage = 1; renderMaintenanceList({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); };
    const newBtn = root.querySelector('[data-act=new]');
    if (newBtn) newBtn.onclick = () => Router.go('/maintenance/order/new');
    root.querySelectorAll('[data-act=del]').forEach(el => {
      el.onclick = async (e) => { e.stopPropagation(); const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true }); if (ok) { Store.remove('maintenanceOrders', el.getAttribute('data-id')); UI.toast('删除成功', 'success'); renderMaintenanceList({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); } };
    });
  }
  function renderMaintenanceDetail({ pageEl, crumbEl, params }) {
    const root = pageEl;
    const isNew = params.id === 'new';
    let data = isNew ? {} : Store.getById('maintenanceOrders', params.id);
    if (!isNew && !data) { root.innerHTML = UI.render404('/maintenance/order'); return; }
    Router.setCrumb(crumbEl, [
      { label: '资产维护', path: '/maintenance/order' },
      { label: '维护工单', path: '/maintenance/order' },
      { label: isNew ? '新建工单' : data.name }
    ]);
    root.innerHTML = `
      <div class="page-header">
        <div class="page-title">${isNew ? '新建维护工单' : UI.esc(data.name)}</div>
        <div class="page-actions">
          <button class="btn btn-primary" data-act="save">保存</button>
          <button class="btn" data-act="cancel">取消</button>
          ${!isNew ? '<button class="btn btn-danger" data-act="delete">删除</button>' : ''}
        </div>
      </div>
      <div class="card"><div class="card-body">
        <div class="form-row">
          ${UI.field({ label: '工单名', name: 'name', value: data.name, required: true })}
          ${UI.field({ label: '资产', name: 'asset', value: data.asset, type: 'select', options: Store.listAll('assets').map(a => ({ value: a.id, label: a.displayName })) })}
        </div>
        <div class="form-row-3">
          ${UI.field({ label: '类型', name: 'type', value: data.type, type: 'select', options: ['维修', '保养', '巡检', '升级'].map(v => ({ value: v, label: v })) })}
          ${UI.field({ label: '优先级', name: 'priority', value: data.priority, type: 'select', options: ['高', '中', '低'].map(v => ({ value: v, label: v })) })}
          ${UI.field({ label: '状态', name: 'status', value: data.status || '待处理', type: 'select', options: ['待处理', '处理中', '已完成', '已关闭'].map(v => ({ value: v, label: v })) })}
        </div>
        <div class="form-row">
          ${UI.field({ label: '处理人', name: 'assignee', value: data.assignee, type: 'select', options: Store.listAll('users').map(u => ({ value: u.id, label: u.name })) })}
          ${UI.field({ label: '创建人', name: 'createdBy', value: data.createdBy || 'Admin', disabled: true })}
        </div>
        ${UI.field({ label: '备注', name: 'notes', value: data.notes, type: 'textarea', rows: 3 })}
      </div></div>
    `;
    root.querySelector('[data-act=save]').onclick = () => {
      const collected = UI.collectForm(root);
      Object.assign(data, collected);
      if (!data.name) { UI.toast('请填写工单名', 'error'); return; }
      if (isNew) { Store.create('maintenanceOrders', data); UI.toast('创建成功', 'success'); }
      else { Store.update('maintenanceOrders', data.id, data); UI.toast('保存成功', 'success'); }
      Router.go('/maintenance/order');
    };
    root.querySelector('[data-act=cancel]').onclick = () => Router.go('/maintenance/order');
    if (!isNew) root.querySelector('[data-act=delete]').onclick = async () => {
      const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true });
      if (ok) { Store.remove('maintenanceOrders', data.id); UI.toast('删除成功', 'success'); Router.go('/maintenance/order'); }
    };
  }
  function getAssetName(id) { const a = Store.getById('assets', id); return a ? a.displayName : id; }
  function getUserName(id) { const u = Store.getById('users', id); return u ? u.name : id; }
  function registerRoutes() {
    Router.register('/maintenance/order', renderMaintenanceList);
    Router.register('/maintenance/order/:id', renderMaintenanceDetail);
  }
  global.MaintenanceModule = { registerRoutes };
})(window);
