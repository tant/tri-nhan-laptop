# Technology Stack

## Overview
The Vietnamese Laptop Repair Management System is built using modern web technologies with a focus on type safety, performance, and developer experience.

## Frontend Stack

### Core Framework
- **React 19**: Latest version with concurrent features and improved performance
- **TypeScript 5.7.2**: Full type safety with strict configuration
- **Vite 6.3.5**: Fast build tool and development server

### Routing & State Management
- **TanStack Router 1.130.2**: Type-safe file-based routing with devtools
- **React Context**: Built-in state management for authentication and global state
- **Custom Hooks**: Reusable logic encapsulation following React patterns

### UI Framework & Styling
- **Tailwind CSS 4.0.6**: Utility-first CSS framework with new features
- **@tailwindcss/vite 4.0.6**: Vite plugin integration for Tailwind CSS
- **shadcn/ui**: High-quality, accessible component library built on Radix UI
- **Radix UI Primitives**: Unstyled, accessible components for complex UI
- **Lucide React 0.476.0**: Beautiful, customizable icon library
- **class-variance-authority**: Type-safe variant API for component styling
- **next-themes 0.4.6**: Theme switching support (dark/light mode)
- **sonner 2.0.7**: Toast notification system
- **tw-animate-css 1.3.6**: Enhanced CSS animations for Tailwind

### Form Handling & Validation
- **React Hook Form 7.62.0**: Performant forms with minimal re-renders
- **Zod 4.1.9**: TypeScript-first schema validation library
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Data Tables
- **TanStack Table 8.21.3**: Powerful, extensible data tables with TypeScript support

## Backend Stack

### Database & Authentication
- **Supabase**: Complete backend-as-a-service platform
  - **PostgreSQL 15+**: Relational database with JSONB support
  - **Supabase Auth**: JWT-based authentication with social providers
  - **Row Level Security (RLS)**: Database-level security policies
  - **Real-time Subscriptions**: WebSocket-based live updates
  - **Supabase Storage**: File storage with RLS integration

### Database Features
- **JSONB Fields**: Flexible data structures for parts compatibility and repair details
- **Database Functions**: PostgreSQL functions for business logic (ticket generation, user management)
- **Triggers**: Automated data consistency and audit trails
- **Migrations**: Version-controlled database schema changes
- **Multiple Foreign Keys**: Complex table relationships with explicit foreign key naming for Supabase queries
- **Client-side Filtering**: Complex database queries handled via JavaScript filtering for Supabase REST API compatibility

### Performance Optimizations
- **Authentication Caching**: localStorage-based user profile caching for reduced database calls
- **Request Deduplication**: Prevention of concurrent redundant profile fetches
- **Optimistic Updates**: Immediate UI feedback with rollback capability
- **Real-time Optimization**: Efficient WebSocket subscription management

## Development Tools

### Code Quality
- **Biome 1.9.4**: Fast linter, formatter, and import organizer replacing ESLint/Prettier
- **TypeScript Strict Mode**: Enhanced type checking with additional rules
- **Git Hooks**: Pre-commit quality checks (if configured)

### Testing Framework
- **Playwright 1.55.0**: End-to-end testing with browser automation
- **Vitest 3.0.5**: Fast unit testing framework compatible with Vite
- **Testing Library**: React component testing utilities
- **jsdom**: Browser environment simulation for tests

### Development Experience
- **TanStack Router Devtools**: Route debugging and visualization
- **TanStack React Devtools**: State inspection and debugging
- **Vite HMR**: Hot module replacement for fast development
- **TypeScript Path Mapping**: `@/*` aliases for clean imports

### Development Scripts & Automation
- **Database Management**: `pnpm run db:start|stop|reset|status` for Supabase control
- **Admin Creation**: `pnpm run create-admin` for automated admin user setup
- **Code Quality**: `pnpm run lint|format|check` for Biome-based quality control
- **Testing**: `pnpm run test:unit|test:all|test:ui` for comprehensive testing
- **Build Process**: `pnpm run build` with TypeScript compilation

## Build & Deployment

