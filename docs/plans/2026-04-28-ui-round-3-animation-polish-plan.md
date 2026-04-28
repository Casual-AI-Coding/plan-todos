# UI Round 3 视觉与交互升级实施计划

> **关联设计文档**: `docs/specs/2026-04-28-ui-visual-upgrade-design.md`
> **日期**: 2026-04-28

---

## 目标

为 Dashboard 和 ViewsView 添加精致动画、微交互、视觉优化和交互反馈，提升用户体验的流畅度和精致感。

**核心改进方向:**
1. 动画与微交互 (hover effects, toggle transitions, staggered entrances)
2. 视觉打磨 (spacing, typography, contrast, shadows)
3. 交互反馈 (loading states, click feedback, state transitions)
4. 空状态优化 (better empty states with illustrations)
5. 缺失功能细节 (ViewsBoard column animations, ItemTooltip animation)

---

## 文件映射

| 文件 | 职责 | 改动类型 |
|------|------|----------|
| `src/app/views/dashboard/SectionCard.tsx` | SectionCard 动画增强 | 修改 |
| `src/app/views/dashboard/TodayTodosCard.tsx` | Todo item 交互动画 | 修改 |
| `src/app/views/dashboard/OverdueTodosCard.tsx` | 过期Todo视觉强化 | 修改 |
| `src/app/views/dashboard/ActivePlansCard.tsx` | Plan item 动画 | 修改 |
| `src/app/views/dashboard/ActiveTargetsCard.tsx` | Target item 动画 | 修改 |
| `src/app/views/dashboard/ActiveMilestonesCard.tsx` | Milestone item 动画 | 修改 |
| `src/components/views/EntityCard.tsx` | 通用卡片动画封装 | 修改 |
| `src/components/views/ViewsBoard.tsx` | Kanban column 动画 | 修改 |
| `src/components/views/ViewsCalendar.tsx` | Calendar cell 动画 | 修改 |
| `src/components/views/ViewsGantt.tsx` | Gantt bar 动画 | 修改 |
| `src/components/views/ItemTooltip.tsx` | Tooltip 动画增强 | 修改 |
| `src/components/ui/EmptyState.tsx` | 空状态组件增强 | 修改 |
| `src/components/ui/Checkbox.tsx` | Checkbox 动画增强 | 修改 |
| `src/components/ui/ProgressBar.tsx` | ProgressBar 动画增强 | 修改 |
| `src/components/ui/animations/StaggeredList.tsx` | 修正 stagger 行为 | 修改 |
| `src/components/ui/animations/FadeIn.tsx` | 新增 direction variants | 修改 |

---

## Phase 1: 核心动画组件增强

### Task 1.1: 增强 StaggeredList 动画行为

**文件:**
- 修改: `src/components/ui/animations/StaggeredList.tsx`

**改动内容:**
```tsx
// 新增自定义 stagger 时间参数，支持组件级别配置
interface StaggeredListProps {
  // ...existing
  staggerDelay?: number;        // 每个 item 延迟 (默认 50ms)
  visibleVariants?: Variants;  // 自定义 visible 状态
}

// 为 item 添加 key-based animation，确保重新渲染时重放动画
export function StaggeredListItem({
  children,
  className = "",
  customKey,  // 可选，用于强制重放动画
}: {
  children: ReactNode;
  className?: string;
  customKey?: string;
})
```

**验证:**
- `npm run test -- src/components/ui/animations/StaggeredList.test.tsx`

---

### Task 1.2: 扩展 FadeIn 动画组件

**文件:**
- 修改: `src/components/ui/animations/FadeIn.tsx`

**改动内容:**
```tsx
// 新增 scale direction 支持
interface FadeInProps {
  // ...existing
  direction?: "up" | "down" | "left" | "right" | "none" | "scale-up" | "scale-down";
}

// scale-up: 从 scale(0.8) + opacity(0) → scale(1) + opacity(1)
const scaleUpVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};
```

