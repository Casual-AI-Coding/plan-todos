# UI/UX 设计审查报告

**审查日期**: 2026-03-01  
**项目**: Plan Todos (Tauri + Next.js + React)

---

## 设计系统概况

| 项目         | 状态        | 说明                                          |
| ------------ | ----------- | --------------------------------------------- |
| **主题**     | ✅ 良好     | 3 个主题 (light, dark, dracula)，CSS 变量管理 |
| **样式方案** | ✅ Tailwind | 73 个 TSX 文件，1121 处 className             |
| **图标**     | ✅ 无 emoji | 使用内联 SVG                                  |
| **字体**     | 需检查      | 需确认是否有统一字体配置                      |

---

## 问题汇总

### P1 - 高优先级

| #   | 问题                        | 位置            | 影响                 | 建议                                 |
| --- | --------------------------- | --------------- | -------------------- | ------------------------------------ |
| U1  | **cursor-pointer 缺失严重** | 52 个文件 (71%) | 用户不知道元素可点击 | 所有 hover 元素添加 `cursor-pointer` |
| U2  | **hover 状态覆盖率低**      | 46 个文件 (63%) | 无交互反馈           | 添加 `hover:` 样式                   |
| U3  | **focus 状态不足**          | 57 个文件 (78%) | 键盘导航不友好       | 添加 `focus:` 样式                   |
| U4  | **内联 SVG 无统一管理**     | 9 个文件 20 处  | 维护性差             | 抽取到独立 Icons 组件                |

### P2 - 中优先级

| #   | 问题                     | 位置                             | 建议                         |
| --- | ------------------------ | -------------------------------- | ---------------------------- |
| U5  | **过渡动画不一致**       | 52 处，但时长不统一              | 定义 CSS 变量统一管理        |
| U6  | **组件文件过大**         | ViewsView.tsx (160 处 className) | 拆分组件                     |
| U7  | **缺少统一 Button 组件** | 各页面独立实现                   | 抽取到 components/ui         |
| U8  | **SearchBar 固定宽度**   | `w-80` 小屏问题                  | 响应式改为 `w-full max-w-xs` |

### P3 - 低优先级

| #   | 问题                    | 建议          |
| --- | ----------------------- | ------------- |
| U9  | 内联 SVG viewBox 不统一 | 统一为 24x24  |
| U10 | 阴影样式分散            | 使用 CSS 变量 |

---

## 交互问题详情

### 鼠标/指针交互覆盖率

| 项目           | 覆盖率      | 缺失文件数 |
| -------------- | ----------- | ---------- |
| hover 状态     | 37% (27/73) | 46 个文件  |
| cursor-pointer | 29% (21/73) | 52 个文件  |
| transition     | 38% (28/73) | 45 个文件  |

**核心问题**: 大量可交互元素缺少 hover 和 cursor-pointer，用户体验不直观。

### 键盘/无障碍

| 项目       | 状态        | 说明          |
| ---------- | ----------- | ------------- |
| focus 状态 | 22% (16/73) | 严重不足      |
| aria-label | ⚠️ 缺失     | 图标按钮缺失  |
| 键盘导航   | ⚠️ 缺失     | TodoItem 缺失 |

---

## 良好方面

- ✅ 使用 Tailwind CSS (现代方案)
- ✅ 3 个主题支持 (light/dark/dracula)
- ✅ CSS 变量设计良好
- ✅ 无 emoji 作为图标
- ✅ 响应式类使用 (sm:, md:, lg:)
- ✅ 部分组件有良好过渡动画

---

## 修复建议

### 快速修复方案

```css
/* globals.css 添加 */
@layer utilities {
  .interactive {
    @apply cursor-pointer transition-colors duration-200;
  }
  .interactive-hover:hover {
    @apply bg-opacity-80;
  }
}
```

```tsx
// 使用方式
<button className="interactive interactive-hover">Click me</button>
```

### 统一 Icons 组件

创建 `src/components/ui/Icons/index.tsx`:

```tsx
import { X, Check, Plus, ... } from 'lucide-react';

export const Icons = {
  X,
  Check,
  Plus,
  // ...
};
```

### 统一过渡动画

在 `globals.css` 定义:

```css
:root {
  --transition-fast: 150ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;
}
```

