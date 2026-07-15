# Contributing to AI PR Reviewer

Thank you for considering contributing to AI PR Reviewer! This document provides guidelines and instructions for contributing.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/AI_PR_REVIEWER.git
   cd AI_PR_REVIEWER
   ```
3. Set up the development environment as described in [README.md](README.md#getting-started)
4. Create a branch for your changes:
   ```bash
   git checkout -b type/description-of-change
   ```

## Development Workflow

### Branch Naming

Use descriptive, hyphen-separated branch names with a type prefix:

- `fix/` — Bug fixes
- `feat/` — New features
- `enhance/` — Enhancements to existing features
- `refactor/` — Code refactoring
- `docs/` — Documentation changes
- `accessibility/` — Accessibility improvements
- `perf/` — Performance optimizations
- `chore/` — Maintenance tasks

Examples:
- `fix/webhook-signature-verification`
- `feat/review-export-markdown`
- `docs/improve-installation-guide`

### Make Changes

1. Keep changes focused on a single issue
2. Follow the existing code style
3. Add or update tests if applicable
4. Verify the build passes: `npm run build`

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]
```

Types:
- `fix:` — A bug fix
- `feat:` — A new feature
- `enhance:` — Enhancement to existing feature
- `refactor:` — Code refactoring
- `docs:` — Documentation changes
- `style:` — Formatting, missing semicolons, etc.
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

Examples:
```
fix: resolve sidebar overflow on mobile devices
feat: add cursor-based pagination for reviews
docs: improve local setup instructions
refactor: extract webhook verification into shared utility
```

## Pull Request Process

1. Ensure your branch is up to date with the latest `master`
2. Run the build to verify no errors: `npm run build`
3. Create a pull request with a clear title and description
4. Link any related issues using "Closes #issue-number"
5. Wait for review and address any feedback

### PR Checklist

Before submitting, ensure:
- [ ] Code follows project conventions
- [ ] Changes are focused on a single issue
- [ ] Build passes without errors
- [ ] No unrelated changes included
- [ ] Responsive design considered (if UI change)
- [ ] Accessibility considered (if UI change)
- [ ] Documentation updated (if applicable)

## Code Style

- **TypeScript**: Strict mode, prefer types over interfaces for simple shapes
- **React**: Use functional components with hooks, prefer server components where possible
- **CSS**: Use Tailwind CSS utility classes; avoid custom CSS unless necessary
- **Imports**: Use `@/` path alias for project files; group imports by: external → internal → relative
- **Formatting**: Use consistent indentation (tabs preferred); no trailing whitespace

### Server Actions

- Use `"use server"` directive at the top
- Always authenticate via `auth.api.getSession()` with `headers()`
- Return structured responses with `{ success: boolean, error?: string }`
- Use `revalidatePath()` to invalidate caches after mutations

### File Organization

```
module/
  feature-name/
    actions/     — Server actions
    components/  — Client components
    hooks/       — React hooks
    lib/         — Utility functions
```

## Testing

- Run the build to verify TypeScript compilation:
  ```bash
  npm run build
  ```
- Run linting:
  ```bash
  npm run lint
  ```
- Manually test UI changes in both light and dark modes
- Verify responsive layouts at mobile (375px), tablet (768px), and desktop (1280px+)

## Issue Reporting

### Bug Reports

Include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment (browser, OS, Node.js version)

### Feature Requests

Include:
- Clear description of the proposed feature
- Use case and motivation
- Possible implementation approach (optional)

## Questions?

Open a discussion or issue for any questions about contributing.
