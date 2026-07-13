// ========================================
// ITAM 原型 - 资源管理模块（位置管理：树+详情）
// ========================================
(function(global) {
  'use strict';

  let selectedNodeId = null;
  let mode = 'view'; // 'view' | 'newRoot' | 'newChild' | 'edit'
  let expandedNodes = new Set(); // 记录展开的节点ID

  function renderLocationPage({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '资源管理', path: '/resource/location' }, { label: '位置管理' }]);
    const all = Store.listAll('locations');
    const tree = buildTree(all);

    // 默认展开根节点
    if (expandedNodes.size === 0) {
      tree.forEach(n => expandedNodes.add(n.id));
    }

    const title = mode === 'newRoot' ? '新建根节点' : (mode === 'newChild' ? '新建子节点' : (mode === 'edit' && selectedNodeId) ? (Store.getById('locations', selectedNodeId) || {}).name : '位置详情');
    pageEl.innerHTML = `
      <div class="page-header"><div class="page-title">位置管理</div></div>
      <div class="tree-layout">
        <div class="tree-card">
          <div class="card-header"><div class="card-title">位置树</div></div>
          <div class="tree-actions">
            <button class="btn btn-sm btn-primary" data-act="new-root">+ 新建根节点</button>
            <button class="btn btn-sm" data-act="new-child">+ 新建子节点</button>
            <button class="btn btn-sm btn-danger" data-act="delete">删除</button>
          </div>
          <div class="tree-body">${renderTree(tree, null, 0)}</div>
        </div>
        <div class="tree-card">
          <div class="card-header"><div class="card-title">${UI.esc(title || '位置详情')}</div></div>
          <div class="card-body">${renderLocationForm()}</div>
        </div>
      </div>
    `;
    bindLocationEvents(pageEl, all);
  }

  function buildTree(items) {
    const map = new Map();
    items.forEach(x => map.set(x.id, { ...x, children: [] }));
    const roots = [];
    map.forEach(n => {
      if (n.parentId && map.has(n.parentId)) {
        map.get(n.parentId).children.push(n);
      } else {
        roots.push(n);
      }
    });
    return roots;
  }

  function renderTree(nodes, parentId, depth) {
    return nodes.map(n => {
      const hasChildren = n.children && n.children.length > 0;
      const isExpanded = expandedNodes.has(n.id);
      const isSelected = selectedNodeId === n.id;
      const arrow = hasChildren
        ? `<span class="tree-arrow ${isExpanded ? 'expanded' : ''}" data-toggle-id="${UI.esc(n.id)}">${isExpanded ? '▼' : '▶'}</span>`
        : `<span class="tree-arrow-placeholder"></span>`;
      return `
      <div class="tree-node ${isSelected ? 'selected' : ''}" data-id="${UI.esc(n.id)}" data-depth="${depth}">
        ${arrow}<span class="tree-label">${UI.esc(n.name)} <span class="text-muted" style="font-size:11px">(${UI.esc(n.addressType || '')})</span></span>
      </div>
      ${hasChildren && isExpanded ? `<div class="tree-children">${renderTree(n.children, n.id, depth + 1)}</div>` : ''}
    `;
    }).join('');
  }

  function renderLocationForm() {
    if (mode === 'view' && !selectedNodeId) {
      return `<div class="empty"><div class="empty-icon">📍</div><div class="empty-text">请选择左侧节点查看详情，或点击"新建根节点"开始</div></div>`;
    }
    let data;
    if (mode === 'newRoot') {
      data = { name: '', addressType: '地区', code: '', parentId: '', fullPath: '', description: '' };
    } else if (mode === 'newChild' && selectedNodeId) {
      const parent = Store.getById('locations', selectedNodeId);
      data = { name: '', addressType: '城市', code: '', parentId: parent.id, fullPath: parent.fullPath, description: '' };
    } else if (selectedNodeId) {
      data = Object.assign({}, Store.getById('locations', selectedNodeId));
    }
    if (!data) return '';
    const all = Store.listAll('locations');
    const parentOptions = [{ value: '', label: '（根节点）' }, ...all.filter(x => x.id !== data.id).map(x => ({ value: x.id, label: x.fullPath }))];
    return `
      <div class="form-row">
        ${UI.field({ label: '名称', name: 'name', value: data.name, required: true, maxLength: 100 })}
        ${UI.field({ label: '地址类型', name: 'addressType', value: data.addressType, type: 'select', required: true, options: ['地区', '国家', '省份', '城市', '街道', '建筑', '楼层', '房间'].map(v => ({ value: v, label: v })) })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '编码', name: 'code', value: data.code })}
        ${UI.field({ label: '父级地址', name: 'parentId', value: data.parentId || '', type: 'select', options: parentOptions })}
      </div>
      ${UI.field({ label: '地址全称', name: 'fullPath', value: data.fullPath, help: '层级路径（如 Asia/China/Beijing）' })}
      ${UI.field({ label: '描述', name: 'description', value: data.description, type: 'textarea', rows: 3, maxLength: 200 })}
      <div class="flex gap-8 mt-16">
        <button class="btn btn-primary" data-act="save">保存</button>
        <button class="btn" data-act="cancel-form">取消</button>
      </div>
    `;
  }

  function bindLocationEvents(root, all) {
    // 点击展开/收缩箭头：只切换展开状态，不影响选中
    root.querySelectorAll('.tree-arrow[data-toggle-id]').forEach(arrow => {
      arrow.onclick = (e) => {
        e.stopPropagation(); // 阻止冒泡到节点点击
        const nodeId = arrow.getAttribute('data-toggle-id');
        if (expandedNodes.has(nodeId)) {
          expandedNodes.delete(nodeId);
        } else {
          expandedNodes.add(nodeId);
        }
        renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
      };
    });

    // 点击节点：选中 + 更新右侧 + 展开当前节点子节点
    root.querySelectorAll('.tree-node').forEach(el => {
      el.onclick = (e) => {
        // 如果点击的是箭头，已被上面的 stopPropagation 拦截，不会到这里
        selectedNodeId = el.getAttribute('data-id');
        mode = 'edit';
        // 选中节点时自动展开其子节点
        if (selectedNodeId) {
          expandedNodes.add(selectedNodeId);
        }
        renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
      };
    });

    const newRoot = root.querySelector('[data-act=new-root]');
    if (newRoot) newRoot.onclick = () => { selectedNodeId = null; mode = 'newRoot'; renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); };
    const newChild = root.querySelector('[data-act=new-child]');
    if (newChild) newChild.onclick = () => {
      if (!selectedNodeId) { UI.toast('请先选中一个父节点', 'warning'); return; }
      mode = 'newChild';
      renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
    };
    const del = root.querySelector('[data-act=delete]');
    if (del) del.onclick = async () => {
      if (!selectedNodeId) { UI.toast('请先选择节点', 'warning'); return; }
      const ok = await UI.confirm({ title: '确认删除', content: '确定删除该位置节点？子节点将成为孤儿。', danger: true });
      if (ok) {
        Store.remove('locations', selectedNodeId);
        expandedNodes.delete(selectedNodeId);
        selectedNodeId = null;
        mode = 'view';
        UI.toast('删除成功', 'success');
        renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
      }
    };
    const save = root.querySelector('[data-act=save]');
    if (save) save.onclick = () => {
      const data = UI.collectForm(root);
      if (!data.name) { UI.toast('请填写名称', 'error'); return; }
      // 自动生成 fullPath
      if (data.parentId) {
        const p = Store.getById('locations', data.parentId);
        data.fullPath = p ? `${p.fullPath}/${data.name}` : data.name;
      } else {
        data.fullPath = data.name;
      }
      if (mode === 'newRoot' || mode === 'newChild') {
        Store.create('locations', data);
        // 新建后自动展开父节点
        if (data.parentId) expandedNodes.add(data.parentId);
        selectedNodeId = Store.listAll('locations').slice(-1)[0].id;
        expandedNodes.add(selectedNodeId);
        UI.toast('创建成功', 'success');
        mode = 'edit';
      } else if (selectedNodeId) {
        Store.update('locations', selectedNodeId, data);
        UI.toast('保存成功', 'success');
        mode = 'view';
      }
      renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
    };
    const cancel = root.querySelector('[data-act=cancel-form]');
    if (cancel) cancel.onclick = () => { mode = 'view'; renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); };
  }

  function registerRoutes() {
    Router.register('/resource/location', renderLocationPage);
  }
  global.ResourceModule = { registerRoutes };
})(window);
