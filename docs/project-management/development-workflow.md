# Development Workflow & Team Processes
**Project:** Vietnamese Laptop Repair Shop Management System
**Established:** Sprint 1, Day 1
**Purpose:** Define consistent development practices for team efficiency

## 🌊 Git Workflow Strategy

### Branch Structure
```
main (production-ready)
├── develop (integration branch)
├── feature/epic-01-docker-setup
├── feature/epic-01-supabase-config
├── feature/epic-02-ticket-workflow
├── hotfix/critical-bug-fix
```

### Branching Rules
- **main:** Production-ready code only
- **develop:** Integration branch for completed features
- **feature/*:** Individual user story development
- **hotfix/*:** Critical production fixes

### Branch Naming Convention
```bash
feature/epic-[number]-[description]
feature/epic-01-docker-setup
feature/epic-02-ticket-creation
feature/epic-03-customer-portal

bugfix/[issue-description]
bugfix/auth-session-timeout

hotfix/[critical-issue]
hotfix/database-connection-leak
```

## 🔄 Daily Development Cycle

### Morning Routine (9:00 AM)
1. **Pull Latest Changes**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Start Development Environment**
   ```bash
   make dev
   # Wait for all services to start
   make dev-logs  # Check for any startup errors
   ```

3. **Daily Standup** (15 minutes)
   - What I completed yesterday
   - What I'm working on today
   - Any blockers or help needed
   - Sprint goal progress check

### Development Work (9:15 AM - 5:00 PM)

#### Feature Development Process
1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/epic-01-docker-setup
   ```

2. **Make Changes with Regular Commits**
   ```bash
   # Work on specific acceptance criteria
   git add .
   git commit -m "feat(epic-01): implement Docker multi-stage build"

   # Continue development
   git add .
   git commit -m "feat(epic-01): add volume mounting for hot reload"
   ```

3. **Regular Testing**
   ```bash
   # Run tests frequently
   pnpm test
   pnpm lint
   pnpm build

   # Validate environment
   make dev-logs
   ```

### End of Day Routine (5:00 PM)
1. **Commit Work in Progress**
   ```bash
   git add .
   git commit -m "wip(epic-01): Docker configuration 80% complete"
   git push origin feature/epic-01-docker-setup
   ```

2. **Update Sprint Progress**
   - Mark completed acceptance criteria
   - Update daily deliverables checklist
   - Note any blockers for tomorrow

3. **Clean Shutdown**
   ```bash
   make dev-down
   ```

## 🔍 Code Review Process

### Pull Request Requirements
- [ ] All acceptance criteria completed
- [ ] Tests passing (`pnpm test`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Build successful (`pnpm build`)
- [ ] No console errors in browser
- [ ] Vietnamese text properly displayed
- [ ] Mobile responsive (test on small screen)

### Pull Request Template
```markdown
## Epic/Story
**Epic:** [Epic number and name]
**Story:** [Story number and name]

## Changes Made
- [List of changes]
- [Acceptance criteria addressed]

## Testing Performed
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Mobile responsiveness verified
- [ ] Vietnamese localization verified

## Screenshots (if UI changes)
[Add screenshots showing before/after]

## Notes for Reviewer
[Any specific areas to focus on]
```

### Review Checklist
- [ ] Code follows TypeScript best practices
- [ ] Vietnamese text uses consistent terminology
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Documentation updated if needed

## 🧪 Testing Strategy

### Test Types & When to Run
1. **Unit Tests:** Before every commit
   ```bash
   pnpm test
   ```

2. **Integration Tests:** Before pull request
   ```bash
   pnpm test:integration
   ```

3. **E2E Tests:** Before merging to develop
   ```bash
   pnpm test:e2e
   ```

4. **Manual Testing:** Daily during development
   - Test Vietnamese UI text
   - Verify mobile responsiveness
   - Check Docker services health

### Testing Environment
- **Development:** Local Docker setup
- **Staging:** Clean environment for integration testing
- **Production:** Reserved for release validation

## 📊 Quality Gates

### Before Committing
- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Unit tests pass

### Before Pull Request
- [ ] All acceptance criteria met
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Performance acceptable

### Before Merging to Develop
- [ ] Code review approved
- [ ] All tests pass in CI
- [ ] No merge conflicts
- [ ] Sprint goal alignment verified

### Before Release
- [ ] E2E tests pass
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Vietnamese localization verified

## 🔧 Development Tools & Standards

### Code Editor Setup
- **VSCode Extensions Required:**
  - TypeScript and JavaScript Language Features
  - Prettier - Code formatter
  - ESLint
  - Docker
  - GitLens

### Code Style Standards
```typescript
// File naming: kebab-case
// customer-management.tsx
// repair-ticket-workflow.ts

// Component naming: PascalCase
export const CustomerManagement: React.FC = () => {
  // Vietnamese comments for business logic
  // Tạo khách hàng mới từ thông tin phiếu sửa chữa
  const createCustomerFromTicket = () => {
    // Implementation
  }
}

// Type naming: PascalCase with descriptive names
interface RepairTicketData {
  id: string
  customerId: string
  deviceInfo: DeviceInformation
  repairStatus: RepairStatus
}
```

### Vietnamese Localization Standards
```typescript
// Use consistent Vietnamese terminology
const UI_TEXT = {
  customer: 'Khách hàng',
  repairTicket: 'Phiếu sửa chữa',
  parts: 'Linh kiện',
  employee: 'Nhân viên',
  shopOwner: 'Chủ cửa hàng'
}

// Date formatting for Vietnam
const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN')
}
```

## 📱 Device Testing Requirements

### Desktop Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Minimum resolution: 1024x768

### Mobile Testing
- [ ] Chrome Mobile
- [ ] Safari Mobile (iOS)
- [ ] Responsive breakpoints: 320px, 768px, 1024px
- [ ] Touch interactions working

### Performance Requirements
- [ ] Page load time < 3 seconds
- [ ] No memory leaks in long sessions
- [ ] Smooth animations (60fps)
- [ ] Offline functionality (PWA features)

## 🚨 Emergency Procedures

### Critical Bug Process
1. **Immediate Response**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-issue-description
   # Fix the issue
   git commit -m "hotfix: fix critical database connection issue"
   ```

2. **Fast Track Review**
   - Skip normal review process for critical fixes
   - Test thoroughly in staging
   - Deploy immediately after validation

3. **Post-Fix Actions**
   - Update documentation
   - Add regression tests
   - Conduct post-mortem if needed

### Development Environment Issues
1. **Docker Problems**
   ```bash
   make clean      # Clean all Docker resources
   make dev        # Restart fresh environment
   ```

2. **Database Issues**
   ```bash
   make db-reset   # Reset database to clean state
   # Re-run initialization scripts
   ```

3. **Escalation Path**
   - Try documented troubleshooting first
   - Ask team for help in daily standup
   - Escalate to architecture review if needed

---

## 🎯 Success Metrics

### Daily Success Indicators
- All team members can start development in <5 minutes
- No merge conflicts due to workflow issues
- Consistent code quality across all contributions
- Vietnamese text appears correctly on all devices

### Sprint Success Indicators
- All planned features completed on time
- Zero critical bugs in sprint deliverables
- Team velocity increasing over time
- Environment setup time decreasing

**This workflow ensures consistent, high-quality development while maintaining the Vietnamese business focus of our laptop repair shop system! 🛠️**