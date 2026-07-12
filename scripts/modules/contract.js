// ========================================
// ITAM 原型 - 合同管理模块
// 合同 / 合同规格 / 我的审批 / 续签 / 调整
// ========================================
(function(global) {
  'use strict';

  // 通用工具
  function getContractName(id) { const x = Store.getById('contracts', id); return x ? x.name : id; }
  function getSpecName(id) { const x = Store.getById('contractSpecs', id); return x ? x.name : id; }
  function getVendorName(id) { const x = Store.getById('vendors', id); return x ? x.name : id; }
  function getUserName(id) { const u = Store.getById('users', id); return u ? u.name : id; }

  // ===== 合同管理 =====
  const contractMod = CrudFactory.createCrud({
    storeKey: 'contracts', title: '合同管理', listPath: '/contract/list',
    columns: [
      { title: '合同编号', field: 'code' },
      { title: '名称', field: 'name' },
      { title: '类型', field: 'type' },
      { title: '合同规格', field: 'spec', render: (r) => r.spec ? `<a class="link" data-nav="/contract/spec/${UI.esc(r.spec)}">${UI.esc(getSpecName(r.spec))}</a>` : '-' },
      { title: '供应商', field: 'vendor', render: (r) => r.vendor ? UI.esc(getVendorName(r.vendor)) : '-' },
      { title: '开始日期', field: 'startDate' },
      { title: '结束日期', field: 'endDate' },
      { title: '金额', field: 'amount', render: (r) => `${UI.esc(r.amount || 0)} ${UI.esc(r.currency || '')}` },
      { title: '阶段', field: 'stage', render: (r) => UI.statusTag(r.stage) },
      { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '合同编号', name: 'code', value: d.code, required: true }) + UI.field({ label: '名称', name: 'name', value: d.name, required: true }) },
      { html: UI.field({ label: '合同规格', name: 'spec', value: d.spec, type: 'select', required: true, options: Store.listAll('contractSpecs').map(s => ({ value: s.id, label: s.name })) }) + UI.field({ label: '供应商', name: 'vendor', type: 'select', options: Store.listAll('vendors').map(v => ({ value: v.id, label: v.name })) }) },
      { html: UI.field({ label: '类型', name: 'type', value: d.type, type: 'select', required: true, options: ['维护合同', '保险合同', '租赁合同', '服务合同', '软件许可证', '订阅合同', '保证合同', '采购订单', '采购协议', '保密协议'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '父合同', name: 'parentContract', type: 'select', options: [{ value: '', label: '（无）' }, ...Store.listAll('contracts').filter(c => c.id !== d.id).map(c => ({ value: c.id, label: c.name }))] }) },
      { html: UI.field({ label: '管理员', name: 'admin', type: 'select', options: Store.listAll('users').map(u => ({ value: u.id, label: u.name })) }) + UI.field({ label: '审批人', name: 'approver', type: 'select', required: true, options: Store.listAll('users').map(u => ({ value: u.id, label: u.name })) }) + UI.field({ label: '业务负责人', name: 'bizOwner', type: 'select', options: Store.listAll('users').map(u => ({ value: u.id, label: u.name })) }) },
      { html: UI.field({ label: '阶段', name: 'stage', value: d.stage || '草稿', type: 'select', required: true, options: ['草稿', '生效中', '已过期', '已作废'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '状态', name: 'status', value: d.status || '无', type: 'select', options: ['无', '审批中', '续约已批准', '已续约'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '币种', name: 'currency', value: d.currency || 'CNY', type: 'select', options: ['CNY', 'USD', 'EUR'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '开始日期', name: 'startDate', value: d.startDate, required: true, type: 'text' }) + UI.field({ label: '结束日期', name: 'endDate', value: d.endDate, required: true, type: 'text' }) + UI.field({ label: '付款金额', name: 'amount', value: d.amount, type: 'number' }) },
      { colspan: 1, html: UI.field({ label: '描述', name: 'description', value: d.description, type: 'textarea', rows: 3 }) }
    ],
    breadcrumbs: {
      list: [{ label: '合同管理', path: '/contract/list' }, { label: '合同管理' }],
      detail: [{ label: '合同管理', path: '/contract/list' }, { label: '合同管理', path: '/contract/list' }]
    },
    onDetailExtra: {
      header: (d) => `<button class="btn" data-act="adjust">调整合同</button><button class="btn" data-act="renew">续签合同</button><button class="btn btn-danger" data-act="cancel-contract">取消合同</button>`,
      body: (root, d) => {
        const adj = root.querySelector('[data-act=adjust]');
        if (adj) adj.onclick = () => Router.go('/contract/change');
        const rn = root.querySelector('[data-act=renew]');
        if (rn) rn.onclick = () => Router.go('/contract/renewal');
        const cc = root.querySelector('[data-act=cancel-contract]');
        if (cc) cc.onclick = async () => {
          const ok = await UI.confirm({ title: '取消合同', content: '确定将该合同阶段置为"已作废"？', danger: true });
          if (ok) { Store.update('contracts', d.id, { stage: '已作废' }); UI.toast('已取消', 'success'); Router.go('/contract/list'); }
        };
      }
    }
  });

  // ===== 合同规格 =====
  const specMod = CrudFactory.createCrud({
    storeKey: 'contractSpecs', title: '合同规格', listPath: '/contract/spec',
    columns: [
      { title: '规格全称', field: 'fullName' },
      { title: '名称', field: 'name' },
      { title: '类型', field: 'type', render: (r) => UI.statusTag(r.type) },
      { title: '规格类别', field: 'category' },
      { title: '创建人', field: 'createdBy' },
      { title: '创建时间', field: 'createdTime' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '规格全称', name: 'fullName', value: d.fullName, required: true }) + UI.field({ label: '名称', name: 'name', value: d.name, required: true }) },
      { html: UI.field({ label: '类型', name: 'type', value: d.type, type: 'select', required: true, options: ['维护合同', '软件订阅', '租赁合同', '采购合同', '服务合同'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '规格类别', name: 'category', value: d.category, type: 'select', required: true, options: ['Contract', '维修合同分类', '订阅合同分类'].map(v => ({ value: v, label: v })) }) },
      { colspan: 1, html: UI.field({ label: '概要信息', name: 'summary', value: d.summary, type: 'textarea', rows: 3 }) }
    ],
    breadcrumbs: {
      list: [{ label: '合同管理', path: '/contract/list' }, { label: '合同规格' }],
      detail: [{ label: '合同管理', path: '/contract/list' }, { label: '合同规格', path: '/contract/spec' }]
    }
  });

  // ===== 我的审批（特殊：内联通过/拒绝） =====
  function renderApprovals({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '合同管理', path: '/contract/list' }, { label: '我的审批' }]);
    const all = Store.listAll('myApprovals');
    const cols = [
      { title: '审批结果', field: 'result', render: (r) => UI.statusTag(r.result) },
      { title: '审批人', field: 'approver' },
      { title: '待审批合同', field: 'contractName', render: (r) => {
        const m = (r.contractName || '').match(/^(CT\d+)/);
        if (m) {
          const c = Store.listAll('contracts').find(x => x.code === m[1]);
          if (c) return `<a class="link" data-nav="/contract/list/${UI.esc(c.id)}">${UI.esc(r.contractName)}</a>`;
        }
        return UI.esc(r.contractName);
      } },
      { title: '备注', field: 'notes' },
      { title: '创建时间', field: 'createdTime' },
      { title: '操作', field: '_act', link: false, render: (r) => {
        if (r.result === '待审批') return `<a class="link" data-act="approve" data-id="${UI.esc(r.id)}">通过</a> <a class="link" data-act="reject" data-id="${UI.esc(r.id)}">拒绝</a> <a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>`;
        return `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>`;
      } }
    ];
    pageEl.innerHTML = UI.renderListPage({
      title: '我的审批', subtitle: `共 ${all.length} 条`,
      toolbarLeft: '<input class="input search-box" placeholder="请输入合同/审批人">',
      toolbarRight: '<button class="btn">🔄</button>',
      columns: cols, data: all, pagination: null
    });
    pageEl.querySelectorAll('[data-act=del]').forEach(el => {
      el.onclick = async () => { const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true }); if (ok) { Store.remove('myApprovals', el.getAttribute('data-id')); UI.toast('删除成功', 'success'); renderApprovals({ pageEl, crumbEl }); } };
    });
    pageEl.querySelectorAll('[data-act=approve]').forEach(el => {
      el.onclick = () => {
        Store.update('myApprovals', el.getAttribute('data-id'), { result: '已批准' });
        // 联动：把对应合同状态置为"续约已批准"
        const apv = Store.getById('myApprovals', el.getAttribute('data-id'));
        if (apv) {
          const m = (apv.contractName || '').match(/^(CT\d+)/);
          if (m) {
            const c = Store.listAll('contracts').find(x => x.code === m[1]);
            if (c) Store.update('contracts', c.id, { status: '续约已批准' });
          }
        }
        UI.toast('已通过', 'success');
        renderApprovals({ pageEl, crumbEl });
      };
    });
    pageEl.querySelectorAll('[data-act=reject]').forEach(el => {
      el.onclick = () => {
        Store.update('myApprovals', el.getAttribute('data-id'), { result: '已拒绝' });
        UI.toast('已拒绝', 'warning');
        renderApprovals({ pageEl, crumbEl });
      };
    });
  }

  // ===== 续签记录 =====
  const renewMod = CrudFactory.createCrud({
    storeKey: 'contractRenewals', title: '续签记录', listPath: '/contract/renewal',
    columns: [
      { title: '合同', field: 'contractCode', render: (r) => r.contractCode ? `<a class="link" data-nav="/contract/renewal/${UI.esc(r.id)}">${UI.esc(r.contractCode)}</a>` : '-' },
      { title: '前序合同', field: 'oldContract' },
      { title: '原到期', field: 'oldEnd' },
      { title: '新到期', field: 'newEnd' },
      { title: '金额变化', field: 'amountChange' },
      { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '合同编号', name: 'contractCode', value: d.contractCode, required: true }) + UI.field({ label: '前序合同', name: 'oldContract', value: d.oldContract }) },
      { html: UI.field({ label: '原到期', name: 'oldEnd', value: d.oldEnd, type: 'text' }) + UI.field({ label: '新到期', name: 'newEnd', value: d.newEnd, type: 'text' }) + UI.field({ label: '金额变化', name: 'amountChange', value: d.amountChange, type: 'number' }) },
      { html: UI.field({ label: '状态', name: 'status', value: d.status, type: 'select', options: ['草稿', '生效中', '已续约', '已作废'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '合同管理', path: '/contract/list' }, { label: '续签记录' }],
      detail: [{ label: '合同管理', path: '/contract/list' }, { label: '续签记录', path: '/contract/renewal' }]
    }
  });

  // ===== 调整记录 =====
  const changeMod = CrudFactory.createCrud({
    storeKey: 'contractChanges', title: '调整记录', listPath: '/contract/change',
    columns: [
      { title: '合同编号', field: 'contractCode', render: (r) => r.contractCode ? `<a class="link" data-nav="/contract/change/${UI.esc(r.id)}">${UI.esc(r.contractCode)}</a>` : '-' },
      { title: '调整类型', field: 'changeType' },
      { title: '原金额', field: 'oldAmount' },
      { title: '新金额', field: 'newAmount' },
      { title: '原因', field: 'reason' },
      { title: '创建时间', field: 'createdTime' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '合同编号', name: 'contractCode', value: d.contractCode, required: true }) + UI.field({ label: '调整类型', name: 'changeType', type: 'select', options: ['金额调整', '期限调整', '范围调整', '负责人调整'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '原金额', name: 'oldAmount', value: d.oldAmount, type: 'number' }) + UI.field({ label: '新金额', name: 'newAmount', value: d.newAmount, type: 'number' }) },
      { colspan: 1, html: UI.field({ label: '原因', name: 'reason', value: d.reason, type: 'textarea', rows: 3 }) }
    ],
    breadcrumbs: {
      list: [{ label: '合同管理', path: '/contract/list' }, { label: '调整记录' }],
      detail: [{ label: '合同管理', path: '/contract/list' }, { label: '调整记录', path: '/contract/change' }]
    }
  });

  // ===== 软件对账 =====
  const reconMod = CrudFactory.createCrud({
    storeKey: 'reconciliation', title: '对账记录', listPath: '/reconciliation/record',
    columns: [
      { title: '对账单号', field: 'code' },
      { title: '对账期间', field: 'period' },
      { title: '软件', field: 'software' },
      { title: '购买数', field: 'purchased' },
      { title: '安装数', field: 'installed' },
      { title: '使用数', field: 'used' },
      { title: '差异', field: 'diff', render: (r) => UI.tag(((r.purchased || 0) - (r.used || 0)), ((r.purchased || 0) - (r.used || 0)) >= 0 ? 'green' : 'red') },
      { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) }
    ],
    formFields: (d) => [],
    breadcrumbs: {
      list: [{ label: '软件对账', path: '/reconciliation/record' }, { label: '对账记录' }],
      detail: [{ label: '软件对账', path: '/reconciliation/record' }, { label: '对账记录', path: '/reconciliation/record' }]
    }
  });
  // 对账记录只读，不显示新建

  // 预填一些对账数据
  function ensureReconciliation() {
    if (Store.listAll('reconciliation').length === 0) {
      const all = Store.listAll('licenseConfigs');
      all.forEach(lc => {
        const sw = Store.getById('assetModels', lc.software);
        const installed = Store.listAll('softwareInstallations').filter(si => si.software === lc.software).length;
        const used = Store.listAll('softwareUsages').filter(su => su.software === lc.software).length;
        Store.create('reconciliation', {
          code: 'RC' + (1000 + Math.floor(Math.random() * 9000)),
          period: '2025-01',
          software: lc.software,
          softwareName: sw ? sw.name : '',
          purchased: lc.rights,
          installed, used,
          status: installed === used ? '平衡' : '差异'
        });
      });
    }
  }

  function registerRoutes() {
    ensureReconciliation();
    Router.register('/contract/list', contractMod.renderList.bind(contractMod));
    Router.register('/contract/list/:id', contractMod.renderDetail.bind(contractMod));
    Router.register('/contract/spec', specMod.renderList.bind(specMod));
    Router.register('/contract/spec/:id', specMod.renderDetail.bind(specMod));
    Router.register('/contract/approval', renderApprovals);
    Router.register('/contract/renewal', renewMod.renderList.bind(renewMod));
    Router.register('/contract/renewal/:id', renewMod.renderDetail.bind(renewMod));
    Router.register('/contract/change', changeMod.renderList.bind(changeMod));
    Router.register('/contract/change/:id', changeMod.renderDetail.bind(changeMod));
    Router.register('/reconciliation/record', (ctx) => {
      const all = Store.listAll('reconciliation');
      const cols = [
        { title: '对账单号', field: 'code', render: (r) => `<a class="link" data-nav="/reconciliation/record/${UI.esc(r.id)}">${UI.esc(r.code)}</a>` },
        { title: '对账期间', field: 'period' },
        { title: '软件', field: 'softwareName' },
        { title: '购买数', field: 'purchased' },
        { title: '安装数', field: 'installed' },
        { title: '使用数', field: 'used' },
        { title: '差异', field: '_diff', link: false, render: (r) => UI.tag(((r.purchased || 0) - (r.used || 0)), ((r.purchased || 0) - (r.used || 0)) >= 0 ? 'green' : 'red') },
        { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) }
      ];
      ctx.pageEl.innerHTML = UI.renderListPage({
        title: '对账记录', subtitle: `共 ${all.length} 条`,
        toolbarLeft: '<input class="input search-box" placeholder="请输入对账单号">',
        toolbarRight: '<button class="btn">🔄</button><button class="btn">导出</button>',
        columns: cols, data: all, pagination: { total: all.length, page: 1, pageSize: 30 }
      });
    });
    Router.register('/reconciliation/record/:id', ({ pageEl, crumbEl, params }) => {
      const r = Store.getById('reconciliation', params.id);
      if (!r) { pageEl.innerHTML = UI.render404('/reconciliation/record'); return; }
      Router.setCrumb(crumbEl, [{ label: '软件对账', path: '/reconciliation/record' }, { label: '对账记录', path: '/reconciliation/record' }, { label: r.code }]);
      pageEl.innerHTML = `
        <div class="page-header"><div class="page-title">${UI.esc(r.code)}</div><div class="page-actions"><button class="btn" data-act="cancel">返回</button></div></div>
        <div class="card"><div class="card-body">
          ${UI.renderHeadInfo([
            { label: '对账期间', value: r.period },
            { label: '软件', value: r.softwareName },
            { label: '状态', value: r.status, render: () => UI.statusTag(r.status) }
          ])}
          <div class="form-row-3 mt-16">
            ${UI.field({ label: '购买数', name: '_p', value: r.purchased, disabled: true })}
            ${UI.field({ label: '安装数', name: '_i', value: r.installed, disabled: true })}
            ${UI.field({ label: '使用数', name: '_u', value: r.used, disabled: true })}
          </div>
        </div></div>
      `;
      pageEl.querySelector('[data-act=cancel]').onclick = () => Router.go('/reconciliation/record');
    });
  }
  global.ContractModule = { registerRoutes };
})(window);