---

## 修复优先级

1. **立即**: cursor-pointer + hover + focus 状态补全
2. **立即**: 统一 Icons 组件
3. **短期**: SearchBar 响应式修复
4. **短期**: 统一过渡动画时长
5. **长期**: 抽取公共组件

---

## 相关文件

- `src/app/globals.css` - 全局样式
- `src/components/ui/` - UI 组件库
- `src/components/features/` - 业务组件

---

## 第二轮深入审查

### 1. UI 组件深度审查

| #   | 问题                        | 位置                                                                      | 建议                           |
| --- | --------------------------- | ------------------------------------------------------------------------- | ------------------------------ |
| C1  | **内联样式过多**            | 38 个文件，153 处 `style={{}}`                                            | 迁移到 Tailwind 或 CSS modules |
| C2  | **硬编码颜色**              | 8 种: #134E4A, #22C55E, #EF4444, #3B82F6, #F59E0B, #fff, #e81123, #ffffff | 使用 CSS 变量                  |
| C3  | **Button 组件使用不一致**   | 各文件独立实现 button 样式                                                | 统一使用 Button 组件           |
| C4  | **Card 组件重复**           | Card.tsx + EmptyStateCard.tsx + DraggableCard                             | 统一为可配置组件               |
| C5  | **缺少 Input 组件统一管理** | 各处独立实现                                                              | 创建 FormComponents            |

### 2. UX 模式审查

#### 加载状态

| #   | 问题                    | 位置                      | 建议                 |
| --- | ----------------------- | ------------------------- | -------------------- |
| L1  | **Skeleton 组件良好**   | ✅ Skeleton.tsx 已实现    | 保持                 |
| L2  | **表单无 loading 状态** | TodoForm, CirculationForm | 添加 loading spinner |
| L3  | **视图加载状态不一致**  | 各 view 实现不同          | 统一加载组件         |

#### 空状态

| #   | 问题                       | 位置                               | 建议 |
| --- | -------------------------- | ---------------------------------- | ---- |
| E1  | ✅ **EmptyState 组件良好** | EmptyState.tsx, EmptyStateCard.tsx | 保持 |

#### 错误处理

| #   | 问题                    | 位置                         | 建议                     |
| --- | ----------------------- | ---------------------------- | ------------------------ |
| T1  | ✅ **Toast 系统完善**   | Toast.tsx, ToastProvider.tsx | 保持                     |
| T2  | **缺少 Error Boundary** | 全局                         | 添加 Error Boundary 组件 |

#### 反馈机制

| #   | 问题                         | 位置               | 建议            |
| --- | ---------------------------- | ------------------ | --------------- |
| F1  | ✅ **CheckinConfirm 确认框** | CheckinConfirm.tsx | 保持            |
| F2  | **缺少撤销功能**             | 删除操作           | 添加 undo toast |

#### 导航

| #   | 问题                      | 位置                           | 建议 |
| --- | ------------------------- | ------------------------------ | ---- |
| N1  | ✅ **Sidebar 活跃状态**   | Sidebar.tsx 使用 aria-selected | 保持 |
| N2  | ✅ **BottomNav 活跃状态** | BottomNav.tsx 使用 isActive    | 保持 |

#### 动画

| #   | 问题             | 位置                                                    | 建议            |
| --- | ---------------- | ------------------------------------------------------- | --------------- |
| A1  | **动画库分散**   | 5 个不同动画组件                                        | 统一动画策略    |
| A2  | **动画实现重复** | StaggeredList, PageSlide, FadeIn, ScaleIn, RippleEffect | 合并或抽取 Hook |

### 3. 视觉设计一致性

| #   | 问题             | 位置                   | 建议               |
| --- | ---------------- | ---------------------- | ------------------ |
| V1  | **颜色不一致**   | 8 种硬编码颜色         | 使用 CSS 变量      |
| V2  | **间距不统一**   | 多种 margin/padding 值 | 建立 spacing token |
| V3  | **字体大小分散** | 多种 font-size         | 使用 type scale    |
| V4  | **圆角不统一**   | 多种 border-radius 值  | 建立 rounded token |

### 4. 响应式设计

