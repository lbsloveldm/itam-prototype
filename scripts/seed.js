// ========================================
// ITAM 原型 - 种子数据初始化
// 基于最新系统截图和操作手册构造
// 覆盖全部 16 个模块的核心实体
// ========================================
(function(global) {
  'use strict';

  function buildSeed() {
    const seed = {};
    const t = (id, name, code, type) => ({ id, name, code: code || '', type: type || '' });

    // ===== 用户/角色/组织（用户中心）=====
    seed.orgs = [
      { id: 'org-1', name: '根组织', code: 'ROOT', parentId: null, fullPath: '根组织' },
      { id: 'org-2', name: '美的集团', code: 'MDJT', parentId: 'org-1', fullPath: '根组织/美的集团' },
      { id: 'org-3', name: '集团总部', code: 'HQ', parentId: 'org-2', fullPath: '根组织/美的集团/集团总部' },
      { id: 'org-4', name: '信息技术部', code: 'IT', parentId: 'org-3', fullPath: '根组织/美的集团/集团总部/信息技术部' },
      { id: 'org-5', name: '财务部', code: 'FIN', parentId: 'org-3', fullPath: '根组织/美的集团/集团总部/财务部' },
      { id: 'org-6', name: '生产中心', code: 'PC', parentId: 'org-2', fullPath: '根组织/美的集团/生产中心' }
    ];
    seed.roles = [
      { id: 'role-1', name: '超级管理员', code: 'SUPER_ADMIN', description: '系统全部权限', permissions: ['*'] },
      { id: 'role-2', name: '资产管理员', code: 'ASSET_ADMIN', description: '资产管理模块全部权限', permissions: ['asset:*', 'inventory:*', 'audit:*'] },
      { id: 'role-3', name: '成本管理员', code: 'COST_ADMIN', description: '成本管理模块', permissions: ['cost:*'] },
      { id: 'role-4', name: '合同管理员', code: 'CONTRACT_ADMIN', description: '合同管理模块', permissions: ['contract:*'] },
      { id: 'role-5', name: 'License管理员', code: 'LICENSE_ADMIN', description: '软件 License 管理', permissions: ['license:*'] },
      { id: 'role-6', name: '普通员工', code: 'EMPLOYEE', description: '自服务权限', permissions: ['self-service:read', 'self-service:create'] }
    ];
    seed.users = [
      { id: 'user-1', name: 'Admin', username: 'admin', email: 'admin@example.com', phone: '13800000001', orgId: 'org-4', roleId: 'role-1', status: 'active' },
      { id: 'user-2', name: 'demi', username: 'demi', email: 'demi@example.com', phone: '13800000002', orgId: 'org-4', roleId: 'role-2', status: 'active' },
      { id: 'user-3', name: '张三', username: 'zhangsan', email: 'zhangsan@example.com', phone: '13800000003', orgId: 'org-4', roleId: 'role-6', status: 'active' },
      { id: 'user-4', name: '李四', username: 'lisi', email: 'lisi@example.com', phone: '13800000004', orgId: 'org-5', roleId: 'role-6', status: 'active' },
      { id: 'user-5', name: 'ke', username: 'ke', email: 'ke@example.com', phone: '13800000005', orgId: 'org-4', roleId: 'role-1', status: 'active' }
    ];

    // ===== 资产规格分类 =====
    seed.assetModelCategories = [
      { id: 'amc-1', name: '计算设备', code: 'COMPUTE', parentId: null, fullPath: '计算设备' },
      { id: 'amc-2', name: '服务器', code: 'SERVER', parentId: 'amc-1', fullPath: '计算设备/服务器' },
      { id: 'amc-3', name: '笔记本', code: 'LAPTOP', parentId: 'amc-1', fullPath: '计算设备/笔记本' },
      { id: 'amc-4', name: '台式机', code: 'DESKTOP', parentId: 'amc-1', fullPath: '计算设备/台式机' },
      { id: 'amc-5', name: '外设耗材', code: 'PERIPHERAL', parentId: null, fullPath: '外设耗材' },
      { id: 'amc-6', name: '办公耗材', code: 'OFFICE_SUP', parentId: 'amc-5', fullPath: '外设耗材/办公耗材' },
      { id: 'amc-7', name: '网络设备', code: 'NETWORK', parentId: null, fullPath: '网络设备' },
      { id: 'amc-8', name: '云服务', code: 'CLOUD', parentId: null, fullPath: '云服务' }
    ];

    // ===== 资产规格 =====
    seed.assetModels = [
      { id: 'am-1', name: 'ThinkPad X1 Carbon', fullName: 'ThinkPad X1 Carbon Gen 11', categoryId: 'amc-3', manufacturer: 'Lenovo', assetType: 'hardware' },
      { id: 'am-2', name: 'MacBook Pro 16', fullName: 'MacBook Pro 16 M3 Max', categoryId: 'amc-3', manufacturer: 'Apple', assetType: 'hardware' },
      { id: 'am-3', name: 'Dell PowerEdge R750', fullName: 'Dell PowerEdge R750 Rack Server', categoryId: 'amc-2', manufacturer: 'Dell', assetType: 'hardware' },
      { id: 'am-4', name: 'HP LaserJet Pro', fullName: 'HP LaserJet Pro M404dn', categoryId: 'amc-6', manufacturer: 'HP', assetType: 'consumable' },
      { id: 'am-5', name: '鼠标套装', fullName: '罗技 MX Master 3S 套装', categoryId: 'amc-6', manufacturer: 'Logitech', assetType: 'consumable' },
      { id: 'am-6', name: '办公套装', fullName: '美的办公套装 (笔记本+鼠标+键盘)', categoryId: 'amc-1', manufacturer: '美的', assetType: 'bundle' },
      { id: 'am-7', name: '标准托盘', fullName: '标准机柜托盘 1U', categoryId: 'amc-7', manufacturer: '美的', assetType: 'pallet' },
      { id: 'am-8', name: 'Microsoft 365 企业版', fullName: 'Microsoft 365 E3 年度订阅', categoryId: 'amc-8', manufacturer: 'Microsoft', assetType: 'software' },
      { id: 'am-9', name: 'Adobe Creative Cloud', fullName: 'Adobe Creative Cloud 团队版', categoryId: 'amc-8', manufacturer: 'Adobe', assetType: 'software' },
      { id: 'am-10', name: '阿里云 ECS', fullName: '阿里云 ECS 计算实例', categoryId: 'amc-8', manufacturer: '阿里云', assetType: 'cloud' },
      { id: 'am-11', name: '华为云 RDS', fullName: '华为云 RDS for MySQL', categoryId: 'amc-8', manufacturer: '华为云', assetType: 'cloud' }
    ];

    // ===== 资产（6 种类型）=====
    seed.assets = [
      // 硬件资产 - 14 条
      { id: 'ast-1', assetTag: 'P000000001', displayName: 'P000000001-硬件', assetType: 'hardware', model: 'am-1', state: 'In use', substate: 'Assigned', assignedTo: 'user-3', location: 'loc-1', dept: 'org-4', company: 'company-1', serialNumber: 'SN001', department: '信息技术部', installDate: '2024-01-15', createdBy: 'Admin' },
      { id: 'ast-2', assetTag: 'P000000002', displayName: 'P000000002-笔记本', assetType: 'hardware', model: 'am-2', state: 'In use', substate: 'Assigned', assignedTo: 'user-2', location: 'loc-1', dept: 'org-4', company: 'company-1', serialNumber: 'SN002', department: '信息技术部', installDate: '2024-02-10', createdBy: 'Admin' },
      { id: 'ast-3', assetTag: 'P000000003', displayName: 'P000000003-服务器', assetType: 'hardware', model: 'am-3', state: 'In use', substate: 'Deployed', assignedTo: '', location: 'loc-2', dept: 'org-4', company: 'company-1', serialNumber: 'SN003', department: '信息技术部', installDate: '2023-11-20', createdBy: 'Admin' },
      { id: 'ast-4', assetTag: 'P000000004', displayName: 'P000000004-笔记本', assetType: 'hardware', model: 'am-1', state: 'In stock', substate: 'In Stock', assignedTo: '', location: 'stockroom-1', dept: 'org-4', company: 'company-1', serialNumber: 'SN004', department: '信息技术部', createdBy: 'Admin' },
      { id: 'ast-5', assetTag: 'P000000005', displayName: 'P000000005-笔记本', assetType: 'hardware', model: 'am-1', state: 'In stock', substate: 'In Stock', assignedTo: '', location: 'stockroom-1', dept: 'org-4', company: 'company-1', serialNumber: 'SN005', department: '信息技术部', createdBy: 'Admin' },
      { id: 'ast-6', assetTag: 'P000000006', displayName: 'P000000006-台式机', assetType: 'hardware', model: 'am-2', state: 'In use', substate: 'Assigned', assignedTo: 'user-4', location: 'loc-1', dept: 'org-5', company: 'company-1', serialNumber: 'SN006', department: '财务部', createdBy: 'demi' },
      { id: 'ast-7', assetTag: 'P000000007', displayName: 'P000000007-服务器', assetType: 'hardware', model: 'am-3', state: 'In use', substate: 'Deployed', assignedTo: '', location: 'loc-2', dept: 'org-4', company: 'company-1', serialNumber: 'SN007', department: '信息技术部', createdBy: 'Admin' },
      { id: 'ast-8', assetTag: 'P000000008', displayName: 'P000000008-笔记本', assetType: 'hardware', model: 'am-1', state: 'In use', substate: 'Assigned', assignedTo: 'user-5', location: 'loc-1', dept: 'org-4', company: 'company-1', serialNumber: 'SN008', department: '信息技术部', createdBy: 'Admin' },
      { id: 'ast-9', assetTag: 'P000000009', displayName: 'P000000009-笔记本', assetType: 'hardware', model: 'am-2', state: 'Retired', substate: 'Retired', assignedTo: '', location: 'stockroom-1', dept: 'org-4', company: 'company-1', serialNumber: 'SN009', department: '信息技术部', createdBy: 'Admin' },
      { id: 'ast-10', assetTag: 'P000000010', displayName: 'P000000010-台式机', assetType: 'hardware', model: 'am-2', state: 'In use', substate: 'Assigned', assignedTo: 'user-3', location: 'loc-1', dept: 'org-4', company: 'company-1', serialNumber: 'SN010', department: '信息技术部', createdBy: 'demi' },
      { id: 'ast-11', assetTag: 'P000000011', displayName: 'P000000011-笔记本', assetType: 'hardware', model: 'am-1', state: 'In use', substate: 'Assigned', assignedTo: 'user-2', location: 'loc-1', dept: 'org-4', company: 'company-1', serialNumber: 'SN011', department: '信息技术部', createdBy: 'Admin' },
      { id: 'ast-12', assetTag: 'P000000012', displayName: 'P000000012-服务器', assetType: 'hardware', model: 'am-3', state: 'In use', substate: 'Deployed', assignedTo: '', location: 'loc-2', dept: 'org-4', company: 'company-1', serialNumber: 'SN012', department: '信息技术部', createdBy: 'Admin' },
      { id: 'ast-13', assetTag: 'P000000013', displayName: 'P000000013-笔记本', assetType: 'hardware', model: 'am-1', state: 'In use', substate: 'Assigned', assignedTo: 'user-4', location: 'loc-1', dept: 'org-5', company: 'company-1', serialNumber: 'SN013', department: '财务部', createdBy: 'Admin' },
      { id: 'ast-14', assetTag: 'P000000014', displayName: 'P000000014-笔记本', assetType: 'hardware', model: 'am-2', state: 'In stock', substate: 'In Stock', assignedTo: '', location: 'stockroom-1', dept: 'org-4', company: 'company-1', serialNumber: 'SN014', department: '信息技术部', createdBy: 'Admin' },
      // 耗材资产 - 8 条
      { id: 'ast-15', assetTag: 'C000000001', displayName: 'HP 硒鼓-CF258A', assetType: 'consumable', model: 'am-4', state: 'In stock', quantity: 50, stockroomId: 'stockroom-1', createdBy: 'Admin' },
      { id: 'ast-16', assetTag: 'C000000002', displayName: 'HP 硒鼓-CF258A', assetType: 'consumable', model: 'am-4', state: 'In stock', quantity: 30, stockroomId: 'stockroom-1', createdBy: 'Admin' },
      { id: 'ast-17', assetTag: 'C000000003', displayName: '罗技鼠标 MX Master 3S', assetType: 'consumable', model: 'am-5', state: 'In stock', quantity: 100, stockroomId: 'stockroom-1', createdBy: 'demi' },
      { id: 'ast-18', assetTag: 'C000000004', displayName: '罗技鼠标 MX Master 3S', assetType: 'consumable', model: 'am-5', state: 'In use', quantity: 25, stockroomId: 'stockroom-1', assignedTo: 'user-3', createdBy: 'demi' },
      { id: 'ast-19', assetTag: 'C000000005', displayName: 'A4 打印纸', assetType: 'consumable', model: 'am-4', state: 'In stock', quantity: 200, stockroomId: 'stockroom-1', createdBy: 'Admin' },
      { id: 'ast-20', assetTag: 'C000000006', displayName: '墨盒-爱普生', assetType: 'consumable', model: 'am-4', state: 'In stock', quantity: 80, stockroomId: 'stockroom-1', createdBy: 'Admin' },
      { id: 'ast-21', assetTag: 'C000000007', displayName: 'USB-C 数据线', assetType: 'consumable', model: 'am-5', state: 'In stock', quantity: 150, stockroomId: 'stockroom-1', createdBy: 'demi' },
      { id: 'ast-22', assetTag: 'C000000008', displayName: '网线-Cat6', assetType: 'consumable', model: 'am-5', state: 'In stock', quantity: 80, stockroomId: 'stockroom-1', createdBy: 'Admin' },
      // 捆绑资产 - 1 条
      { id: 'ast-23', assetTag: 'B000000001', displayName: '美的办公套装-001', assetType: 'bundle', model: 'am-6', state: 'In use', components: ['ast-1', 'ast-17'], assignedTo: 'user-3', createdBy: 'Admin' },
      // 托盘资产 - 1 条
      { id: 'ast-24', assetTag: 'PAL000001', displayName: '机柜托盘-A1', assetType: 'pallet', model: 'am-7', palletType: 'Pallet', stockroomId: 'stockroom-1', state: 'In stock', createdBy: 'Admin' },
      // 软件许可 - 3 条
      { id: 'ast-25', assetTag: 'SW00000001', displayName: 'Microsoft 365 E3', assetType: 'software', model: 'am-8', state: 'In use', rights: 100, licenseKey: 'XXXXX-XXXXX-XXXXX-AAAAA', quantity: 100, createdBy: 'Admin' },
      { id: 'ast-26', assetTag: 'SW00000002', displayName: 'Adobe Creative Cloud', assetType: 'software', model: 'am-9', state: 'In use', rights: 50, licenseKey: 'YYYYY-YYYYY-YYYYY-BBBBB', quantity: 50, createdBy: 'Admin' },
      { id: 'ast-27', assetTag: 'SW00000003', displayName: 'JetBrains All Products Pack', assetType: 'software', model: 'am-8', state: 'In stock', rights: 30, licenseKey: 'ZZZZZ-ZZZZZ-ZZZZZ-CCCCC', quantity: 30, createdBy: 'demi' },
      // 云资产 - 2 条
      { id: 'ast-28', assetTag: 'CL1234567EC2Instance', displayName: '阿里云 ECS-生产环境', assetType: 'cloud', model: 'am-10', state: 'In use', cloudResourceType: '计算', vendor: 'company-2', createdBy: 'Admin' },
      { id: 'ast-29', assetTag: 'CL7654321RDSInstance', displayName: '华为云 RDS-主库', assetType: 'cloud', model: 'am-11', state: 'In use', cloudResourceType: '数据库', vendor: 'company-3', createdBy: 'Admin' }
    ];

    // ===== CI 映射 =====
    seed.ciMappings = [
      { id: 'cim-1', name: '资产字段-CI 字段映射-服务器', assetField: 'serialNumber', ciField: 'Serial Number', sourceType: 'hardware', targetType: 'Server' },
      { id: 'cim-2', name: '资产字段-CI 字段映射-笔记本', assetField: 'displayName', ciField: 'Name', sourceType: 'hardware', targetType: 'Laptop' },
      { id: 'cim-3', name: '状态映射-In use→Active', assetField: 'state', ciField: 'Status', sourceType: 'all', targetType: 'all' }
    ];

    // ===== 位置管理（树）=====
    seed.locations = [
      { id: 'loc-root', name: 'Asia', addressType: '地区', parentId: null, fullPath: 'Asia', code: 'ASIA', contact: '', phone: '', zip: '', longitude: '100.000', latitude: '30.000', description: '亚洲地区根节点' },
      { id: 'loc-1', name: 'China', addressType: '国家', parentId: 'loc-root', fullPath: 'Asia/China', code: 'CN', contact: '王经理', phone: '010-88888888', zip: '100000', longitude: '116.404', latitude: '39.915', description: '中国' },
      { id: 'loc-2', name: 'Beijing', addressType: '城市', parentId: 'loc-1', fullPath: 'Asia/China/Beijing', code: 'BJ', contact: '李主管', phone: '010-66666666', zip: '100000', longitude: '116.404', latitude: '39.915', description: '北京市' },
      { id: 'loc-3', name: 'Guangdong', addressType: '省份', parentId: 'loc-1', fullPath: 'Asia/China/Guangdong', code: 'GD', contact: '陈主管', phone: '020-33333333', zip: '510000', longitude: '113.264', latitude: '23.129', description: '广东省' },
      { id: 'loc-4', name: 'Foshan', addressType: '城市', parentId: 'loc-3', fullPath: 'Asia/China/Guangdong/Foshan', code: 'FS', contact: '张主管', phone: '0757-88888888', zip: '528000', longitude: '113.123', latitude: '23.021', description: '佛山市' },
      { id: 'loc-5', name: '美的总部大楼', addressType: '建筑', parentId: 'loc-4', fullPath: 'Asia/China/Guangdong/Foshan/美的总部大楼', code: 'MDHQ', contact: '何总', phone: '0757-88888888', zip: '528000', longitude: '113.123', latitude: '23.456', description: '美的集团总部' },
      { id: 'loc-6', name: 'Shanghai', addressType: '城市', parentId: 'loc-1', fullPath: 'Asia/China/Shanghai', code: 'SH', contact: '刘主管', phone: '021-66666666', zip: '200000', longitude: '121.474', latitude: '31.230', description: '上海市' },
      { id: 'loc-7', name: 'IDC-Guangzhou', addressType: '建筑', parentId: 'loc-3', fullPath: 'Asia/China/Guangdong/IDC-Guangzhou', code: 'IDC-GZ', contact: '技术组', phone: '020-99999999', zip: '510000', longitude: '113.264', latitude: '23.129', description: '广州IDC机房' }
    ];

    // ===== 公司/供应商/产品（组织管理）=====
    seed.companies = [
      { id: 'company-1', name: '美的集团股份有限公司', code: 'MDJT', type: '综合', contact: '张总', phone: '0757-88888888', email: 'contact@midea.com', address: '广东省佛山市顺德区美的大道', website: 'https://www.midea.com', manager: '何老板', grade: 'A', status: 'active' },
      { id: 'company-2', name: '阿里云计算有限公司', code: 'ALI', type: '供应商', contact: '王经理', phone: '0571-88888888', email: 'b2b@aliyun.com', address: '杭州市西湖区', website: 'https://www.aliyun.com', manager: '阿里云商务', grade: 'A', status: 'active' },
      { id: 'company-3', name: '华为云计算技术有限公司', code: 'HW', type: '供应商', contact: '李经理', phone: '0755-28780808', email: 'b2b@huaweicloud.com', address: '深圳市龙岗区', website: 'https://www.huaweicloud.com', manager: '华为云商务', grade: 'A', status: 'active' },
      { id: 'company-4', name: 'Dell Technologies Inc', code: 'DELL', type: '制造商', contact: 'Dell China', phone: '800-858-0888', email: 'china@dell.com', address: '厦门', website: 'https://www.dell.com', manager: 'Dell 销售', grade: 'A', status: 'active' },
      { id: 'company-5', name: '联想（北京）有限公司', code: 'LENOVO', type: '制造商', contact: 'Lenovo China', phone: '800-810-8888', email: 'china@lenovo.com', address: '北京', website: 'https://www.lenovo.com.cn', manager: '联想销售', grade: 'A', status: 'active' },
      { id: 'company-6', name: 'Microsoft Corporation', code: 'MS', type: '供应商', contact: 'MS China', phone: '400-820-3800', email: 'china@microsoft.com', address: '北京', website: 'https://www.microsoft.com', manager: '微软销售', grade: 'A', status: 'active' }
    ];
    seed.vendors = [
      { id: 'v-1', name: '北京神州数码有限公司', code: 'DC', contact: '王经理', phone: '010-88886666', email: 'wang@digitalchina.com', address: '北京', website: 'www.digitalchina.com', status: 'active' },
      { id: 'v-2', name: '联强国际贸易有限公司', code: 'WT', contact: '李经理', phone: '021-66668888', email: 'li@wtt.com.cn', address: '上海', website: 'www.wtt.com.cn', status: 'active' },
      { id: 'v-3', name: '佳杰科技', code: 'JJ', contact: '陈经理', phone: '020-33336666', email: 'chen@wpgholdings.com', address: '广州', website: 'www.wpgholdings.com', status: 'active' }
    ];
    seed.products = [
      { id: 'prod-1', name: 'ThinkPad X1 Carbon Gen 11', model: 'am-1', vendor: 'v-1', price: 14999, currency: 'CNY' },
      { id: 'prod-2', name: 'MacBook Pro 16 M3', model: 'am-2', vendor: 'v-2', price: 24999, currency: 'CNY' },
      { id: 'prod-3', name: 'Dell PowerEdge R750', model: 'am-3', vendor: 'v-3', price: 89999, currency: 'CNY' },
      { id: 'prod-4', name: 'Microsoft 365 E3', model: 'am-8', vendor: 'v-1', price: 4999, currency: 'CNY' }
    ];

    // ===== 折旧方案 =====
    seed.depreciationSchemas = [
      { id: 'ds-1', name: 'SL 3 Months', category: '直线法', depreciationTime: '3 Months', script: 'return depreciationCal...', createdBy: 'Admin' },
      { id: 'ds-2', name: '6 月', category: '余额递减法', depreciationTime: '6 Months', script: 'return depreciationCal...', createdBy: 'Admin' },
      { id: 'ds-3', name: '自定义1次', category: '自定义', depreciationTime: '1 Days', script: '', createdBy: 'Admin' },
      { id: 'ds-4', name: 'DDB 1 Years', category: '余额递减法', depreciationTime: '1 Years', script: 'return depreciationCal...', createdBy: 'Admin' },
      { id: 'ds-5', name: 'DDB 1 Years 111111...', category: '余额递减法', depreciationTime: '1 Years', script: 'return depreciationCal...', createdBy: 'Admin' },
      { id: 'ds-6', name: '11days DDB', category: '余额递减法', depreciationTime: '11 Days', script: 'return depreciationCal...', createdBy: 'Admin' },
      { id: 'ds-7', name: '10 Months SL', category: '直线法', depreciationTime: '10 Months', script: 'return depreciationCal...', createdBy: 'demi' },
      { id: 'ds-8', name: '3 Weeks DDB', category: '余额递减法', depreciationTime: '3 Weeks', script: 'return depreciationCal...', createdBy: 'demi' },
      { id: 'ds-9', name: '4 Months', category: '余额递减法', depreciationTime: '4 Months', script: 'return depreciationCal...', createdBy: 'demi' },
      { id: 'ds-10', name: '111', category: '余额递减法', depreciationTime: '1 Years', script: 'return depreciationCal...', createdBy: 'demi' }
    ];

    // ===== 成本中心 / 固定资产 / 费用条目 / 费率卡 =====
    seed.costCenters = [
      { id: 'cc-1', name: '信息技术中心', code: 'IT-CC', parentId: null, manager: '何老板' },
      { id: 'cc-2', name: '财务共享中心', code: 'FIN-CC', parentId: null, manager: '李总' },
      { id: 'cc-3', name: '生产运营中心', code: 'PROD-CC', parentId: null, manager: '王总' },
      { id: 'cc-4', name: '行政中心', code: 'ADMIN-CC', parentId: null, manager: '陈总' }
    ];
    seed.fixedAssets = [
      { id: 'fa-1', name: '办公楼宇-A座', code: 'FA-001', costCenter: 'cc-4', value: 5000000, currency: 'CNY', acquisitionDate: '2018-01-01' },
      { id: 'fa-2', name: '服务器机柜-001', code: 'FA-002', costCenter: 'cc-1', value: 80000, currency: 'CNY', acquisitionDate: '2020-05-01' },
      { id: 'fa-3', name: '生产设备-注塑机', code: 'FA-003', costCenter: 'cc-3', value: 1200000, currency: 'CNY', acquisitionDate: '2019-09-01' }
    ];
    seed.expenseLines = [
      { id: 'el-1', name: '办公用品费', code: 'EL-OFFICE', type: '运营费用', amount: 5000, currency: 'CNY', period: '2025-01' },
      { id: 'el-2', name: '云服务费', code: 'EL-CLOUD', type: '运营费用', amount: 35000, currency: 'CNY', period: '2025-01' },
      { id: 'el-3', name: '差旅费', code: 'EL-TRAVEL', type: '运营费用', amount: 12000, currency: 'CNY', period: '2025-01' },
      { id: 'el-4', name: '软件订阅费', code: 'EL-SW', type: '运营费用', amount: 80000, currency: 'CNY', period: '2025-01' }
    ];
    seed.laborRates = [
      { id: 'lr-1', name: '高级工程师', code: 'LR-SR', rate: 500, unit: '小时', currency: 'CNY' },
      { id: 'lr-2', name: '中级工程师', code: 'LR-MID', rate: 300, unit: '小时', currency: 'CNY' },
      { id: 'lr-3', name: '初级工程师', code: 'LR-JR', rate: 150, unit: '小时', currency: 'CNY' }
    ];
    seed.taskRates = [
      { id: 'tr-1', name: '标准任务费率', code: 'TR-STD', rate: 200, unit: '任务', currency: 'CNY' },
      { id: 'tr-2', name: '加急任务费率', code: 'TR-URG', rate: 400, unit: '任务', currency: 'CNY' }
    ];
    seed.costSoftwareLicenses = [
      { id: 'csl-1', name: 'Microsoft 365 年度成本', software: 'am-8', cost: 499900, period: '2025', currency: 'CNY' },
      { id: 'csl-2', name: 'Adobe CC 年度成本', software: 'am-9', cost: 120000, period: '2025', currency: 'CNY' }
    ];

    // ===== 库存管理 =====
    seed.stockroomTypes = [
      { id: 'st-1', name: '内部库房', code: 'InnerStockroomType1', isExternal: false },
      { id: 'st-2', name: '外部库房', code: 'OuterStockroomType1', isExternal: true }
    ];
    seed.stockrooms = [
      { id: 'stockroom-1', fullName: '佛山-主仓库', name: 'Stockroom1', typeId: 'st-1', group: '美的集团', locationId: 'loc-5', manager: '张主管', longitude: '113.123', latitude: '23.456', isExternal: false },
      { id: 'stockroom-2', fullName: '北京-分仓库', name: 'Stockroom2', typeId: 'st-1', group: '美的集团', locationId: 'loc-3', manager: '李主管', longitude: '116.404', latitude: '39.915', isExternal: false },
      { id: 'stockroom-3', fullName: '广州-外部云仓', name: 'Stockroom3', typeId: 'st-2', group: '美的集团', locationId: 'loc-6', manager: '王主管', longitude: '113.264', latitude: '23.129', isExternal: true }
    ];
    seed.shelves = [
      { id: 'sh-1', name: '货架A1', code: 'SH-A1', stockroomId: 'stockroom-1', capacity: 100 },
      { id: 'sh-2', name: '货架A2', code: 'SH-A2', stockroomId: 'stockroom-1', capacity: 100 },
      { id: 'sh-3', name: '货架B1', code: 'SH-B1', stockroomId: 'stockroom-1', capacity: 80 },
      { id: 'sh-4', name: '货架B2', code: 'SH-B2', stockroomId: 'stockroom-2', capacity: 50 }
    ];
    seed.serviceLocations = [
      { id: 'sl-1', name: '美的总部-1楼', code: 'SL-MD-1F', stockroomId: 'stockroom-1', address: '佛山' },
      { id: 'sl-2', name: '美的总部-2楼', code: 'SL-MD-2F', stockroomId: 'stockroom-1', address: '佛山' },
      { id: 'sl-3', name: '北京-中关村', code: 'SL-BJ-ZGC', stockroomId: 'stockroom-2', address: '北京' }
    ];
    seed.stockRules = [
      { id: 'sr-1', name: '笔记本-低库存预警', assetType: 'hardware', modelCategory: 'amc-3', threshold: 5, alertLevel: 'warning' },
      { id: 'sr-2', name: '硒鼓-低库存预警', assetType: 'consumable', modelCategory: 'amc-6', threshold: 20, alertLevel: 'warning' }
    ];

    // ===== 合同管理 =====
    seed.contractSpecs = [
      { id: 'cspec-1', fullName: '硬件维保-标准', name: '硬件维保-标准', type: '维护合同', category: 'Contract', createdBy: 'Admin' },
      { id: 'cspec-2', fullName: '软件订阅-标准', name: '软件订阅-标准', type: '软件订阅', category: 'Contract', createdBy: 'Admin' },
      { id: 'cspec-3', fullName: '租赁合同-通用', name: '租赁合同-通用', type: '租赁合同', category: 'Contract', createdBy: 'demi' }
    ];
    seed.contracts = [
      { id: 'ct-1', code: 'CT20250001', name: '2025年硬件维保合同', spec: 'cspec-1', vendor: 'v-1', type: '维护合同', stage: '生效中', status: '无', startDate: '2025-01-01', endDate: '2025-12-31', amount: 120000, currency: 'CNY', approver: 'user-1' },
      { id: 'ct-2', code: 'CT20250002', name: 'Microsoft 365 年度订阅', spec: 'cspec-2', vendor: 'v-1', type: '软件订阅', stage: '生效中', status: '无', startDate: '2025-01-01', endDate: '2025-12-31', amount: 499900, currency: 'CNY', approver: 'user-1' },
      { id: 'ct-3', code: 'CT20250003', name: '阿里云 ECS 租赁', spec: 'cspec-3', vendor: 'v-1', type: '租赁合同', stage: '草稿', status: '审批中', startDate: '2025-02-01', endDate: '2026-01-31', amount: 360000, currency: 'CNY', approver: 'user-5' },
      { id: 'ct-4', code: 'CT20250004', name: '华为云 RDS 租赁', spec: 'cspec-3', vendor: 'v-2', type: '租赁合同', stage: '生效中', status: '已续约', startDate: '2024-12-01', endDate: '2025-11-30', amount: 80000, currency: 'CNY', approver: 'user-1' }
    ];
    seed.myApprovals = [
      { id: 'apv-1', result: '待审批', approver: 'ke(ke)', contractName: 'CT20250003-阿里云 ECS 租赁', notes: '请尽快审批', createdTime: '2025-01-15 10:00:00' },
      { id: 'apv-2', result: '已批准', approver: 'ke(ke)', contractName: 'CT20250001-2025年硬件维保合同', notes: '已通过', createdTime: '2024-12-20 14:30:00' },
      { id: 'apv-3', result: '已拒绝', approver: 'ke(ke)', contractName: 'CT20240099-旧合同', notes: '金额超预算', createdTime: '2024-11-10 09:15:00' }
    ];
    seed.contractRenewals = [
      { id: 'cr-1', contractCode: 'CT20250001', oldContract: 'CT20240001', oldEnd: '2024-12-31', newEnd: '2025-12-31', amountChange: 10000, status: '生效中' },
      { id: 'cr-2', contractCode: 'CT20250004', oldContract: 'CT20240004', oldEnd: '2024-11-30', newEnd: '2025-11-30', amountChange: 5000, status: '已续约' }
    ];
    seed.contractChanges = [
      { id: 'cc-1', contractCode: 'CT20250001', changeType: '金额调整', oldAmount: 110000, newAmount: 120000, reason: '增加服务范围', createdTime: '2025-03-01 10:00:00' }
    ];

    // ===== 资产盘点 =====
    seed.auditTemplates = [
      { id: 'atemp-1', name: '季度盘点模板', code: 'ASTAUDTEM0001', type: 'Stockroom', stockrooms: ['stockroom-1'], locations: ['loc-5'], models: ['am-1', 'am-2', 'am-3'], enabled: true, createdBy: 'Admin' },
      { id: 'atemp-2', name: '年度全盘模板', code: 'ASTAUDTEM0002', type: 'Stockroom', stockrooms: ['stockroom-1', 'stockroom-2'], locations: ['loc-3', 'loc-5'], models: [], enabled: true, createdBy: 'Admin' }
    ];
    seed.auditPlans = [
      { id: 'aplan-1', name: '2025-Q1 季度盘点', code: 'ASTAUDPLN0001', template: 'atemp-1', frequency: '每季度', startDate: '2025-03-01', endDate: '2025-03-31', status: '进行中', createdBy: 'Admin' },
      { id: 'aplan-2', name: '2025 年度全盘', code: 'ASTAUDPLN0002', template: 'atemp-2', frequency: '每年', startDate: '2025-12-01', endDate: '2025-12-31', status: '未开始', createdBy: 'Admin' }
    ];
    seed.auditTasks = [
      { id: 'atask-1', name: '佛山主仓-笔记本盘点', code: 'ASTAUDD0001', plan: 'aplan-1', assignee: 'user-2', status: 'In Progress', bootTime: '2025-03-01 09:00:00', overdue: false, check: true, models: ['am-1', 'am-2'], result: '', createdBy: 'Admin' },
      { id: 'atask-2', name: '佛山主仓-服务器盘点', code: 'ASTAUDD0002', plan: 'aplan-1', assignee: 'user-3', status: 'Not started', bootTime: '', overdue: false, check: true, models: ['am-3'], result: '', createdBy: 'Admin' },
      { id: 'atask-3', name: '2024年度盘点-已完成', code: 'ASTAUDD0099', plan: 'aplan-2', assignee: 'user-2', status: 'Completed', bootTime: '2024-12-01 09:00:00', overdue: false, check: true, models: [], result: '已盘点 29 项，盘盈 0 项，盘亏 1 项', createdBy: 'Admin' }
    ];
    seed.auditResults = [
      { id: 'ares-1', task: 'atask-3', assetTag: 'P000000009', actualStatus: '盘亏', notes: '已退役，但未及时在系统中标记', createdBy: 'Admin' }
    ];

    // ===== 资产维护 =====
    seed.maintenanceOrders = [
      { id: 'mo-1', name: 'P000000001 维护工单', asset: 'ast-1', type: '维修', status: '待处理', priority: '高', assignee: 'user-2', createdBy: 'Admin' },
      { id: 'mo-2', name: 'P000000007 维护工单', asset: 'ast-7', type: '巡检', status: '处理中', priority: '中', assignee: 'user-3', createdBy: 'Admin' },
      { id: 'mo-3', name: 'P000000012 维护工单', asset: 'ast-12', type: '升级', status: '已完成', priority: '低', assignee: 'user-2', createdBy: 'demi' }
    ];

    // ===== 软件 License =====
    seed.licenseTypes = [
      { id: 'lt-1', name: '永久授权', code: 'Perpetual', mode: '永久', createdBy: 'Admin' },
      { id: 'lt-2', name: '年度订阅', code: 'Annual', mode: '订阅', createdBy: 'Admin' },
      { id: 'lt-3', name: 'SaaS 订阅', code: 'SaaS', mode: 'SaaS', createdBy: 'Admin' }
    ];
    seed.licenseConfigs = [
      { id: 'lc-1', name: 'Microsoft 365 E3 配置', type: 'lt-2', software: 'am-8', rights: 100, compliance: '合规', createdBy: 'Admin' },
      { id: 'lc-2', name: 'Adobe Creative Cloud 配置', type: 'lt-2', software: 'am-9', rights: 50, compliance: '合规', createdBy: 'Admin' },
      { id: 'lc-3', name: 'JetBrains 全产品配置', type: 'lt-1', software: 'am-8', rights: 30, compliance: '合规', createdBy: 'demi' }
    ];
    seed.licenseReclaimRules = [
      { id: 'lrr-1', name: '30天未使用自动回收', software: 'am-8', days: 30, enabled: true, createdBy: 'Admin' },
      { id: 'lrr-2', name: '员工离职自动回收', software: 'am-9', days: 0, enabled: true, createdBy: 'Admin' }
    ];
    seed.licenseDiscoveries = [
      { id: 'ld-1', name: '已发现软件-Slack', software: 'am-8', mapping: 'cim-1', createdBy: 'Admin' },
      { id: 'ld-2', name: '已发现软件-Photoshop', software: 'am-9', mapping: 'cim-2', createdBy: 'demi' }
    ];
    seed.softwareInstallations = [
      { id: 'si-1', name: 'SI00000001', asset: 'ast-1', software: 'am-8', installDate: '2024-01-20', createdBy: 'Admin' },
      { id: 'si-2', name: 'SI00000002', asset: 'ast-2', software: 'am-8', installDate: '2024-02-15', createdBy: 'Admin' },
      { id: 'si-3', name: 'SI00000003', asset: 'ast-1', software: 'am-9', installDate: '2024-03-10', createdBy: 'demi' }
    ];
    seed.softwareUsages = [
      { id: 'su-1', name: 'SU00000001', asset: 'ast-1', software: 'am-8', lastUsed: '2025-01-10 14:30:00', usageHours: 120, createdBy: 'Admin' },
      { id: 'su-2', name: 'SU00000002', asset: 'ast-2', software: 'am-8', lastUsed: '2025-01-12 10:15:00', usageHours: 88, createdBy: 'Admin' }
    ];

    // ===== 设置 =====
    seed.classes = [
      { id: 'cls-1', name: '硬件-Hardware', category: '硬件', description: '硬件资产分类', createdBy: 'Admin' },
      { id: 'cls-2', name: '软件-Software', category: '软件', description: '软件资产分类', createdBy: 'Admin' },
      { id: 'cls-3', name: '服务-Service', category: '服务', description: '服务资产分类', createdBy: 'demi' }
    ];
    seed.identifierRules = [
      { id: 'ir-1', name: '硬件-默认', assetType: 'hardware', prefix: 'P', length: 9, example: 'P000000001' },
      { id: 'ir-2', name: '软件许可-默认', assetType: 'software', prefix: 'SW', length: 8, example: 'SW00000001' },
      { id: 'ir-3', name: '耗材-默认', assetType: 'consumable', prefix: 'C', length: 9, example: 'C000000001' },
      { id: 'ir-4', name: '捆绑-默认', assetType: 'bundle', prefix: 'B', length: 9, example: 'B000000001' },
      { id: 'ir-5', name: '托盘-默认', assetType: 'pallet', prefix: 'PAL', length: 7, example: 'PAL000001' },
      { id: 'ir-6', name: '云资产-默认', assetType: 'cloud', prefix: 'CL', length: 9, example: 'CL1234567EC2Instance' }
    ];
    seed.permissions = [
      { id: 'pm-1', name: '资产查看', code: 'asset:read', scope: '资产', description: '查看资产台账' },
      { id: 'pm-2', name: '资产编辑', code: 'asset:write', scope: '资产', description: '创建/编辑资产' },
      { id: 'pm-3', name: '资产删除', code: 'asset:delete', scope: '资产', description: '删除资产' },
      { id: 'pm-4', name: '成本查看', code: 'cost:read', scope: '成本', description: '查看成本管理' }
    ];

    // ===== 资源管理（位置，已在上面） =====

    // ===== 配置中心（CMDB）=====
    seed.ciTypes = [
      { id: 'cit-1', name: '服务器', code: 'Server', icon: '🖥' },
      { id: 'cit-2', name: '笔记本', code: 'Laptop', icon: '💻' },
      { id: 'cit-3', name: '网络设备', code: 'Network', icon: '🌐' }
    ];
    seed.cmdbCis = [
      { id: 'ci-1', name: 'P000000001-硬件', runStatus: '运行中', code: 'CI0001', xcFlag: '否', model: 'ThinkPad X1', env: '生产', note: '研发笔记本' },
      { id: 'ci-2', name: 'P000000003-服务器', runStatus: '运行中', code: 'CI0002', xcFlag: '否', model: 'Dell R750', env: '生产', note: '应用服务器' },
      { id: 'ci-3', name: 'P000000007-服务器', runStatus: '运行中', code: 'CI0003', xcFlag: '是', model: 'Dell R750', env: '生产', note: '信创服务器' }
    ];

    // ===== 自服务 =====
    seed.myTickets = [
      { id: 'mt-1', no: 'SR-2025-0001', subject: '笔记本无法开机', type: '故障报修', status: '待处理', priority: '高', createdBy: 'user-3' },
      { id: 'mt-2', no: 'SR-2025-0002', subject: '申请新鼠标', type: '资产申领', status: '处理中', priority: '低', createdBy: 'user-3' },
      { id: 'mt-3', no: 'SR-2025-0003', subject: '软件安装-Photoshop', type: '软件申请', status: '已完成', priority: '中', createdBy: 'user-3' }
    ];
    seed.stockRequests = [
      { id: 'srq-1', subject: '笔记本库存不足预警', assetType: 'hardware', model: 'am-1', currentStock: 2, threshold: 5, status: '待审批', createdBy: 'user-3' },
      { id: 'srq-2', subject: '硒鼓库存不足预警', assetType: 'consumable', model: 'am-4', currentStock: 8, threshold: 20, status: '已批准', createdBy: 'user-4' }
    ];

    // ===== 预警 =====
    seed.expiryWarnings = [
      { id: 'ew-1', type: '资产到期', asset: 'ast-1', message: 'P000000001 将在 30 天后到期', level: 'warning', status: '未处理', createdTime: '2025-01-10 10:00:00' },
      { id: 'ew-2', type: '合同到期', asset: 'ct-1', message: '2025年硬件维保合同 将在 60 天后到期', level: 'info', status: '未处理', createdTime: '2025-01-08 14:30:00' },
      { id: 'ew-3', type: 'License 到期', asset: 'ast-25', message: 'Microsoft 365 E3 将在 90 天后到期', level: 'info', status: '已处理', createdTime: '2025-01-05 09:00:00' }
    ];
    seed.notifications = [
      { id: 'nt-1', title: '资产盘点通知', content: '2025-Q1 季度盘点即将开始', status: '未读', createdTime: '2025-01-15 09:00:00' },
      { id: 'nt-2', title: '审批通知', content: '您有一条待审批的合同申请', status: '未读', createdTime: '2025-01-14 16:00:00' },
      { id: 'nt-3', title: '系统升级通知', content: '系统将于本周日 02:00-04:00 进行升级', status: '已读', createdTime: '2025-01-10 08:00:00' }
    ];
    seed.recycleBin = [];

    return seed;
  }

  function ensureSeeded() {
    if (Store.isSeeded()) return;
    const seed = buildSeed();
    Object.keys(seed).forEach(key => {
      const items = seed[key].map(x => Object.assign({ id: x.id || Store.uid(), createdTime: x.createdTime || Store.nowStr(), updatedTime: x.updatedTime || Store.nowStr() }, x));
      localStorage.setItem(Store.PREFIX + key, JSON.stringify(items));
    });
    Store.markSeeded();
  }

  // 暴露
  global.SeedBuilder = { buildSeed, ensureSeeded };
})(window);
