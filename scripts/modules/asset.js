// ========================================
// ITAM 原型 - 资产管理模块
// 资产台账、规格管理、规格分类、CI映射
// ========================================
(function(global) {
  'use strict';

  const ASSET_TYPES = [
    { key: 'all', label: '全部资产', color: 'blue', icon: '📦' },
    { key: 'hardware', label: '硬件资产', color: 'blue', icon: '🖥' },
    { key: 'consumable', label: '耗材资产', color: 'orange', icon: '🖱' },
    { key: 'bundle', label: '捆绑资产', color: 'purple', icon: '🎁' },
    { key: 'pallet', label: '托盘资产', color: 'cyan', icon: '📥' },
    { key: 'software', label: '软件许可', color: 'green', icon: '💿' },
    { key: 'cloud', label: '云资产', color: 'volcano', icon: '☁' }
  ];

  const ASSET_STATE_OPTIONS = [
    { value: 'In use', label: 'In use' },
    { value: 'In stock', label: 'In stock' },
    { value: 'Retired', label: 'Retired' },
    { value: 'Reserved', label: 'Reserved' }
  ];

  // ====================== 资产台账列表 ======================
  let currentType = 'all';
  let currentKeyword = '';
  let currentPage = 1;
  let currentPageSize = 30;

  function renderAssetLedger({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [
      { label: '资产管理', path: '/asset/ledger' },
      { label: '资产台账' }
    ]);
    const all = Store.listAll('assets');
    // 计数
    const counts = {};
    counts.all = all.length;
    ASSET_TYPES.forEach(t => { if (t.key !== 'all') counts[t.key] = all.filter(a => a.assetType === t.key).length; });

    // 过滤
    let filtered = currentType === 'all' ? all : all.filter(a => a.assetType === currentType);
    if (currentKeyword) {
      const k = currentKeyword.toLowerCase();
      filtered = filtered.filter(a =>
        (a.assetTag || '').toLowerCase().includes(k) ||
        (a.displayName || '').toLowerCase().includes(k) ||
        (a.serialNumber || '').toLowerCase().includes(k)
      );
    }
    // 分页
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / currentPageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * currentPageSize;
    const pageData = filtered.slice(start, start + currentPageSize);

    // 列定义
    const baseCols = [
      { title: '资产标识', field: 'assetTag', render: (row) => `<a class="link" data-nav="/asset/ledger/${UI.esc(row.id)}">${UI.esc(row.assetTag)}</a>` },
      { title: '名称', field: 'displayName', render: (row) => UI.esc(row.displayName) }
    ];
    let typeCols = [];
    if (currentType === 'all') {
      typeCols.push({ title: '类型', field: 'assetType', render: (row) => UI.statusTag(getAssetTypeLabel(row.assetType)) });
    } else if (currentType === 'hardware') {
      typeCols.push({ title: '序列号', field: 'serialNumber' });
      typeCols.push({ title: '部门', field: 'department' });
    } else if (currentType === 'consumable') {
      typeCols.push({ title: '数量', field: 'quantity' });
    } else if (currentType === 'software') {
      typeCols.push({ title: '授权数', field: 'rights' });
      typeCols.push({ title: 'License Key', field: 'licenseKey' });
      typeCols.push({ title: '数量', field: 'quantity' });
    } else if (currentType === 'bundle') {
      typeCols.push({ title: '组件构成', field: 'components', render: (row) => (row.components || []).map(c => UI.esc(c)).join(', ') || '-' });
    } else if (currentType === 'pallet') {
      typeCols.push({ title: '托盘类型', field: 'palletType' });
    } else if (currentType === 'cloud') {
      typeCols.push({ title: '云资源类别', field: 'cloudResourceType' });
      typeCols.push({ title: '供应商', field: 'vendor', render: (row) => row.vendor ? Relations.renderRelatedField('company', row.vendor) : '-' });
    }
    const tailCols = [
      { title: '规格', field: 'model', render: (row) => row.model ? Relations.renderRelatedField('assetModel', row.model) : '-' },
      { title: '状态', field: 'state', render: (row) => UI.statusTag(row.state) },
      { title: '使用人', field: 'assignedTo', render: (row) => row.assignedTo ? UI.esc(getUserName(row.assignedTo)) : '-' },
      { title: '位置', field: 'location', render: (row) => row.location ? UI.esc(getLocationFullPath(row.location)) : '-' },
      { title: '创建时间', field: 'createdTime' },
      { title: '操作', render: (row) => `<a class="link" data-act="del-asset" data-id="${UI.esc(row.id)}">删除</a>` }
    ];
    const columns = [...baseCols, ...typeCols, ...tailCols];

    // 类型面板
    const panelHtml = `
      <div class="type-panel">
        ${ASSET_TYPES.map(t => `
          <div class="type-panel-item ${currentType === t.key ? 'active' : ''}" data-type="${UI.esc(t.key)}">
            <span>${UI.esc(t.icon)} ${UI.esc(t.label)}</span>
            <span class="type-panel-count">${counts[t.key] || 0}</span>
          </div>
        `).join('')}
      </div>
    `;

    // 工具栏
    const toolbarLeft = `<input class="input search-box" placeholder="请输入资产标识 / 名称" value="${UI.esc(currentKeyword)}" data-search-input>
      <button class="btn" data-search-btn>搜索</button>`;
    const toolbarRight = `
      <button class="btn" title="刷新" data-act="refresh">🔄</button>
      <button class="btn" title="筛选" data-act="filter">▼ 筛选 (1)</button>
      <button class="btn" title="搜索">⌕ (8)</button>
      <button class="btn" title="列设置">⚏</button>
      <button class="btn" data-act="save-view">保存视图</button>
      <button class="btn btn-primary" data-act="new">+ 新建</button>
      <button class="btn" data-act="more">更多 ▾</button>
    `;

    pageEl.innerHTML = `
      <div class="page-header">
        <div class="flex gap-12" style="align-items:baseline">
          <div class="page-title">资产台账</div>
        </div>
        <div class="page-actions">
          <button class="btn" data-act="refresh">🔄</button>
          <button class="btn btn-primary" data-act="new">+ 新建</button>
        </div>
      </div>
      <div class="type-panel-layout">
        <div>${panelHtml}</div>
        <div>
          <div class="table-card">
            <div class="table-toolbar">
              <div class="table-toolbar-left">${toolbarLeft}</div>
              <div class="table-toolbar-right">${toolbarRight}</div>
            </div>
            ${renderAssetTable(pageData, columns)}
            ${UI.renderPagination({ total, page: currentPage, pageSize: currentPageSize }, (p) => { currentPage = p; renderAssetLedger({ pageEl, crumbEl }); }, (s) => { currentPageSize = s; currentPage = 1; renderAssetLedger({ pageEl, crumbEl }); })}
          </div>
        </div>
      </div>
    `;
    bindAssetLedgerEvents(pageEl);
  }

  function renderAssetTable(data, columns) {
    const cols = columns.map(c => `<th class="${c.cls || ''}">${UI.esc(c.title)}${c.sortable ? ' <span style="color:#999">⇅</span>' : ''}</th>`).join('');
    const rows = data.length === 0 ? `<tr><td colspan="${columns.length + 1}"><div class="empty"><div class="empty-icon">📭</div><div class="empty-text">暂无数据</div></div></td></tr>` : data.map(row => {
      const cells = columns.map(c => `<td>${c.render ? c.render(row) : UI.esc(row[c.field] || '-')}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table class="data-table"><thead><tr><th class="col-checkbox"><input type="checkbox" data-act="check-all"></th>${cols}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  function bindAssetLedgerEvents(root) {
    // 类型切换
    root.querySelectorAll('[data-type]').forEach(el => {
      el.onclick = () => {
        currentType = el.getAttribute('data-type');
        currentPage = 1;
        renderAssetLedger({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
      };
    });
    // 搜索
    const searchInput = root.querySelector('[data-search-input]');
    const searchBtn = root.querySelector('[data-search-btn]');
    if (searchBtn) searchBtn.onclick = () => {
      currentKeyword = searchInput.value;
      currentPage = 1;
      renderAssetLedger({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
    };
    if (searchInput) searchInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        currentKeyword = searchInput.value;
        currentPage = 1;
        renderAssetLedger({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
      }
    };
    // 新建
    root.querySelectorAll('[data-act=new]').forEach(el => {
      el.onclick = () => Router.go('/asset/ledger/new');
    });
    // 刷新
    root.querySelectorAll('[data-act=refresh]').forEach(el => {
      el.onclick = () => { UI.toast('已刷新', 'success'); renderAssetLedger({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); };
    });
    // 删除
    root.querySelectorAll('[data-act=del-asset]').forEach(el => {
      el.onclick = async (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-id');
        const ok = await UI.confirm({ title: '确认删除', content: '确定要删除该资产吗？删除后可在回收站恢复。', danger: true, okText: '删除' });
        if (ok) {
          Store.cascadeDelete('assets', id, []);
          UI.toast('删除成功', 'success');
          renderAssetLedger({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
        }
      };
    });
    // 分页
    root.querySelectorAll('.pagination button[data-page]').forEach(el => {
      el.onclick = () => {
        const p = parseInt(el.getAttribute('data-page'), 10);
        if (!isNaN(p)) { currentPage = p; renderAssetLedger({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); }
      };
    });
    const ps = root.querySelector('[data-act=page-size]');
    if (ps) ps.onchange = () => { currentPageSize = parseInt(ps.value, 10); currentPage = 1; renderAssetLedger({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); };
  }

  // ====================== 资产详情/新建 ======================
  function renderAssetDetail({ pageEl, crumbEl, params }) {
    const isNew = params.id === 'new';
    let asset = isNew ? null : Store.getById('assets', params.id);
    if (!isNew && !asset) {
      pageEl.innerHTML = UI.render404('/asset/ledger');
      return;
    }
    Router.setCrumb(crumbEl, [
      { label: '资产管理', path: '/asset/ledger' },
      { label: '资产台账', path: '/asset/ledger' },
      { label: isNew ? '新建资产' : (asset.displayName || asset.assetTag) }
    ]);

    const formData = isNew ? { assetType: 'hardware', state: 'In stock' } : Object.assign({}, asset);
    const models = Store.listAll('assetModels');
    const modelCategories = Store.listAll('assetModelCategories');

    // 头部信息条
    const headInfo = isNew ? '' : UI.renderHeadInfo([
      { label: '规格', value: getModelName(formData.model) },
      { label: '状态', value: formData.state ? '' : '-', render: () => UI.statusTag(formData.state) },
      { label: '子状态', value: formData.substate || '-' },
      { label: '创建时间', value: formData.createdTime },
      { label: '更新时间', value: formData.updatedTime }
    ]);

    // Tabs
    const tabsHtml = UI.renderTabs([
      { key: 'details', label: '详情', content: renderDetailsTab(formData) },
      { key: 'contract', label: '合同', content: renderRelatedTab('合同', formData.id, 'contract', 'contract', 'assets') },
      { key: 'fixed-assets', label: '固定资产', content: renderRelatedTab('固定资产', formData.id, 'fixedAsset', 'fixedAsset', 'assets') },
      { key: 'software-license', label: '软件授权', content: renderRelatedTab('软件授权', formData.id, 'licenseConfig', 'licenseConfig', 'assets') },
      { key: 'assets', label: '子资产', content: renderRelatedTab('子资产', formData.id, 'asset', 'asset', 'assets') },
      { key: 'expense-line', label: '费用条目', content: renderRelatedTab('费用条目', formData.id, 'expenseLine', 'expenseLine', 'assets') }
    ], 'details');

    pageEl.innerHTML = `
      <div class="page-header">
        <div class="flex gap-12" style="align-items:baseline">
          <div class="page-title">${isNew ? '新建资产' : UI.esc(formData.displayName || formData.assetTag)}</div>
          ${!isNew ? UI.statusTag(getAssetTypeLabel(formData.assetType)) : ''}
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" data-act="save">保存</button>
          <button class="btn" data-act="cancel">取消</button>
          ${!isNew ? '<button class="btn btn-danger" data-act="delete">删除</button>' : ''}
        </div>
      </div>
      ${headInfo}
      <div class="tabs">${tabsHtml}</div>
    `;
    bindAssetDetailEvents(pageEl, formData, isNew);
  }

  function renderDetailsTab(d) {
    return UI.renderCollapse([
      { key: 'general', title: '基本信息', content: renderGeneralSection(d) },
      { key: 'ownership', title: '归属信息', content: renderOwnershipSection(d) },
      { key: 'cost', title: '费用信息', content: renderCostSection(d) },
      { key: 'depreciation', title: '折旧', extra: '<button class="btn" data-act="calc-depreciation">计算折旧</button>', content: renderDepreciationSection(d) }
    ], ['general', 'ownership', 'cost', 'depreciation']);
  }

  function renderGeneralSection(d) {
    return `
      <div class="form-row">
        ${UI.field({ label: '名称', name: 'displayName', value: d.displayName, required: true, maxLength: 100 })}
        ${UI.field({ label: '规格分类', name: '_category', value: getModelCategoryName(d.model), disabled: true })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '规格', name: 'model', value: d.model, type: 'select', options: Store.listAll('assetModels').map(m => ({ value: m.id, label: m.name })) })}
        ${UI.field({ label: '类型', name: 'assetType', value: d.assetType, type: 'select', required: true, options: ASSET_TYPES.filter(t => t.key !== 'all').map(t => ({ value: t.key, label: t.label })) })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '资产标识', name: 'assetTag', value: d.assetTag, required: true, placeholder: '保存时自动生成' })}
        ${UI.field({ label: '序列号', name: 'serialNumber', value: d.serialNumber, placeholder: '可选' })}
      </div>
      <div class="form-row-3">
        ${UI.field({ label: '数量', name: 'quantity', value: d.quantity || 1, type: 'number' })}
        ${UI.field({ label: '状态', name: 'state', value: d.state, type: 'select', options: ASSET_STATE_OPTIONS })}
        ${UI.field({ label: '子状态', name: 'substate', value: d.substate, type: 'select', options: [{ value: 'Assigned', label: 'Assigned' }, { value: 'In Stock', label: 'In Stock' }, { value: 'Deployed', label: 'Deployed' }, { value: 'Retired', label: 'Retired' }] })}
      </div>
      ${renderTypeSpecificFields(d)}
    `;
  }

  function renderTypeSpecificFields(d) {
    const t = d.assetType;
    if (t === 'software') {
      return `
        <div class="form-row-3">
          ${UI.field({ label: '授权数', name: 'rights', value: d.rights, type: 'number' })}
          ${UI.field({ label: 'License Key', name: 'licenseKey', value: d.licenseKey })}
          ${UI.field({ label: '已用', name: 'used', value: d.used || 0, type: 'number', disabled: true })}
        </div>
      `;
    }
    if (t === 'pallet') {
      return UI.field({ label: '托盘类型', name: 'palletType', value: d.palletType, type: 'select', options: [{ value: 'Pallet', label: 'Pallet' }, { value: 'Bin', label: 'Bin' }, { value: 'Box', label: 'Box' }, { value: 'Container', label: 'Container' }, { value: 'Other', label: 'Other' }] });
    }
    if (t === 'cloud') {
      return UI.field({ label: '云资源类别', name: 'cloudResourceType', value: d.cloudResourceType, type: 'select', options: ['计算', '存储', '网络', '安全', '数据库', '应用集群', '服务实例', '中间件', '容器资源'].map(v => ({ value: v, label: v })) });
    }
    if (t === 'bundle') {
      return UI.field({ label: '组件构成', name: 'components', value: (d.components || []).join(', '), help: '多个组件用逗号分隔' });
    }
    if (t === 'hardware') {
      return UI.field({ label: '部门', name: 'department', value: d.department, help: '归属部门' });
    }
    if (t === 'consumable') {
      return UI.field({ label: '库存数量', name: 'quantity', value: d.quantity, type: 'number' });
    }
    return '';
  }

  function renderOwnershipSection(d) {
    const users = Store.listAll('users');
    const locations = Store.listAll('locations');
    return `
      <div class="form-row">
        ${UI.field({ label: '使用人', name: 'assignedTo', value: d.assignedTo, type: 'select', options: users.map(u => ({ value: u.id, label: u.name })) })}
        ${UI.field({ label: '位置', name: 'location', value: d.location, type: 'select', options: locations.map(l => ({ value: l.id, label: l.fullPath })) })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '部门', name: 'dept', value: d.dept, type: 'select', options: Store.listAll('orgs').map(o => ({ value: o.id, label: o.name })) })}
        ${UI.field({ label: '公司', name: 'company', value: d.company, type: 'select', options: Store.listAll('companies').map(c => ({ value: c.id, label: c.name })) })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '安装时间', name: 'installDate', value: d.installDate, type: 'text' })}
        ${UI.field({ label: '分配时间', name: 'assignDate', value: d.assignDate, type: 'text' })}
      </div>
    `;
  }

  function renderCostSection(d) {
    return `
      <div class="form-row">
        ${UI.field({ label: 'PO number', name: 'poNumber', value: d.poNumber })}
        ${UI.field({ label: 'GL account', name: 'glAccount', value: d.glAccount })}
      </div>
      <div class="form-row-3">
        ${UI.field({ label: '成本', name: 'cost', value: d.cost, type: 'number' })}
        ${UI.field({ label: '币种', name: 'currency', value: d.currency || 'CNY', type: 'select', options: ['CNY', 'USD', 'EUR', 'JPY', 'HKD'].map(v => ({ value: v, label: v })) })}
        ${UI.field({ label: '成本中心', name: 'costCenter', value: d.costCenter, type: 'select', options: Store.listAll('costCenters').map(c => ({ value: c.id, label: c.name })) })}
      </div>
      <div class="form-row">
        ${UI.field({ label: '供应商', name: 'vendor', value: d.vendor, type: 'select', options: Store.listAll('vendors').map(v => ({ value: v.id, label: v.name })) })}
        ${UI.field({ label: '获取方式', name: 'acquisitionMethod', value: d.acquisitionMethod, type: 'select', options: ['采购', '租赁', '赠送', '调拨'].map(v => ({ value: v, label: v })) })}
      </div>
      ${UI.field({ label: 'TCO', name: 'tco', value: d.tco || '-', disabled: true, help: '总拥有成本（只读）' })}
    `;
  }

  function renderDepreciationSection(d) {
    return `
      <div class="form-row">
        ${UI.field({ label: '折旧方案', name: 'depreciationSchema', value: d.depreciationSchema, type: 'select', options: Store.listAll('depreciationSchemas').map(s => ({ value: s.id, label: s.name })) })}
        ${UI.field({ label: '折旧生效时间', name: 'depreciationStartDate', value: d.depreciationStartDate, type: 'text' })}
      </div>
      <div class="form-row-3">
        ${UI.field({ label: '残值时间', name: 'residualDate', value: d.residualDate, type: 'text' })}
        ${UI.field({ label: '残值', name: 'residualValue', value: d.residualValue, type: 'number' })}
        ${UI.field({ label: '已折旧金额', name: 'depreciatedAmount', value: d.depreciatedAmount || '0.00', disabled: true })}
      </div>
    `;
  }

  function renderRelatedTab(title, assetId, relatedType, relatedCollection, refField) {
    // 这里简化为占位：实际项目会通过 refField 查询
    return `<div class="empty"><div class="empty-icon">📭</div><div class="empty-text">暂无关联${title}</div></div>`;
  }

  function bindAssetDetailEvents(root, formData, isNew) {
    root.querySelector('[data-act=save]').onclick = () => {
      // 从表单实时收集数据，确保获取最新输入值
      const collected = UI.collectForm(root);
      Object.assign(formData, collected);
      if (!formData.displayName) { UI.toast('请填写资产名称', 'error'); return; }
      if (!formData.model) { UI.toast('请选择规格', 'error'); return; }
      if (isNew) {
        formData.id = Store.uid();
        formData.assetTag = formData.assetTag || UI.genAssetTag(formData.assetType);
        formData.createdTime = Store.nowStr();
        Store.create('assets', formData);
        UI.toast('创建成功', 'success');
      } else {
        Store.update('assets', formData.id, formData);
        UI.toast('保存成功', 'success');
      }
      Router.go('/asset/ledger');
    };
    root.querySelector('[data-act=cancel]').onclick = () => Router.go('/asset/ledger');
    if (!isNew) {
      root.querySelector('[data-act=delete]').onclick = async () => {
        const ok = await UI.confirm({ title: '确认删除', content: '确定要删除该资产吗？', danger: true });
        if (ok) {
          Store.cascadeDelete('assets', formData.id, []);
          UI.toast('删除成功', 'success');
          Router.go('/asset/ledger');
        }
      };
    }
    // 计算折旧
    const calcBtn = root.querySelector('[data-act=calc-depreciation]');
    if (calcBtn) calcBtn.onclick = () => {
      if (isNew) {
        UI.toast('保存资产后可计算折旧', 'warning');
        return;
      }
      // 弹出选择折旧方案
      const schemas = Store.listAll('depreciationSchemas');
      const body = `
        <table class="data-table">
          <thead><tr><th></th><th>名称</th><th>类别</th><th>折旧时间</th></tr></thead>
          <tbody>${schemas.map((s, i) => `<tr><td><input type="radio" name="schema" value="${UI.esc(s.id)}" ${i === 0 ? 'checked' : ''}></td><td>${UI.esc(s.name)}</td><td>${UI.esc(s.category)}</td><td>${UI.esc(s.depreciationTime)}</td></tr>`).join('')}</tbody>
        </table>
      `;
      const footer = document.createElement('div');
      footer.innerHTML = `<button class="btn" type="button" data-act="cancel">取消</button><button class="btn btn-primary" type="button" data-act="ok">提交</button>`;
      const m = UI.openModal({ title: 'Please Select Depreciation / 选择折旧方案', body, footer });
      footer.querySelector('[data-act=ok]').onclick = () => {
        const sel = m.bodyEl.querySelector('input[name=schema]:checked');
        if (!sel) { UI.toast('请选择折旧方案', 'warning'); return; }
        const sid = sel.value;
        const sch = Store.getById('depreciationSchemas', sid);
        formData.depreciationSchema = sid;
        formData.depreciationStartDate = Store.nowStr();
        // 简单计算：原值 10000 * 时间比例
        formData.depreciatedAmount = '1250.00';
        Store.update('assets', formData.id, formData);
        UI.closeModal();
        UI.toast('折旧计算成功', 'success');
        renderAssetDetail({ pageEl: root, crumbEl: document.getElementById('breadcrumb'), params: { id: formData.id } });
      };
      footer.querySelector('[data-act=cancel]').onclick = () => UI.closeModal();
    };

    // Tabs 切换
    root.querySelectorAll('[data-tab]').forEach(el => {
      el.onclick = () => {
        root.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        const key = el.getAttribute('data-tab');
        const body = el.parentElement.nextElementSibling;
        let content = '';
        if (key === 'details') content = renderDetailsTab(formData);
        else if (key === 'contract') content = renderRelatedTab('合同', formData.id, 'contract');
        else if (key === 'fixed-assets') content = renderRelatedTab('固定资产', formData.id, 'fixedAsset');
        else if (key === 'software-license') content = renderRelatedTab('软件授权', formData.id, 'licenseConfig');
        else if (key === 'assets') content = renderRelatedTab('子资产', formData.id, 'asset');
        else if (key === 'expense-line') content = renderRelatedTab('费用条目', formData.id, 'expenseLine');
        body.innerHTML = content;
        // 重新绑定事件
        bindAssetDetailEvents(root, formData, isNew);
        // 恢复当前激活 tab
        root.querySelectorAll('[data-tab]').forEach(t => {
          if (t.getAttribute('data-tab') === key) t.classList.add('active');
        });
      };
    });
  }

  // ====================== 资产规格管理 ======================
  let modelKw = '', modelPage = 1, modelSize = 30;
  function renderAssetModels({ pageEl, crumbEl }) {
    Router.setCrumb(crumbEl, [
      { label: '资产管理', path: '/asset/ledger' },
      { label: '资产规格管理' }
    ]);
    const all = Store.listAll('assetModels');
    const filtered = modelKw ? all.filter(m => (m.name + m.fullName + m.manufacturer).toLowerCase().includes(modelKw.toLowerCase())) : all;
    const total = filtered.length;
    const start = (modelPage - 1) * modelSize;
    const data = filtered.slice(start, start + modelSize);

    const columns = [
      { title: '全称', field: 'fullName', render: (row) => `<a class="link" data-nav="/asset/model/${UI.esc(row.id)}">${UI.esc(row.fullName)}</a>` },
      { title: '名称', field: 'name' },
      { title: '分类', field: 'categoryId', render: (row) => UI.esc(getModelCategoryName(row.categoryId)) },
      { title: '制造商', field: 'manufacturer' },
      { title: '资产类型', field: 'assetType', render: (row) => UI.statusTag(getAssetTypeLabel(row.assetType)) },
      { title: '操作', render: (row) => `<a class="link" data-act="del" data-id="${UI.esc(row.id)}">删除</a>` }
    ];

    pageEl.innerHTML = UI.renderListPage({
      title: '资产规格管理', subtitle: `共 ${all.length} 条`,
      toolbarLeft: `<input class="input search-box" placeholder="请输入名称" value="${UI.esc(modelKw)}" data-search-input>
        <button class="btn" data-search-btn>搜索</button>`,
      toolbarRight: `
        <button class="btn" data-act="refresh">🔄</button>
        <button class="btn">▼ 筛选</button>
        <button class="btn">⌕</button>
        <button class="btn">⚏</button>
        <button class="btn">保存视图</button>
        <button class="btn btn-primary" data-act="new">+ 新建</button>
        <button class="btn">更多 ▾</button>
      `,
      columns, data,
      pagination: { total, page: modelPage, pageSize: modelSize },
      onPageChange: (p) => { modelPage = p; renderAssetModels({ pageEl, crumbEl }); },
      onPageSizeChange: (s) => { modelSize = s; modelPage = 1; renderAssetModels({ pageEl, crumbEl }); },
      empty: '暂无规格'
    });
    bindModelListEvents(pageEl);
  }

  function bindModelListEvents(root) {
    root.querySelector('[data-search-btn]').onclick = () => {
      modelKw = root.querySelector('[data-search-input]').value;
      modelPage = 1;
      renderAssetModels({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
    };
    root.querySelector('[data-act=new]').onclick = () => Router.go('/asset/model/new');
    root.querySelectorAll('[data-act=del]').forEach(el => {
      el.onclick = async (e) => {
        e.stopPropagation();
        const ok = await UI.confirm({ title: '确认删除', content: '确定删除该规格？', danger: true });
        if (ok) {
          Store.remove('assetModels', el.getAttribute('data-id'));
          UI.toast('删除成功', 'success');
          renderAssetModels({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
        }
      };
    });
  }

  function renderAssetModelDetail({ pageEl, crumbEl, params }) {
    const isNew = params.id === 'new';
    let data = isNew ? {} : Store.getById('assetModels', params.id);
    if (!isNew && !data) { pageEl.innerHTML = UI.render404('/asset/model'); return; }
    Router.setCrumb(crumbEl, [
      { label: '资产管理', path: '/asset/ledger' },
      { label: '资产规格管理', path: '/asset/model' },
      { label: isNew ? '新建规格' : (data.fullName || data.name) }
    ]);
    const cats = Store.listAll('assetModelCategories');
    pageEl.innerHTML = `
      <div class="page-header">
        <div class="page-title">${isNew ? '新建资产规格' : UI.esc(data.fullName)}</div>
        <div class="page-actions">
          <button class="btn btn-primary" data-act="save">保存</button>
          <button class="btn" data-act="cancel">取消</button>
          ${!isNew ? '<button class="btn btn-danger" data-act="delete">删除</button>' : ''}
        </div>
      </div>
      <div class="card"><div class="card-body">
        <div class="form-row">
          ${UI.field({ label: '全称', name: 'fullName', value: data.fullName, required: true })}
          ${UI.field({ label: '名称', name: 'name', value: data.name, required: true })}
        </div>
        <div class="form-row">
          ${UI.field({ label: '分类', name: 'categoryId', value: data.categoryId, type: 'select', options: cats.map(c => ({ value: c.id, label: c.fullPath })) })}
          ${UI.field({ label: '制造商', name: 'manufacturer', value: data.manufacturer })}
        </div>
        <div class="form-row">
          ${UI.field({ label: '资产类型', name: 'assetType', value: data.assetType, type: 'select', options: ASSET_TYPES.filter(t => t.key !== 'all').map(t => ({ value: t.key, label: t.label })) })}
        </div>
      </div></div>
    `;
    bindModelDetailEvents(pageEl, data, isNew);
  }
  function bindModelDetailEvents(root, data, isNew) {
    root.querySelector('[data-act=save]').onclick = () => {
      const collected = UI.collectForm(root);
      Object.assign(data, collected);
      if (!data.name) { UI.toast('请填写名称', 'error'); return; }
      if (isNew) {
        Store.create('assetModels', data);
        UI.toast('创建成功', 'success');
      } else {
        Store.update('assetModels', data.id, data);
        UI.toast('保存成功', 'success');
      }
      Router.go('/asset/model');
    };
    root.querySelector('[data-act=cancel]').onclick = () => Router.go('/asset/model');
    if (!isNew) root.querySelector('[data-act=delete]').onclick = async () => {
      const ok = await UI.confirm({ title: '确认删除', content: '确定删除该规格？', danger: true });
      if (ok) { Store.remove('assetModels', data.id); UI.toast('删除成功', 'success'); Router.go('/asset/model'); }
    };
  }

  // ====================== 资产规格分类 ======================
  let mcatKw = '', mcatPage = 1, mcatSize = 30;
  function renderModelCategories({ pageEl, crumbEl }) {
    const root = pageEl;
    Router.setCrumb(crumbEl, [
      { label: '资产管理', path: '/asset/ledger' },
      { label: '资产规格分类管理' }
    ]);
    const all = Store.listAll('assetModelCategories');
    const filtered = mcatKw ? all.filter(c => (c.name + c.fullPath).toLowerCase().includes(mcatKw.toLowerCase())) : all;
    const start = (mcatPage - 1) * mcatSize;
    const data = filtered.slice(start, start + mcatSize);
    root.innerHTML = UI.renderListPage({
      title: '资产规格分类管理', subtitle: `共 ${all.length} 条`,
      toolbarLeft: `<input class="input search-box" placeholder="请输入名称" value="${UI.esc(mcatKw)}" data-search-input><button class="btn" data-search-btn>搜索</button>`,
      toolbarRight: `<button class="btn">🔄</button><button class="btn">▼ 筛选</button><button class="btn btn-primary" data-act="new">+ 新建</button>`,
      columns: [
        { title: '名称', field: 'name', render: (row) => `<a class="link" data-nav="/asset/model-category/${UI.esc(row.id)}">${UI.esc(row.name)}</a>` },
        { title: '编码', field: 'code' },
        { title: '完整路径', field: 'fullPath' },
        { title: '操作', render: (row) => `<a class="link" data-act="del" data-id="${UI.esc(row.id)}">删除</a>` }
      ],
      data,
      pagination: { total: filtered.length, page: mcatPage, pageSize: mcatSize },
      onPageChange: (p) => { mcatPage = p; renderModelCategories({ pageEl: root, crumbEl }); },
      onPageSizeChange: (s) => { mcatSize = s; mcatPage = 1; renderModelCategories({ pageEl: root, crumbEl }); }
    });
    root.querySelector('[data-search-btn]').onclick = () => {
      mcatKw = root.querySelector('[data-search-input]').value;
      mcatPage = 1;
      renderModelCategories({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
    };
    root.querySelector('[data-act=new]').onclick = () => Router.go('/asset/model-category/new');
    root.querySelectorAll('[data-act=del]').forEach(el => {
      el.onclick = async (e) => {
        e.stopPropagation();
        const ok = await UI.confirm({ title: '确认删除', content: '确定删除该分类？', danger: true });
        if (ok) { Store.remove('assetModelCategories', el.getAttribute('data-id')); UI.toast('删除成功', 'success'); renderModelCategories({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); }
      };
    });
  }
  function renderModelCategoryDetail({ pageEl, crumbEl, params }) {
    const root = pageEl;
    const isNew = params.id === 'new';
    let data = isNew ? {} : Store.getById('assetModelCategories', params.id);
    if (!isNew && !data) { root.innerHTML = UI.render404('/asset/model-category'); return; }
    Router.setCrumb(crumbEl, [
      { label: '资产管理', path: '/asset/ledger' },
      { label: '资产规格分类管理', path: '/asset/model-category' },
      { label: isNew ? '新建分类' : data.name }
    ]);
    const allCats = Store.listAll('assetModelCategories');
    root.innerHTML = `
      <div class="page-header">
        <div class="page-title">${isNew ? '新建资产规格分类' : UI.esc(data.name)}</div>
        <div class="page-actions">
          <button class="btn btn-primary" data-act="save">保存</button>
          <button class="btn" data-act="cancel">取消</button>
          ${!isNew ? '<button class="btn btn-danger" data-act="delete">删除</button>' : ''}
        </div>
      </div>
      <div class="card"><div class="card-body">
        <div class="form-row">
          ${UI.field({ label: '名称', name: 'name', value: data.name, required: true })}
          ${UI.field({ label: '编码', name: 'code', value: data.code })}
        </div>
        <div class="form-row">
          ${UI.field({ label: '父级分类', name: 'parentId', value: data.parentId, type: 'select', options: [{ value: '', label: '（根分类）' }, ...allCats.filter(c => c.id !== data.id).map(c => ({ value: c.id, label: c.fullPath }))] })}
          ${UI.field({ label: '完整路径', name: 'fullPath', value: data.fullPath, disabled: true, help: '保存时自动生成' })}
        </div>
      </div></div>
    `;
    root.querySelector('[data-act=save]').onclick = () => {
      const collected = UI.collectForm(root);
      Object.assign(data, collected);
      if (!data.name) { UI.toast('请填写名称', 'error'); return; }
      const parent = data.parentId ? Store.getById('assetModelCategories', data.parentId) : null;
      data.fullPath = parent ? `${parent.fullPath}/${data.name}` : data.name;
      if (isNew) { Store.create('assetModelCategories', data); UI.toast('创建成功', 'success'); }
      else { Store.update('assetModelCategories', data.id, data); UI.toast('保存成功', 'success'); }
      Router.go('/asset/model-category');
    };
    root.querySelector('[data-act=cancel]').onclick = () => Router.go('/asset/model-category');
    if (!isNew) root.querySelector('[data-act=delete]').onclick = async () => {
      const ok = await UI.confirm({ title: '确认删除', content: '确定删除该分类？', danger: true });
      if (ok) { Store.remove('assetModelCategories', data.id); UI.toast('删除成功', 'success'); Router.go('/asset/model-category'); }
    };
  }

  // ====================== 映射管理 ======================
  let cimKw = '', cimPage = 1, cimSize = 30;
  function renderCIMappings({ pageEl, crumbEl }) {
    const root = pageEl;
    Router.setCrumb(crumbEl, [
      { label: '资产管理', path: '/asset/ledger' },
      { label: '映射管理' }
    ]);
    const all = Store.listAll('ciMappings');
    const filtered = cimKw ? all.filter(c => (c.name + c.assetField + c.ciField).toLowerCase().includes(cimKw.toLowerCase())) : all;
    const start = (cimPage - 1) * cimSize;
    const data = filtered.slice(start, start + cimSize);
    root.innerHTML = UI.renderListPage({
      title: '映射管理', subtitle: `共 ${all.length} 条`,
      toolbarLeft: `<input class="input search-box" placeholder="请输入名称" value="${UI.esc(cimKw)}" data-search-input><button class="btn" data-search-btn>搜索</button>`,
      toolbarRight: `<button class="btn">🔄</button><button class="btn">▼ 筛选</button><button class="btn btn-primary" data-act="new">+ 新建</button>`,
      columns: [
        { title: '名称', field: 'name', render: (row) => `<a class="link" data-nav="/asset/ci-mapping/${UI.esc(row.id)}">${UI.esc(row.name)}</a>` },
        { title: '资产字段', field: 'assetField', render: (row) => `<a class="link" data-nav="/asset/ci-mapping/${UI.esc(row.id)}">${UI.esc(row.assetField)}</a>` },
        { title: 'CI字段', field: 'ciField' },
        { title: '源类型', field: 'sourceType' },
        { title: '目标类型', field: 'targetType' },
        { title: '操作', render: (row) => `<a class="link" data-act="del" data-id="${UI.esc(row.id)}">删除</a>` }
      ],
      data,
      pagination: { total: filtered.length, page: cimPage, pageSize: cimSize },
      onPageChange: (p) => { cimPage = p; renderCIMappings({ pageEl: root, crumbEl }); },
      onPageSizeChange: (s) => { cimSize = s; cimPage = 1; renderCIMappings({ pageEl: root, crumbEl }); }
    });
    root.querySelector('[data-search-btn]').onclick = () => {
      cimKw = root.querySelector('[data-search-input]').value;
      cimPage = 1;
      renderCIMappings({ pageEl: root, crumbEl: document.getElementById('breadcrumb') });
    };
    root.querySelector('[data-act=new]').onclick = () => Router.go('/asset/ci-mapping/new');
    root.querySelectorAll('[data-act=del]').forEach(el => {
      el.onclick = async (e) => {
        e.stopPropagation();
        const ok = await UI.confirm({ title: '确认删除', content: '确定删除该映射？', danger: true });
        if (ok) { Store.remove('ciMappings', el.getAttribute('data-id')); UI.toast('删除成功', 'success'); renderCIMappings({ pageEl: root, crumbEl: document.getElementById('breadcrumb') }); }
      };
    });
  }
  function renderCIMappingDetail({ pageEl, crumbEl, params }) {
    const root = pageEl;
    const isNew = params.id === 'new';
    let data = isNew ? {} : Store.getById('ciMappings', params.id);
    if (!isNew && !data) { root.innerHTML = UI.render404('/asset/ci-mapping'); return; }
    Router.setCrumb(crumbEl, [
      { label: '资产管理', path: '/asset/ledger' },
      { label: '映射管理', path: '/asset/ci-mapping' },
      { label: isNew ? '新建映射' : data.name }
    ]);
    root.innerHTML = `
      <div class="page-header">
        <div class="page-title">${isNew ? '新建映射' : UI.esc(data.name)}</div>
        <div class="page-actions">
          <button class="btn btn-primary" data-act="save">保存</button>
          <button class="btn" data-act="cancel">取消</button>
          ${!isNew ? '<button class="btn btn-danger" data-act="delete">删除</button>' : ''}
        </div>
      </div>
      <div class="card"><div class="card-body">
        <div class="form-row">
          ${UI.field({ label: '名称', name: 'name', value: data.name, required: true })}
          ${UI.field({ label: '源类型', name: 'sourceType', value: data.sourceType, type: 'select', options: ['all', ...ASSET_TYPES.filter(t => t.key !== 'all').map(t => t.key)].map(v => ({ value: v, label: v })) })}
        </div>
        <div class="form-row">
          ${UI.field({ label: '资产字段', name: 'assetField', value: data.assetField, required: true })}
          ${UI.field({ label: 'CI字段', name: 'ciField', value: data.ciField, required: true })}
        </div>
        <div class="form-row">
          ${UI.field({ label: '目标类型', name: 'targetType', value: data.targetType, type: 'select', options: ['all', 'Server', 'Laptop', 'Network'].map(v => ({ value: v, label: v })) })}
        </div>
      </div></div>
    `;
    root.querySelector('[data-act=save]').onclick = () => {
      const collected = UI.collectForm(root);
      Object.assign(data, collected);
      if (!data.name) { UI.toast('请填写名称', 'error'); return; }
      if (isNew) { Store.create('ciMappings', data); UI.toast('创建成功', 'success'); }
      else { Store.update('ciMappings', data.id, data); UI.toast('保存成功', 'success'); }
      Router.go('/asset/ci-mapping');
    };
    root.querySelector('[data-act=cancel]').onclick = () => Router.go('/asset/ci-mapping');
    if (!isNew) root.querySelector('[data-act=delete]').onclick = async () => {
      const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true });
      if (ok) { Store.remove('ciMappings', data.id); UI.toast('删除成功', 'success'); Router.go('/asset/ci-mapping'); }
    };
  }

  // ====================== 工具函数 ======================
  function getAssetTypeLabel(key) {
    const t = ASSET_TYPES.find(x => x.key === key);
    return t ? t.label : key;
  }
  function getModelName(id) {
    if (!id) return '-';
    const m = Store.getById('assetModels', id);
    return m ? m.name : id;
  }
  function getModelCategoryName(id) {
    if (!id) return '-';
    const c = Store.getById('assetModelCategories', id);
    return c ? c.name : id;
  }
  function getUserName(id) {
    if (!id) return '-';
    const u = Store.getById('users', id);
    return u ? u.name : id;
  }
  function getLocationFullPath(id) {
    if (!id) return '-';
    const l = Store.getById('locations', id);
    return l ? l.fullPath : id;
  }

  // ====================== 注册路由 ======================
  function registerRoutes() {
    Router.register('/asset/ledger', renderAssetLedger);
    Router.register('/asset/ledger/:id', renderAssetDetail);
    Router.register('/asset/model', renderAssetModels);
    Router.register('/asset/model/:id', renderAssetModelDetail);
    Router.register('/asset/model-category', renderModelCategories);
    Router.register('/asset/model-category/:id', renderModelCategoryDetail);
    Router.register('/asset/ci-mapping', renderCIMappings);
    Router.register('/asset/ci-mapping/:id', renderCIMappingDetail);
  }

  global.AssetModule = { registerRoutes, renderAssetLedger, ASSET_TYPES };
})(window);
