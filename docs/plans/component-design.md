# Plan Todos - 组件设计

> 状态：✅ 已实现（2026-02-14）
> 
> **实际状态**：UI 组件库和视图组件已全部实现

---

## 一、组件架构

```
src/components/
├── ui/                      # 基础UI组件
│   ├── Button/
│   ├── Input/
│   ├── Select/
│   ├── Modal/
│   ├── Card/
│   ├── Badge/
│   ├── ProgressBar/
│   ├── Checkbox/
│   ├── DatePicker/
│   └── SearchBar/
│
├── layout/                   # 布局组件
│   ├── Sidebar/
│   ├── Header/
│   └── MainContent/
│
├── entities/                 # 实体组件
│   ├── TodoCard/
│   ├── PlanCard/
│   ├── TaskCard/
│   ├── TargetCard/
│   ├── StepCard/
│   └── MilestoneCard/
│
├── views/                    # 视图组件
│   ├── Dashboard/
│   ├── TodoList/
│   ├── PlanList/
│   ├── TargetList/
│   ├── MilestoneList/
│   ├── ViewSwitcher/
│   └── Statistics/
│
└── forms/                    # 表单组件
    ├── TodoForm/
    ├── PlanForm/
    ├── TaskForm/
    ├── TargetForm/
    ├── StepForm/
    └── MilestoneForm/
```

---

## 二、基础UI组件

### 2.1 Button

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

// 使用示例
<Button variant="primary" size="md">新建</Button>
<Button variant="ghost" size="sm" icon={<EditIcon />}>编辑</Button>
```

**样式规范**：
- 主色：`#0D9488` (Teal)
- 强调色：`#F97316` (Orange)
- 圆角：`8px`
- 间距：`8px 16px`

---

### 2.2 Input

```tsx
interface InputProps {
  type: 'text' | 'email' | 'password' | 'date' | 'number';
  placeholder?: string;
  value?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}
```

---

### 2.3 Modal

```tsx
interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: 'sm' | 'md' | 'lg';
}
```

**行为**：
- 点击遮罩关闭
- ESC 键关闭
- 打开时锁定 body scroll

---

### 2.4 Card

```tsx
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
```

---

### 2.5 ProgressBar

```tsx
interface ProgressBarProps {
  value: number;        // 0-100
  showLabel?: boolean;
  color?: 'teal' | 'orange' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

// 使用示例
<ProgressBar value={75} showLabel color="teal" />
// ████████████░░░░░░░░░ 75%
```

---

### 2.6 DatePicker

```tsx
interface DatePickerProps {
  value?: string;       // ISO 8601
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
}
```

---

## 三、布局组件

### 3.1 Sidebar

```tsx
interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  collapsed?: boolean;
}
```

**结构**：
```
┌─────────────────┐
│  Logo           │
├─────────────────┤
│  一级菜单        │
│  ├─ 二级菜单    │
│  └─ 二级菜单    │
│  一级菜单        │
├─────────────────┤
│  设置           │
└─────────────────┘
```

**交互**：
- 点击一级菜单展开/收起二级
- 选中状态高亮
- 折叠模式仅显示图标

---

### 3.2 Header

```tsx
interface HeaderProps {
  title: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}
```

---

## 四、实体组件

### 4.1 TodoCard

```tsx
interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

// UI
┌────────────────────────────────────────────┐
│ [✓] 任务标题                    📅 02-13  │
│     任务描述...                  🗑️ 📝    │
└────────────────────────────────────────────┘
```

---

### 4.2 PlanCard

```tsx
interface PlanCardProps {
  plan: Plan & { progress: number; task_count: number };
  tasks: Task[];
  expanded?: boolean;
  onToggleExpand: () => void;
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  // Task handlers
  onCreateTask: (planId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

// UI (展开状态)
┌────────────────────────────────────────────────────┐
│ ▼ Plan A                        🗑️ 📦 📝       │
│   2026-01-01 ~ 2026-03-31                        │
│   ████████████░░░░░░░ 60% (3/5)                  │
│ ─────────────────────────────────────────────────│
│ [ ] Task 1          📅 02-01 ~ 02-15   🗑️ 📝  │
│ [✓] Task 2          📅 02-05 ~ 02-20   ✅      │
│ [ ] Task 3          📅 02-10 ~ 02-25   🗑️ 📝  │
│ [+ 添加 Task]                                     │
└────────────────────────────────────────────────────┘
```

---

### 4.3 TargetCard

