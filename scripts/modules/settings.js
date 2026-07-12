// ========================================
// ITAM 原型 - 设置模块
// Class管理/资产标识配置规则/二维码标签设置/权限管理
// ========================================
(function(global) {
  'use strict';

  // Class管理
  const clsMod = CrudFactory.createCrud({
    storeKey: 'classes', title: 'Class管理', listPath: '/asset/settings/class',
    columns: [
      { title: '名称', field: 'name' },
      { title: '分类', field: 'category' },
      { title: '描述', field: 'description' },
      { title: '创建人', field: 'createdBy' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '分类', name: 'category', value: d.category, type: 'select', required: true, options: ['硬件', '软件', '服务'].map(v => ({ value: v, label: v })) }) },
      { colspan: 1, html: UI.field({ label: '描述', name: 'description', value: d.description, type: 'textarea', rows: 3 }) }
    ],
    breadcrumbs: {
      list: [{ label: '设置', path: '/asset/settings/class' }, { label: 'Class管理' }],
      detail: [{ label: '设置', path: '/asset/settings/class' }, { label: 'Class管理', path: '/asset/settings/class' }]
    }
  });

  // 资产标识配置规则
  const irMod = CrudFactory.createCrud({
    storeKey: 'identifierRules', title: '资产标识配置规则', listPath: '/asset/settings/identifier-rule',
    columns: [
      { title: '名称', field: 'name' },
      { title: '资产类型', field: 'assetType' },
      { title: '前缀', field: 'prefix' },
      { title: '总长度', field: 'length' },
      { title: '示例', field: 'example' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '资产类型', name: 'assetType', value: d.assetType, type: 'select', required: true, options: ['hardware', 'consumable', 'software', 'cloud', 'bundle', 'pallet'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '前缀', name: 'prefix', value: d.prefix, required: true }) + UI.field({ label: '总长度', name: 'length', value: d.length, type: 'number', required: true }) + UI.field({ label: '示例', name: 'example', value: d.example, placeholder: '如 P000000001' }) }
    ],
    breadcrumbs: {
      list: [{ label: '设置', path: '/asset/settings/class' }, { label: '资产标识配置规则' }],
      detail: [{ label: '设置', path: '/asset/settings/class' }, { label: '资产标识配置规则', path: '/asset/settings/identifier-rule' }]
    }
  });

  // 二维码标签设置（特殊：表单型）
  function renderQRLabel({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '设置', path: '/asset/settings/class' }, { label: '二维码标签设置' }]);
    pageEl.innerHTML = `
      <div class="page-header"><div class="page-title">二维码标签设置</div><div class="page-actions"><button class="btn btn-primary" data-act="save">保存</button></div></div>
      <div class="card"><div class="card-body">
        <div class="form-row">
          ${UI.field({ label: '标签尺寸', name: 'size', value: '300 x 200', placeholder: '宽 x 高 (像素)' })}
          ${UI.field({ label: '二维码纠错级别', name: 'eccLevel', value: 'M', type: 'select', options: ['L', 'M', 'Q', 'H'].map(v => ({ value: v, label: v })) })}
        </div>
        <div class="form-row-3">
          ${UI.field({ label: '显示资产标识', name: 'showTag', value: true, type: 'switch' })}
          ${UI.field({ label: '显示资产名称', name: 'showName', value: true, type: 'switch' })}
          ${UI.field({ label: '显示规格', name: 'showModel', value: false, type: 'switch' })}
        </div>
        ${UI.field({ label: '附加字段', name: 'extraFields', value: '使用人, 位置, 部门', help: '多个用逗号分隔' })}
        <div class="form-group">
          <label class="form-label">二维码内容模板</label>
          <textarea class="textarea" name="template" rows="4">ITAM:{assetTag}</textarea>
        </div>
      </div></div>
    `;
    pageEl.querySelector('[data-act=save]').onclick = () => UI.toast('保存成功', 'success');
  }

  // 权限管理
  const pmMod = CrudFactory.createCrud({
    storeKey: 'permissions', title: '权限管理', listPath: '/asset/settings/permission',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '范围', field: 'scope' },
      { title: '描述', field: 'description' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true }) },
      { html: UI.field({ label: '范围', name: 'scope', value: d.scope, type: 'select', required: true, options: ['资产', '成本', '合同', '库存', 'License'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '描述', name: 'description', value: d.description }) }
    ],
    breadcrumbs: {
      list: [{ label: '设置', path: '/asset/settings/class' }, { label: '权限管理' }],
      detail: [{ label: '设置', path: '/asset/settings/class' }, { label: '权限管理', path: '/asset/settings/permission' }]
    }
  });

  function registerRoutes() {
    Router.register('/asset/settings/class', clsMod.renderList.bind(clsMod));
    Router.register('/asset/settings/class/:id', clsMod.renderDetail.bind(clsMod));
    Router.register('/asset/settings/identifier-rule', irMod.renderList.bind(irMod));
    Router.register('/asset/settings/identifier-rule/:id', irMod.renderDetail.bind(irMod));
    Router.register('/asset/settings/qr-label', renderQRLabel);
    Router.register('/asset/settings/permission', pmMod.renderList.bind(pmMod));
    Router.register('/asset/settings/permission/:id', pmMod.renderDetail.bind(pmMod));
  }
  global.SettingsModule = { registerRoutes };
})(window);
