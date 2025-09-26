# 🏪 Vietnamese Laptop Repair Shop Management System

A modern, full-featured management system for laptop repair shops built with React 19, TypeScript, and Supabase.

## ✨ Features

### 🔧 **Repair Management**
- **16-State Workflow**: Complete repair process from device receipt to completion
- **Auto-Generated Tickets**: Format `LRP-YYYY-XXXXXX` with database sequences
- **Real-time Updates**: Live status changes via Supabase realtime
- **Photo Management**: Private storage for repair documentation
- **Customer Portal**: Public lookup system for repair status

### 👥 **Customer Management**
- **Phone-Based Identity**: Vietnamese business practice using phone as primary key
- **Automatic Creation**: Customers created when first repair ticket is submitted
- **History Tracking**: Complete repair history per customer
- **Privacy Controls**: RLS policies for public vs. staff data access

### 📦 **Inventory Management**
- **Parts Catalog**: Compatibility tracking with laptop models
- **Usage Logging**: Track parts used in repairs with pricing
- **Stock Monitoring**: Current inventory levels (placeholder for full system)

### 👨‍💼 **Staff Management**
- **Role-Based Access**: Shop owner (admin) and staff roles
- **Authentication**: Supabase Auth with Vietnamese error messages
- **Assignment Tracking**: Track who worked on each repair

### 📊 **Analytics & Reporting**
- **Business Metrics**: Revenue, repair counts, popular devices
- **Status Distribution**: Visual breakdown of repair pipeline
- **Performance Tracking**: Repair completion times and success rates

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (latest LTS recommended)
- **pnpm** (`npm install -g pnpm`)
- **Docker** (for Supabase services)
- **7GB+ RAM** (for running all Supabase services)

### 1. Clone and Install
```bash
git clone <repository-url>
cd try-vite
pnpm install
```

### 2. Complete Fresh Setup (100% Verified ✅)
```bash
# Step 1: Copy environment template
cp .env.example .env

# Step 2: Start Supabase services (automatically applies migrations and seed data)
pnpm run db:start

# Step 3: Create admin user from environment variables
pnpm run create-admin

# Step 4: Start development server
pnpm run dev
```

**📝 Setup Notes:**
- Supabase configuration, migration and seed files are included in the repository
- `pnpm run db:start` automatically detects and applies all migrations and seed data
- No need to run `supabase init` - all config files are ready
- Admin credentials are read from `.env` file

**✅ All Services Running:**
- **Application**: http://localhost:5173
- **Supabase Studio**: http://127.0.0.1:54323
- **API Endpoint**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Email Testing**: http://127.0.0.1:54324

**🔑 Default Admin Login:**
- Email: `admin@laptop-repair-shop.local`
- Password: `AdminPass123!`

### 3. Daily Development Workflow
```bash
# Start services
pnpm run db:start

# Start application
pnpm run dev

# When done
pnpm run db:stop
```

## 📋 Environment Variables

Create a `.env` file with the following variables:

### Supabase Connection
```env
# Get these values from `pnpm run db:start` output
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<your_anon_key>
VITE_SERVICE_ROLE_KEY=<your_service_role_key>
```

### Admin User Configuration
```env
SHOP_ADMIN_EMAIL=admin@laptop-repair-shop.local
SHOP_ADMIN_PASSWORD=AdminPass123!
SHOP_ADMIN_NAME="Shop Manager"
SHOP_ADMIN_ROLE=shop_owner
```

### Application Settings
```env
VITE_APP_NAME="Hệ thống Quản lý Sửa chữa Laptop"
VITE_DEFAULT_CURRENCY=VND
VITE_DEFAULT_TIMEZONE=Asia/Ho_Chi_Minh
VITE_DEFAULT_LOCALE=vi-VN
```

## 🛠️ Development Commands

### Database Management
```bash
pnpm run db:start      # Start Supabase services
pnpm run db:stop       # Stop Supabase services
pnpm run db:status     # Check service status
pnpm run db:reset      # Reset database (apply migrations + seed data)
```

### Application Development
```bash
pnpm run dev           # Start development server
pnpm run build         # Build for production
pnpm run preview       # Preview production build
```

### Code Quality
```bash
pnpm run lint          # Run Biome linting
pnpm run format        # Format code with Biome
pnpm run check         # Run linting and formatting
```

### Testing
```bash
pnpm run test          # Run tests
pnpm run test:watch    # Run tests in watch mode
pnpm run test:ui       # Run tests with UI
```

### Admin Management
```bash
pnpm run create-admin       # Create admin user (Node.js script)
pnpm run create-admin:bash  # Create admin user (Bash script)
```

