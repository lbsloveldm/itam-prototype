// ========================================
// ITAM 原型 - 通用 UI 工具
// ========================================
(function(global) {
  'use strict';

  // ---- HTML 转义 ----
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---- Toast ----
  function toast(message, type) {
    type = type || 'info';
    const root = document.getElementById('toast-root');
    if (!root) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = message;
    root.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity .3s';
      setTimeout(() => t.remove(), 300);
    }, 2500);
  }

  // ---- Modal ----
  function openModal({ title, body, footer, width }) {
    closeModal();
    const mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.id = 'modal-mask';
    const modal = document.createElement('div');
    modal.className = 'modal';
    if (width) modal.style.minWidth = width;
    modal.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">${title || ''}</div>
        <button class="modal-close" type="button">×</button>
      </div>
      <div class="modal-body"></div>
      <div class="modal-footer"></div>
    `;
    mask.appendChild(modal);
    document.getElementById('modal-root').appendChild(mask);
    const bodyEl = modal.querySelector('.modal-body');
    const footerEl = modal.querySelector('.modal-footer');
    if (typeof body === 'string') bodyEl.innerHTML = body;
    else if (body) bodyEl.appendChild(body);
    if (typeof footer === 'string') footerEl.innerHTML = footer;
    else if (footer) footerEl.appendChild(footer);
    else footerEl.style.display = 'none';
    modal.querySelector('.modal-close').onclick = closeModal;
    mask.onclick = (e) => { if (e.target === mask) closeModal(); };
    return { mask, modal, bodyEl, footerEl };
  }
  function closeModal() {
    const m = document.getElementById('modal-mask');
    if (m) m.remove();
  }
  function confirm(opts) {
    return new Promise(resolve => {
      const { title, content, okText, cancelText, danger } = opts;
      const footer = document.createElement('div');
      footer.innerHTML = `
        <button class="btn" type="button" data-act="cancel">${esc(cancelText || '取消')}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="button" data-act="ok">${esc(okText || '确定')}</button>
      `;
      const m = openModal({ title: title || '确认', body: `<div>${content || ''}</div>`, footer });
      footer.querySelector('[data-act=ok]').onclick = () => { closeModal(); resolve(true); };
      footer.querySelector('[data-act=cancel]').onclick = () => { closeModal(); resolve(false); };
    });
  }

  // ---- Tag ----
  function tag(text, color) {
    const map = {
      blue: 'tag-blue', green: 'tag-green', orange: 'tag-orange', red: 'tag-red',
      purple: 'tag-purple', cyan: 'tag-cyan', gold: 'tag-gold', grey: 'tag-grey',
      magenta: 'tag-magenta', volcano: 'tag-volcano'
    };
    const cls = map[color] || 'tag-blue';
    return `<span class="tag ${cls}">${esc(text || '-')}</span>`;
  }

  // 状态 → 颜色映射（业务通用）
  const STATUS_COLOR = {
    // asset
    'In use': 'green', 'In stock': 'blue', 'Retired': 'grey', 'Reserved': 'orange',
    // audit
    'In Progress': 'gold', 'Not started': 'grey', 'Completed': 'green',
    // contract
    '生效中': 'green', '草稿': 'grey', '已作废': 'red', '已续约': 'cyan',
    '无': 'grey', '审批中': 'orange', '续约已批准': 'cyan',
    // approval
    '待审批': 'gold', '已批准': 'green', '已拒绝': 'red',
    // warning
    '未处理': 'red', '已处理': 'green', '未读': 'red', '已读': 'grey',
    // status
    'active': 'green', 'inactive': 'grey', '正常合作中': 'green', '停止合作': 'red',
    // common
    '合规': 'green', '不合规': 'red', 'warning': 'orange', 'info': 'blue', 'error': 'red'
  };
  function statusTag(s) {
    if (!s) return tag('-', 'grey');
    return tag(s, STATUS_COLOR[s] || 'blue');
  }

  // ---- 列表页通用结构 ----
  function renderListPage({ title, subtitle, breadcrumbs, toolbarLeft, toolbarRight, columns, data, onRowClick, empty, pagination, onPageChange, onPageSizeChange, pageSizeOptions }) {
    const cols = columns.map(c => `<th class="${c.cls || ''}">${esc(c.title)}${c.sortable ? ' <span style="color:#999">⇅</span>' : ''}</th>`).join('');
    const rows = data.length === 0 ? `<tr><td colspan="${columns.length + 1}"><div class="empty"><div class="empty-icon">📭</div><div class="empty-text">${empty || '暂无数据'}</div></div></td></tr>` : data.map((row, i) => {
      const cells = columns.map(c => `<td>${c.render ? c.render(row, i) : esc(c.field ? row[c.field] : '')}</td>`).join('');
      return `<tr data-id="${esc(row.id)}" data-idx="${i}">${cells}</tr>`;
    }).join('');
    const crumb = (breadcrumbs || []).map((b, i, arr) => {
      const sep = i < arr.length - 1 ? '<span class="sep">/</span>' : '';
      return i < arr.length - 1
        ? `<a data-nav="${esc(b.path || '')}">${esc(b.label)}</a>${sep}`
        : `<span class="current">${esc(b.label)}</span>`;
    }).join('');
    const pag = pagination ? renderPagination(pagination, onPageChange, onPageSizeChange, pageSizeOptions) : '';
    return `
      <div class="page-header">
        <div class="flex gap-12" style="align-items:baseline">
          <div class="page-title">${esc(title)}</div>
          ${subtitle ? `<div class="page-subtitle">${esc(subtitle)}</div>` : ''}
        </div>
        <div class="page-actions">
          ${toolbarRight || '<button class="btn btn-primary" data-act="new">+ 新建</button>'}
        </div>
      </div>
      <div class="table-card">
        <div class="table-toolbar">
          <div class="table-toolbar-left">${toolbarLeft || ''}</div>
        </div>
        <table class="data-table">
          <thead><tr><th class="col-checkbox"><input type="checkbox" data-act="check-all"></th>${cols}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        ${pag}
      </div>
    `;
  }

  // ---- 分页 ----
  function renderPagination({ total, page, pageSize }, onPageChange, onPageSizeChange, pageSizeOptions) {
    pageSizeOptions = pageSizeOptions || [10, 30, 50, 100];
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i <= 5 || i === totalPages || Math.abs(i - page) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    const pageBtns = pages.map(p => {
      if (p === '...') return `<span>...</span>`;
      return `<button class="${p === page ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }).join('');
    return `
      <div class="pagination">
        <span class="pagination-info">共 ${total} 条</span>
        <select class="page-size-select" data-act="page-size">
          ${pageSizeOptions.map(s => `<option value="${s}" ${s === pageSize ? 'selected' : ''}>${s}/页</option>`).join('')}
        </select>
        ${pageBtns}
        <button data-page="${Math.max(1, page - 1)}" ${page <= 1 ? 'disabled' : ''}>上一页</button>
        <button data-page="${Math.min(totalPages, page + 1)}" ${page >= totalPages ? 'disabled' : ''}>下一页</button>
      </div>
    `;
  }

  // ---- 详情页头部信息条 ----
  function renderHeadInfo(items) {
    return `
      <div class="head-info">
        ${items.map(it => `<div class="head-info-item"><div class="head-info-label">${esc(it.label)}</div><div class="head-info-value">${it.render ? it.render() : esc(it.value || '-')}</div></div>`).join('')}
      </div>
    `;
  }

  // ---- Tabs ----
  function renderTabs(tabs, activeKey, onChange) {
    return `
      <div class="tab-bar">
        ${tabs.map(t => `<div class="tab-item ${t.key === activeKey ? 'active' : ''}" data-tab="${esc(t.key)}">${esc(t.label)}</div>`).join('')}
      </div>
      <div class="tab-content" data-tab-body>${(tabs.find(t => t.key === activeKey) || {}).content || ''}</div>
    `;
  }

  // ---- Collapse 分节表单 ----
  function renderCollapse(sections, defaultOpen) {
    return sections.map((s, i) => {
      const open = defaultOpen ? (defaultOpen.includes(s.key || i)) : (s.defaultOpen !== false);
      return `
        <div class="collapse-item ${open ? 'expanded' : ''}" data-section="${esc(s.key || i)}">
          <div class="collapse-header" data-collapse-toggle>
            <span>${esc(s.title)}</span>
            <span class="caret">▶</span>
          </div>
          <div class="collapse-body">${s.content}</div>
        </div>
      `;
    }).join('');
  }

  // ---- 通用表单字段渲染 ----
  function field({ label, name, value, type, options, required, disabled, placeholder, help, error, onChange, rows, maxLength }) {
    let input = '';
    if (type === 'select') {
      input = `<select class="select" name="${esc(name)}" ${disabled ? 'disabled' : ''} ${onChange ? `data-change="${esc(name)}"` : ''}>
        <option value="">${esc(placeholder || '请选择')}</option>
        ${(options || []).map(o => `<option value="${esc(o.value)}" ${String(o.value) === String(value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
      </select>`;
    } else if (type === 'textarea') {
      input = `<textarea class="textarea" name="${esc(name)}" ${disabled ? 'disabled' : ''} ${onChange ? `data-change="${esc(name)}"` : ''} placeholder="${esc(placeholder || '')}" ${rows ? `rows="${rows}` : ''} ${maxLength ? `maxlength="${maxLength}"` : ''}>${esc(value || '')}</textarea>`;
    } else if (type === 'switch') {
      input = `<label class="switch"><input type="checkbox" name="${esc(name)}" ${value ? 'checked' : ''} ${disabled ? 'disabled' : ''} data-change="${esc(name)}"><span class="switch-slider"></span></label>`;
    } else {
      input = `<input class="input" name="${esc(name)}" type="${type || 'text'}" value="${esc(value || '')}" ${disabled ? 'disabled' : ''} ${onChange ? `data-change="${esc(name)}"` : ''} placeholder="${esc(placeholder || '')}" ${maxLength ? `maxlength="${maxLength}"` : ''}>`;
    }
    return `
      <div class="form-group">
        <label class="form-label ${required ? 'required' : ''}">${esc(label)}</label>
        ${input}
        ${error ? `<div class="form-error">${esc(error)}</div>` : ''}
        ${help ? `<div class="form-help">${esc(help)}</div>` : ''}
      </div>
    `;
  }

  // ---- 表单数据收集 ----
  function collectForm(formEl) {
    const data = {};
    formEl.querySelectorAll('[name]').forEach(el => {
      const v = el.type === 'checkbox' ? el.checked : el.value;
      data[el.name] = v;
    });
    return data;
  }

  // ---- 404 页面 ----
  function render404(returnTo) {
    return `
      <div class="result">
        <div class="result-icon">😕</div>
        <div class="result-title">404 - 页面不存在</div>
        <div class="result-subtitle">您访问的记录不存在或已被删除</div>
        <button class="btn btn-primary" onclick="Router.go('${esc(returnTo || '#/asset/ledger')}')">返回</button>
      </div>
    `;
  }

  // ---- Empty ----
  function renderEmpty(text) {
    return `<div class="empty"><div class="empty-icon">📭</div><div class="empty-text">${esc(text || '暂无数据')}</div></div>`;
  }

  // ---- 关联链接渲染（用于详情页中"关联实体"） ----
  function link(href, text) {
    return `<a class="link" data-nav="${esc(href)}">${esc(text)}</a>`;
  }

  // 全局事件代理 - 监听 data-nav / data-act
  function bindGlobalDelegation(root) {
    root = root || document;
    root.addEventListener('click', (e) => {
      // 关联链接跳转
      const navEl = e.target.closest('[data-nav]');
      if (navEl) {
        e.preventDefault();
        const path = navEl.getAttribute('data-nav');
        if (path) Router.go(path);
        return;
      }
      // 折叠分节
      const collapseToggle = e.target.closest('[data-collapse-toggle]');
      if (collapseToggle) {
        collapseToggle.parentElement.classList.toggle('expanded');
        return;
      }
      // Tabs 切换
      const tabEl = e.target.closest('[data-tab]');
      if (tabEl) {
        const tabs = tabEl.parentElement;
        tabs.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
        tabEl.classList.add('active');
        const key = tabEl.getAttribute('data-tab');
        const handler = tabEl.getAttribute('data-tab-handler');
        if (handler && window.TabHandlers && window.TabHandlers[handler]) {
          const body = tabEl.parentElement.nextElementSibling;
          body.innerHTML = window.TabHandlers[handler](key);
          bindGlobalDelegation(body);
        } else {
          const content = tabEl.getAttribute('data-tab-content');
          if (content) {
            const body = tabEl.parentElement.nextElementSibling;
            body.innerHTML = content;
            bindGlobalDelegation(body);
          }
        }
        return;
      }
    });
    root.addEventListener('change', (e) => {
      const ch = e.target.closest('[data-change]');
      if (ch) {
        const name = ch.getAttribute('data-change');
        const handler = ch.getAttribute('data-change-handler');
        if (handler && window.FormChangeHandlers && window.FormChangeHandlers[handler]) {
          window.FormChangeHandlers[handler](name, ch);
        }
      }
      // 分页大小
      if (e.target.matches('[data-act=page-size]')) {
        const handler = e.target.getAttribute('data-page-size-handler');
        if (handler && window.PaginationHandlers && window.PaginationHandlers[handler]) {
          window.PaginationHandlers[handler](parseInt(e.target.value, 10));
        }
      }
    });
  }

  // ---- 通用搜索过滤 ----
  function filterByKeyword(items, keyword, fields) {
    if (!keyword) return items;
    const k = keyword.toLowerCase();
    return items.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(k)));
  }

  // ---- 通用 ID 生成器（按 prefix） ----
  function genAssetTag(type) {
    const map = {
      hardware: { prefix: 'P', len: 9 },
      software: { prefix: 'SW', len: 8 },
      consumable: { prefix: 'C', len: 9 },
      bundle: { prefix: 'B', len: 9 },
      pallet: { prefix: 'PAL', len: 7 },
      cloud: { prefix: 'CL', len: 9 }
    };
    const m = map[type] || { prefix: 'A', len: 9 };
    const total = m.len - m.prefix.length;
    const random = Math.floor(Math.random() * Math.pow(10, total)).toString().padStart(total, '0');
    return m.prefix + random;
  }

  // 暴露
  global.UI = {
    esc, toast, openModal, closeModal, confirm,
    tag, statusTag, link,
    renderListPage, renderPagination, renderHeadInfo, renderTabs, renderCollapse,
    field, collectForm, render404, renderEmpty,
    bindGlobalDelegation, filterByKeyword, genAssetTag
  };
})(window);
