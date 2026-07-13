// ========================================
// ITAM 原型 - 通用 localStorage 数据层
// ========================================
(function(global) {
  'use strict';

  const PREFIX = 'itam_';
  const SEED_FLAG = 'itam_seeded_v3';

  // ------- 通用集合操作 -------
  function read(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('read error', key, e);
      return [];
    }
  }
  function write(key, data) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.error('write error', key, e);
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function nowStr() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // ------- 集合 API -------
  function listAll(key) { return read(key); }
  function getById(key, id) { return read(key).find(x => x.id === id); }
  function create(key, data) {
    const items = read(key);
    const obj = Object.assign({}, data, {
      id: data.id || uid(),
      createdTime: data.createdTime || nowStr(),
      updatedTime: nowStr()
    });
    items.push(obj);
    write(key, items);
    return obj;
  }
  function update(key, id, patch) {
    const items = read(key);
    const idx = items.findIndex(x => x.id === id);
    if (idx < 0) return null;
    items[idx] = Object.assign({}, items[idx], patch, { id, updatedTime: nowStr() });
    write(key, items);
    return items[idx];
  }
  function remove(key, id) {
    const items = read(key).filter(x => x.id !== id);
    write(key, items);
  }
  function removeMany(key, ids) {
    const idSet = new Set(ids);
    const items = read(key).filter(x => !idSet.has(x.id));
    write(key, items);
  }
  function clearAll(key) { write(key, []); }
  function count(key) { return read(key).length; }
  function countBy(key, predicate) { return read(key).filter(predicate).length; }

  // ------- 跨集合清理：删除 X 时清理引用 X 的关系 -------
  // relations: [{ collection: 'assets', field: 'companyId' }, ...]
  function cascadeDelete(key, id, relations) {
    remove(key, id);
    relations.forEach(rel => {
      const items = read(rel.collection);
      const filtered = items.filter(x => x[rel.field] !== id);
      if (filtered.length !== items.length) write(rel.collection, filtered);
    });
  }

  // ------- 导出 / 导入 -------
  function exportAll() {
    const all = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) all[k] = localStorage.getItem(k);
    }
    return all;
  }
  function resetAll() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) localStorage.removeItem(k);
    }
  }

  // ------- 初始化种子 -------
  function isSeeded() { return localStorage.getItem(SEED_FLAG) === '1'; }
  function markSeeded() { localStorage.setItem(SEED_FLAG, '1'); }

  global.Store = {
    PREFIX, uid, nowStr,
    listAll, getById, create, update, remove, removeMany, clearAll, count, countBy,
    cascadeDelete, exportAll, resetAll, isSeeded, markSeeded
  };
})(window);
