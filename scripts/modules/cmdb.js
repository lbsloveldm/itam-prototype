// ========================================
// ITAM 原型 - 配置中心模块（CMDB）
// 配置台账 / CI类型
// ========================================
(function(global) {
  'use strict';

  function getAssetName(id) { const x = Store.getById('assets', id); return x ? x.displayName : id; }
  function getCITypeName(id) { const x = Store.getById('ciTypes', id); return x ? x.name : id; }

  // 配置台账
  const ciMod = CrudFactory.createCrud({
    storeKey: 'cmdbCis', title: '配置台账', listPath: '/cmdb/ci',
    columns: [
      { title: '名称', field: 'name' },
      { title: '运行状态', field: 'runStatus', render: (r) => UI.statusTag(r.runStatus) },
      { title: '配置编码', field: 'code' },
      { title: '信创标识', field: 'xcFlag' },
      { title: '型号', field: 'model' },
      { title: '所属环境', field: 'env' },
      { title: '备注', field: 'note' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '配置编码', name: 'code', value: d.code, required: true }) },
      { html: UI.field({ label: '运行状态', name: 'runStatus', value: d.runStatus, type: 'select', required: true, options: ['运行中', '已下线', '已停用'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '信创标识', name: 'xcFlag', value: d.xcFlag, type: 'select', options: ['是', '否'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '型号', name: 'model', value: d.model }) + UI.field({ label: '所属环境', name: 'env', value: d.env, type: 'select', options: ['生产', '测试', '开发', '预发布'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '所属CI类型', name: 'ciType', value: d.ciType, type: 'select', options: Store.listAll('ciTypes').map(t => ({ value: t.id, label: t.name })) }) + UI.field({ label: '资产关联', name: 'asset', value: d.asset, type: 'select', options: Store.listAll('assets').map(a => ({ value: a.id, label: a.displayName })) }) },
      { colspan: 1, html: UI.field({ label: '备注', name: 'note', value: d.note, type: 'textarea', rows: 3 }) }
    ],
    breadcrumbs: {
      list: [{ label: '配置中心', path: '/cmdb/ci' }, { label: '配置台账' }],
      detail: [{ label: '配置中心', path: '/cmdb/ci' }, { label: '配置台账', path: '/cmdb/ci' }]
    }
  });

  // CI类型（只读列表）
  function renderCITypes({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '配置中心', path: '/cmdb/ci' }, { label: 'CI类型' }]);
    const all = Store.listAll('ciTypes');
    pageEl.innerHTML = UI.renderListPage({
      title: 'CI类型', subtitle: `共 ${all.length} 条`,
      toolbarLeft: '<input class="input search-box" placeholder="请输入名称">',
      toolbarRight: '<button class="btn">🔄</button>',
      columns: [
        { title: '图标', field: 'icon', link: false, render: (r) => `<span style="font-size:20px">${UI.esc(r.icon || '-')}</span>` },
        { title: '名称', field: 'name' },
        { title: '编码', field: 'code' },
        { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
      ],
      data: all,
      pagination: { total: all.length, page: 1, pageSize: 30 }
    });
  }

  function registerRoutes() {
    Router.register('/cmdb/ci', ciMod.renderList.bind(ciMod));
    Router.register('/cmdb/ci/:id', ciMod.renderDetail.bind(ciMod));
    Router.register('/cmdb/ci-type', renderCITypes);
  }
  global.CmdbModule = { registerRoutes };
})(window);