**验证:**
- `npm run typecheck` 无错误

---

### Task 1.3: 增强 Checkbox 动画

**文件:**
- 修改: `src/components/ui/Checkbox.tsx`

**改动内容:**
```tsx
// 1. 添加 Framer Motion 包装
// 2. Checkbox 勾选时有弹性动画 (spring bounce)
// 3. 添加 hover:scale(1.1) 效果
// 4. 颜色过渡使用 CSS variable

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className = "", ...props }, ref) => {
  return (
    <motion.label 
      className="inline-flex items-center gap-2 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className="relative w-5 h-5"
        animate={checked ? "checked" : "unchecked"}
        variants={{
          checked: { scale: [1, 1.2, 1], backgroundColor: "var(--color-primary)" },
          unchecked: { scale: 1, backgroundColor: "transparent" },
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.input
          ref={ref}
          type="checkbox"
          className="sr-only"
          {...props}
        />
        {/* Animated checkmark SVG */}
        <motion.svg
          viewBox="0 0 24 24"
          className="absolute inset-0 w-full h-full"
          initial="unchecked"
          animate={checked ? "checked" : "unchecked"}
        >
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            variants={{
              checked: { pathLength: 1, opacity: 1 },
              unchecked: { pathLength: 0, opacity: 0 },
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.svg>
      </motion.div>
      {label && <span>{label}</span>}
    </motion.label>
  );
});
```

**验证:**
- `npm run typecheck`

---

### Task 1.4: 增强 ProgressBar 动画

**文件:**
- 修改: `src/components/ui/ProgressBar.tsx`

**改动内容:**
```tsx
// 1. 添加 Framer Motion
// 2. 进度变化时使用弹性动画 (spring)
// 3. 添加条纹动画 (striped gradient moving)
// 4. 添加 glow 效果在高进度时

<div className="w-full rounded-full overflow-hidden relative">
  {/* Glow effect overlay */}
  {clampedValue > 80 && (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{ x: ["-100%", "200%"] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
  )}
  <motion.div
    className="h-full rounded-full"
    initial={false}
    animate={{ width: `${clampedValue}%` }}
    transition={{ type: "spring", stiffness: 100, damping: 20 }}
    style={{ backgroundColor: colorMap[color] }}
  />
</div>
```

**验证:**
- `npm run typecheck`

---

## Phase 2: Dashboard 卡片动画增强

### Task 2.1: 增强 SectionCard 组件

**文件:**
- 修改: `src/app/views/dashboard/SectionCard.tsx`

**改动内容:**
```tsx
import { motion } from "framer-motion";

// 1. 添加 motion.div 包装，Entrance animation
// 2. accentColor bar 添加 hover glow 效果
// 3. 添加 content entrance stagger

export function SectionCard({
  title,
  titleColor = "var(--color-text)",
  emptyMessage,
  isEmpty = false,
  children,
  headerRight,
  icon,
  accentColor,
}: SectionCardProps) {
  const IconComponent = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden">
        {/* Animated accent bar */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: accentColor }}
          whileHover={{
            boxShadow: `0 0 12px ${accentColor}`,
            transition: { duration: 0.2 },
          }}
        />
        {/* ... rest of content */}
      </Card>
    </motion.div>
  );
}
```

**验证:**
- `npm run typecheck`

---

### Task 2.2: 增强 TodayTodosCard 交互

**文件:**
- 修改: `src/app/views/dashboard/TodayTodosCard.tsx`

