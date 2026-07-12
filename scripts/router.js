// ========================================
// ITAM 原型 - Hash 路由
// 路径格式：#/模块/实体 或 #/模块/实体/:id 或 #/模块/实体/new
// ========================================
(function(global) {
  'use strict';

  const routes = []; // { pattern, handler }
  const PAGE = 30; // 默认每页

  function register(pattern, handler) {
    routes.push({ pattern, handler });
  }

  function parse(hash) {
    let h = hash || '#/';
    if (!h.startsWith('#')) h = '#' + h;
    if (h === '#' || h === '#/') h = '#/portal/apps';
    return h.replace(/^#/, '');
  }

  function go(path) {
    if (!path.startsWith('#')) path = '#' + path;
    if (location.hash === path) {
      handle();
    } else {
      location.hash = path;
    }
  }

  function match(path) {
    for (const r of routes) {
      const params = matchPattern(r.pattern, path);
      if (params) return { handler: r.handler, params };
    }
    return null;
  }

  function matchPattern(pattern, path) {
    const pParts = pattern.split('/').filter(Boolean);
    const aParts = path.split('/').filter(Boolean);
    if (pParts.length !== aParts.length) return null;
    const params = {};
    for (let i = 0; i < pParts.length; i++) {
      if (pParts[i].startsWith(':')) {
        params[pParts[i].slice(1)] = decodeURIComponent(aParts[i]);
      } else if (pParts[i] !== aParts[i]) {
        return null;
      }
    }
    return params;
  }

  function handle() {
    const path = parse(location.hash);
    // 默认重定向
    if (path === '/' || path === '') {
      go('/portal/apps');
      return;
    }
    const m = match(path);
    const page = document.getElementById('page');
    const crumb = document.getElementById('breadcrumb');
    if (!page) return;
    page.innerHTML = '<div class="empty"><div class="empty-text">加载中...</div></div>';
    if (m) {
      try {
        m.handler({ path, params: m.params, pageEl: page, crumbEl: crumb });
      } catch (e) {
        console.error('Route handler error:', e);
        page.innerHTML = `<div class="empty"><div class="empty-text">页面加载失败：${UI.esc(e.message)}</div></div>`;
      }
    } else {
      page.innerHTML = UI.render404('#/portal/apps');
    }
    // 滚动到顶部
    document.querySelector('.content')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }

  // 工具：根据路径取面包屑
  function setCrumb(el, items) {
    if (!items || !items.length) { el.innerHTML = ''; return; }
    el.innerHTML = items.map((b, i) => {
      const sep = i < items.length - 1 ? '<span class="sep">/</span>' : '';
      return i < items.length - 1
        ? `<a data-nav="${UI.esc(b.path || '')}">${UI.esc(b.label)}</a>${sep}`
        : `<span class="current">${UI.esc(b.label)}</span>`;
    }).join('');
  }

  // 暴露
  global.Router = { register, go, handle, setCrumb, PAGE };
})(window);
