// ========================================
// ITAM 原型 - 通用 CRUD 工厂
// 用于快速创建基于 storeKey 的列表+详情
// ========================================
(function(global) {
  'use strict';

  function createCrud({ storeKey, title, listPath, columns, formFields, breadcrumbs, getExtraHead, beforeSave, onListExtra, onDetailExtra }) {
    let kw = '', page = 1, size = 30;
    return {
      renderList({ pageEl, crumbEl }) {
        Router.setCrumb(crumbEl, breadcrumbs.list);
        const all = Store.listAll(storeKey);
        const filtered = kw ? all.filter(x => columns.some(c => {
          const v = x[c.field];
          if (v === undefined || v === null) return false;
          return String(v).toLowerCase().includes(kw.toLowerCase());
        })) : all;
        const total = filtered.length;
        const start = (page - 1) * size;
        const data = filtered.slice(start, start + size);
        const cols = columns.map(c => {
          if (c.link === false) return c;
          return {
            ...c,
            render: c.render || ((row) => {
              const v = row[c.field];
              if (!v) return '-';
              if (c.linkMap && c.linkMap[c.field]) {
                const target = c.linkMap[c.field];
                return `<a class="link" data-nav="${target.path}/${UI.esc(row[c.linkField || c.field])}">${UI.esc(v)}</a>`;
              }
              return `<a class="link" data-nav="${listPath}/${UI.esc(row.id)}">${UI.esc(v)}</a>`;
            })
          };
        });
        pageEl.innerHTML = UI.renderListPage({
          title, subtitle: `共 ${all.length} 条`,
          toolbarLeft: `<input class="input search-box" placeholder="请输入名称" value="${UI.esc(kw)}" data-search-input><button class="btn" data-search-btn>搜索</button>`,
          toolbarRight: `<button class="btn">🔄</button><button class="btn">▼ 筛选</button><button class="btn">保存视图</button>${formFields ? '<button class="btn btn-primary" data-act="new">+ 新建</button>' : ''}<button class="btn">更多 ▾</button>`,
          columns: cols, data,
          pagination: { total, page, pageSize: size },
          onPageChange: (p) => { page = p; this.renderList({ pageEl, crumbEl }); },
          onPageSizeChange: (s) => { size = s; page = 1; this.renderList({ pageEl, crumbEl }); }
        });
        const sb = pageEl.querySelector('[data-search-btn]');
        if (sb) sb.onclick = () => { kw = pageEl.querySelector('[data-search-input]').value; page = 1; this.renderList({ pageEl, crumbEl }); };
        const nb = pageEl.querySelector('[data-act=new]');
        if (nb) nb.onclick = () => Router.go(`${listPath}/new`);
        pageEl.querySelectorAll('[data-act=del]').forEach(el => {
          el.onclick = async (e) => { e.stopPropagation(); const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true }); if (ok) { Store.remove(storeKey, el.getAttribute('data-id')); UI.toast('删除成功', 'success'); this.renderList({ pageEl, crumbEl }); } };
        });
        if (onListExtra) onListExtra(pageEl, this);
      },
      renderDetail({ pageEl, crumbEl, params }) {
        const isNew = params.id === 'new';
        let data = isNew ? {} : Store.getById(storeKey, params.id);
        if (!isNew && !data) { pageEl.innerHTML = UI.render404(listPath); return; }
        const itemName = isNew ? `新建${title}` : (data.name || data.code || data.fullName);
        Router.setCrumb(crumbEl, [...breadcrumbs.detail, { label: itemName }]);
        const headInfo = (isNew || !getExtraHead) ? '' : UI.renderHeadInfo(getExtraHead(data));
        const fields = formFields(data);
        const fieldsHtml = fields.map(f => {
          if (f.colspan === 3) return `<div class="form-row-3">${f.html}</div>`;
          if (f.colspan === 2) return `<div class="form-row">${f.html}</div>`;
          return f.html;
        }).join('');
        pageEl.innerHTML = `
          <div class="page-header">
            <div class="page-title">${UI.esc(itemName)}</div>
            <div class="page-actions">
              ${onDetailExtra ? onDetailExtra.header(data) : ''}
              <button class="btn btn-primary" data-act="save">保存</button>
              <button class="btn" data-act="cancel">取消</button>
              ${!isNew ? '<button class="btn btn-danger" data-act="delete">删除</button>' : ''}
            </div>
          </div>
          ${headInfo}
          <div class="card"><div class="card-body">${fieldsHtml}</div></div>
        `;
        pageEl.querySelector('[data-act=save]').onclick = () => {
          const collected = UI.collectForm(pageEl);
          Object.assign(data, collected);
          if (beforeSave) {
            const r = beforeSave(data, isNew);
            if (r === false) return;
          }
          if (isNew) { Store.create(storeKey, data); UI.toast('创建成功', 'success'); }
          else { Store.update(storeKey, data.id, data); UI.toast('保存成功', 'success'); }
          Router.go(listPath);
        };
        pageEl.querySelector('[data-act=cancel]').onclick = () => Router.go(listPath);
        if (!isNew) pageEl.querySelector('[data-act=delete]').onclick = async () => {
          const ok = await UI.confirm({ title: '确认删除', content: '确定删除？', danger: true });
          if (ok) { Store.remove(storeKey, data.id); UI.toast('删除成功', 'success'); Router.go(listPath); }
        };
        if (onDetailExtra) onDetailExtra.body(pageEl, data, isNew);
      }
    };
  }

  global.CrudFactory = { createCrud };
})(window);
