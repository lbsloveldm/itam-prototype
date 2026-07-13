// ========================================
// ITAM 原型 - 资源管理模块（位置管理）
// 左侧位置树 + 中间数据表格 + 右侧编辑表单
// ========================================
(function(global) {
  'use strict';

  let selectedNodeId = null;
  let formMode = 'hidden'; // 'hidden' | 'new' | 'edit'
  let expandedNodes = new Set();
  let searchKw = '';
  let filterType = '';
  let filterCity = '';
  let currentPage = 1;
  let pageSize = 30;

  const ADDRESS_TYPES = ['地区', '国家', '省份', '城市', '街道', '建筑', '楼层', '房间'];
  const CITY_OPTIONS = ['北京', '上海', '广州', '深圳', '佛山', '杭州', '南京', '成都', '武汉', '西安'];

  function getLocName(id) { const x = Store.getById('locations', id); return x ? x.name : '-'; }

  function renderLocationPage({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [{ label: '资源管理', path: '/resource/location' }, { label: '位置管理' }]);
    const all = Store.listAll('locations');
    const tree = buildTree(all);

    // 默认展开根节点
    if (expandedNodes.size === 0) {
      tree.forEach(n => expandedNodes.add(n.id));
    }

    // 筛选列表数据
    let listData = all;
    if (searchKw) listData = listData.filter(d => (d.fullPath || d.name).toLowerCase().includes(searchKw.toLowerCase()));
    if (filterType) listData = listData.filter(d => d.addressType === filterType);
    if (filterCity) listData = listData.filter(d => d.fullPath && d.fullPath.includes(filterCity));

    const total = listData.length;
    const startIdx = (currentPage - 1) * pageSize;
    const pageData = listData.slice(startIdx, startIdx + pageSize);

    const formData = getFormData();

    pageEl.innerHTML = `
      <div class="page-header">
        <div class="flex" style="align-items:center; gap:8px;">
          <div class="page-title">位置管理</div>
          ${formMode !== 'hidden' ? `<span class="sep">/</span><span style="color:#1890ff">${formMode === 'new' ? '新建位置' : '编辑位置'}</span>` : ''}
        </div>
        <div class="page-actions">
          <button class="btn">列设置</button>
          <button class="btn">▼ 筛选${(searchKw||filterType||filterCity) ? ' (' + [searchKw,filterType,filterCity].filter(Boolean).length + ')' : ''}</button>
          <button class="btn">保存视图</button>
          <button class="btn">更多 ▼</button>
          <button class="btn btn-primary" data-act="new-location">+ 新建位置</button>
        </div>
      </div>

      <div class="loc-layout">
        <!-- 左侧：位置树 -->
        <div class="loc-tree-panel">
          <div class="loc-tree-header">
            <input class="input input-sm" placeholder="请输入名称" data-search-input value="${UI.esc(searchKw)}">
            <select class="select select-sm" data-filter-type>
              <option value="">全部</option>
              ${ADDRESS_TYPES.map(t => `<option value="${UI.esc(t)}" ${filterType===t?'selected':''}>${UI.esc(t)}</option>`).join('')}
            </select>
          </div>
          <div class="loc-tree-body">
            ${renderTree(tree, 0)}
          </div>
        </div>

        <!-- 中间：数据表格 -->
        <div class="loc-table-panel">
          <div class="loc-filter-bar">
            <input class="input input-sm" placeholder="请输入地址全称" data-filter-fullname value="${UI.esc(searchKw)}" style="width:180px">
            <select class="select select-sm" data-filter-type2 style="width:140px">
              <option value="">请选择地址类型</option>
              ${ADDRESS_TYPES.map(t => `<option value="${UI.esc(t)}" ${filterType===t?'selected':''}>${UI.esc(t)}</option>`).join('')}
            </select>
            <select class="select select-sm" data-filter-city style="width:140px">
              <option value="">请选择城市</option>
              ${CITY_OPTIONS.map(c => `<option value="${UI.esc(c)}" ${filterCity===c?'selected':''}>${UI.esc(c)}</option>`).join('')}
            </select>
            <button class="btn btn-sm btn-primary" data-act="search">搜索</button>
            <button class="btn btn-sm" data-act="reset-filter">重置</button>
          </div>
          <div class="loc-table-wrapper">
            ${renderTable(pageData)}
          </div>
          ${renderPagination(total, currentPage, pageSize)}
        </div>

        <!-- 右侧：新建/编辑表单 -->
        ${formMode !== 'hidden' ? `
        <div class="loc-form-panel">
          <div class="loc-form-header">
            <span>${formMode === 'new' ? '新建位置' : '编辑位置'}</span>
            <button class="loc-form-close" data-act="close-form">✕</button>
          </div>
          <div class="loc-form-body">
            <div class="form-section-title">基本信息</div>
            ${renderLocationForm(formData)}
          </div>
          <div class="loc-form-footer">
            <button class="btn btn-primary" data-act="save">确定</button>
            <button class="btn" data-act="close-form">取消</button>
          </div>
        </div>
        ` : ''}
      </div>
    `;
    bindLocationEvents(pageEl, all);
  }

  function getFormData() {
    if (formMode === 'new') {
      return { name: '', addressType: '地区', code: '', parentId: selectedNodeId || '', fullPath: '', contact: '', phone: '', zip: '', longitude: '', latitude: '', description: '' };
    } else if (formMode === 'edit' && selectedNodeId) {
      return Object.assign({ contact: '', phone: '', zip: '', longitude: '', latitude: '', description: '' }, Store.getById('locations', selectedNodeId));
    }
    return {};
  }

  function buildTree(items) {
    const map = new Map();
    items.forEach(x => map.set(x.id, { ...x, children: [] }));
    const roots = [];
    map.forEach(n => {
      if (n.parentId && map.has(n.parentId)) map.get(n.parentId).children.push(n);
      else roots.push(n);
    });
    return roots;
  }

  function renderTree(nodes, depth) {
    return nodes.map(n => {
      const hasChildren = n.children && n.children.length > 0;
      const isExpanded = expandedNodes.has(n.id);
      const isSelected = selectedNodeId === n.id;
      const arrow = hasChildren
        ? `<span class="loc-tree-arrow ${isExpanded ? 'expanded' : ''}" data-toggle-id="${UI.esc(n.id)}">${isExpanded ? '▼' : '▶'}</span>`
        : `<span class="loc-tree-arrow-placeholder"></span>`;
      const icon = n.addressType === '地区' ? '🌍' : n.addressType === '国家' ? '🏳' : n.addressType === '城市' ? '🏙' : n.addressType === '建筑' ? '🏢' : '📍';
      return `
        <div class="loc-tree-node ${isSelected ? 'selected' : ''}" data-id="${UI.esc(n.id)}" data-depth="${depth}">
          ${arrow}<span class="loc-tree-icon">${icon}</span><span class="loc-tree-label">${UI.esc(n.name)}</span>
        </div>
        ${hasChildren && isExpanded ? `<div class="loc-tree-children">${renderTree(n.children, depth + 1)}</div>` : ''}
      `;
    }).join('');
  }

  function renderTable(data) {
    if (!data || data.length === 0) {
      return `<div class="empty"><div class="empty-icon">📍</div><div class="empty-text">暂无数据</div></div>`;
    }
    const rows = data.map(row => `
      <tr data-id="${UI.esc(row.id)}">
        <td>${UI.esc(row.fullPath || row.name || '')}</td>
        <td>${UI.esc(row.name || '')}</td>
        <td>${row.parentId ? UI.esc(getLocName(row.parentId)) : '-'}</td>
        <td>${UI.esc(row.addressType || '-')}</td>
        <td class="td-actions">
          <a class="link" data-act="gen-fullname" data-id="${UI.esc(row.id)}">更新全称</a>
          <a class="link danger" data-act="del-row" data-id="${UI.esc(row.id)}">删除</a>
        </td>
      </tr>
    `).join('');
    return `
      <table class="data-table">
        <thead><tr>
          <th>地址全称</th><th>名称</th><th>父级地址</th><th>地址类型</th><th style="width:140px">操作</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderPagination(total, page, size) {
    const totalPages = Math.ceil(total / size) || 1;
    return `
      <div class="pagination-bar">
        <span class="page-info">共 ${total} 条</span>
        <select class="select select-sm" data-act="page-size">
          ${[10, 20, 30, 50].map(s => `<option value="${s}" ${s===size?'selected':''}>${s} 条/页</option>`).join('')}
        </select>
        <div class="page-btns">
          <button class="btn btn-sm" data-page="${Math.max(1, page-1)}" ${page<=1?'disabled':''}>‹</button>
          <span class="page-current">${page} / ${totalPages}</span>
          <button class="btn btn-sm" data-page="${Math.min(totalPages, page+1)}" ${page>=totalPages?'disabled':''}>›</button>
        </div>
      </div>
    `;
  }

  function renderLocationForm(d) {
    const all = Store.listAll('locations');
    const parentOptions = [{ value: '', label: '（根节点）' }, ...all.filter(x => x.id !== d.id).map(x => ({ value: x.id, label: x.fullPath || x.name }))];
    return `
      <div class="form-row">
        ${UI.field({ label: '父级地址', name: 'parentId', value: d.parentId || '', type: 'select', required: true, options: parentOptions })}
        ${UI.field({ label: '名称', name: 'name', value: d.name, required: true, maxLength: 40 })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '地址全称', name: 'fullPath', value: d.fullPath, disabled: true, help: '保存时自动生成' })}
        ${UI.field({ label: '地址类型', name: 'addressType', value: d.addressType, type: 'select', required: true, options: ADDRESS_TYPES.map(v => ({ value: v, label: v })) })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '联系人', name: 'contact', value: d.contact })}
        ${UI.field({ label: '电话', name: 'phone', value: d.phone })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '编码', name: 'code', value: d.code })}
        ${UI.field({ label: '邮编', name: 'zip', value: d.zip })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '经度', name: 'longitude', value: d.longitude })}
        ${UI.field({ label: '纬度', name: 'latitude', value: d.latitude })}
      </div>
      ${UI.field({ label: '描述', name: 'description', value: d.description, type: 'textarea', rows: 2, maxLength: 200 })}
    `;
  }

  function bindLocationEvents(root, all) {
    // === 树：展开/收缩箭头 ===
    root.querySelectorAll('.loc-tree-arrow[data-toggle-id]').forEach(arrow => {
      arrow.onclick = (e) => {
        e.stopPropagation();
        const nodeId = arrow.getAttribute('data-toggle-id');
        if (expandedNodes.has(nodeId)) expandedNodes.delete(nodeId);
        else expandedNodes.add(nodeId);
        renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
      };
    });

    // === 树：点击节点 → 选中 + 更新表格 ===
    root.querySelectorAll('.loc-tree-node').forEach(el => {
      el.onclick = () => {
        selectedNodeId = el.getAttribute('data-id');
        // 选中节点时自动展开
        if (selectedNodeId) expandedNodes.add(selectedNodeId);
        renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
      };
    });

    // === 搜索 ===
    const searchInput = root.querySelector('[data-search-input]');
    if (searchInput) searchInput.oninput = () => { searchKw = searchInput.value; };
    const filterTypeEl = root.querySelector('[data-filter-type]');
    if (filterTypeEl) filterTypeEl.onchange = () => { filterType = filterTypeEl.value; };
    const filterType2 = root.querySelector('[data-filter-type2]');
    if (filterType2) filterType2.onchange = () => { filterType = filterType2.value; };
    const filterCityEl = root.querySelector('[data-filter-city]');
    if (filterCityEl) filterCityEl.onchange = () => { filterCity = filterCityEl.value; };
    const filterFullname = root.querySelector('[data-filter-fullname]');
    if (filterFullname) filterFullname.oninput = () => { searchKw = filterFullname.value; };

    const searchBtn = root.querySelector('[data-act=search]');
    if (searchBtn) searchBtn.onclick = () => { currentPage = 1; renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); };
    const resetBtn = root.querySelector('[data-act=reset-filter]');
    if (resetBtn) resetBtn.onclick = () => {
      searchKw = ''; filterType = ''; filterCity = ''; currentPage = 1;
      renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
    };

    // === 新建位置 ===
    const newBtn = root.querySelector('[data-act=new-location]');
    if (newBtn) newBtn.onclick = () => {
      formMode = 'new';
      renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
    };

    // === 表格行点击 → 编辑 ===
    root.querySelectorAll('.data-table tbody tr[data-id]').forEach(tr => {
      tr.onclick = (e) => {
        if (e.target.closest('.td-actions')) return; // 操作列不触发行选中
        selectedNodeId = tr.getAttribute('data-id');
        formMode = 'edit';
        if (selectedNodeId) expandedNodes.add(selectedNodeId);
        renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
      };
    });

    // === 表格操作：更新全称 ===
    root.querySelectorAll('[data-act=gen-fullname]').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-id');
        const node = Store.getById('locations', id);
        if (!node) return;
        if (node.parentId) {
          const p = Store.getById('locations', node.parentId);
          node.fullPath = p ? `${p.fullPath}/${node.name}` : node.name;
        } else {
          node.fullPath = node.name;
        }
        Store.update('locations', id, node);
        UI.toast('全称已更新', 'success');
        renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
      };
    });

    // === 表格操作：删除 ===
    root.querySelectorAll('[data-act=del-row]').forEach(el => {
      el.onclick = async (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-id');
        const ok = await UI.confirm({ title: '确认删除', content: '确定删除该位置？子节点将成为孤儿。', danger: true });
        if (ok) {
          Store.remove('locations', id);
          expandedNodes.delete(id);
          if (selectedNodeId === id) { selectedNodeId = null; formMode = 'hidden'; }
          UI.toast('删除成功', 'success');
          renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
        }
      };
    });

    // === 分页 ===
    root.querySelectorAll('.pagination-bar button[data-page]').forEach(btn => {
      btn.onclick = () => { currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1; renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); };
    });
    const psEl = root.querySelector('[data-act=page-size]');
    if (psEl) psEl.onchange = () => { pageSize = parseInt(psEl.value, 10); currentPage = 1; renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); };

    // === 表单：保存 ===
    const saveBtn = root.querySelector('[data-act=save]');
    if (saveBtn) saveBtn.onclick = () => {
      const data = UI.collectForm(root);
      if (!data.name) { UI.toast('请填写名称', 'error'); return; }
      if (!data.parentId && formMode === 'new') { /* 允许根节点 */ }
      // 自动生成 fullPath
      if (data.parentId) {
        const p = Store.getById('locations', data.parentId);
        data.fullPath = p ? `${p.fullPath}/${data.name}` : data.name;
      } else {
        data.fullPath = data.name;
      }
      if (formMode === 'new') {
        Store.create('locations', data);
        UI.toast('创建成功', 'success');
      } else if (selectedNodeId) {
        Store.update('locations', selectedNodeId, data);
        UI.toast('保存成功', 'success');
      }
      formMode = 'hidden';
      renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
    };

    // === 表单：取消/关闭 ===
    root.querySelectorAll('[data-act=close-form]').forEach(btn => {
      btn.onclick = () => { formMode = 'hidden'; renderLocationPage({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); };
    });
  }

  function registerRoutes() {
    Router.register('/resource/location', renderLocationPage);
  }
  global.ResourceModule = { registerRoutes };
})(window);
