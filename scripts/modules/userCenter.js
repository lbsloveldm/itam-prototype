// ========================================
// ITAM 原型 - 用户中心模块
// 组织机构 / 用户管理 / 角色管理
// ========================================
(function(global) {
  'use strict';

  function getRoleName(id) { const x = Store.getById('roles', id); return x ? x.name : id; }
  function getOrgName(id) { const x = Store.getById('orgs', id); return x ? x.name : id; }

  // 组织机构（树状）
  function renderOrgs({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '用户中心', path: '/user-center/org' }, { label: '组织机构' }]);
    const all = Store.listAll('orgs');
    const renderNode = (n, depth) => `
      <div class="tree-node" data-id="${UI.esc(n.id)}" data-depth="${depth}">
        <span>${depth > 0 ? '└─ ' : ''}${UI.esc(n.name)} <span class="text-muted" style="font-size:11px">(${UI.esc(n.code || '')})</span></span>
      </div>
      ${(n.children || []).map(c => renderNode(c, depth + 1)).join('')}
    `;
    const buildTree = (items) => {
      const map = new Map();
      items.forEach(x => map.set(x.id, { ...x, children: [] }));
      const roots = [];
      map.forEach(n => {
        if (n.parentId && map.has(n.parentId)) map.get(n.parentId).children.push(n);
        else roots.push(n);
      });
      return roots;
    };
    pageEl.innerHTML = `
      <div class="page-header"><div class="page-title">组织机构</div></div>
      <div class="card"><div class="card-body">${buildTree(all).map(n => renderNode(n, 0)).join('') || '<div class="empty">暂无组织</div>'}</div></div>
    `;
  }

  // 用户管理
  const userMod = CrudFactory.createCrud({
    storeKey: 'users', title: '用户管理', listPath: '/user-center/users',
    columns: [
      { title: '名称', field: 'name' },
      { title: '用户名', field: 'username' },
      { title: '邮箱', field: 'email' },
      { title: '手机', field: 'phone' },
      { title: '组织', field: 'orgId', render: (r) => r.orgId ? UI.esc(getOrgName(r.orgId)) : '-' },
      { title: '角色', field: 'roleId', render: (r) => r.roleId ? UI.esc(getRoleName(r.roleId)) : '-' },
      { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '用户名', name: 'username', value: d.username, required: true }) },
      { html: UI.field({ label: '邮箱', name: 'email', value: d.email }) + UI.field({ label: '手机', name: 'phone', value: d.phone }) },
      { html: UI.field({ label: '组织', name: 'orgId', value: d.orgId, type: 'select', options: Store.listAll('orgs').map(o => ({ value: o.id, label: o.name })) }) + UI.field({ label: '角色', name: 'roleId', value: d.roleId, type: 'select', options: Store.listAll('roles').map(r => ({ value: r.id, label: r.name })) }) + UI.field({ label: '状态', name: 'status', value: d.status || 'active', type: 'select', options: ['active', 'inactive'].map(v => ({ value: v, label: v === 'active' ? '启用' : '禁用' })) }) }
    ],
    breadcrumbs: {
      list: [{ label: '用户中心', path: '/user-center/org' }, { label: '用户管理' }],
      detail: [{ label: '用户中心', path: '/user-center/org' }, { label: '用户管理', path: '/user-center/users' }]
    }
  });

  // 角色管理
  const roleMod = CrudFactory.createCrud({
    storeKey: 'roles', title: '角色管理', listPath: '/user-center/roles',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编码', field: 'code' },
      { title: '描述', field: 'description' },
      { title: '权限数', field: 'permissions', render: (r) => Array.isArray(r.permissions) ? r.permissions.length : '-' },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编码', name: 'code', value: d.code, required: true }) },
      { colspan: 1, html: UI.field({ label: '描述', name: 'description', value: d.description, type: 'textarea', rows: 3 }) },
      { colspan: 1, html: UI.field({ label: '权限 (逗号分隔)', name: 'permissions_str', value: (d.permissions || []).join(','), help: '如 asset:read,asset:write,*' }) }
    ],
    breadcrumbs: {
      list: [{ label: '用户中心', path: '/user-center/org' }, { label: '角色管理' }],
      detail: [{ label: '用户中心', path: '/user-center/org' }, { label: '角色管理', path: '/user-center/roles' }]
    },
    beforeSave: (d) => {
      d.permissions = (d.permissions_str || '').split(',').map(s => s.trim()).filter(Boolean);
    }
  });

  function registerRoutes() {
    Router.register('/user-center/org', renderOrgs);
    Router.register('/user-center/users', userMod.renderList.bind(userMod));
    Router.register('/user-center/users/:id', userMod.renderDetail.bind(userMod));
    Router.register('/user-center/roles', roleMod.renderList.bind(roleMod));
    Router.register('/user-center/roles/:id', roleMod.renderDetail.bind(roleMod));
  }
  global.UserCenterModule = { registerRoutes };
})(window);
