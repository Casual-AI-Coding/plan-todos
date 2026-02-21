# AGENTS.md - Developer Guide for plan-todos

## Project Overview

This is a full-stack TypeScript application using Next.js (App Router), SQLite database, and Vitest for testing.

## Build, Lint & Test Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Testing
```bash
npm run test              # Run all tests once
npm run test -- src/path/to/file.test.ts    # Run single test file
npm run test -- --watch  # Run tests in watch mode
npm run test -- --watchAll  # Watch all test files
npm run test -- --run     # Run tests once (non-watch, for CI)
```

### Linting & Formatting
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors automatically
npm run format           # Format code with Prettier
npm run typecheck        # Run TypeScript type checking
```

### Database (Prisma)
```bash
npx prisma studio        # Open Prisma database GUI
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma db seed       # Seed database with initial data
```

### Code Quality
```bash
npm run commit           # Interactive commit with Conventional Commits
```

---

## Code Style Guidelines

### TypeScript Configuration

All TypeScript code should follow strict mode guidelines:
- Enable `strict: true` in tsconfig.json
- Use explicit return types for exported functions
- Prefer `interface` over `type` for object shapes
- Use `unknown` instead of `any`; narrow types before use

### Imports Organization

Organize imports in the following order (separate with blank lines):

```typescript
// 1. Node.js built-ins
import path from 'path';
import fs from 'fs';

// 2. External libraries
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { useState } from 'react';

// 3. Internal modules (absolute imports)
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// 4. Relative imports (../, ./)
import { Button } from '@/components/ui/button';
import styles from './page.module.css';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `UserProfile.tsx` |
| Files (utils/hooks) | camelCase | `useAuth.ts` |
| Files (config) | kebab-case | `firebase-config.ts` |
| Functions | camelCase | `getUserById()` |
| Components | PascalCase | `UserProfile` |
| Hooks | camelCase (prefix `use`) | `useAuth` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Enums | PascalCase | `UserRole` |
| Enum Values | PascalCase | `UserRole.Admin` |
| Database Fields | snake_case | `created_at` |
| CSS Classes | kebab-case | `.main-container` |

### Component Structure

Follow this structure for React/Next.js components:

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types (if needed)
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// 3. Component definition
export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // 4. State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 5. Effects
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  // 6. Event handlers
  const handleSubmit = async () => {
    // ...
  };

  // 7. Render
  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  );
}
```

### Error Handling

Use structured error handling patterns:

```typescript
// 1. Custom error classes for domain errors
class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

// 2. Try-catch with typed errors
async function getUser(id: string): Promise<User> {
  try {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User', id);
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new Error('Failed to fetch user');
  }
}

// 3. Error boundaries for React components
// Use Next.js error.tsx for route-level error handling
```

### Database (Prisma) Patterns

```typescript
// 1. Always use transactions for multi-step operations
const [user, account] = await db.$transaction([
  db.user.create({ data: userData }),
  db.account.create({ data: accountData }),
]);

// 2. Use select/include for optimized queries
const user = await db.user.findUnique({
  where: { id },
  include: { posts: true }, // Only include needed relations
});

// 3. Use batch operations for bulk updates
await db.user.updateMany({
  where: { role: 'INACTIVE' },
  data: { status: 'ARCHIVED' },
});
```

### API Routes (Next.js)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await db.user.create({ data: parsed.data });
  return NextResponse.json(user, { status: 201 });
}
```

### Testing Guidelines (Vitest)

```typescript
// 1. Follow AAA pattern (Arrange, Act, Assert)
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 'user-123';
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({ id: userId }));
    });

    it('should throw NotFoundError when user not found', async () => {
      await expect(userService.getUserById('invalid')).rejects.toThrow(NotFoundError);
    });
  });
});
```

### File Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Route groups
│   │   ├── page.tsx       # Page component
│   │   └── layout.tsx     # Layout
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   └── features/          # Feature-specific components
├── lib/                   # Utilities and configurations
│   ├── db.ts              # Database client
│   ├── auth.ts            # Authentication
│   └── utils.ts           # Helper functions
├── types/                  # TypeScript type definitions
└── styles/                # Global styles
```

### Git Commit Messages

Follow Conventional Commits:

```
feat: add user registration
fix: resolve login redirect issue
docs: update API documentation
refactor: simplify user service
test: add unit tests for auth
chore: update dependencies
```

### Git Workflow

#### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<ticket-id>-<short-description>` | `feature/TODO-123-add-calendar-view` |
| Bugfix | `fix/<ticket-id>-<short-description>` | `fix/TODO-456-fix-todo-creation-error` |
| Hotfix | `hotfix/<ticket-id>-<short-description>` | `hotfix/TODO-789-crash-on-startup` |
| Refactor | `refactor/<scope>-<short-description>` | `refactor/db-move-to-sqlite` |
| Docs | `docs/<short-description>` | `docs/add-api-documentation` |

#### Branch Protection

- `main` - Protected, requires PR
- `develop` - Integration branch
- Feature branches - From `develop`

#### Workflow

```bash
# 1. Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/TODO-123-add-calendar-view

# 2. Work and commit (use npm run commit for conventional commits)
git add .
npm run commit

# 3. Keep branch updated
git fetch origin
git rebase origin/develop

# 4. Push and create PR
git push -u origin feature/TODO-123-add-calendar-view
# Then create PR via GitHub CLI or web UI
```

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Example:

```
feat(todo): add due date reminder feature

- Add reminder settings to todo creation
- Support 5min/15min/30min/1hour/1day before options
- Integrate with notification system

Closes #123
```

#### Allowed Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependencies |
| `ci` | CI configuration |
| `build` | Build system changes |

