# Epic Details

## Epic 1.1: Development Environment Setup
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

## Epic 1.2: Authentication & User Management
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

## Epic 1.3: Core Application Shell
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

## Epic 2.1: Customer Management System
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

## Epic 2.2: Repair Ticket System
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