**改动内容:**
```tsx
import { motion, AnimatePresence } from "framer-motion";

// 1. 使用 AnimatePresence 包装 todo items，支持添加/删除动画
// 2. 每个 todo item 添加 hover scale 和 shadow
// 3. 完成时添加 strike-through 动画
// 4. 添加手指光标样式

{todos.map((todo, idx) => (
  <motion.div
    key={todo.id}
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ 
      duration: 0.2, 
      delay: idx * 0.05,
      layout: { type: "spring", stiffness: 500, damping: 30 }
    }}
    whileHover={{ scale: 1.02, boxShadow: "var(--shadow-md)" }}
    whileTap={{ scale: 0.98 }}
    className="flex items-center gap-3 p-2 rounded cursor-pointer"
    style={{ backgroundColor: "var(--color-bg-hover)" }}
  >
    <motion.div
      animate={todo.status === "done" ? "checked" : "unchecked"}
    >
      <Checkbox checked={todo.status === "done"} />
    </motion.div>
    <motion.span
      animate={todo.status === "done" ? "done" : "pending"}
      variants={{
        done: { 
          textDecorationLine: "line-through",
          color: "var(--color-text-muted)",
          transition: { duration: 0.3 }
        },
        pending: { 
          textDecorationLine: "none",
          color: "var(--color-text)",
        }
      }}
    >
      {todo.title}
    </motion.span>
  </motion.div>
))}
```

**验证:**
- `npm run typecheck`

---

### Task 2.3: 增强 OverdueTodosCard 视觉

**文件:**
- 修改: `src/app/views/dashboard/OverdueTodosCard.tsx`

**改动内容:**
```tsx
// 1. 添加红色脉冲动画提示
// 2. 过期数量 badge 添加 attention animation
// 3. 每个 overdue item 添加微弱红色 glow hover

<motion.div
  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
  style={{ backgroundColor: "var(--color-error)" }}
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  <span className="text-xs text-white font-bold">{count}</span>
</motion.div>

// Overdue item hover
<motion.div
  whileHover={{ 
    scale: 1.02,
    boxShadow: "0 0 8px rgba(239, 68, 68, 0.3)",
    borderColor: "var(--color-error)"
  }}
/>
```

**验证:**
- `npm run typecheck`

---

### Task 2.4: 增强 ActivePlansCard / ActiveTargetsCard / ActiveMilestonesCard

**文件:**
- 修改: `src/app/views/dashboard/ActivePlansCard.tsx`
- 修改: `src/app/views/dashboard/ActiveTargetsCard.tsx`
- 修改: `src/app/views/dashboard/ActiveMilestonesCard.tsx`

**改动内容 (统一应用于三个文件):**
```tsx
// 1. 统一使用 motion.div + StaggeredList
// 2. 每个 item 添加 hover lift 效果
// 3. 添加 subtle scale animation
// 4. 点击区域添加波纹效果 (RippleEffect)

import { RippleEffect } from "@/components/ui/animations";

{plans.map((plan) => (
  <RippleEffect key={plan.id} onClick={() => onNavigate?.("plan", plan.id)}>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="p-3 rounded-lg border cursor-pointer"
      style={{
        backgroundColor: "var(--color-bg-hover)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Icon + Title */}
      <div className="flex items-center gap-2">
        <IconComponent size={16} style={{ color: accentColor }} />
        <span className="font-medium truncate">{plan.title}</span>
      </div>
      {/* Progress if available */}
      {"progress" in plan && (
        <ProgressBar value={plan.progress} size="sm" className="mt-2" />
      )}
    </motion.div>
  </RippleEffect>
))}
```

**验证:**
- `npm run typecheck`

---

## Phase 3: ViewsView 视图动画

### Task 3.1: 增强 EntityCard 组件

**文件:**
- 修改: `src/app/views/views/EntityCard.tsx`