### Build Process
- **Vite Build**: Optimized production builds with code splitting
- **TypeScript Compilation**: Type checking during build process
- **Asset Optimization**: Automatic optimization of images and static assets

### Package Management
- **pnpm**: Fast, disk space efficient package manager
- **Node.js 18+**: Modern JavaScript runtime with ES2022 support

## Environment Configuration

### Local Development
- **Supabase CLI**: Local database and API development
- **Docker**: Containerized Supabase services
- **Environment Variables**: Type-safe configuration management

### Database Setup
- **Local Supabase**: Development environment with Docker
- **Database Migrations**: Automated schema management
- **Seed Data**: Realistic Vietnamese business data for development

## Key Dependencies

### Production Dependencies
```json
{
  "@supabase/supabase-js": "^2.57.4",
  "@tanstack/react-router": "^1.130.2",
  "@tanstack/react-table": "^8.21.3",
  "react": "^19.0.0",
  "react-hook-form": "^7.62.0",
  "zod": "^4.1.9",
  "tailwindcss": "^4.0.6",
  "lucide-react": "^0.476.0"
}
```

### Development Dependencies
```json
{
  "@biomejs/biome": "1.9.4",
  "@playwright/test": "^1.55.0",
  "@types/node": "^24.5.2",
  "@types/react": "^19.0.8",
  "typescript": "^5.7.2",
  "vite": "^6.3.5",
  "vitest": "^3.0.5"
}
```

## Architecture Patterns

### Component Architecture
- **Composition over Inheritance**: React composition patterns
- **Custom Hooks**: Business logic separation from UI
- **Context Providers**: Global state management
- **Compound Components**: Complex UI component patterns

### Data Flow
- **Unidirectional Data Flow**: React best practices
- **Real-time Updates**: Supabase subscriptions for live data
- **Optimistic Updates**: Immediate UI feedback with rollback capability
- **Error Boundaries**: Graceful error handling and recovery

### Authentication Architecture
- **Context-Based State**: React Context for authentication state management
- **JWT Integration**: Supabase Auth with automatic token refresh
- **Profile Caching**: localStorage-based user profile caching for performance
- **Request Deduplication**: Prevention of concurrent authentication requests
- **Fallback Mechanisms**: Graceful handling of database timeouts and errors
- **Role-Based Access**: Dynamic role checking with cached fallbacks

### Database Patterns
- **Repository Pattern**: Data access layer abstraction
- **RLS Security**: Database-level security enforcement
- **Audit Trails**: Automatic change tracking
- **Data Validation**: Client and server-side validation

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Lazy loading for large components
- **Bundle Analysis**: Regular bundle size monitoring
- **Image Optimization**: Optimized image loading and caching
- **Memoization**: Strategic use of React.memo and useMemo

### Database Optimization
- **Query Optimization**: Efficient database queries with proper indexing
- **Connection Pooling**: Managed by Supabase
- **Caching Strategy**: Browser and server-side caching
- **Real-time Efficiency**: Optimized subscription management

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Role-based Access**: Shop owner vs staff permissions
- **Session Management**: Automatic token refresh and logout
- **Route Protection**: Authentication guards for protected routes

### Data Security
- **RLS Policies**: Database-level access control
- **Input Validation**: Comprehensive client and server validation
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in XSS protection

## Monitoring & Analytics

### Error Tracking
- **Error Boundaries**: React error catching and reporting
- **Console Logging**: Structured logging for development
- **User Feedback**: Error reporting with user context

### Performance Monitoring
- **Web Vitals**: Core web performance metrics
- **Database Performance**: Query performance monitoring
- **Real-time Metrics**: Connection and subscription monitoring

## Vietnamese Localization Support

### Internationalization
- **Built-in Support**: Native Vietnamese text throughout application
- **Date/Time Formatting**: Vietnamese locale formatting
- **Currency Formatting**: Vietnamese Dong (VND) support
- **Number Formatting**: Vietnamese number conventions

### Business Logic
- **Phone Number Validation**: Vietnamese phone number formats
- **Address Formatting**: Vietnamese address standards
- **Business Terminology**: Accurate repair shop terminology in Vietnamese