## 🏗️ Architecture

### Tech Stack

#### Core Framework
- **React 19**: Latest version with concurrent features
- **TypeScript 5.7.2**: Full type safety with strict configuration
- **Vite 6.3.5**: Fast build tool and development server

#### Routing & State Management
- **TanStack Router 1.130.2**: Type-safe file-based routing with devtools
- **React Context**: Authentication and global state management
- **Custom Hooks**: Reusable business logic encapsulation

#### UI Framework & Styling
- **Tailwind CSS 4.0.6**: Utility-first CSS framework
- **@tailwindcss/vite 4.0.6**: Vite plugin integration
- **shadcn/ui**: High-quality, accessible component library
- **Radix UI Primitives**: Unstyled, accessible components
- **Lucide React 0.476.0**: Beautiful icon library
- **next-themes 0.4.6**: Theme switching support (dark/light mode)
- **sonner 2.0.7**: Toast notification system
- **tw-animate-css 1.3.6**: Enhanced CSS animations

#### Forms & Validation
- **React Hook Form 7.62.0**: Performant forms with minimal re-renders
- **Zod 4.1.9**: TypeScript-first schema validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

#### Data & Tables
- **TanStack Table 8.21.3**: Powerful, extensible data tables
- **Supabase 2.57.4**: Complete backend-as-a-service
  - PostgreSQL 15+ with JSONB support
  - Authentication with JWT tokens
  - Real-time subscriptions via WebSockets
  - Row Level Security (RLS) policies
  - File storage with access controls

#### Development Tools
- **Biome 1.9.4**: Fast linter, formatter, and import organizer
- **Playwright 1.55.0**: End-to-end testing framework
- **Vitest 3.0.5**: Fast unit testing compatible with Vite
- **TanStack Router Devtools**: Route debugging and visualization

#### Performance Optimizations
- **Authentication Caching**: localStorage-based user profile caching for reduced database calls
- **Request Deduplication**: Prevention of concurrent redundant profile fetches
- **Optimistic Updates**: Immediate UI feedback with rollback capability
- **Real-time Optimization**: Efficient WebSocket subscription management

### Project Structure
```
src/
├── api/                        # API layer components
│   └── public/                 # Public API endpoints
├── components/
│   ├── customers/              # Customer management components
│   │   ├── CustomerPrivacyManager.tsx
│   │   ├── ContactManagement.tsx
│   │   ├── CustomerProfileForm.tsx
│   │   └── PhoneInput.tsx
│   ├── notifications/          # Notification system components
│   │   └── NotificationBell.tsx
│   ├── pages/                  # Main page components
│   │   ├── AdminPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── PartsPage.tsx
│   │   ├── RepairTicketsPage.tsx
│   │   └── SetupPage.tsx
│   ├── parts/                  # Parts management components
│   │   └── PartsInventoryManager.tsx
│   ├── tickets/                # Repair ticket components
│   │   ├── CreateTicketForm.tsx
│   │   ├── EditTicketForm.tsx
│   │   └── TicketDetailView.tsx
│   ├── ui/                     # Reusable UI components (shadcn/ui)
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── data-table.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── textarea.tsx
│   │   └── toaster.tsx
│   ├── app-sidebar.tsx         # Main navigation sidebar
│   ├── protected-route.tsx     # Authentication guards
│   └── theme-provider.tsx      # Theme management component
├── contexts/
│   └── auth-context.tsx        # Authentication context provider
├── hooks/                      # Custom React hooks
│   ├── use-customer-history.ts # Customer history management
│   ├── use-customers.ts        # Customer data management
│   ├── use-mobile.ts           # Mobile responsiveness
│   ├── use-notifications.ts    # Notification management
│   ├── use-parts.ts            # Parts inventory hooks
│   ├── use-repair-tickets.ts   # Repair ticket management
│   ├── use-sync-manager.ts     # Data synchronization
│   ├── use-ticket-activity.ts  # Ticket activity tracking
│   └── use-toast.ts            # Toast notifications
├── lib/                        # Core utilities and configurations
│   ├── analytics/              # Business analytics utilities
│   ├── audit/                  # Audit trail functionality
│   ├── devices/                # Device management utilities
│   │   └── vietnamese-brands.ts # Vietnamese laptop brands
│   ├── financial/              # Financial calculations
│   ├── privacy/                # Privacy and data protection
│   ├── problem-analysis/       # Issue analysis utilities
│   ├── security/               # Security utilities
│   ├── translation/            # Localization utilities
│   ├── validation/             # Data validation
│   ├── warranty/               # Warranty management
│   ├── workflow/               # Repair workflow logic
│   ├── supabase.ts            # Supabase client and type definitions
│   ├── utils.ts               # General utility functions
│   └── types.ts               # Global TypeScript types
├── routes/                     # File-based routing with TanStack Router
│   ├── __root.tsx             # Root layout component
│   ├── index.tsx              # Home page (public repair lookup)
│   ├── login.tsx              # Authentication page
│   ├── dashboard.tsx          # Main dashboard (protected)
│   ├── admin.tsx              # Administration panel (shop owner only)
│   ├── analytics.tsx          # Business analytics (protected)
│   ├── khach-hang/            # Customer management (Vietnamese routes)
│   ├── phieu-sua-chua/        # Repair tickets routing (Vietnamese routes)
│   ├── ton-kho/               # Inventory management (Vietnamese routes)
│   ├── cua-hang/              # Shop management (Vietnamese routes)
│   ├── setup.tsx              # Initial setup page
│   └── routeTree.gen.ts       # Auto-generated route tree
└── main.tsx                   # Application entry point

supabase/
├── migrations/                # Database schema migrations
└── seed.sql                  # Development seed data

scripts/
├── create-admin.js           # Admin user creation (Node.js)
├── create-admin.sh           # Admin user creation (Bash)
└── README.md                # Scripts documentation

tests/
├── e2e/                     # End-to-end tests
│   ├── auth.test.ts        # Authentication flows
│   ├── parts-search.test.ts # Parts search functionality
│   └── repair-workflow.test.ts # Repair process testing
└── unit/                   # Unit tests (if added)
```

