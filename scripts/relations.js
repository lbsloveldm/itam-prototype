// ========================================
// ITAM 原型 - 关联实体跳转映射
// 详情页中"关联实体"蓝链可点击下钻到对应实体
// ========================================
(function(global) {
  'use strict';

  // 关联类型 → 路由映射
  const ROUTE_MAP = {
    asset: '/asset/ledger',
    assetModel: '/asset/model',
    modelCategory: '/asset/model-category',
    ciMapping: '/asset/ci-mapping',
    ci: '/cmdb/ci',
    ciType: '/cmdb/ci-type',
    contract: '/contract/list',
    contractSpec: '/contract/spec',
    contractRenewal: '/contract/renewal',
    contractChange: '/contract/change',
    approval: '/contract/approval',
    depreciationSchema: '/cost/depreciation',
    costCenter: '/cost/cost-center',
    fixedAsset: '/cost/fixed-asset',
    expenseLine: '/cost/expense-line',
    laborRate: '/cost/labor-rate',
    taskRate: '/cost/task-rate',
    costSoftwareLicense: '/cost/software-license',
    licenseConfig: '/license/config',
    licenseType: '/license/type',
    reclaimRule: '/license/reclaim-rule',
    discoveryMapping: '/license/discovery-mapping',
    softwareInstallation: '/license/installation',
    softwareUsage: '/license/usage',
    stockroom: '/inventory/stockroom',
    stockroomType: '/inventory/stockroom-type',
    shelf: '/inventory/shelf',
    serviceLocation: '/inventory/service-location',
    stockRule: '/inventory/stock-rule',
    maintenanceOrder: '/maintenance/order',
    auditTemplate: '/audit/template',
    auditPlan: '/audit/plan',
    auditTask: '/audit/task',
    company: '/org/company',
    vendor: '/org/vendor',
    product: '/org/product',
    location: '/resource/location',
    user: '/user-center/users',
    role: '/user-center/roles',
    org: '/user-center/org',
    cls: '/asset/settings/class',
    identifierRule: '/asset/settings/identifier-rule',
    permission: '/asset/settings/permission',
    myTicket: '/self-service/tickets',
    myAudit: '/self-service/my-audits',
    stockRequest: '/self-service/stock-request',
    expiryWarning: '/warning/expiry',
    notification: '/warning/notification'
  };

  // 通用：根据类型 + id 生成跳转链接
  function linkTo(type, id) {
    const base = ROUTE_MAP[type];
    if (!base) return '#';
    return base + '/' + (id || '');
  }

  // 通用：渲染关联实体字段
  function renderRelatedField(type, value) {
    if (!value) return '<span class="text-muted">-</span>';
    if (Array.isArray(value)) {
      return value.map(v => `<a class="link" data-nav="${UI.esc(linkTo(type, v))}">${UI.esc(v)}</a>`).join(', ');
    }
    return `<a class="link" data-nav="${UI.esc(linkTo(type, value))}">${UI.esc(value)}</a>`;
  }

  global.Relations = { linkTo, renderRelatedField, ROUTE_MAP };
})(window);
