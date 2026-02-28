# UI Components Documentation

This document describes all UI components available in Plan Todos, including animation components and data visualization charts.

## Table of Contents

- [Animation Components](#animation-components)
  - [RippleEffect](#rippleeffect)
  - [StaggeredList](#staggeredlist)
  - [HoverCard](#hovercard)
  - [PageSlide](#pageslide)
- [Chart Components](#chart-components)
  - [GaugeChart](#gaugechart)
  - [TrendChart](#trendchart)
  - [HeatmapCalendar](#heatmapcalendar)
  - [DistributionChart](#distributionchart)
- [Theme Support](#theme-support)

---

## Animation Components

### RippleEffect

Click ripple animation for buttons and interactive elements.

**Usage:**

```tsx
import { RippleEffect } from "@/components/ui/animations";

<RippleEffect>
  <button className="px-4 py-2 bg-primary">Click Me</button>
</RippleEffect>;
```

**Props:**

| Prop        | Type                      | Default                      | Description            |
| ----------- | ------------------------- | ---------------------------- | ---------------------- |
| `children`  | `ReactNode`               | required                     | Child element to wrap  |
| `className` | `string`                  | `""`                         | Additional CSS classes |
| `color`     | `string`                  | `"rgba(255, 255, 255, 0.4)"` | Ripple color           |
| `onClick`   | `(e: MouseEvent) => void` | -                            | Click handler          |

---

### StaggeredList

Staggered entrance animations for list items.

**Usage:**

```tsx
import { StaggeredList, StaggeredListItem } from "@/components/ui/animations";

<StaggeredList staggerDelay={50} animationDuration={0.3}>
  <StaggeredListItem>Item 1</StaggeredListItem>
  <StaggeredListItem>Item 2</StaggeredListItem>
  <StaggeredListItem>Item 3</StaggeredListItem>
</StaggeredList>;
```

**Props - StaggeredList:**

| Prop                | Type        | Default  | Description                  |
| ------------------- | ----------- | -------- | ---------------------------- |
| `children`          | `ReactNode` | required | List items                   |
| `className`         | `string`    | `""`     | Container CSS classes        |
| `staggerDelay`      | `number`    | `50`     | Delay between items (ms)     |
| `animationDuration` | `number`    | `0.3`    | Animation duration (seconds) |

---

### HoverCard

Enhanced card with hover effects including elevation and glow.

**Usage:**

```tsx
import { HoverCard } from "@/components/ui/animations";

<HoverCard hoverElevation={-4} glowOnHover={true} className="p-4">
  <h3>Card Title</h3>
  <p>Card content</p>
</HoverCard>;
```

**Props:**

| Prop             | Type            | Default  | Description                     |
| ---------------- | --------------- | -------- | ------------------------------- |
| `children`       | `ReactNode`     | required | Card content                    |
| `className`      | `string`        | `""`     | Additional CSS classes          |
| `hoverElevation` | `number`        | `-4`     | Vertical movement on hover (px) |
| `glowOnHover`    | `boolean`       | `true`   | Enable glow effect              |
| `style`          | `CSSProperties` | -        | Inline styles                   |

---

### PageSlide

Page transition animation wrapper.

**Usage:**

```tsx
import { PageSlide } from "@/components/ui/animations";

<PageSlide direction="up" duration={0.4}>
  <div>Page content</div>
</PageSlide>;
```

**Props:**

| Prop        | Type                                  | Default  | Description                  |
| ----------- | ------------------------------------- | -------- | ---------------------------- |
| `children`  | `ReactNode`                           | required | Page content                 |
| `className` | `string`                              | `""`     | Additional CSS classes       |
| `direction` | `"left" \| "right" \| "up" \| "down"` | `"up"`   | Slide direction              |
| `duration`  | `number`                              | `0.4`    | Animation duration (seconds) |

---

## Chart Components

### GaugeChart

Circular progress indicator with animated fill.

**Usage:**

```tsx
import { GaugeChart } from "@/components/ui/charts";

<GaugeChart
  value={75}
  size="md"
  label="Completion Rate"
  color="var(--color-primary)"
  animated={true}
/>;
```

**Props:**

| Prop             | Type                   | Default                  | Description            |
| ---------------- | ---------------------- | ------------------------ | ---------------------- |
| `value`          | `number`               | required                 | Progress value (0-100) |
| `size`           | `"sm" \| "md" \| "lg"` | `"md"`                   | Chart size             |
| `color`          | `string`               | `var(--color-primary)`   | Primary color          |
| `secondaryColor` | `string`               | `var(--color-secondary)` | Gradient end color     |
| `showValue`      | `boolean`              | `true`                   | Show value in center   |
| `animated`       | `boolean`              | `true`                   | Enable animation       |
| `label`          | `string`               | -                        | Label below chart      |

---

### TrendChart

Line/area/bar chart for trend visualization.

**Usage:**

```tsx
import { TrendChart } from "@/components/ui/charts";

const data = [
  { date: "2024-01", value: 10 },
  { date: "2024-02", value: 25 },
  { date: "2024-03", value: 18 },
];

<TrendChart
  data={data}
  type="area"
  color="var(--color-primary)"
  showGrid={true}
  animated={true}
  height={200}
/>;
```

**Props:**

| Prop       | Type                        | Default                | Description            |
| ---------- | --------------------------- | ---------------------- | ---------------------- |
| `data`     | `TrendData[]`               | required               | Array of {date, value} |
| `type`     | `"line" \| "area" \| "bar"` | `"line"`               | Chart type             |
| `color`    | `string`                    | `var(--color-primary)` | Chart color            |
| `showGrid` | `boolean`                   | `true`                 | Show grid lines        |
| `animated` | `boolean`                   | `true`                 | Enable animation       |
| `height`   | `number`                    | `200`                  | Chart height (px)      |

---

### HeatmapCalendar

GitHub-style activity heatmap.

**Usage:**

```tsx
import { HeatmapCalendar } from "@/components/ui/charts";

const data = [
  { date: "2024-01-01", count: 5 },
  { date: "2024-01-02", count: 0 },
  { date: "2024-01-03", count: 8 },
];

<HeatmapCalendar
  data={data}
  months={6}
  color="var(--color-primary)"
  onCellClick={(date) => console.log(date)}
/>;
```

**Props:**

| Prop          | Type                     | Default                | Description              |
| ------------- | ------------------------ | ---------------------- | ------------------------ |
| `data`        | `HeatmapData[]`          | required               | Array of {date, count}   |
| `months`      | `number`                 | `6`                    | Number of months to show |
| `color`       | `string`                 | `var(--color-primary)` | Base color               |
| `onCellClick` | `(date: string) => void` | -                      | Cell click handler       |

---

### DistributionChart

Horizontal bar chart showing distribution of values across categories.

**Usage:**

```tsx
import { DistributionChart } from "@/components/ui/charts";

const data = [
  { label: "Completed", value: 45, color: "#22c55e" },
  { label: "In Progress", value: 30, color: "#3b82f6" },
  { label: "Pending", value: 25, color: "#f59e0b" },
];

<DistributionChart
  data={data}
  title="Task Distribution"
  showValues={true}
  animated={true}
/>;
```

**Props:**

| Prop             | Type                 | Default  | Description                     |
| ---------------- | -------------------- | -------- | ------------------------------- |
| `data`           | `DistributionItem[]` | required | Array of {label, value, color?} |
| `title`          | `string`             | -        | Chart title                     |
| `showValues`     | `boolean`            | `true`   | Show values on bars             |
| `showPercentage` | `boolean`            | `true`   | Show percentages                |
| `animated`       | `boolean`            | `true`   | Enable animation                |
| `maxHeight`      | `number`             | `300`    | Max container height (px)       |

---

## Theme Support

All components support the 9 themes via CSS variables:

### Available Themes

1. **light** - Default light theme
2. **dark** - Dark mode
3. **dracula** - Dracula color scheme
4. **nord** - Nord color palette
5. **monokai** - Monokai theme
6. **glass** - Glassmorphism effects
7. **spring** - Spring festival theme
8. **catppuccin** - Catppuccin palette
9. **tokyoNight** - Tokyo Night theme
10. **oneDark** - One Dark theme

### CSS Variables

Components use these CSS variables for theming:

```css
/* Colors */
--color-primary: Primary brand color --color-secondary: Secondary accent color
  --color-bg: Background color --color-bg-card: Card background
  --color-text: Primary text --color-text-muted: Secondary text
  --color-border: Border color /* Shadows */ --shadow-sm: Small shadow
  --shadow-md: Medium shadow --shadow-lg: Large shadow --shadow-xl: Extra large
  shadow --shadow-glow: Glow effect /* Animation */
  --animation-easing-spring: cubic-bezier(0.22, 1, 0.36, 1)
  --animation-easing-smooth: cubic-bezier(0.4, 0, 0.2, 1)
  --animation-duration-fast: 150ms --animation-duration-normal: 250ms
  --animation-duration-slow: 400ms /* Glass Effects */ --glass-blur: Blur amount
  --glass-opacity: Transparency --glass-border-glow: Border glow
  --glass-inner-shadow: Inner shadow;
```

### Usage Example

```tsx
// Component automatically uses theme colors
<GaugeChart
  value={75}
  color="var(--color-primary)"  // Uses current theme primary
/>

// Override for specific use case
<GaugeChart
  value={75}
  color="#ff0000"  // Custom color
/>
```

---

## Best Practices

1. **Animation Performance**
   - Use `will-change` on animated elements
   - Prefer `transform` and `opacity` for animations
   - Test on low-end devices

2. **Chart Data**
   - Memoize data with `useMemo` for large datasets
   - Use proper date formatting for time-based charts
   - Handle empty states gracefully

3. **Accessibility**
   - Charts include `role="img"` and `aria-label`
   - Interactive elements have proper focus states
   - Color contrast meets WCAG standards

4. **Responsive Design**
   - Charts adapt to container width
   - Use `maxHeight` to prevent overflow
   - Test on mobile devices
