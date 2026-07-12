// ========================================
// ITAM 原型 - 库存管理模块
// 库房类型/库房/货架/服务位置/库存规则
// ========================================
(function(global) {
  'use strict';

  function getStockroomName(id) { const x = Store.getById('stockrooms', id); return x ? x.fullName || x.name : id; }
  function getStockroomTypeName(id) { const x = Store.getById('stockroomTypes', id); return x ? x.name : id; }
  function getLocationPath(id) { const x = Store.getById('locations', id); return x ? x.fullPath : id; }

  // 库房类型
  const stockroomTypeMod = CrudFactory.createCrud({
    storeKey: 'stockroomTypes', title: '库房类型管理', listPath: '/inventory/stockroom-type',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '是否外部库房', field: 'isExternal', render: (r) => r.isExternal ? UI.statusTag('是') : UI.statusTag('否') },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true, maxLength: 100 }) + UI.field({ label: '编码', name: 'code', value: d.code, maxLength: 50 }) },
      { html: UI.field({ label: '是否外部库房', name: 'isExternal', value: d.isExternal, type: 'switch' }) }
    ],
    breadcrumbs: {
      list: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '库房类型管理' }],
      detail: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '库房类型管理', path: '/inventory/stockroom-type' }]
    }
  });

  // 库房
  const stockroomMod = CrudFactory.createCrud({
    storeKey: 'stockrooms', title: '库房管理', listPath: '/inventory/stockroom',
    columns: [
      { title: '全称', field: 'fullName' },
      { title: '名称', field: 'name' },
      { title: '类型', field: 'typeId', render: (r) => r.typeId ? UI.esc(getStockroomTypeName(r.typeId)) : '-' },
      { title: '库房主用群组', field: 'group' },
      { title: '位置', field: 'locationId', render: (r) => r.locationId ? UI.esc(getLocationPath(r.locationId)) : '-' },
      { title: '库房管理员', field: 'manager' },
      { title: '是否外部库房', field: 'isExternal', render: (r) => r.isExternal ? UI.statusTag('是') : UI.statusTag('否') },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '全称', name: 'fullName', value: d.fullName, help: '留空默认取名称' }) + UI.field({ label: '名称', name: 'name', value: d.name, required: true, maxLength: 100 }) },
      { html: UI.field({ label: '类型', name: 'typeId', value: d.typeId, type: 'select', required: true, options: Store.listAll('stockroomTypes').map(t => ({ value: t.id, label: t.name })) }) + UI.field({ label: '库房主用群组', name: 'group', value: d.group }) },
      { html: UI.field({ label: '位置', name: 'locationId', value: d.locationId, type: 'select', options: Store.listAll('locations').map(l => ({ value: l.id, label: l.fullPath })) }) + UI.field({ label: '库房管理员', name: 'manager', value: d.manager }) },
      { html: UI.field({ label: '经度', name: 'longitude', value: d.longitude }) + UI.field({ label: '纬度', name: 'latitude', value: d.latitude }) + UI.field({ label: '是否外部库房', name: 'isExternal', value: d.isExternal, type: 'switch' }) }
    ],
    breadcrumbs: {
      list: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '库房管理' }],
      detail: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '库房管理', path: '/inventory/stockroom' }]
    }
  });

  // 货架
  const shelfMod = CrudFactory.createCrud({
    storeKey: 'shelves', title: '货架管理', listPath: '/inventory/shelf',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '所属库房', field: 'stockroomId', render: (r) => r.stockroomId ? UI.esc(getStockroomName(r.stockroomId)) : '-' },
      { title: '容量', field: 'capacity' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code }) },
      { html: UI.field({ label: '所属库房', name: 'stockroomId', value: d.stockroomId, type: 'select', required: true, options: Store.listAll('stockrooms').map(s => ({ value: s.id, label: s.fullName || s.name })) }) + UI.field({ label: '容量', name: 'capacity', value: d.capacity, type: 'number' }) }
    ],
    breadcrumbs: {
      list: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '货架管理' }],
      detail: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '货架管理', path: '/inventory/shelf' }]
    }
  });

  // 服务位置
  const slMod = CrudFactory.createCrud({
    storeKey: 'serviceLocations', title: '服务位置', listPath: '/inventory/service-location',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '所属库房', field: 'stockroomId', render: (r) => r.stockroomId ? UI.esc(getStockroomName(r.stockroomId)) : '-' },
      { title: '地址', field: 'address' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code }) },
      { html: UI.field({ label: '所属库房', name: 'stockroomId', value: d.stockroomId, type: 'select', required: true, options: Store.listAll('stockrooms').map(s => ({ value: s.id, label: s.fullName || s.name })) }) + UI.field({ label: '地址', name: 'address', value: d.address }) }
    ],
    breadcrumbs: {
      list: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '服务位置' }],
      detail: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '服务位置', path: '/inventory/service-location' }]
    }
  });

  // 库存规则
  const srMod = CrudFactory.createCrud({
    storeKey: 'stockRules', title: '库存规则配置', listPath: '/inventory/stock-rule',
    columns: [
      { title: '名称', field: 'name' },
      { title: '资产类型', field: 'assetType' },
      { title: '规格分类', field: 'modelCategory', render: (r) => UI.esc(getCategoryName(r.modelCategory)) },
      { title: '阈值', field: 'threshold' },
      { title: '告警级别', field: 'alertLevel', render: (r) => UI.statusTag(r.alertLevel) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '资产类型', name: 'assetType', value: d.assetType, type: 'select', options: ASSET_TYPES.filter ? ASSET_TYPES.filter(t => t.key !== 'all').map(t => ({ value: t.key, label: t.label })) : ['hardware', 'consumable', 'software', 'cloud', 'bundle', 'pallet'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '规格分类', name: 'modelCategory', value: d.modelCategory, type: 'select', options: Store.listAll('assetModelCategories').map(c => ({ value: c.id, label: c.name })) }) + UI.field({ label: '阈值', name: 'threshold', value: d.threshold, type: 'number' }) + UI.field({ label: '告警级别', name: 'alertLevel', value: d.alertLevel, type: 'select', options: ['info', 'warning', 'error'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '库存规则配置' }],
      detail: [{ label: '库存管理', path: '/inventory/stockroom' }, { label: '库存规则配置', path: '/inventory/stock-rule' }]
    }
  });
  function getCategoryName(id) { const x = Store.getById('assetModelCategories', id); return x ? x.name : id; }

  function registerRoutes() {
    Router.register('/inventory/stockroom-type', stockroomTypeMod.renderList.bind(stockroomTypeMod));
    Router.register('/inventory/stockroom-type/:id', stockroomTypeMod.renderDetail.bind(stockroomTypeMod));
    Router.register('/inventory/stockroom', stockroomMod.renderList.bind(stockroomMod));
    Router.register('/inventory/stockroom/:id', stockroomMod.renderDetail.bind(stockroomMod));
    Router.register('/inventory/shelf', shelfMod.renderList.bind(shelfMod));
    Router.register('/inventory/shelf/:id', shelfMod.renderDetail.bind(shelfMod));
    Router.register('/inventory/service-location', slMod.renderList.bind(slMod));
    Router.register('/inventory/service-location/:id', slMod.renderDetail.bind(slMod));
    Router.register('/inventory/stock-rule', srMod.renderList.bind(srMod));
    Router.register('/inventory/stock-rule/:id', srMod.renderDetail.bind(srMod));
  }
  global.InventoryModule = { registerRoutes };
})(window);
