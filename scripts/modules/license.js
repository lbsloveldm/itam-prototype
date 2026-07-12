// ========================================
// ITAM 原型 - 软件License模块
// License配置/类型/回收规则/发现映射/软件安装/软件使用
// ========================================
(function(global) {
  'use strict';

  function getSoftwareName(id) { const x = Store.getById('assetModels', id); return x ? x.name : id; }
  function getLicenseTypeName(id) { const x = Store.getById('licenseTypes', id); return x ? x.name : id; }
  function getAssetName(id) { const x = Store.getById('assets', id); return x ? x.displayName : id; }

  // License配置
  const lcMod = CrudFactory.createCrud({
    storeKey: 'licenseConfigs', title: 'License配置', listPath: '/license/config',
    columns: [
      { title: '名称', field: 'name' },
      { title: '类型', field: 'type', render: (r) => r.type ? UI.esc(getLicenseTypeName(r.type)) : '-' },
      { title: '软件', field: 'software', render: (r) => r.software ? UI.esc(getSoftwareName(r.software)) : '-' },
      { title: '授权数', field: 'rights' },
      { title: '合规', field: 'compliance', render: (r) => UI.statusTag(r.compliance) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '类型', name: 'type', value: d.type, type: 'select', options: Store.listAll('licenseTypes').map(t => ({ value: t.id, label: t.name })) }) },
      { html: UI.field({ label: '软件', name: 'software', value: d.software, type: 'select', required: true, options: Store.listAll('assetModels').filter(m => m.assetType === 'software').map(m => ({ value: m.id, label: m.name })) }) + UI.field({ label: '授权数', name: 'rights', value: d.rights, type: 'number' }) },
      { html: UI.field({ label: '合规', name: 'compliance', value: d.compliance || '合规', type: 'select', options: ['合规', '不合规'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '软件License', path: '/license/config' }, { label: 'License配置' }],
      detail: [{ label: '软件License', path: '/license/config' }, { label: 'License配置', path: '/license/config' }]
    }
  });

  // 许可证类型
  const ltMod = CrudFactory.createCrud({
    storeKey: 'licenseTypes', title: '许可证类型', listPath: '/license/type',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '授权模式', field: 'mode' },
      { title: '创建人', field: 'createdBy' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true }) },
      { html: UI.field({ label: '授权模式', name: 'mode', value: d.mode, type: 'select', required: true, options: ['永久', '订阅', 'SaaS', '试用'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '软件License', path: '/license/config' }, { label: '许可证类型' }],
      detail: [{ label: '软件License', path: '/license/config' }, { label: '许可证类型', path: '/license/type' }]
    }
  });

  // 回收规则
  const lrrMod = CrudFactory.createCrud({
    storeKey: 'licenseReclaimRules', title: '回收规则', listPath: '/license/reclaim-rule',
    columns: [
      { title: '名称', field: 'name' },
      { title: '软件', field: 'software', render: (r) => r.software ? UI.esc(getSoftwareName(r.software)) : '-' },
      { title: '未使用天数', field: 'days' },
      { title: '启用', field: 'enabled', render: (r) => r.enabled ? UI.statusTag('是') : UI.statusTag('否') },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '软件', name: 'software', value: d.software, type: 'select', options: Store.listAll('assetModels').filter(m => m.assetType === 'software').map(m => ({ value: m.id, label: m.name })) }) },
      { html: UI.field({ label: '未使用天数', name: 'days', value: d.days, type: 'number', help: '超过此天数未使用则自动回收（0=立即）' }) + UI.field({ label: '启用', name: 'enabled', value: d.enabled, type: 'switch' }) }
    ],
    breadcrumbs: {
      list: [{ label: '软件License', path: '/license/config' }, { label: '回收规则' }],
      detail: [{ label: '软件License', path: '/license/config' }, { label: '回收规则', path: '/license/reclaim-rule' }]
    }
  });

  // 软件发现映射
  const ldMod = CrudFactory.createCrud({
    storeKey: 'licenseDiscoveries', title: '软件资产发现映射', listPath: '/license/discovery-mapping',
    columns: [
      { title: '名称', field: 'name' },
      { title: '软件', field: 'software', render: (r) => r.software ? UI.esc(getSoftwareName(r.software)) : '-' },
      { title: '关联CI映射', field: 'mapping' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '软件', name: 'software', value: d.software, type: 'select', options: Store.listAll('assetModels').filter(m => m.assetType === 'software').map(m => ({ value: m.id, label: m.name })) }) + UI.field({ label: '关联CI映射', name: 'mapping', value: d.mapping, type: 'select', options: Store.listAll('ciMappings').map(m => ({ value: m.id, label: m.name })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '软件License', path: '/license/config' }, { label: '软件资产发现映射' }],
      detail: [{ label: '软件License', path: '/license/config' }, { label: '软件资产发现映射', path: '/license/discovery-mapping' }]
    }
  });

  // 软件安装
  const siMod = CrudFactory.createCrud({
    storeKey: 'softwareInstallations', title: '软件安装', listPath: '/license/installation',
    columns: [
      { title: '名称', field: 'name' },
      { title: '资产', field: 'asset', render: (r) => r.asset ? `<a class="link" data-nav="/asset/ledger/${UI.esc(r.asset)}">${UI.esc(getAssetName(r.asset))}</a>` : '-' },
      { title: '软件', field: 'software', render: (r) => r.software ? UI.esc(getSoftwareName(r.software)) : '-' },
      { title: '安装时间', field: 'installDate' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '资产', name: 'asset', value: d.asset, type: 'select', options: Store.listAll('assets').map(a => ({ value: a.id, label: a.displayName })) }) },
      { html: UI.field({ label: '软件', name: 'software', value: d.software, type: 'select', options: Store.listAll('assetModels').filter(m => m.assetType === 'software').map(m => ({ value: m.id, label: m.name })) }) + UI.field({ label: '安装时间', name: 'installDate', value: d.installDate, type: 'text' }) }
    ],
    breadcrumbs: {
      list: [{ label: '软件License', path: '/license/config' }, { label: '软件安装' }],
      detail: [{ label: '软件License', path: '/license/config' }, { label: '软件安装', path: '/license/installation' }]
    }
  });

  // 软件使用
  const suMod = CrudFactory.createCrud({
    storeKey: 'softwareUsages', title: '软件使用', listPath: '/license/usage',
    columns: [
      { title: '名称', field: 'name' },
      { title: '资产', field: 'asset', render: (r) => r.asset ? `<a class="link" data-nav="/asset/ledger/${UI.esc(r.asset)}">${UI.esc(getAssetName(r.asset))}</a>` : '-' },
      { title: '软件', field: 'software', render: (r) => r.software ? UI.esc(getSoftwareName(r.software)) : '-' },
      { title: '最后使用', field: 'lastUsed' },
      { title: '使用小时', field: 'usageHours' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '资产', name: 'asset', value: d.asset, type: 'select', options: Store.listAll('assets').map(a => ({ value: a.id, label: a.displayName })) }) },
      { html: UI.field({ label: '软件', name: 'software', value: d.software, type: 'select', options: Store.listAll('assetModels').filter(m => m.assetType === 'software').map(m => ({ value: m.id, label: m.name })) }) + UI.field({ label: '最后使用', name: 'lastUsed', value: d.lastUsed, type: 'text' }) + UI.field({ label: '使用小时', name: 'usageHours', value: d.usageHours, type: 'number' }) }
    ],
    breadcrumbs: {
      list: [{ label: '软件License', path: '/license/config' }, { label: '软件使用' }],
      detail: [{ label: '软件License', path: '/license/config' }, { label: '软件使用', path: '/license/usage' }]
    }
  });

  function registerRoutes() {
    Router.register('/license/config', lcMod.renderList.bind(lcMod));
    Router.register('/license/config/:id', lcMod.renderDetail.bind(lcMod));
    Router.register('/license/type', ltMod.renderList.bind(ltMod));
    Router.register('/license/type/:id', ltMod.renderDetail.bind(ltMod));
    Router.register('/license/reclaim-rule', lrrMod.renderList.bind(lrrMod));
    Router.register('/license/reclaim-rule/:id', lrrMod.renderDetail.bind(lrrMod));
    Router.register('/license/discovery-mapping', ldMod.renderList.bind(ldMod));
    Router.register('/license/discovery-mapping/:id', ldMod.renderDetail.bind(ldMod));
    Router.register('/license/installation', siMod.renderList.bind(siMod));
    Router.register('/license/installation/:id', siMod.renderDetail.bind(siMod));
    Router.register('/license/usage', suMod.renderList.bind(suMod));
    Router.register('/license/usage/:id', suMod.renderDetail.bind(suMod));
  }
  global.LicenseModule = { registerRoutes };
})(window);