| #   | 问题                   | 位置                        | 建议                   |
| --- | ---------------------- | --------------------------- | ---------------------- |
| R1  | **响应式类使用良好**   | 25 个文件使用 sm:, md:, lg: | 保持                   |
| R2  | **SearchBar 固定宽度** | `w-80` (320px)              | 改为 `w-full max-w-xs` |
| R3  | **Gantt 视图无响应式** | ViewsGantt.tsx              | 添加水平滚动或缩放     |
| R4  | **Board 视图可能溢出** | ViewsBoard.tsx              | 添加响应式处理         |

---

## 审查总结

### 问题统计

| 类别       | P1    | P2     | P3    | 总计   |
| ---------- | ----- | ------ | ----- | ------ |
| 交互状态   | 3     | 0      | 0     | 3      |
| UI 组件    | 1     | 4      | 1     | 6      |
| UX 模式    | 0     | 4      | 1     | 5      |
| 视觉一致性 | 0     | 4      | 0     | 4      |
| 响应式     | 0     | 2      | 0     | 2      |
| **总计**   | **4** | **14** | **2** | **20** |

### 已确认良好

- ✅ Tailwind CSS
- ✅ 3 主题支持
- ✅ Skeleton 加载
- ✅ EmptyState 组件
- ✅ Toast 通知
- ✅ 导航活跃状态
- ✅ CSS 变量设计

### 优先修复

1. **cursor-pointer + hover + focus** - 交互状态补全
2. **统一 Icons 组件** - 抽取内联 SVG
3. **内联样式迁移** - 153 处 style={{}}
4. **硬编码颜色** - 8 种颜色迁移到 CSS 变量
5. **SearchBar 响应式** - 修复小屏问题

---

## 第三轮深入审查 (响应式 + 无障碍)

### 响应式设计问题

| #   | 问题                   | 严重程度 | 位置                 | 建议                             |
| --- | ---------------------- | -------- | -------------------- | -------------------------------- |
| R1  | **禁用用户缩放**       | 🔴 高    | `layout.tsx:32-33`   | 移除 `maximumScale: 1`，改为 `5` |
| R2  | **按钮触摸目标过小**   | 🟡 中    | `Button.tsx:111-112` | sm/md 尺寸在移动端 < 44px        |
| R3  | **SearchBar 固定宽度** | 🟡 中    | `SearchBar.tsx:38`   | `w-80` (320px) 溢出              |
| R4  | **移动端头部过高**     | 🟡 中    | `page.tsx:159`       | `3.5rem` (56px) 占用空间         |
| R5  | **桌面端功能无移动端** | 🟢 低    | ViewsView.tsx        | Gantt/Board 无响应式             |

### 视口配置问题

```typescript
// layout.tsx 当前配置 ❌
export const viewport = {
  maximumScale: 1, // 禁用缩放
  userScalable: false, // 禁止用户缩放 - 无障碍问题
};

// 建议修复 ✅
export const viewport = {
  maximumScale: 5, // 允许放大 5 倍
  userScalable: true, // 允许用户缩放
};
```

### 触摸目标问题

```typescript
// Button.tsx 当前配置
const sizeStyles = {
  sm: "px-3 py-1.5 text-sm", // ~24px - ❌ 太小
  md: "px-4 py-2 text-sm", // ~32px - ⚠️
  lg: "px-6 py-3 text-base", // ~48px - ✅
};

// 建议: 移动端最小 44px
```

### 良好响应式实践

- ✅ mobile-first 方法: `p-2 sm:p-4 md:p-6`
- ✅ 断点使用正确: `sm:`, `md:`, `lg:`, `xl:`
- ✅ BottomNav 高度 `h-14` (56px) 符合标准
- ✅ `scrollbar-hide` 类处理滚动

---

## 完整问题统计

| 类别       | P1    | P2     | P3    | 总计   |
| ---------- | ----- | ------ | ----- | ------ |
| 交互状态   | 3     | 0      | 0     | 3      |
| UI 组件    | 1     | 4      | 1     | 6      |
| UX 模式    | 0     | 4      | 1     | 5      |
| 视觉一致性 | 0     | 4      | 0     | 4      |
| 响应式     | 1     | 3      | 1     | 5      |
| **总计**   | **5** | **15** | **3** | **23** |
