# Testing Guide

This project uses a clean separation between unit tests (Vitest) and end-to-end tests (Playwright).

## Test Structure

```
tests/
├── phase-1/          # Phase 1 unit tests (Vitest)
├── phase-2/          # Phase 2 unit tests (Vitest)
├── e2e/              # All E2E tests (Playwright)
│   ├── phase-2/      # Phase 2 E2E tests
│   └── *.test.ts     # General E2E tests
├── setup.ts          # Vitest setup file
└── utils/            # Test utilities
```

## Running Tests

### Unit Tests (Vitest)
```bash
# Run all unit tests
pnpm test:unit

# Run unit tests in watch mode
pnpm test:unit:watch

# Run with UI
pnpm test:ui

# Run specific test file
pnpm test tests/phase-2/epic-2.2/unit/repair-ticket-creation.test.ts
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
pnpm test:e2e

# Run with browser UI (headed mode)
pnpm test:e2e:headed

# Run with Playwright UI
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e tests/e2e/auth.test.ts
```

### All Tests
```bash
# Run both unit and E2E tests
pnpm test:all
```

## Configuration

### Unit Tests (Vitest)
- Config: `vitest.config.ts`
- Environment: jsdom
- Excludes: `tests/e2e/**` and `tests/**/e2e/**`
- Includes: `tests/**/*.test.ts` and `src/**/*.test.ts`

### E2E Tests (Playwright)
- Config: `playwright.config.ts`
- Test Directory: `tests/e2e/`
- Base URL: `http://localhost:5174`
- Browsers: Chromium (default)

## Test Categories

### Phase 1 Tests
- Epic 1.1: Supabase Environment Setup
- Epic 1.2: Vietnamese Auth Integration
- Epic 1.3: React Application Foundation

### Phase 2 Tests
- Epic 2.1: Phone-Based Customer System
- Epic 2.2: Repair Workflow Management
- Epic 2.3: Vietnamese Customer Interface

### E2E Test Coverage
- Authentication flows
- Ticket creation and management
- Real-time synchronization
- Vietnamese localization
- Phone-based customer system
- Parts management
- Cost tracking and billing

## Development Workflow

1. **Write unit tests** for business logic, hooks, and utilities
2. **Write E2E tests** for user journeys and integration scenarios
3. **Run tests locally** before committing:
   ```bash
   pnpm test:all
   ```
4. **Fix any failing tests** before pushing changes

## Best Practices

### Unit Tests
- Test business logic in isolation
- Mock external dependencies (Supabase, APIs)
- Focus on edge cases and error handling
- Use Vietnamese test data when relevant

### E2E Tests
- Test complete user workflows
- Use realistic Vietnamese business data
- Include authentication and authorization scenarios
- Test mobile responsiveness when applicable

### Common Issues
- **Playwright/Vitest conflicts**: Fixed by proper directory separation
- **Test isolation**: Each test should be independent
- **Vietnamese data**: Use proper Unicode characters in test data
- **Timing**: Use proper waits in E2E tests, avoid arbitrary timeouts