### Database Schema

#### Core Tables
- **customers**: Customer information (phone as primary key, Vietnamese address formats)
- **repair_tickets**: Main business entity with comprehensive 16-state workflow
  - **CRITICAL**: Contains both `issue_description` (staff technical diagnosis) and `customer_description` (customer's original problem description)
  - Both fields are required - tickets cannot be created without `customer_description`
  - **Extended features**: labor costs, overhead, taxes, discounts, customer satisfaction, follow-up tracking
  - **Priority system**: Configurable priority levels for repair queue management
  - **Relationships**: Links to devices, previous repairs, technicians, cost breakdowns
- **parts**: Inventory items with Vietnamese laptop compatibility metadata
  - **Part numbers**: Explicit part_number field for inventory tracking
  - **Compatibility matrix**: JSONB fields for laptop model compatibility
  - **Stock management**: Current stock, minimum levels, reorder points
- **user_profiles**: Staff accounts linked to Supabase Auth with role-based permissions

#### Database Features
- **JSONB Fields**: Flexible data structures for parts compatibility and repair details
- **Database Functions**: PostgreSQL functions for business logic (ticket generation, user management)
- **Triggers**: Automated data consistency and audit trails
- **Migrations**: Version-controlled database schema changes
- **Multiple Foreign Keys**: Complex table relationships with explicit foreign key naming for Supabase queries
- **Client-side Filtering**: Complex database queries handled via JavaScript filtering for Supabase REST API compatibility

#### Key Features
- **Auto-generated Ticket Codes**: `LRP-YYYY-XXXXXX` format via PostgreSQL functions
- **Row Level Security**: Comprehensive RLS policies for data access control
- **Real-time Subscriptions**: Live updates for repair status changes via WebSockets
- **Cost Management**: Detailed cost breakdown (labor, parts, overhead, taxes, discounts)
- **Customer Experience**: Satisfaction ratings, feedback, follow-up requirements
- **Service Intelligence**: Recurring issue tracking, complexity levels, repair categories
- **Audit Trail**: Version tracking, status logs, cost change history

## 🔐 Authentication & Authorization

### User Roles
- **shop_owner**: Full system access, can manage staff and settings
- **staff**: Can manage repairs and customers, limited admin access

### Admin User Creation
Admin users are created using environment variables:

```bash
# Using Node.js script (recommended)
pnpm run create-admin

# Using Bash script
pnpm run create-admin:bash

# Manual via Supabase Studio
# Visit http://127.0.0.1:54323 → Authentication → Users
```

### Access Control
- **Public Routes**: Home, login, repair lookup
- **Authenticated Routes**: Dashboard, repair management, customer management
- **Admin Routes**: Staff management, system settings

## 🔄 Development Workflow

### Daily Development
1. **Start Supabase**: `pnpm run db:start`
2. **Check Status**: `pnpm run db:status`
3. **Start Frontend**: `pnpm run dev`
4. **Develop**: Make changes with hot reload
5. **Test**: `pnpm run test`
6. **Lint/Format**: `pnpm run check`

### Database Changes
1. Create migration: `pnpx supabase migration new <name>`
2. Edit migration file in `supabase/migrations/`
3. Apply changes: `pnpm run db:reset`
4. Update TypeScript types in `src/lib/supabase.ts`

### Adding Features
1. **UI Components**: Use shadcn/ui or create in `components/ui/`
2. **Business Logic**: Create custom hooks in `hooks/`
3. **Pages**: Add route files in `src/routes/`
4. **Database**: Add migrations and update types

## 🌐 Access Points

### Development URLs
- **Application**: http://localhost:5173
- **Supabase Studio**: http://127.0.0.1:54323
- **API Endpoint**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### Production URLs
- **Frontend**: Deploy to Vercel, Netlify, or static hosting
- **Backend**: Self-hosted Supabase using Docker Compose

## 🚀 Deployment

### Frontend Deployment
```bash
# Build production bundle
pnpm run build

# Deploy dist/ directory to static hosting
# Update environment variables for production Supabase instance
```

### Backend Deployment
- Use Docker Compose for production Supabase deployment
- Configure production environment variables
- Set up SSL certificates for HTTPS
- Configure backup strategies for PostgreSQL

## 🤝 Contributing

### Code Standards
- **TypeScript**: Strict mode enabled
- **Formatting**: Biome (runs on commit)
- **Testing**: Write tests for business logic
- **Components**: Use shadcn/ui patterns
- **Commits**: Conventional commit messages

### Vietnamese Localization
- All user-facing text in Vietnamese
- Error messages translated
- Date/time formatting for Vietnam
- Currency formatting in VND

## 📝 License

Private repository - All rights reserved

## 🆘 Troubleshooting

### Common Issues

#### Database Schema Issues (Recently Fixed)
- **"Could not find the 'customer_description' column" Error**: Fixed 2025-09-25
  - Added missing `customer_description` column to `repair_tickets` table
  - Both `issue_description` and `customer_description` fields are now required
  - Update seed data if using custom test data to include both fields
- **Relationship Ambiguity Errors**: Fixed foreign key relationships
  - Use specific foreign key relationships: `user_profiles!repair_tickets_assigned_technician_id_fkey(*)`
  - Added missing `part_number` column to parts table
- **Invalid Supabase Query Patterns**: Fixed client-side filtering approach
  - ❌ Invalid: `.or("current_stock.lte.min_stock_level,current_stock.eq.0")`
  - ✅ Correct: Fetch all data, then filter client-side with `part.current_stock <= part.min_stock_level`

#### Supabase Won't Start
- **Check Docker**: Ensure Docker is running
- **Port Conflicts**: Check if ports 54321-54324 are available
- **Memory**: Ensure 7GB+ RAM available
- **Reset**: Try `docker system prune` and restart
- **Migration Issues**: If `db:reset` fails, try manual seed data insertion

#### Authentication Issues
- **Check Environment**: Verify Supabase URL and keys in `.env`
- **Admin User**: Run `pnpm run create-admin` to create admin account
- **Studio Access**: Visit http://127.0.0.1:54323 for manual user management
- **RLS Policies**: Ensure public policies exist for `repair_tickets` and `customers` tables

#### Public Lookup Returns Empty Results
- **RLS Policy Setup**: Ensure public policies are configured correctly
- **Test Data Available**:
  - Phone: 0901234567, Ticket: LRP-2025-000001 (Nguyễn Văn An - Dell)
  - Phone: 0912345678, Ticket: LRP-2025-000002 (Trần Thị Bình - HP)
- **Connection Issues**: Restart Supabase completely with `db:stop` then `db:start`

#### Build Errors
- **Dependencies**: Run `pnpm install` to update dependencies
- **TypeScript**: Check `src/lib/supabase.ts` types match database schema
- **Linting**: Run `pnpm run check` to fix code quality issues
- **Schema Validation**: Verify all NOT NULL columns are included in Insert types as required fields

#### Performance Issues
- **Authentication Caching**: Performance optimizations implemented for user profile caching
- **Request Deduplication**: Concurrent authentication requests are now prevented
- **Database Queries**: Use client-side filtering for complex Supabase queries instead of server-side operations

### Getting Help
- **Documentation**: Check `docs/` directory for detailed guides
- **Scripts**: See `scripts/README.md` for admin utilities
- **Database**: Use Supabase Studio for database inspection
- **Logs**: Check browser console and terminal output

---

Built with ❤️ for Vietnamese laptop repair shops