**改动内容:**
```tsx
import { motion } from "framer-motion";

// 1. 添加 motion.div 包装
// 2. 添加 entrance animation (scale + fade)
// 3. 添加 hover lift + glow 效果
// 4. 添加点击 feedback (scale down)
// 5. 添加 subtle rotation on hover

export function EntityCard({
  item,
  onHover,
  onLeave,
  onClick,
  showProgress = true,
  progressColor = "teal",
  showIcon = true,
}: EntityCardProps) {
  const config = ENTITY_TYPE_CONFIG[item.type];
  const hasProgress = "progress" in item.data;
  const title = "title" in item.data ? item.data.title : "";
  const id = "id" in item.data ? item.data.id : "";
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        scale: 1.03,
        y: -2,
        boxShadow: `0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px ${config.accentColor}40`,
        transition: { duration: 0.15 },
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="p-2.5 rounded-lg border cursor-pointer"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: config.borderColor,
      }}
      onMouseEnter={(e) => onHover?.(item, e)}
      onMouseLeave={() => onLeave?.()}
      onClick={() => onClick?.(item.type, id)}
    >
      {/* Icon + Badge row */}
      <motion.div
        className="flex items-center gap-2 mb-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {showIcon && IconComponent && (
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
          >
            <IconComponent size={14} style={{ color: config.accentColor }} />
          </motion.div>
        )}
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.textColor}`}>
          {config.label}
        </span>
      </motion.div>

      {/* Title */}
      <div className="font-medium text-sm truncate" style={{ color: "var(--color-text)" }}>
        {title}
      </div>

      {/* Progress */}
      {showProgress && hasProgress && (
        <motion.div
          className="mt-2"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <ProgressBar
            value={(item.data as { progress: number }).progress}
            color={progressColor}
            size="sm"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
```

**验证:**
- `npm run typecheck`

---

### Task 3.2: 增强 ViewsBoard Kanban 动画

**文件:**
- 修改: `src/components/views/ViewsBoard.tsx`

**改动内容:**
```tsx
import { motion, AnimatePresence } from "framer-motion";

// 1. Column headers 添加 pulse 动画表示拖拽目标
// 2. Column items 使用 StaggeredList 进场动画
// 3. Column 添加 hover highlight
// 4. Empty state 添加 fade 动画

{columns.map((col) => {
  const items = getItemsByStatus(col.id);
  return (
    <motion.div
      key={col.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: columns.indexOf(col) * 0.1 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-lg p-4 flex flex-col h-[60vh] border"
      style={{
        backgroundColor: "var(--color-bg-hover)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Column header */}
      <motion.div
        className="flex items-center gap-2 mb-4 flex-shrink-0"
        whileHover={{ scale: 1.02 }}
      >
        {/* ...existing icon + title + count */}
      </motion.div>

      {/* Items with stagger */}
      <AnimatePresence mode="popLayout">
        <StaggeredList className="space-y-2 overflow-y-auto flex-1 min-h-0">
          {items.map((item, idx) => (
            <StaggeredListItem key={`${item.type}-${idx}`}>
              <EntityCard
                item={item}
                // ...existing props
              />
            </StaggeredListItem>
          ))}
        </StaggeredList>
      </AnimatePresence>

      {/* Empty state */}
      <AnimatePresence>
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              无
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
})}
```

**验证:**
- `npm run typecheck`

---

### Task 3.3: 增强 ViewsCalendar 日期单元格动画

**文件:**
- 修改: `src/components/views/ViewsCalendar.tsx`

**改动内容:**
```tsx
// 1. 日期单元格 hover 添加 scale + shadow
// 2. 有内容的单元格添加 dot pulse
// 3. 切换月份使用 slide 动画
// 4. Today 单元格添加 subtle glow

{dayCells.map((day, idx) => (
  <motion.div
    key={idx}
    whileHover={{
      scale: 1.05,
      boxShadow: "var(--shadow-md)",
      backgroundColor: day.isToday
        ? "color-mix(in srgb, var(--color-primary) 15%, transparent)"
        : "var(--color-bg-hover)",
    }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={`
      min-h-[80px] p-1.5 rounded-lg border
      ${day.isToday ? "ring-2 ring-primary/30" : ""}
      ${day.isCurrentMonth ? "" : "opacity-40"}
    `}
    style={{
      backgroundColor: day.isToday
        ? "color-mix(in srgb, var(--color-primary) 10%, var(--color-bg-card))"
        : "var(--color-bg-card)",
      borderColor: day.isToday ? "var(--color-primary)" : "var(--color-border)",
    }}
  >
    {/* Day number */}
    <div className="flex justify-between items-start">
      <span
        className={`text-sm font-medium ${
          day.isToday ? "text-primary" : ""
        }`}
        style={{ color: day.isToday ? "var(--color-primary)" : "var(--color-text)" }}
      >
        {day.day}
      </span>
      {day.isToday && (
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--color-primary)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
    {/* Items */}
    {day.items.slice(0, 2).map((item) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-xs truncate p-0.5 rounded mt-1"
        style={{ backgroundColor: entityColors[item.type] }}
      >
        {item.title}
      </motion.div>
    ))}
    {day.items.length > 2 && (
      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        +{day.items.length - 2} 更多
      </span>
    )}
  </motion.div>
))}
```

**验证:**
- `npm run typecheck`

---

### Task 3.4: 增强 ViewsGantt 时间条动画

**文件:**
- 修改: `src/components/views/ViewsGantt.tsx`

**改动内容:**
```tsx
// 1. 时间条使用 motion.div
// 2. 添加 hover scale + tooltip trigger
// 3. 时间条宽度动画 (progress 变化时)
// 4. 添加连接线动画

{tasks.map((task, idx) => (
  <motion.div
    key={task.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: idx * 0.05 }}
    className="flex items-center gap-4 py-2"
  >
    {/* Task label */}
    <div className="w-32 truncate text-sm" style={{ color: "var(--color-text)" }}>
      {task.title}
    </div>

    {/* Timeline bar */}
    <div className="flex-1 relative h-6">
      <motion.div
        className="absolute h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${task.progress}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: idx * 0.05 }}
        whileHover={{
          scale: 1.05,
          boxShadow: "var(--shadow-glow)",
        }}
        onMouseEnter={(e) => onHover?.(task, e)}
        onMouseLeave={() => onLeave?.()}
        style={{
          background: `linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, white))`,
          left: `${task.startOffset}%`,
        }}
      >
        {/* Progress shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
        />
      </motion.div>
    </div>
  </motion.div>
))}
```

**验证:**
- `npm run typecheck`

---

### Task 3.5: 增强 ItemTooltip 动画

**文件:**
- 修改: `src/components/views/ItemTooltip.tsx`

**改动内容:**
```tsx
import { motion, AnimatePresence } from "framer-motion";

// 1. 使用 AnimatePresence 控制显示/隐藏
// 2. 添加 scale + fade 动画
// 3. 添加 subtle 上下浮动动画
// 4. 位置计算考虑 viewport boundary

export function ItemTooltip({ hoveredItem, hoverPosition }: ItemTooltipProps) {
  return (
    <AnimatePresence>
      {hoveredItem && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 5 }}
          transition={{
            duration: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            left: Math.min(hoverPosition.x + 10, window.innerWidth - 220),
            top: Math.min(hoverPosition.y + 10, window.innerHeight - 200),
            pointerEvents: "none",
          }}
          className="fixed z-50 rounded-lg shadow-lg p-3 min-w-[200px] border"
        >
          {/* Subtle floating animation */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Existing content */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**验证:**
- `npm run typecheck`

---

## Phase 4: EmptyState 组件增强

### Task 4.1: 增强 EmptyState 组件

**文件:**
- 修改: `src/components/ui/EmptyState.tsx`

**改动内容:**
```tsx
import { motion } from "framer-motion";

// 1. 添加 entrance animation (scale + fade)
// 2. Icon 添加 floating 动画
// 3. 添加入门引导光晕效果
// 4. Action button 添加 hover lift

export function EmptyState({
  icon = "📋",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`
        flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl
        ${className}
      `}
      style={{
        background: "linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-hover) 100%)",
      }}
    >
      {/* Animated Icon */}
      <motion.div
        className="w-16 h-16 flex items-center justify-center rounded-2xl text-4xl mb-5"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
        }}
        animate={{
          y: [0, -8, 0],
          boxShadow: [
            "0 0 0 0 rgba(13, 148, 136, 0)",
            "0 0 20px 5px rgba(13, 148, 136, 0.2)",
            "0 0 0 0 rgba(13, 148, 136, 0)",
          ],
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 3, repeat: Infinity },
        }}
        role="img"
        aria-label={icon}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-sm mb-6 max-w-sm leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </motion.p>
      )}

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          whileHover={{ y: -2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
```

**验证:**
- `npm run typecheck`
- `npm run test -- src/components/ui/EmptyState.test.tsx`

---

## Phase 5: 验证与收尾

### Task 5.1: 运行验证命令

- [ ] `npm run test` — 全部测试通过
- [ ] `npm run typecheck` — 无类型错误
- [ ] `npm run build` — 构建成功
- [ ] `npm run lint` — 无 lint 错误

### Task 5.2: 视觉验证检查清单

- [ ] Dashboard: 所有卡片 hover 动画正常
- [ ] Dashboard: Checkbox 勾选动画流畅
- [ ] Dashboard: SectionCard accent bar hover glow
- [ ] Dashboard: Todo item 添加/完成动画
- [ ] Dashboard: Overdue 红色脉冲提示
- [ ] ViewsView: EntityCard hover lift + glow
- [ ] ViewsView: Kanban column stagger 进场
- [ ] ViewsView: Calendar cell hover scale
- [ ] ViewsView: Gantt bar progress动画
- [ ] ViewsView: ItemTooltip scale + fade
- [ ] EmptyState: floating icon 动画
- [ ] 全局: 无动画卡顿或闪动

### Task 5.3: Git 提交

```bash
git add -A
git commit -m "feat(ui): add micro-interactions and animations round 3

- Enhanced Checkbox with spring animation and animated checkmark
- Enhanced ProgressBar with spring animation and glow effect
- Enhanced SectionCard with hover lift and accent glow
- Enhanced TodayTodosCard with staggered item animations
- Enhanced OverdueTodosCard with red pulse attention indicator
- Enhanced EntityCard with hover lift and glow effects
- Enhanced ViewsBoard with column stagger entrance
- Enhanced ViewsCalendar with cell hover scale effect
- Enhanced ViewsGantt with bar progress animation
- Enhanced ItemTooltip with scale and fade animation
- Enhanced EmptyState with floating icon animation
- Enhanced StaggeredList with configurable delay"
```

---

## 执行顺序

```
Phase 1 (核心动画组件):
  1.1 → 1.2 → 1.3 → 1.4 (可并行)

Phase 2 (Dashboard):
  2.1 → 2.2 → 2.3 → 2.4 (2.2-2.4 可并行)

Phase 3 (ViewsView):
  3.1 → 3.2 → 3.3 → 3.4 → 3.5 (3.2-3.5 可并行)

Phase 4 (EmptyState):
  4.1

Phase 5 (验证):
  5.1 → 5.2 → 5.3
```

---

## 技术说明

### Framer Motion 动画原则

1. **Spring Physics**: 优先使用 `type: "spring"` 而非 `duration`，更自然
2. **Stagger**: 子元素使用 `staggerChildren` 实现瀑布效果
3. **Layout Animation**: 使用 `layout` prop 实现列表重排动画
4. **Performance**: 仅动画 `transform` 和 `opacity`，避免触发布局
5. **Accessibility**: 尊重 `prefers-reduced-motion`，在 globals.css 添加:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### CSS Variable 动画

所有颜色动画使用 CSS variable 实现，确保主题切换时平滑过渡:

```css
transition: color 0.3s var(--animation-easing-smooth),
            background-color 0.2s var(--animation-easing-smooth);
```
