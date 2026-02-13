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