#### Git Commands Best Practices

```bash
# Never force push to main/develop
git push --force-with-lease  # Safer alternative if needed

# Interactive rebase for clean history
git rebase -i HEAD~3  # Squash last 3 commits

# Stash changes properly
git stash push -m "WIP: working on feature X"

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all uncommitted changes
git checkout -- .
git clean -fd
```

#### Using git-master Skill

For complex git operations, use the `git-master` skill:

```bash
# Atomic commits, rebase/squash, history search (blame, bisect, log -S)
# Recommended for: commit, rebase, squash, who wrote, when was X added
```

#### Version Management

**Version Format:** `Major.Minor.Patch` (遵循 Semantic Versioning)

| 版本类型 | 说明 | 示例 |
|----------|------|------|
| Major (主版本) | 不兼容的 API 变更 | 1.0.0 → 2.0.0 |
| Minor (次版本) | 新功能 (向后兼容) | 0.3.8 → 0.4.0 |
| Patch (补丁版本) | Bug 修复 (向后兼容) | 0.3.8 → 0.3.9 |
| Pre-release | 预发布版本 | 0.3.9-beta.1 |
| Build Metadata | 构建元数据 | 0.3.9+build.123 |

**版本号递增规则:**
- 首位 (Major): 重大架构变更、不兼容的 API 变更
- 次位 (Minor): 新功能添加、向后兼容的功能变更
- 三位 (Patch): Bug 修复、文档更新、小优化

---

### 发布流程 (Release Checklist)

**发版本前必须完成的检查清单:**

| # | 操作 | 命令/说明 |
|---|------|-----------|
| 1 | 本地测试全部通过 | `npm run test` |
| 2 | 测试覆盖率 >= 90% | `npm run test:coverage` |
| 3 | 类型检查 | `npm run typecheck` |
| 4 | ESLint 检查 | `npm run lint` |
| 5 | 代码格式化 | `npm run format` |
| 6 | 构建测试 | `npm run build` |
| 7 | 检查文档是否需要更新 | 检查 CHANGELOG.md、AGENTS.md |

**发版本需要修改的文件:**

| 文件 | 修改内容 |
|------|----------|
| `package.json` | 更新 `"version": "x.x.x"` |
| `src-tauri/tauri.conf.json` | 更新 `"version": "x.x.x"` |
| `src-tauri/Cargo.toml` | 更新 `version = "x.x.x"` |
| `CHANGELOG.md` | 添加新版本发布说明 |

**发布步骤:**

```bash
# 1. 修改版本号 (package.json)
# 2. 修改版本号 (src-tauri/tauri.conf.json)
# 3. 修改版本号 (src-tauri/Cargo.toml)
# 4. 更新 CHANGELOG.md
# 5. 检查文档是否需要更新

# 5. 提交更改
git add -A
git commit -m "release: bump version to x.x.x"

# 5. 创建 tag (Major/Minor/Patch 版本会触发 Release CI)
git tag -a v{x.x.x} -m "Release v{x.x.x}"

# 6. 推送 tag
git push origin v{x.x.x}
```

**Hotfix 版本:**
- 使用 `-1` 后缀: `v0.3.9-1`
- 适用于严重 bug 需要立即修复的场景
- **注意**: Hotfix 不会自动触发 Release CI (只触发 `v*` 但版本不匹配)

### 版本发布审批规则

**禁止未经审批擅自发布版本。**

```
发布版本前必须满足以下条件:

1. ✅ 所有验收标准已通过 (查看迭代设计文档中的验收标准)
2. ✅ 用户/产品负责人明确批准发布
3. ✅ 本地测试全部通过 (npm run test)
4. ✅ 类型检查通过 (npm run typecheck)
5. ✅ 代码格式化通过 (npm run format)
6. ✅ 构建测试通过 (npm run build - 前端; tauri build - 桌面端)

违规处理:
- 未经审批擅自发布 → 回滚版本并修复
- 跳过验收标准 → 回滚版本并补全验收
```

---

## Testing Guidelines

### Test Coverage Requirement

**Minimum coverage: 90%**

Run coverage report:
```bash
npm run test:coverage
```

Ensure coverage meets threshold before committing.

### Testing Commands

```bash
npm run test              # Run all tests once
npm run test -- src/path/to/file.test.ts    # Run single test file
npm run test -- --watch  # Run tests in watch mode
npm run test -- --run     # Run tests once (non-watch, for CI)
npm run test:coverage    # Run tests with coverage report
```

---

## Verification Checklist

Before marking any work as complete:

- [ ] All tests pass (`npm run test`)
- [ ] Test coverage >= 90% (`npm run test:coverage`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Build succeeds (`npm run build`)

---

## Documentation Guidelines

### File Location

**设计文档**保存在 `docs/plans/` 目录：
- `docs/plans/*.md` - 各模块最新设计文档
- `docs/plans/v1/` - 历史版本归档

### Version Control Rules

1. **更新独立设计文档**
   - 各模块设计文档保持在根目录
   - 如 `database-schema.md`、`api-design.md` 等

2. **历史归档到子目录**
   - 创建版本子目录如 `v1/`, `v2/`
   - 将完整旧版本设计移动到归档目录
   - 文件名包含版本号如 `2026-02-13-todo-plan-design-v1.md`

### Example

```
docs/plans/
├── navigation-ui-design.md    # 最新 UI 设计
├── core-concepts.md          # 最新核心概念
├── database-schema.md       # 最新数据库设计
├── api-design.md            # 最新 API 设计
├── component-design.md      # 最新组件设计
├── v1/
│   └── 2026-02-13-todo-plan-design-v1.md  # 旧版归档
└── v2/                      # 未来版本
```
