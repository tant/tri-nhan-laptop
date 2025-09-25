# Biome Linting Error Resolution - Brownfield Addition

## User Story

As a developer working on the Vietnamese Laptop Repair Shop Management System,
I want all Biome linting errors resolved across the codebase,
So that the codebase maintains high code quality standards and passes all linting checks.

## Story Context

**Existing System Integration:**
- Integrates with: Existing Biome configuration in biome.json
- Technology: React 19 + TypeScript with Biome linter
- Follows pattern: Established React/TypeScript best practices
- Touch points: All source files in src/ directory (162 files total)

**Current Error Summary:**
- Total Errors: 140
- Files Affected: ~50+ files
- Main Error Categories: React patterns, TypeScript dependencies, code quality

## Acceptance Criteria

**Functional Requirements:**
1. All 140 Biome linting errors are resolved across the codebase
2. All fixes maintain existing functionality without breaking changes
3. Code follows established React and TypeScript best practices

**Integration Requirements:**
4. Existing React component functionality continues to work unchanged
5. New code patterns follow existing component architecture
6. Integration with Supabase and TanStack Router maintains current behavior
7. All TypeScript types remain consistent with existing schema

**Quality Requirements:**
8. All fixes are covered by existing test suites (no new test failures)
9. Code formatting follows existing Biome configuration standards
10. No regression in application functionality verified through build process

## Technical Analysis

**Error Categories (Priority Order):**

### Critical - React Pattern Violations
- **noArrayIndexKey (6 instances)**: Array indices used as React keys in skeleton loaders
  - Files: `src/components/skeleton-loaders.tsx`
  - Impact: Performance and state consistency issues
  - Fix: Use stable unique identifiers or combine with item properties

### High Priority - Hook Dependencies
- **useExhaustiveDependencies (15+ instances)**: Incorrect dependency arrays in useEffect hooks
  - Files: Multiple components (TicketAssignment, workflow components)
  - Impact: Stale closures, infinite re-renders, logic bugs
  - Fix: Add missing dependencies or use useCallback for stable references

### Medium Priority - Code Cleanliness
- **noUnusedVariables (40+ instances)**: Unused imports and variables
  - Files: Throughout src/ directory
  - Impact: Bundle size, code maintainability
  - Fix: Remove unused imports/variables or prefix with underscore if needed

### Low Priority - Code Quality
- **noUndeclaredVariables (20+ instances)**: References to undefined variables
  - Files: Various components and hooks
  - Impact: Runtime errors, type safety
  - Fix: Proper import statements or variable declarations

## Implementation Approach

**Phase 1: Critical Fixes (skeleton-loaders.tsx)**
- Fix noArrayIndexKey errors by using unique identifiers
- Ensure skeleton components maintain visual consistency

**Phase 2: Hook Dependency Fixes**
- Systematically fix useEffect dependency arrays
- Use useCallback/useMemo where appropriate for stable references
- Ensure no infinite re-render loops are introduced

**Phase 3: Cleanup (unused variables/imports)**
- Remove or properly reference unused variables
- Clean up import statements
- Maintain existing API contracts

**Phase 4: Variable Declaration Fixes**
- Add missing imports
- Declare undefined variables properly
- Ensure type safety is maintained

## Technical Notes

- **Integration Approach:** Incremental fixes maintaining existing functionality
- **Existing Pattern Reference:** Follow current React hooks patterns in use-repair-workflow.ts and other hooks
- **Key Constraints:**
  - Must not break existing Vietnamese business logic
  - All database integration patterns must remain unchanged
  - Biome configuration remains as-is (no rule modifications)

## Definition of Done

- [ ] All 140 Biome linting errors are resolved
- [ ] `pnpm run lint` passes without errors
- [ ] `pnpm run build` succeeds without new TypeScript errors
- [ ] Existing functionality regression tested via manual spot-checking
- [ ] Code follows existing patterns and standards
- [ ] No new console errors or warnings in development
- [ ] Tests pass (existing unit tests)

## Risk Assessment

**Primary Risk:** Introducing bugs while fixing dependency arrays and unused variables
**Mitigation:**
- Fix errors incrementally by file/component
- Test each major component after fixes
- Use TypeScript compiler to catch type issues

**Rollback:** Git commit each phase separately for easy selective rollback

**Compatibility Verification:**
- [ ] No breaking changes to existing React component APIs
- [ ] Database integration hooks maintain existing behavior
- [ ] UI components follow existing design patterns
- [ ] Performance impact is negligible (should improve slightly)

## Success Criteria

1. ✅ Biome linting passes completely (`pnpm run lint` exits with code 0)
2. ✅ Application builds and runs without new errors
3. ✅ All existing functionality verified working
4. ✅ Code quality improved without architectural changes
5. ✅ Development workflow enhanced (no linting noise)

## Development Session Estimation

**Time Estimate:** 3-4 hours focused work
- Phase 1: 30 minutes (skeleton fixes)
- Phase 2: 2 hours (hook dependencies)
- Phase 3: 1 hour (cleanup)
- Phase 4: 30 minutes (variable declarations)
- Testing: 30 minutes verification

**Session Scope:** Single development session with incremental commits per phase