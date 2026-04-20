/**
 * Internationalization - UI text single source of truth.
 * Currently Chinese-only, structured for future i18n expansion.
 * Keys follow dot-notation: namespace.label
 */

export const t = {
  // Navigation
  nav: {
    dashboard: "今日总览",
    todos: "待办",
    circulations: "打卡",
    circulationsToday: "今日打卡",
    circulationsSettings: "打卡设置",
    plans: "计划",
    goals: "目标",
    milestones: "里程碑",
    views: "视图查看",
    statistics: "数据统计",
    notifications: "通知",
    notificationCenter: "通知中心",
    notificationSettings: "通知设置",
    channels: "通知渠道",
    dailySummary: "每日汇总",
    circulationNotifications: "打卡通知",
    dataManagement: "数据管理",
    importExport: "导入/导出",
    sync: "云同步",
    settings: "设置",
    general: "通用",
    tagManagement: "标签管理",
    about: "关于",
    home: "首页",
    checkin: "打卡",
    more: "更多",
    menu: "菜单",
    closeMenu: "关闭菜单",
    openMenu: "打开菜单",
  },

  // Common actions
  action: {
    delete: "删除",
    edit: "编辑",
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    create: "创建",
    update: "更新",
    close: "关闭",
    search: "搜索",
    selectAll: "全选",
    deselectAll: "取消全选",
  },

  // Status labels
  status: {
    pending: "待处理",
    inProgress: "进行中",
    completed: "已完成",
    cancelled: "已取消",
    all: "全部",
    active: "进行中",
    archived: "已归档",
  },

  // Priority labels
  priority: {
    P0: "P0 紧急",
    P1: "P1 高",
    P2: "P2 中",
    P3: "P3 低",
    urgent: "紧急",
    high: "高",
    medium: "中",
    low: "低",
  },

  // Filter labels
  filter: {
    all: "全部",
    today: "今日",
    upcoming: "即将到期",
    completed: "已完成",
    list: "列表",
    calendar: "日历",
    gantt: "甘特图",
    board: "看板",
  },

  // Todo-specific
  todo: {
    created: "待办已创建",
    updated: "待办已更新",
    deleted: "待办已删除",
    emptyTitle: "标题不能为空",
  },

  // View modes
  viewMode: {
    list: "列表",
    calendar: "日历",
    gantt: "甘特图",
    board: "看板",
  },

  // Loading states
  loading: {
    default: "加载中...",
    saving: "保存中...",
    deleting: "删除中...",
  },

  // Confirmation dialogs
  confirm: {
    delete: "删除？",
    deleteConfirm: "确认删除此项？",
    unsavedChanges: "有未保存的更改，确定离开？",
  },

  // Statistics
  statistics: {
    pending: "待办",
    completed: "已完成",
    inProgress: "进行中",
  },

  // Validation error messages
  validation: {
    required: (fieldName: string) => `${fieldName}不能为空`,
    maxLength: (fieldName: string, max: number) =>
      `${fieldName}不能超过${max}个字符`,
    invalidPriority: "无效的优先级",
    invalidStatus: "无效的状态",
  },

  // Error messages
  error: {
    notFound: (entity: string, id: string) =>
      `${entity} with id "${id}" not found`,
    networkError: "网络错误，请重试",
    unknownError: "未知错误",
  },
} as const;

/**
 * Helper to get a validation error message for required fields.
 * This replaces the previous inline template literals in validation.ts
 */
export function requiredMessage(fieldName: string): string {
  return `${fieldName}不能为空`;
}

/**
 * Helper to get a validation error message for max length.
 */
export function maxLengthMessage(fieldName: string, max: number): string {
  return `${fieldName}不能超过${max}个字符`;
}