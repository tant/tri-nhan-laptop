# Vietnamese Laptop Repair Management System Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Replace existing WordPress-based system with a modern, integrated repair shop management solution
- Streamline repair workflow from device intake to completion with 16-state status tracking
- Provide public repair status lookup system for customers without requiring authentication
- Enable efficient staff management with role-based access (Admin/Staff)
- Implement automated ticket code generation (LRP-YYYY-######) with proper sequencing
- Support real-time status updates and internal communication between staff members
- Create foundation for future features like inventory management and partner collaboration

### Background Context
This system serves a small Vietnamese laptop repair shop (<10 employees) currently using WordPress for business operations. The shop provides four main services: laptop repair (primary business), buying/selling used laptops and parts, repair training courses, and partnership services with other shops. The new system needs to replace the entire existing infrastructure while maintaining Vietnamese language support and local business practices like using phone numbers as customer primary keys.

The solution will be built as a modern web application with local Supabase development environment, designed to handle the complete repair lifecycle from initial device receipt through completion and warranty tracking.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-01-25 | 1.0 | Initial PRD creation | John (PM) |

## Requirements

### Functional Requirements

#### Core Repair Management
- **REQ-001**: System SHALL implement a 16-state repair workflow (Device Received → Assessment → Quote Provided → Approved → Parts Ordered → In Progress → Testing → Quality Check → Completed → Ready for Pickup → Delivered → Paid → Closed → Cancelled → On Hold → Warranty)
- **REQ-002**: System SHALL auto-generate unique ticket codes in format LRP-YYYY-XXXXXX using database sequences
- **REQ-003**: System SHALL provide real-time status updates via Supabase realtime subscriptions
- **REQ-004**: System SHALL support photo attachments for repair documentation with private storage
- **REQ-005**: System SHALL track repair history and warranty information per device

#### Customer Management
- **REQ-006**: System SHALL use phone numbers as primary customer identifiers (Vietnamese business practice)
- **REQ-007**: System SHALL automatically create customer records when first repair ticket is submitted
- **REQ-008**: System SHALL maintain complete repair history per customer
- **REQ-009**: System SHALL provide public repair status lookup without authentication requirements

#### Inventory & Parts Management
- **REQ-010**: System SHALL maintain parts catalog with laptop model compatibility tracking
- **REQ-011**: System SHALL log parts usage in repairs with pricing information
- **REQ-012**: System SHALL monitor current inventory levels (foundation for future expansion)

#### Staff Management & Authentication
- **REQ-013**: System SHALL support role-based access with Shop Owner (admin) and Staff roles
- **REQ-014**: System SHALL integrate with Supabase Auth with Vietnamese error messages
- **REQ-015**: System SHALL track staff assignments per repair ticket
- **REQ-016**: System SHALL enforce Row Level Security policies for data access control

#### Business Analytics
- **REQ-017**: System SHALL provide business metrics including revenue, repair counts, and popular devices
- **REQ-018**: System SHALL display repair status distribution with visual breakdown
- **REQ-019**: System SHALL track repair completion times and success rates

### Non-Functional Requirements

#### Performance & Scalability
- **NFR-001**: System SHALL support <10 concurrent users (small shop requirement)
- **NFR-002**: System SHALL respond to user interactions within 2 seconds
- **NFR-003**: System SHALL handle 1000+ repair tickets without performance degradation

#### Localization & Usability
- **NFR-004**: System SHALL display all user interface text in Vietnamese language
- **NFR-005**: System SHALL format dates/times according to Vietnamese locale (Asia/Ho_Chi_Minh)
- **NFR-006**: System SHALL format currency in Vietnamese Dong (VND)
- **NFR-007**: System SHALL provide intuitive interface suitable for non-technical staff

#### Security & Compliance
- **NFR-008**: System SHALL implement comprehensive Row Level Security policies
- **NFR-009**: System SHALL protect customer data with appropriate access controls
- **NFR-010**: System SHALL use secure authentication via Supabase Auth
- **NFR-011**: System SHALL store sensitive files in private Supabase storage buckets

#### Technical Architecture
- **NFR-012**: System SHALL be built as modern web application using React 19 + TypeScript
- **NFR-013**: System SHALL use Supabase for backend services (database, auth, storage, realtime)
- **NFR-014**: System SHALL support local development environment with Docker
- **NFR-015**: System SHALL maintain type safety throughout the application stack

## UI Goals

### Design Principles

#### Vietnamese-First Design
- **UI-001**: All interface elements SHALL be designed with Vietnamese text as primary content (not translated afterthought)
- **UI-002**: Interface SHALL use Vietnamese typography optimized for readability with diacritical marks
- **UI-003**: Date, time, and number formats SHALL follow Vietnamese conventions (dd/mm/yyyy, 24-hour time, comma decimal separator)
- **UI-004**: Currency display SHALL use Vietnamese Dong formatting (₫123.456.789)

#### Accessibility & Usability
- **UI-005**: Interface SHALL be usable by non-technical staff with minimal computer experience
- **UI-006**: Navigation SHALL be intuitive with clear visual hierarchy and consistent patterns
- **UI-007**: Critical actions SHALL have confirmation dialogs to prevent accidental data loss
- **UI-008**: System SHALL provide visual feedback for all user actions (loading states, success/error messages)

#### Mobile & Responsive Design
- **UI-009**: Interface SHALL be fully responsive and usable on tablets and mobile devices
- **UI-010**: Touch targets SHALL be minimum 44px for mobile usability
- **UI-011**: Mobile layout SHALL prioritize essential functions for on-the-go repair status checking

#### Visual Design & Branding
- **UI-012**: Design SHALL reflect professional repair shop aesthetic with clean, modern appearance
- **UI-013**: Color scheme SHALL use high contrast ratios for accessibility (WCAG AA compliance)
- **UI-014**: Status indicators SHALL use universally understood color coding (green=good, yellow=warning, red=critical)
- **UI-015**: Interface SHALL minimize visual clutter while maintaining information density for business efficiency

### Key User Flows

#### Customer-Facing Flows
- **FLOW-001**: Public repair status lookup - Simple search by ticket code or phone number
- **FLOW-002**: Repair request submission - Guided form with device information and issue description

#### Staff Workflows
- **FLOW-003**: Daily repair dashboard - Overview of active repairs, pending tasks, and priorities
- **FLOW-004**: Ticket creation and management - Streamlined process from device intake to completion
- **FLOW-005**: Customer information lookup - Quick access to repair history and contact details
- **FLOW-006**: Parts inventory checking - Real-time stock levels and compatibility verification

#### Admin Workflows
- **FLOW-007**: Business analytics dashboard - Key metrics, trends, and performance indicators
- **FLOW-008**: Staff management - User accounts, permissions, and activity tracking
- **FLOW-009**: System configuration - Business settings, repair workflow customization

## Technical Assumptions

### Development Environment
- **TECH-001**: Local development uses Supabase CLI with Docker containers for backend services
- **TECH-002**: Development team has access to machines with 7GB+ RAM for running full Supabase stack
- **TECH-003**: Development uses Node.js 18+ and pnpm package manager
- **TECH-004**: Development environment supports Docker and has ports 54321-54324 available

### Technology Stack
- **TECH-005**: Frontend built with Vite + React 19 + TypeScript for modern development experience
- **TECH-006**: UI components use shadcn/ui + Tailwind CSS 4.0 for consistent design system
- **TECH-007**: Routing handled by TanStack Router with file-based routing for type safety
- **TECH-008**: State management uses React Context + custom hooks (no external state library)
- **TECH-009**: Form handling uses React Hook Form + Zod for validation and type safety

### Backend & Infrastructure
- **TECH-010**: Supabase provides all backend services (PostgreSQL, Auth, Storage, Realtime)
- **TECH-011**: Database uses PostgreSQL 15+ with JSONB for flexible data structures
- **TECH-012**: Authentication handled by Supabase Auth with JWT tokens
- **TECH-013**: File storage uses Supabase Storage with Row Level Security policies
- **TECH-014**: Real-time updates delivered via Supabase Realtime WebSocket connections

### Deployment & Production
- **TECH-015**: Production frontend deployable to static hosting (Vercel, Netlify, CDN)
- **TECH-016**: Production backend uses self-hosted Supabase with Docker Compose
- **TECH-017**: Database backups handled by production Supabase instance configuration
- **TECH-018**: SSL certificates and HTTPS termination managed at infrastructure level

### Security & Compliance
- **TECH-019**: Row Level Security (RLS) policies enforce all data access controls
- **TECH-020**: Environment variables manage all sensitive configuration (no hardcoded secrets)
- **TECH-021**: API keys and tokens stored securely and rotated as needed
- **TECH-022**: Customer data protected according to Vietnamese data protection practices

### Performance & Monitoring
- **TECH-023**: Application targets modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **TECH-024**: Bundle size optimized with code splitting and tree shaking
- **TECH-025**: Database queries optimized with appropriate indexes and query patterns
- **TECH-026**: Error tracking and monitoring integrated into production deployment

### Integration & Extensibility
- **TECH-027**: System designed for future integration with accounting software via APIs
- **TECH-028**: Database schema allows extension for additional business services
- **TECH-029**: Component architecture supports addition of new features without major refactoring
- **TECH-030**: Vietnamese language support extensible to other Southeast Asian languages

## Epic List

### Phase 1: Foundation & Authentication (4-6 weeks)
**Epic 1.1: Development Environment Setup**
- Local Supabase development environment
- Database schema and migrations
- Seed data and development utilities
- Admin user creation system

**Epic 1.2: Authentication & User Management**
- Supabase Auth integration with Vietnamese localization
- Role-based access control (Shop Owner, Staff)
- User profile management
- Password reset and account recovery

**Epic 1.3: Core Application Shell**
- React 19 + TypeScript application structure
- TanStack Router with file-based routing
- shadcn/ui component library integration
- Responsive layout and navigation

### Phase 2: Customer & Repair Management (6-8 weeks)
**Epic 2.1: Customer Management System**
- Phone-based customer identification
- Customer profile creation and management
- Repair history tracking
- Customer search and lookup functionality

**Epic 2.2: Repair Ticket System**
- 16-state repair workflow implementation
- Auto-generated ticket codes (LRP-YYYY-XXXXXX)
- Ticket creation, editing, and status updates
- Real-time status synchronization

**Epic 2.3: Public Repair Lookup**
- Unauthenticated repair status checking
- Public-facing interface design
- Secure data exposure with RLS policies
- Mobile-optimized status display

### Phase 3: Inventory & Parts Management (3-4 weeks)
**Epic 3.1: Parts Catalog System**
- Parts database with laptop compatibility
- Parts search and filtering
- Stock level tracking (foundation)
- Parts usage documentation

**Epic 3.2: Repair-Parts Integration**
- Link parts usage to specific repairs
- Pricing and cost tracking
- Parts requirement estimation
- Usage reporting and analytics

### Phase 4: Business Analytics & Reporting (3-4 weeks)
**Epic 4.1: Dashboard & Metrics**
- Business performance dashboard
- Revenue and repair count tracking
- Popular devices and common issues analysis
- Staff performance metrics

**Epic 4.2: Advanced Reporting**
- Repair completion time analysis
- Status distribution visualization
- Customer satisfaction tracking
- Export functionality for business data

### Phase 5: Advanced Features & Polish (4-5 weeks)
**Epic 5.1: File Management & Documentation**
- Photo upload for repair documentation
- Private file storage with Supabase Storage
- File organization and retrieval
- Image optimization and thumbnails

**Epic 5.2: System Administration**
- Business settings configuration
- Repair workflow customization
- System maintenance utilities
- Data backup and recovery tools

**Epic 5.3: Performance & Production Readiness**
- Code optimization and bundle analysis
- Production deployment configuration
- Error tracking and monitoring
- Load testing and performance tuning

### Phase 6: Future Enhancements (Backlog)
**Epic 6.1: Communication Features**
- Customer notification system (Email/SMS)
- Internal staff messaging
- Repair progress notifications
- Automated status updates

**Epic 6.2: Integration Capabilities**
- Accounting software API integration
- Payment processing system
- Third-party service connections
- Data import/export utilities

**Epic 6.3: Mobile Application**
- React Native mobile app
- Offline capability for field work
- Mobile-specific repair workflows
- Push notifications

### Total Estimated Timeline: 20-27 weeks (5-7 months)

## Epic Details

### Epic 1.1: Development Environment Setup
**Priority**: Critical | **Estimated Effort**: 1-2 weeks | **Dependencies**: None

**Description**: Establish complete local development environment with Supabase backend services and standardized setup process.

**Acceptance Criteria**:
- [ ] Supabase CLI configured with Docker containers running locally
- [ ] Database schema migrations create all required tables and functions
- [ ] Seed data populates development environment with sample records
- [ ] Admin user creation script works from environment variables
- [ ] Documentation provides 4-step setup process verification
- [ ] All team members can replicate environment setup successfully

**Technical Implementation**:
- Configure `supabase/config.toml` with appropriate port mappings
- Create database migrations for customers, repair_tickets, parts, user_profiles tables
- Implement `generate_ticket_code()` and `handle_new_user()` PostgreSQL functions
- Set up Row Level Security policies for data access control
- Create comprehensive seed data with realistic Vietnamese business scenarios
- Develop admin creation scripts (Node.js and Bash versions)

**Definition of Done**:
- Fresh clone of repository can be set up in under 10 minutes
- All database tables, functions, and RLS policies are properly created
- Admin user can log in and access all system areas
- Development server runs without errors on localhost:5173

### Epic 1.2: Authentication & User Management
**Priority**: Critical | **Estimated Effort**: 2-3 weeks | **Dependencies**: Epic 1.1

**Description**: Implement secure authentication system with Vietnamese localization and role-based access control.

**Acceptance Criteria**:
- [ ] Supabase Auth integration with Vietnamese error messages
- [ ] Login/logout functionality with proper session management
- [ ] Role-based routing (Shop Owner can access admin areas, Staff cannot)
- [ ] User profile management with Vietnamese name and contact info
- [ ] Password reset flow with email templates in Vietnamese
- [ ] Session persistence and automatic token refresh

**Technical Implementation**:
- Create authentication context with React hooks
- Implement protected route components using TanStack Router
- Design login/register forms with Vietnamese labels and validation
- Set up email templates for password reset and account verification
- Create user profile management interface
- Implement role checking middleware for API access

**User Stories**:
- As a shop owner, I can log in and access all system functions
- As a staff member, I can log in but cannot access admin settings
- As a user, I receive Vietnamese error messages when login fails
- As a user, I can reset my password via email in Vietnamese

### Epic 1.3: Core Application Shell
**Priority**: Critical | **Estimated Effort**: 1-2 weeks | **Dependencies**: Epic 1.2

**Description**: Build responsive application layout with navigation, routing, and UI component foundation.

**Acceptance Criteria**:
- [ ] Responsive navigation works on desktop, tablet, and mobile
- [ ] File-based routing with TanStack Router configured
- [ ] shadcn/ui components integrated with Vietnamese text support
- [ ] Main dashboard layout with sidebar navigation
- [ ] Loading states and error boundaries implemented
- [ ] Dark/light theme support (optional but recommended)

**Technical Implementation**:
- Set up TanStack Router with file-based route structure
- Create reusable layout components (Header, Sidebar, Footer)
- Implement responsive navigation with mobile hamburger menu
- Configure shadcn/ui components with Vietnamese typography
- Create error boundary components for graceful error handling
- Set up loading states for async operations

**User Stories**:
- As a user, I can navigate between sections using clear Vietnamese labels
- As a mobile user, I can access all features through responsive design
- As a user, I see appropriate loading indicators during data operations
- As a user, I receive helpful error messages when something goes wrong

### Epic 2.1: Customer Management System
**Priority**: High | **Estimated Effort**: 2-3 weeks | **Dependencies**: Epic 1.3

**Description**: Implement customer management with phone-based identification following Vietnamese business practices.

**Acceptance Criteria**:
- [ ] Customer search by phone number with Vietnamese formatting
- [ ] Automatic customer creation when first repair ticket submitted
- [ ] Customer profile editing with Vietnamese address formats
- [ ] Complete repair history display per customer
- [ ] Customer data privacy with appropriate RLS policies
- [ ] Export customer data for business reporting

**Technical Implementation**:
- Design customer database schema with phone as primary key
- Create customer search component with Vietnamese phone formatting
- Implement customer profile forms with Vietnamese address fields
- Build customer history view showing all related repairs
- Set up RLS policies protecting customer personal information
- Create customer data export functionality

**User Stories**:
- As staff, I can quickly find customers by typing their phone number
- As staff, I can view complete repair history for any customer
- As staff, customers are automatically created when I create their first repair
- As a customer, my personal information is protected and only visible to authorized staff

### Epic 2.2: Repair Ticket System
**Priority**: Critical | **Estimated Effort**: 3-4 weeks | **Dependencies**: Epic 2.1

**Description**: Core repair workflow with 16-state progression and auto-generated ticket codes.

**Acceptance Criteria**:
- [ ] Auto-generated ticket codes in LRP-YYYY-XXXXXX format
- [ ] 16-state repair workflow with proper state transitions
- [ ] Real-time status updates via Supabase realtime
- [ ] Ticket creation form with device information and issue description
- [ ] Staff assignment tracking for each repair phase
- [ ] Search and filter tickets by status, date, customer, device type

**Technical Implementation**:
- Implement `generate_ticket_code()` database function with sequence
- Create repair status enum with all 16 states and transition rules
- Build ticket creation form with Vietnamese validation messages
- Set up Supabase realtime subscriptions for status changes
- Create ticket management interface with status progression controls
- Implement advanced search and filtering capabilities

**User Stories**:
- As staff, I can create new repair tickets with auto-generated codes
- As staff, I can update repair status and see changes reflected immediately
- As staff, I can track who worked on each phase of the repair
- As staff, I can quickly find tickets using various search criteria
- As a customer, I can track my repair progress through all stages

## PRD Checklist & Next Steps

### PRD Completeness Checklist
- [x] **Goals and Background Context**: Vietnamese laptop repair shop replacement system clearly defined
- [x] **Requirements**: 19 functional and 15 non-functional requirements with clear identifiers
- [x] **UI Goals**: Vietnamese-first design principles and 9 key user flows identified
- [x] **Technical Assumptions**: 30 technical assumptions covering full stack and deployment
- [x] **Epic List**: 6 phases with 13 epics spanning 20-27 weeks of development
- [x] **Epic Details**: Detailed breakdown of critical Phase 1 and Phase 2 epics

### Stakeholder Review Requirements
- [ ] **Business Stakeholder Review**: Shop owner approval of business requirements and workflows
- [ ] **Technical Team Review**: Development team review of technical assumptions and epic sizing
- [ ] **UX/UI Review**: Design team validation of Vietnamese localization requirements
- [ ] **Security Review**: Data protection and RLS policy approach validation

### Pre-Development Prerequisites
- [ ] **Development Environment Validation**: Confirm all team members can set up local Supabase
- [ ] **Vietnamese Content Strategy**: Finalize all UI text, error messages, and email templates
- [ ] **Design System Creation**: Create Vietnamese typography and component style guide
- [ ] **Database Schema Review**: Validate schema against business requirements with shop owner

### Immediate Next Steps (Week 1-2)
1. **Stakeholder Alignment**
   - Schedule PRD review meeting with shop owner for business validation
   - Technical team review session for effort estimation validation
   - Identify any missing requirements or assumptions

2. **Team Preparation**
   - Confirm development team setup with local Supabase environment
   - Establish Vietnamese translation process and content review workflow
   - Set up project tracking system (GitHub Projects, Linear, etc.)

3. **Design Foundation**
   - Create wireframes for core user flows (ticket creation, customer lookup, dashboard)
   - Vietnamese typography testing and component library planning
   - Mobile responsiveness strategy for repair shop workflow

### Success Metrics & KPIs
**Development Metrics**:
- Epic completion rate tracking against 20-27 week timeline
- Code quality metrics (TypeScript coverage, test coverage, linting compliance)
- Performance benchmarks (page load times, database query performance)

**Business Metrics** (Post-Launch):
- Repair processing time reduction vs. current WordPress system
- Staff adoption rate and daily active users
- Customer satisfaction with public repair lookup system
- System uptime and reliability metrics

### Risk Mitigation
**High Risk Items**:
- **Vietnamese Localization Complexity**: Early user testing with shop staff
- **16-State Workflow Complexity**: Iterative validation with shop owner
- **Supabase Learning Curve**: Team training and proof-of-concept development

**Medium Risk Items**:
- **Timeline Estimation**: Regular sprint retrospectives and scope adjustment
- **Mobile Responsiveness**: Early device testing with actual repair shop tablets
- **Data Migration**: Current WordPress data export and import strategy

### Communication Plan
- **Weekly PRD Updates**: Track epic progress and requirement changes
- **Bi-weekly Stakeholder Check-ins**: Business owner feedback and priority adjustments
- **Monthly Technical Reviews**: Architecture decisions and performance optimization

---

**PRD Version**: 1.0
**Last Updated**: 2025-01-25
**Next Review**: TBD (upon stakeholder feedback)
**Status**: Ready for Stakeholder Review
