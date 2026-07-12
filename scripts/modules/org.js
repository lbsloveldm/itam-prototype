// ========================================
// ITAM 原型 - 组织管理模块
// 公司 / 供应商 / 产品
// ========================================
(function(global) {
  'use strict';

  // 公司
  const companyMod = CrudFactory.createCrud({
    storeKey: 'companies', title: '公司管理', listPath: '/org/company',
    columns: [
      { title: '公司名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '类型', field: 'type', render: (r) => UI.statusTag(r.type) },
      { title: '联系人', field: 'contact' },
      { title: '电话', field: 'phone' },
      { title: '地址', field: 'address', render: (r) => UI.esc((r.address || '').slice(0, 30)) },
      { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status === 'active' ? '正常合作中' : r.status) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '公司名称', name: 'name', value: d.name, required: true, maxLength: 100 }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true, maxLength: 50 }) },
      { html: UI.field({ label: '类型', name: 'type', value: d.type, type: 'select', required: true, options: ['供应商', '制造商', '客户', '综合'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '联系人', name: 'contact', value: d.contact, maxLength: 50 }) },
      { html: UI.field({ label: '电话', name: 'phone', value: d.phone, maxLength: 50 }) + UI.field({ label: '邮箱', name: 'email', value: d.email, maxLength: 100 }) },
      { html: UI.field({ label: '地址', name: 'address', value: d.address, maxLength: 200 }) + UI.field({ label: '网站', name: 'website', value: d.website, maxLength: 200 }) },
      { html: UI.field({ label: '经理', name: 'manager', value: d.manager }) + UI.field({ label: '等级', name: 'grade', value: d.grade, type: 'select', options: ['A', 'B', 'C'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '状态', name: 'status', value: d.status || 'active', type: 'select', required: true, options: [{ value: 'active', label: '正常合作中' }, { value: 'inactive', label: '停止合作' }] }) }
    ],
    breadcrumbs: {
      list: [{ label: '组织管理', path: '/org/company' }, { label: '公司管理' }],
      detail: [{ label: '组织管理', path: '/org/company' }, { label: '公司管理', path: '/org/company' }]
    },
    onListExtra: (root) => {
      const actions = root.querySelector('.page-actions');
      if (actions) {
        const imp = document.createElement('button');
        imp.className = 'btn';
        imp.textContent = '导入';
        imp.onclick = () => {
          const body = `
            <div style="margin-bottom:16px"><a class="link" data-act="dl-tpl">下载模板</a></div>
            <div style="border:1px dashed #d9d9d9; padding:40px 20px; text-align:center; border-radius:4px; cursor:pointer; background:#fafafa">
              <div style="font-size:32px">📤</div>
              <div style="margin-top:8px">单击或拖拽文件到此区域</div>
              <div style="color:#999; font-size:12px; margin-top:4px">只支持 xls、xlsx，文件大小不超过 100MB</div>
            </div>
          `;
          const footer = document.createElement('div');
          footer.innerHTML = '<button class="btn" data-act="cancel">取消</button><button class="btn btn-primary" data-act="ok">确定</button>';
          const m = UI.openModal({ title: '导入', body, footer, width: '500px' });
          footer.querySelector('[data-act=ok]').onclick = () => { UI.closeModal(); UI.toast('上传成功，导入 0 条数据', 'success'); };
          footer.querySelector('[data-act=cancel]').onclick = () => UI.closeModal();
          m.bodyEl.querySelector('[data-act=dl-tpl]').onclick = (e) => { e.preventDefault(); UI.toast('已下载模板', 'success'); };
        };
        actions.insertBefore(imp, actions.firstChild);
      }
    }
  });

  // 供应商
  const vendorMod = CrudFactory.createCrud({
    storeKey: 'vendors', title: '供应商目录', listPath: '/org/vendor',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '联系人', field: 'contact' },
      { title: '电话', field: 'phone' },
      { title: '邮箱', field: 'email' },
      { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status === 'active' ? '正常合作中' : r.status) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true }) },
      { html: UI.field({ label: '联系人', name: 'contact', value: d.contact }) + UI.field({ label: '电话', name: 'phone', value: d.phone }) },
      { html: UI.field({ label: '邮箱', name: 'email', value: d.email }) + UI.field({ label: '地址', name: 'address', value: d.address }) },
      { html: UI.field({ label: '网站', name: 'website', value: d.website }) + UI.field({ label: '状态', name: 'status', value: d.status || 'active', type: 'select', options: [{ value: 'active', label: '正常合作中' }, { value: 'inactive', label: '停止合作' }] }) }
    ],
    breadcrumbs: {
      list: [{ label: '组织管理', path: '/org/company' }, { label: '供应商目录' }],
      detail: [{ label: '组织管理', path: '/org/company' }, { label: '供应商目录', path: '/org/vendor' }]
    }
  });

  // 产品
  function getVendorName(id) { const x = Store.getById('vendors', id); return x ? x.name : id; }
  function getModelName(id) { const x = Store.getById('assetModels', id); return x ? x.name : id; }
  const productMod = CrudFactory.createCrud({
    storeKey: 'products', title: '产品目录', listPath: '/org/product',
    columns: [
      { title: '名称', field: 'name' },
      { title: '规格', field: 'model', render: (r) => r.model ? UI.esc(getModelName(r.model)) : '-' },
      { title: '供应商', field: 'vendor', render: (r) => r.vendor ? UI.esc(getVendorName(r.vendor)) : '-' },
      { title: '价格', field: 'price' },
      { title: '币种', field: 'currency' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '规格', name: 'model', type: 'select', options: Store.listAll('assetModels').map(m => ({ value: m.id, label: m.name })) }) },
      { html: UI.field({ label: '供应商', name: 'vendor', type: 'select', options: Store.listAll('vendors').map(v => ({ value: v.id, label: v.name })) }) + UI.field({ label: '价格', name: 'price', type: 'number' }) + UI.field({ label: '币种', name: 'currency', type: 'select', options: ['CNY', 'USD', 'EUR'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '组织管理', path: '/org/company' }, { label: '产品目录' }],
      detail: [{ label: '组织管理', path: '/org/company' }, { label: '产品目录', path: '/org/product' }]
    }
  });

  function registerRoutes() {
    Router.register('/org/company', companyMod.renderList.bind(companyMod));
    Router.register('/org/company/:id', companyMod.renderDetail.bind(companyMod));
    Router.register('/org/vendor', vendorMod.renderList.bind(vendorMod));
    Router.register('/org/vendor/:id', vendorMod.renderDetail.bind(vendorMod));
    Router.register('/org/product', productMod.renderList.bind(productMod));
    Router.register('/org/product/:id', productMod.renderDetail.bind(productMod));
  }
  global.OrgModule = { registerRoutes };
})(window);
