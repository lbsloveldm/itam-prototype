// ========================================
// ITAM 原型 - 预警管理模块
// 资产到期预警 / 消息通知 / 回收站
// ========================================
(function(global) {
  'use strict';

  // 资产到期预警
  function getAssetName(id) { const x = Store.getById('assets', id); return x ? x.displayName : id; }
  function getContractName(id) { const x = Store.getById('contracts', id); return x ? x.name : id; }
  function renderExpiryWarnings({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '预警管理', path: '/warning/expiry' }, { label: '资产到期预警' }]);
    const all = Store.listAll('expiryWarnings');
    pageEl.innerHTML = UI.renderListPage({
      title: '资产到期预警', subtitle: `共 ${all.length} 条`,
      toolbarLeft: '<input class="input search-box" placeholder="请输入类型/资产">',
      toolbarRight: '<button class="btn">🔄</button>',
      columns: [
        { title: '类型', field: 'type', render: (r) => UI.statusTag(r.type) },
        { title: '资产', field: 'asset', render: (r) => {
          if (!r.asset) return '-';
          if (r.type === '资产到期') return `<a class="link" data-nav="/asset/ledger/${UI.esc(r.asset)}">${UI.esc(getAssetName(r.asset))}</a>`;
          if (r.type === '合同到期') return `<a class="link" data-nav="/contract/list/${UI.esc(r.asset)}">${UI.esc(getContractName(r.asset))}</a>`;
          if (r.type === 'License 到期') return `<a class="link" data-nav="/asset/ledger/${UI.esc(r.asset)}">${UI.esc(getAssetName(r.asset))}</a>`;
          return UI.esc(r.asset);
        } },
        { title: '消息', field: 'message' },
        { title: '级别', field: 'level', render: (r) => UI.statusTag(r.level) },
        { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
        { title: '创建时间', field: 'createdTime' },
        { title: '操作', field: '_act', link: false, render: (r) => r.status === '未处理' ? `<a class="link" data-act="mark" data-id="${UI.esc(r.id)}">标记已处理</a>` : '已处理' }
      ],
      data: all,
      pagination: { total: all.length, page: 1, pageSize: 30 }
    });
    pageEl.querySelectorAll('[data-act=mark]').forEach(el => {
      el.onclick = () => {
        Store.update('expiryWarnings', el.getAttribute('data-id'), { status: '已处理' });
        UI.toast('已标记为已处理', 'success');
        renderExpiryWarnings({ pageEl, crumbEl });
      };
    });
  }

  // 消息通知
  function renderNotifications({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '预警管理', path: '/warning/expiry' }, { label: '消息通知' }]);
    const all = Store.listAll('notifications');
    pageEl.innerHTML = UI.renderListPage({
      title: '消息通知', subtitle: `共 ${all.length} 条`,
      toolbarLeft: '<input class="input search-box" placeholder="请输入标题">',
      toolbarRight: '<button class="btn">🔄</button><button class="btn">全部标记已读</button>',
      columns: [
        { title: '标题', field: 'title' },
        { title: '内容', field: 'content' },
        { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
        { title: '时间', field: 'createdTime' },
        { title: '操作', field: '_act', link: false, render: (r) => r.status === '未读' ? `<a class="link" data-act="read" data-id="${UI.esc(r.id)}">标记已读</a>` : '已读' }
      ],
      data: all,
      pagination: { total: all.length, page: 1, pageSize: 30 }
    });
    pageEl.querySelectorAll('[data-act=read]').forEach(el => {
      el.onclick = () => {
        Store.update('notifications', el.getAttribute('data-id'), { status: '已读' });
        UI.toast('已标记为已读', 'success');
        renderNotifications({ pageEl, crumbEl });
      };
    });
  }

  // 回收站
  function renderRecycleBin({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '回收站', path: '/recycle/bin' }, { label: '已删除资产' }]);
    // 从已删除的资产（assetType === 'deleted'）构造
    let bin = Store.listAll('recycleBin');
    if (bin.length === 0) {
      // 模拟从已删除的资产中恢复
      bin = [];
    }
    pageEl.innerHTML = UI.renderListPage({
      title: '已删除资产', subtitle: `共 ${bin.length} 条`,
      toolbarLeft: '<input class="input search-box" placeholder="请输入资产标识">',
      toolbarRight: '<button class="btn">🔄</button><button class="btn">清空</button>',
      columns: [
        { title: '资产标识', field: 'assetTag' },
        { title: '名称', field: 'displayName' },
        { title: '类型', field: 'assetType' },
        { title: '删除时间', field: 'deletedTime' },
        { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="restore" data-id="${UI.esc(r.id)}">恢复</a> <a class="link" data-act="purge" data-id="${UI.esc(r.id)}">永久删除</a>` }
      ],
      data: bin,
      empty: '回收站为空（删除资产后可在此恢复）',
      pagination: { total: bin.length, page: 1, pageSize: 30 }
    });
    pageEl.querySelectorAll('[data-act=restore]').forEach(el => {
      el.onclick = () => {
        const r = Store.getById('recycleBin', el.getAttribute('data-id'));
        if (r) {
          // 重新放回 assets
          const { id, deletedTime, ...rest } = r;
          Store.create('assets', rest);
          Store.remove('recycleBin', id);
          UI.toast('已恢复', 'success');
          renderRecycleBin({ pageEl, crumbEl });
        }
      };
    });
    pageEl.querySelectorAll('[data-act=purge]').forEach(el => {
      el.onclick = async () => {
        const ok = await UI.confirm({ title: '永久删除', content: '此操作不可恢复！', danger: true, okText: '永久删除' });
        if (ok) { Store.remove('recycleBin', el.getAttribute('data-id')); UI.toast('已永久删除', 'success'); renderRecycleBin({ pageEl, crumbEl }); }
      };
    });
  }

  // 资产洞察看板（简单统计）
  function renderInsight({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '资产洞察', path: '/insight/dashboard' }, { label: '资产洞察看板' }]);
    const all = Store.listAll('assets');
    const byType = {};
    all.forEach(a => byType[a.assetType] = (byType[a.assetType] || 0) + 1);
    const byState = {};
    all.forEach(a => byState[a.state] = (byState[a.state] || 0) + 1);
    pageEl.innerHTML = `
      <div class="page-header"><div class="page-title">资产洞察看板</div></div>
      <div class="statistics">
        <div class="statistic-card"><div class="statistic-title">资产总数</div><div class="statistic-value">${all.length}<span class="statistic-suffix">条</span></div></div>
        <div class="statistic-card"><div class="statistic-title">使用中</div><div class="statistic-value">${byState['In use'] || 0}</div></div>
        <div class="statistic-card"><div class="statistic-title">库存中</div><div class="statistic-value">${byState['In stock'] || 0}</div></div>
        <div class="statistic-card"><div class="statistic-title">已退役</div><div class="statistic-value">${byState['Retired'] || 0}</div></div>
      </div>
      <div class="card"><div class="card-header"><div class="card-title">按资产类型分布</div></div>
        <div class="card-body">
          ${Object.entries(byType).map(([k, v]) => `<div class="flex-between mb-8"><span>${UI.esc(k)}</span><span class="text-muted">${v} 条</span></div>`).join('')}
        </div>
      </div>
      <div class="card"><div class="card-header"><div class="card-title">按状态分布</div></div>
        <div class="card-body">
          ${Object.entries(byState).map(([k, v]) => `<div class="flex-between mb-8"><span>${UI.statusTag(k)}</span><span class="text-muted">${v} 条</span></div>`).join('')}
        </div>
      </div>
    `;
  }

  function registerRoutes() {
    Router.register('/warning/expiry', renderExpiryWarnings);
    Router.register('/warning/notification', renderNotifications);
    Router.register('/recycle/bin', renderRecycleBin);
    Router.register('/insight/dashboard', renderInsight);
  }
  global.WarningModule = { registerRoutes };
})(window);
