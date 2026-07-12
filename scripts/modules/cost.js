// ========================================
// ITAM 原型 - 成本管理模块
// 固定资产/费用条目/成本中心/折旧方案/费率卡
// ========================================
(function(global) {
  'use strict';

  // 固定资产
  const faMod = CrudFactory.createCrud({
    storeKey: 'fixedAssets', title: '固定资产', listPath: '/cost/fixed-asset',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '成本中心', field: 'costCenter', render: (r) => r.costCenter ? UI.esc(getCCName(r.costCenter)) : '-' },
      { title: '价值', field: 'value', render: (r) => `${UI.esc(r.value || 0)} ${UI.esc(r.currency || '')}` },
      { title: '获取日期', field: 'acquisitionDate' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true }) },
      { html: UI.field({ label: '成本中心', name: 'costCenter', value: d.costCenter, type: 'select', options: Store.listAll('costCenters').map(c => ({ value: c.id, label: c.name })) }) + UI.field({ label: '币种', name: 'currency', value: d.currency || 'CNY', type: 'select', options: ['CNY', 'USD', 'EUR'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '价值', name: 'value', value: d.value, type: 'number' }) + UI.field({ label: '获取日期', name: 'acquisitionDate', value: d.acquisitionDate, type: 'text' }) }
    ],
    breadcrumbs: {
      list: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '固定资产' }],
      detail: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '固定资产', path: '/cost/fixed-asset' }]
    }
  });
  function getCCName(id) { const x = Store.getById('costCenters', id); return x ? x.name : id; }

  // 费用条目
  const elMod = CrudFactory.createCrud({
    storeKey: 'expenseLines', title: '费用条目', listPath: '/cost/expense-line',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '类型', field: 'type' },
      { title: '金额', field: 'amount', render: (r) => `${UI.esc(r.amount || 0)} ${UI.esc(r.currency || '')}` },
      { title: '期间', field: 'period' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true }) },
      { html: UI.field({ label: '类型', name: 'type', value: d.type, type: 'select', options: ['运营费用', '资本支出', '人力成本', '管理费用', '其他'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '金额', name: 'amount', value: d.amount, type: 'number' }) + UI.field({ label: '币种', name: 'currency', value: d.currency || 'CNY', type: 'select', options: ['CNY', 'USD', 'EUR'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '期间', name: 'period', value: d.period, placeholder: 'YYYY-MM' }) }
    ],
    breadcrumbs: {
      list: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '费用条目' }],
      detail: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '费用条目', path: '/cost/expense-line' }]
    }
  });

  // 成本中心
  const ccMod = CrudFactory.createCrud({
    storeKey: 'costCenters', title: '成本中心', listPath: '/cost/cost-center',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '负责人', field: 'manager' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true }) },
      { html: UI.field({ label: '负责人', name: 'manager', value: d.manager }) + UI.field({ label: '父级中心', name: 'parentId', type: 'select', options: [{ value: '', label: '（根）' }, ...Store.listAll('costCenters').filter(c => c.id !== d.id).map(c => ({ value: c.id, label: c.name }))] }) }
    ],
    breadcrumbs: {
      list: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '成本中心' }],
      detail: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '成本中心', path: '/cost/cost-center' }]
    }
  });

  // 折旧方案
  const dsMod = CrudFactory.createCrud({
    storeKey: 'depreciationSchemas', title: '折旧方案', listPath: '/cost/depreciation',
    columns: [
      { title: '名称', field: 'name' },
      { title: '类别', field: 'category' },
      { title: '折旧时间', field: 'depreciationTime' },
      { title: '脚本', field: 'script', render: (r) => UI.esc((r.script || '').slice(0, 30) || '-') },
      { title: '创建人', field: 'createdBy' },
      { title: '创建时间', field: 'createdTime' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '类别', name: 'category', value: d.category, type: 'select', required: true, options: ['直线法', '余额递减法', '自定义'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '折旧时间', name: 'depreciationTime', value: d.depreciationTime, placeholder: '如 3 Months' }) + UI.field({ label: '脚本', name: 'script', value: d.script, type: 'textarea', rows: 3, placeholder: 'return depreciationCal...' }) }
    ],
    breadcrumbs: {
      list: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '折旧方案' }],
      detail: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '折旧方案', path: '/cost/depreciation' }]
    }
  });

  // 人工费率卡
  const lrMod = CrudFactory.createCrud({
    storeKey: 'laborRates', title: '人工费率卡', listPath: '/cost/labor-rate',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '费率', field: 'rate' },
      { title: '单位', field: 'unit' },
      { title: '币种', field: 'currency' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true }) },
      { html: UI.field({ label: '费率', name: 'rate', value: d.rate, type: 'number' }) + UI.field({ label: '单位', name: 'unit', value: d.unit, type: 'select', options: ['小时', '天', '月'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '币种', name: 'currency', value: d.currency || 'CNY', type: 'select', options: ['CNY', 'USD', 'EUR'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '人工费率卡' }],
      detail: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '人工费率卡', path: '/cost/labor-rate' }]
    }
  });

  // 任务费率卡
  const trMod = CrudFactory.createCrud({
    storeKey: 'taskRates', title: '任务费率卡', listPath: '/cost/task-rate',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '费率', field: 'rate' },
      { title: '单位', field: 'unit' },
      { title: '币种', field: 'currency' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true }) },
      { html: UI.field({ label: '费率', name: 'rate', value: d.rate, type: 'number' }) + UI.field({ label: '单位', name: 'unit', value: d.unit, type: 'select', options: ['任务', '次', '单'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '币种', name: 'currency', value: d.currency || 'CNY', type: 'select', options: ['CNY', 'USD', 'EUR'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '任务费率卡' }],
      detail: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '任务费率卡', path: '/cost/task-rate' }]
    }
  });

  // 软件License（成本视角）
  function getSoftwareName(id) { const x = Store.getById('assetModels', id); return x ? x.name : id; }
  const cslMod = CrudFactory.createCrud({
    storeKey: 'costSoftwareLicenses', title: '软件License', listPath: '/cost/software-license',
    columns: [
      { title: '名称', field: 'name' },
      { title: '软件', field: 'software', render: (r) => r.software ? UI.esc(getSoftwareName(r.software)) : '-' },
      { title: '成本', field: 'cost' },
      { title: '期间', field: 'period' },
      { title: '币种', field: 'currency' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '软件', name: 'software', value: d.software, type: 'select', options: Store.listAll('assetModels').filter(m => m.assetType === 'software').map(m => ({ value: m.id, label: m.name })) }) },
      { html: UI.field({ label: '成本', name: 'cost', value: d.cost, type: 'number' }) + UI.field({ label: '期间', name: 'period', value: d.period, type: 'text' }) + UI.field({ label: '币种', name: 'currency', value: d.currency || 'CNY', type: 'select', options: ['CNY', 'USD', 'EUR'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '软件License' }],
      detail: [{ label: '成本管理', path: '/cost/fixed-asset' }, { label: '软件License', path: '/cost/software-license' }]
    }
  });

  function registerRoutes() {
    Router.register('/cost/fixed-asset', faMod.renderList.bind(faMod));
    Router.register('/cost/fixed-asset/:id', faMod.renderDetail.bind(faMod));
    Router.register('/cost/expense-line', elMod.renderList.bind(elMod));
    Router.register('/cost/expense-line/:id', elMod.renderDetail.bind(elMod));
    Router.register('/cost/cost-center', ccMod.renderList.bind(ccMod));
    Router.register('/cost/cost-center/:id', ccMod.renderDetail.bind(ccMod));
    Router.register('/cost/depreciation', dsMod.renderList.bind(dsMod));
    Router.register('/cost/depreciation/:id', dsMod.renderDetail.bind(dsMod));
    Router.register('/cost/labor-rate', lrMod.renderList.bind(lrMod));
    Router.register('/cost/labor-rate/:id', lrMod.renderDetail.bind(lrMod));
    Router.register('/cost/task-rate', trMod.renderList.bind(trMod));
    Router.register('/cost/task-rate/:id', trMod.renderDetail.bind(trMod));
    Router.register('/cost/software-license', cslMod.renderList.bind(cslMod));
    Router.register('/cost/software-license/:id', cslMod.renderDetail.bind(cslMod));
  }
  global.CostModule = { registerRoutes };
})(window);