```tsx
interface TargetCardProps {
  target: Target & { progress: number };
  steps: Step[];
  expanded?: boolean;
  onToggleExpand: () => void;
  onEdit: (target: Target) => void;
  onDelete: (id: string) => void;
  // Step handlers
  onCreateStep: (targetId: string) => void;
  onEditStep: (step: Step) => void;
  onDeleteStep: (id: string) => void;
  onToggleStep: (id: string) => void;
}

// UI
┌────────────────────────────────────────────────────┐
│ ▼ Target X                        🗑️ 📝          │
│   截止日期：2026-06-30                            │
│   ████████████░░░░░░░ 70%                         │
│   权重总和：70/100                                │
│ ─────────────────────────────────────────────────│
│ [✓] Step 1 (30%)                    🗑️ 📝      │
│ [✓] Step 2 (25%)                    🗑️ 📝      │
│ [+ 添加 Step]                                     │
│ ⚠️ 剩余可用权重：15%                             │
└────────────────────────────────────────────────────┘
```

---

### 4.4 MilestoneCard

```tsx
interface MilestoneCardProps {
  milestone: Milestone & { progress: number };
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

// UI
┌────────────────────────────────────────────────────┐
│ Milestone 1                         🗑️ 📝       │
│ 关联：🚀 Plan A                                  │
│ 目标日期：2026-03-15                             │
│ 进度：███████░░░░░░░ 60%                         │
│ 状态：进行中  [✓ 完成]                           │
└────────────────────────────────────────────────────┘
```

---

## 五、视图组件

### 5.1 Dashboard

```tsx
// 今日总览页面
interface DashboardProps {
  todayTodos: Todo[];
  upcomingTodos: Todo[];
  completedToday: Todo[];
  activePlans: Plan[];
  activeTargets: Target[];
}

// 布局
┌────────────────────────────────────────────────────┐
│  今日待办    │  即将到期    │  今日完成           │
│     5        │      3       │      8              │
├────────────────────────────────────────────────────┤
│  今日待办列表                                    
├────────────────────────────────────────────────────┤
│  进度概览 (Plan/Target 进度卡片)                 
└────────────────────────────────────────────────────┘
```

---

### 5.2 ViewSwitcher

```tsx
interface ViewSwitcherProps {
  currentView: 'list' | 'calendar' | 'timeline' | 'kanban';
  onChange: (view: string) => void;
  data: any[];  // 根据视图类型渲染
}

// 视图切换面板
┌─────────────────────────┐
│  视图查看        [X]   │
├─────────────────────────┤
│ [列表] [日历] [时间轴] │
│ [看板]                  │
│                         │
│   (当前视图内容)        │
└─────────────────────────┘
```

---

### 5.3 Statistics

```tsx
interface StatisticsProps {
  period: 'day' | 'week' | 'month' | 'all';
  onPeriodChange: (period: string) => void;
}

// 包含的子组件
- CompletionChart    // 完成率趋势图
- CountStats         // 数量统计
- DistributionChart  // 分布图表
- EfficiencyStats    // 效率指标
```

---

## 六、表单组件

### 6.1 PlanForm

```tsx
interface PlanFormProps {
  plan?: Plan;
  onSubmit: (data: PlanInput) => void;
  onCancel: () => void;
}

// 字段
- title (必填)
- description
- start_date
- end_date
```

---

### 6.2 TaskForm

```tsx
interface TaskFormProps {
  task?: Task;
  planId: string;
  onSubmit: (data: TaskInput) => void;
  onCancel: () => void;
}

// 字段
- title (必填)
- description
- start_date
- end_date
- status
```

---

### 6.3 TargetForm

```tsx
interface TargetFormProps {
  target?: Target;
  onSubmit: (data: TargetInput) => void;
  onCancel: () => void;
}
```

---

### 6.4 StepForm

```tsx
interface StepFormProps {
  step?: Step;
  targetId: string;
  currentTotalWeight: number;
  onSubmit: (data: StepInput) => void;
  onCancel: () => void;
}

// 特殊处理
- weight 字段需要校验总和 ≤ 100
- 超过时显示错误提示
```

---

### 6.5 MilestoneForm

```tsx
interface MilestoneFormProps {
  milestone?: Milestone;
  onSubmit: (data: MilestoneInput) => void;
  onCancel: () => void;
}

// 字段
- title (必填)
- target_date
-关联类型选择 (Plan/Task/Target 三选一)
```

---

## 七、状态管理

### 7.1 React Context

```tsx
// PlanContext
interface PlanContextValue {
  plans: Plan[];
  loading: boolean;
  createPlan: (data: PlanInput) => Promise<void>;
  updatePlan: (id: string, data: Partial<PlanInput>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

// TodoContext
interface TodoContextValue {
  todos: Todo[];
  loading: boolean;
  // ... CRUD methods
}

// UIContext
interface UIContextValue {
  sidebarCollapsed: boolean;
  currentView: string;
  theme: 'light' | 'dark' | 'system';
  // ... UI state
}
```

---

## 八、后续

- [ ] 开始实现组件库
- [ ] 实现页面
