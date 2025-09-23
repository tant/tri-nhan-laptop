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
- **Frontend**: Vite + React 19 + TypeScript
- **Router**: TanStack Router with file-based routing
- **UI Framework**: shadcn/ui + Tailwind CSS 4.0
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: React Context + Custom Hooks
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + React Testing Library
- **Code Quality**: Biome (ESLint + Prettier replacement)

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── pages/          # Page-specific components
├── contexts/           # React contexts (auth, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   └── supabase.ts     # Database client & types
├── routes/             # File-based routing
└── main.tsx           # Application entry point

supabase/
├── migrations/         # Database schema migrations
└── seed.sql           # Development seed data

scripts/
├── create-admin.js     # Admin user creation (Node.js)
├── create-admin.sh     # Admin user creation (Bash)
└── README.md          # Scripts documentation
```

### Database Schema

#### Core Tables
- **customers**: Customer information (phone as primary key)
- **repair_tickets**: Main business entity with 16-state workflow
- **parts**: Inventory items with laptop compatibility data
- **user_profiles**: Staff accounts linked to Supabase Auth

#### Key Features
- **Auto-generated Ticket Codes**: `LRP-YYYY-XXXXXX` format
- **Row Level Security**: Comprehensive RLS policies for data access
- **Real-time Subscriptions**: Live updates for repair status changes
- **JSONB Fields**: Flexible storage for device info and parts usage

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

#### Supabase Won't Start
- **Check Docker**: Ensure Docker is running
- **Port Conflicts**: Check if ports 54321-54324 are available
- **Memory**: Ensure 7GB+ RAM available
- **Reset**: Try `docker system prune` and restart

#### Authentication Issues
- **Check Environment**: Verify Supabase URL and keys in `.env`
- **Admin User**: Run `pnpm run create-admin` to create admin account
- **Studio Access**: Visit http://127.0.0.1:54323 for manual user management

#### Build Errors
- **Dependencies**: Run `pnpm install` to update dependencies
- **TypeScript**: Check `src/lib/supabase.ts` types match database schema
- **Linting**: Run `pnpm run check` to fix code quality issues

### Getting Help
- **Documentation**: Check `docs/` directory for detailed guides
- **Scripts**: See `scripts/README.md` for admin utilities
- **Database**: Use Supabase Studio for database inspection
- **Logs**: Check browser console and terminal output

---

Built with ❤️ for Vietnamese laptop repair shops