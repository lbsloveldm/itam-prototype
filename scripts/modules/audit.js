// ========================================
// ITAM 原型 - 资产盘点模块
// 模板 / 计划 / 任务 + 结果弹窗
// ========================================
(function(global) {
  'use strict';

  // 通用列表页 + 详情工厂
  function makeModule({ key, storeKey, title, columns, formFields, getExtraBody, breadcrumbsBase }) {
    let kw = '', page = 1, size = 30;
    return {
      renderList({ pageEl, crumbEl }) {
        Router.setCrumb(crumbEl, breadcrumbsBase.list);
        const all = Store.listAll(storeKey);
        const filtered = kw ? all.filter(x => columns.some(c => String(x[c.field] || '').toLowerCase().includes(kw.toLowerCase()))) : all;
        const start = (page - 1) * size;
        const data = filtered.slice(start, start + size);
        const colsWithLink = columns.map(c => ({ ...c, render: c.render || ((row) => {
          if (c.link !== false) return `<a class="link" data-nav="${key.listPath}/${UI.esc(row.id)}">${UI.esc(row[c.field] || '-')}</a>`;
          return UI.esc(row[c.field] || '-');
        }) }));
        pageEl.innerHTML = UI.renderListPage({
          title, subtitle: `共 ${all.length} 条`,
          toolbarLeft: `<input class="input search-box" placeholder="请输入名称" value="${UI.esc(kw)}" data-search-input><button class="btn" data-search-btn>搜索</button>`,
          toolbarRight: `<button class="btn">🔄</button><button class="btn">▼ 筛选</button><button class="btn">保存视图</button><button class="btn btn-primary" data-act="new">+ 新建</button>`,
          columns: colsWithLink, data,
          pagination: { total: filtered.length, page, pageSize: size },
          onPageChange: (p) => { page = p; this.renderList({ pageEl, crumbEl }); },
          onPageSizeChange: (s) => { size = s; page = 1; this.renderList({ pageEl, crumbEl }); }
        });
        const searchBtn = pageEl.querySelector('[data-search-btn]');
        if (searchBtn) searchBtn.onclick = () => { kw = pageEl.querySelector('[data-search-input]').value; page = 1; this.renderList({ pageEl, crumbEl }); };
        const newBtn = pageEl.querySelector('[data-act=new]');
        if (newBtn) newBtn.onclick = () => Router.go(`${key.listPath}/new`);
        pageEl.querySelectorAll('[data-act=del]').forEach(el => {
          el.onclick = async (e) => { e.stopPropagation(); const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true }); if (ok) { Store.remove(storeKey, el.getAttribute('data-id')); UI.toast('删除成功', 'success'); this.renderList({ pageEl, crumbEl }); } };
        });
        if (key.onListRender) key.onListRender(pageEl, this);
      },
      renderDetail({ pageEl, crumbEl, params }) {
        const isNew = params.id === 'new';
        let data = isNew ? {} : Store.getById(storeKey, params.id);
        if (!isNew && !data) { pageEl.innerHTML = UI.render404(key.listPath); return; }
        const itemName = isNew ? `新建${title}` : (data.name || data.code);
        Router.setCrumb(crumbEl, [...breadcrumbsBase.detail, { label: itemName }]);
        const extra = getExtraBody ? getExtraBody(data, isNew) : '';
        const fieldsHtml = formFields(data).map(f => f.colspan === 3 ? `<div class="form-row-3">${f.html}</div>` : f.colspan === 2 ? `<div class="form-row">${f.html}</div>` : f.html).join('');
        pageEl.innerHTML = `
          <div class="page-header">
            <div class="page-title">${UI.esc(itemName)}</div>
            <div class="page-actions">
              <button class="btn btn-primary" data-act="save">保存</button>
              <button class="btn" data-act="cancel">取消</button>
              ${!isNew ? '<button class="btn btn-danger" data-act="delete">删除</button>' : ''}
            </div>
          </div>
          ${extra}
          <div class="card"><div class="card-body">${fieldsHtml}</div></div>
        `;
        pageEl.querySelector('[data-act=save]').onclick = () => {
          const collected = UI.collectForm(pageEl);
          Object.assign(data, collected);
          if (!data.name) { UI.toast('请填写名称', 'error'); return; }
          if (isNew) { Store.create(storeKey, data); UI.toast('创建成功', 'success'); }
          else { Store.update(storeKey, data.id, data); UI.toast('保存成功', 'success'); }
          Router.go(key.listPath);
        };
        pageEl.querySelector('[data-act=cancel]').onclick = () => Router.go(key.listPath);
        if (!isNew) pageEl.querySelector('[data-act=delete]').onclick = async () => {
          const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true });
          if (ok) { Store.remove(storeKey, data.id); UI.toast('删除成功', 'success'); Router.go(key.listPath); }
        };
        if (key.onDetailRender) key.onDetailRender(pageEl, data, isNew);
      }
    };
  }

  // ===== 盘点模板 =====
  const tplMod = makeModule({
    key: { listPath: '/audit/template' },
    storeKey: 'auditTemplates',
    title: '盘点模板',
    columns: [
      { title: '名称', field: 'name' },
      { title: '模板编号', field: 'code' },
      { title: '类型', field: 'type', render: (r) => UI.statusTag(r.type) },
      { title: '盘点库房', field: 'stockrooms', render: (r) => (r.stockrooms || []).map(s => UI.esc(getStockroomName(s))).join('、') || '-' },
      { title: '盘点位置', field: 'locations', render: (r) => (r.locations || []).map(l => UI.esc(getLocationName(l))).join('、') || '-' },
      { title: '盘点规格', field: 'models', render: (r) => (r.models || []).map(m => UI.esc(getModelName(m))).join('、') || '-' },
      { title: '是否启用', field: 'enabled', render: (r) => r.enabled ? UI.statusTag('是') : UI.statusTag('否') },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '模板编号', name: 'code', value: d.code, placeholder: '保存时自动生成' }) },
      { html: UI.field({ label: '类型', name: 'type', value: d.type, type: 'select', options: ['Stockroom', 'Location', 'Asset Type'].map(v => ({ value: v, label: v })) }) + UI.field({ label: '是否启用', name: 'enabled', value: d.enabled, type: 'switch' }) },
      { colspan: 1, html: UI.field({ label: '盘点库房', name: 'stockrooms_str', value: (d.stockrooms || []).join(','), help: '多个用逗号分隔' }) }
    ],
    breadcrumbsBase: {
      list: [{ label: '资产盘点', path: '/audit/template' }, { label: '盘点模板' }],
      detail: [{ label: '资产盘点', path: '/audit/template' }, { label: '盘点模板', path: '/audit/template' }]
    }
  });

  // ===== 盘点计划 =====
  const planMod = makeModule({
    key: { listPath: '/audit/plan' },
    storeKey: 'auditPlans',
    title: '盘点计划',
    columns: [
      { title: '名称', field: 'name' },
      { title: '编号', field: 'code' },
      { title: '模板', field: 'template', render: (r) => r.template ? UI.esc(getTemplateName(r.template)) : '-' },
      { title: '频率', field: 'frequency' },
      { title: '起止日期', field: '_date', link: false, render: (r) => `${UI.esc(r.startDate || '-')} ~ ${UI.esc(r.endDate || '-')}` },
      { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
      { title: '操作', field: '_act', link: false, render: (r) => `<a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>` }
    ],
    formFields: (d) => [
      { html: UI.field({ label: '名称', name: 'name', value: d.name, required: true }) + UI.field({ label: '编号', name: 'code', value: d.code, placeholder: '保存时自动生成' }) },
      { html: UI.field({ label: '模板', name: 'template', value: d.template, type: 'select', options: Store.listAll('auditTemplates').map(t => ({ value: t.id, label: t.name })) }) + UI.field({ label: '频率', name: 'frequency', value: d.frequency, type: 'select', options: ['每天', '每周', '每月', '每季度', '每年'].map(v => ({ value: v, label: v })) }) },
      { html: UI.field({ label: '开始日期', name: 'startDate', value: d.startDate, type: 'text' }) + UI.field({ label: '结束日期', name: 'endDate', value: d.endDate, type: 'text' }) + UI.field({ label: '状态', name: 'status', value: d.status || '未开始', type: 'select', options: ['未开始', '进行中', '已完成', '已取消'].map(v => ({ value: v, label: v })) }) }
    ],
    breadcrumbsBase: {
      list: [{ label: '资产盘点', path: '/audit/plan' }, { label: '盘点计划' }],
      detail: [{ label: '资产盘点', path: '/audit/plan' }, { label: '盘点计划', path: '/audit/plan' }]
    }
  });

  // ===== 盘点任务 =====
  const taskMod = {
    page: 1, size: 30, kw: '',
    renderList({ pageEl, crumbEl }) {
      Router.setCrumb(crumbEl, [{ label: '资产盘点', path: '/audit/task' }, { label: '盘点任务' }]);
      const all = Store.listAll('auditTasks');
      const filtered = this.kw ? all.filter(t => (t.name + t.code + t.status).toLowerCase().includes(this.kw.toLowerCase())) : all;
      const start = (this.page - 1) * this.size;
      const data = filtered.slice(start, start + this.size);
      const cols = [
        { title: '名称', field: 'name', render: (r) => `<a class="link" data-nav="/audit/task/${UI.esc(r.id)}">${UI.esc(r.name)}</a>` },
        { title: '编号', field: 'code' },
        { title: '盘点计划', field: 'plan', render: (r) => r.plan ? `<a class="link" data-nav="/audit/plan/${UI.esc(r.plan)}">${UI.esc(getPlanName(r.plan))}</a>` : '-' },
        { title: '负责人', field: 'assignee', render: (r) => UI.esc(getUserName(r.assignee)) },
        { title: '状态', field: 'status', render: (r) => UI.statusTag(r.status) },
        { title: '启动时间', field: 'bootTime', render: (r) => UI.esc(r.bootTime || '-') },
        { title: '操作', field: '_act', render: (r) => `
          <a class="link" data-act="view-result" data-id="${UI.esc(r.id)}">查看结果</a>
          <a class="link" data-act="del" data-id="${UI.esc(r.id)}">删除</a>
        ` }
      ];
      pageEl.innerHTML = UI.renderListPage({
        title: '盘点任务', subtitle: `共 ${all.length} 条`,
        toolbarLeft: `<input class="input search-box" placeholder="请输入名称" value="${UI.esc(this.kw)}" data-search-input><button class="btn" data-search-btn>搜索</button>`,
        toolbarRight: `<button class="btn">🔄</button><button class="btn">▼ 筛选</button><button class="btn">保存视图</button><button class="btn btn-primary" data-act="new">+ 新建</button>`,
        columns: cols, data,
        pagination: { total: filtered.length, page: this.page, pageSize: this.size },
        onPageChange: (p) => { this.page = p; this.renderList({ pageEl, crumbEl }); },
        onPageSizeChange: (s) => { this.size = s; this.page = 1; this.renderList({ pageEl, crumbEl }); }
      });
      pageEl.querySelector('[data-search-btn]').onclick = () => { this.kw = pageEl.querySelector('[data-search-input]').value; this.page = 1; this.renderList({ pageEl, crumbEl }); };
      pageEl.querySelector('[data-act=new]').onclick = () => Router.go('/audit/task/new');
      pageEl.querySelectorAll('[data-act=del]').forEach(el => {
        el.onclick = async (e) => { e.stopPropagation(); const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true }); if (ok) { Store.remove('auditTasks', el.getAttribute('data-id')); UI.toast('删除成功', 'success'); this.renderList({ pageEl, crumbEl }); } };
      });
      // 查看结果弹窗
      pageEl.querySelectorAll('[data-act=view-result]').forEach(el => {
        el.onclick = (e) => { e.stopPropagation(); this.openResultModal(el.getAttribute('data-id')); };
      });
    },
    openResultModal(taskId) {
      const task = Store.getById('auditTasks', taskId);
      const results = Store.listAll('auditResults').filter(r => r.task === taskId);
      const allAssets = Store.listAll('assets');
      const body = `
        <div style="margin-bottom:12px">
          <strong>${UI.esc(task.name)}</strong> &nbsp;
          ${UI.statusTag(task.status)} &nbsp;
          <span class="text-muted">${UI.esc(task.result || '')}</span>
        </div>
        <table class="data-table">
          <thead><tr><th>资产标识</th><th>实际状态</th><th>备注</th><th>创建人</th></tr></thead>
          <tbody>${results.length === 0 ? '<tr><td colspan="4"><div class="empty">暂无盘点结果</div></td></tr>' : results.map(r => {
            const a = allAssets.find(x => x.id === r.assetTag || x.assetTag === r.assetTag);
            return `<tr><td>${a ? `<a class="link" data-nav="/asset/ledger/${UI.esc(a.id)}">${UI.esc(r.assetTag)}</a>` : UI.esc(r.assetTag)}</td><td>${UI.esc(r.actualStatus)}</td><td>${UI.esc(r.notes || '-')}</td><td>${UI.esc(r.createdBy || '-')}</td></tr>`;
          }).join('')}</tbody>
        </table>
      `;
      const footer = document.createElement('div');
      footer.innerHTML = '<button class="btn btn-primary" data-act="close">关闭</button>';
      const m = UI.openModal({ title: '盘点结果', body, footer, width: '700px' });
      footer.querySelector('[data-act=close]').onclick = () => UI.closeModal();
    },
    renderDetail({ pageEl, crumbEl, params }) {
      const isNew = params.id === 'new';
      let data = isNew ? {} : Store.getById('auditTasks', params.id);
      if (!isNew && !data) { pageEl.innerHTML = UI.render404('/audit/task'); return; }
      const itemName = isNew ? '新建盘点任务' : data.name;
      Router.setCrumb(crumbEl, [{ label: '资产盘点', path: '/audit/task' }, { label: '盘点任务', path: '/audit/task' }, { label: itemName }]);
      const headInfo = isNew ? '' : UI.renderHeadInfo([
        { label: '负责人', value: getUserName(data.assignee) },
        { label: 'Overdue', value: data.overdue ? '是' : '否' },
        { label: 'Check', value: data.check ? '是' : '否' },
        { label: '创建时间', value: data.createdTime }
      ]);
      pageEl.innerHTML = `
        <div class="page-header">
          <div class="page-title">${UI.esc(itemName)}</div>
          <div class="page-actions">
            ${!isNew ? '<button class="btn" data-act="view-result">查看结果</button>' : ''}
            <button class="btn btn-primary" data-act="save">保存</button>
            <button class="btn" data-act="cancel">取消</button>
            ${!isNew ? '<button class="btn btn-danger" data-act="delete">删除</button>' : ''}
          </div>
        </div>
        ${headInfo}
        <div class="card"><div class="card-header"><div class="card-title">基本信息</div></div><div class="card-body">
          <div class="form-row">
            ${UI.field({ label: '名称', name: 'name', value: data.name, required: true })}
            ${UI.field({ label: '盘点计划', name: 'plan', value: data.plan, type: 'select', options: Store.listAll('auditPlans').map(p => ({ value: p.id, label: p.name })) })}
          </div>
          <div class="form-row-3">
            ${UI.field({ label: '负责人', name: 'assignee', value: data.assignee, type: 'select', options: Store.listAll('users').map(u => ({ value: u.id, label: u.name })) })}
            ${UI.field({ label: '启动时间', name: 'bootTime', value: data.bootTime })}
            ${UI.field({ label: '完成时间', name: 'finishTime', value: data.finishTime })}
          </div>
          <div class="form-row-3">
            ${UI.field({ label: '状态', name: 'status', value: data.status, type: 'select', options: ['In Progress', 'Not started', 'Completed', 'Cancelled'].map(v => ({ value: v, label: v })) })}
            ${UI.field({ label: 'Overdue', name: 'overdue', value: data.overdue, type: 'switch' })}
            ${UI.field({ label: 'Check', name: 'check', value: data.check, type: 'switch' })}
          </div>
          ${UI.field({ label: '盘点结果', name: 'result', value: data.result, type: 'textarea', rows: 3 })}
        </div></div>
        <div class="card"><div class="card-header"><div class="card-title">盘点规格 (Models)</div></div><div class="card-body">
          ${UI.field({ label: 'Audit models', name: 'models_str', value: (data.models || []).join(','), help: '多个规格用逗号分隔；说明每规格核对 Serial number / Stockroom / Cost center' })}
        </div></div>
        <div class="card"><div class="card-header"><div class="card-title">附件 (Attachments)</div></div><div class="card-body">
          <div class="empty"><div class="empty-icon">📎</div><div class="empty-text">暂无附件</div></div>
        </div></div>
      `;
      pageEl.querySelector('[data-act=save]').onclick = () => {
        const collected = UI.collectForm(pageEl);
        Object.assign(data, collected);
        if (!data.name) { UI.toast('请填写名称', 'error'); return; }
        if (isNew) { Store.create('auditTasks', data); UI.toast('创建成功', 'success'); }
        else { Store.update('auditTasks', data.id, data); UI.toast('保存成功', 'success'); }
        Router.go('/audit/task');
      };
      pageEl.querySelector('[data-act=cancel]').onclick = () => Router.go('/audit/task');
      if (!isNew) {
        pageEl.querySelector('[data-act=delete]').onclick = async () => {
          const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true });
          if (ok) { Store.remove('auditTasks', data.id); UI.toast('删除成功', 'success'); Router.go('/audit/task'); }
        };
        pageEl.querySelector('[data-act=view-result]').onclick = () => this.openResultModal(data.id);
      }
    }
  };

  // 工具函数
  function getStockroomName(id) { const x = Store.getById('stockrooms', id); return x ? x.fullName || x.name : id; }
  function getLocationName(id) { const x = Store.getById('locations', id); return x ? x.fullPath : id; }
  function getModelName(id) { const x = Store.getById('assetModels', id); return x ? x.name : id; }
  function getTemplateName(id) { const x = Store.getById('auditTemplates', id); return x ? x.name : id; }
  function getPlanName(id) { const x = Store.getById('auditPlans', id); return x ? x.name : id; }
  function getUserName(id) { const u = Store.getById('users', id); return u ? u.name : id; }

  function registerRoutes() {
    Router.register('/audit/template', tplMod.renderList.bind(tplMod));
    Router.register('/audit/template/:id', tplMod.renderDetail.bind(tplMod));
    Router.register('/audit/plan', planMod.renderList.bind(planMod));
    Router.register('/audit/plan/:id', planMod.renderDetail.bind(planMod));
    Router.register('/audit/task', taskMod.renderList.bind(taskMod));
    Router.register('/audit/task/:id', taskMod.renderDetail.bind(taskMod));
  }
  global.AuditModule = { registerRoutes };
})(window);
