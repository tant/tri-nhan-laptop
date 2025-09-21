# Tech Stack Documentation

## Overview
This document outlines the technology stack for the Vietnamese Laptop Repair Shop Management System.

## Frontend Stack

### Core Framework
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5.7.2** - Type safety and development experience
- **Vite 6.3.5** - Fast build tool and development server

### Routing & Navigation
- **TanStack Router 1.130.2** - File-based routing with type safety
- **TanStack Router Devtools** - Development debugging tools

### UI Framework & Styling
- **Tailwind CSS 4.0.6** - Utility-first CSS framework
- **shadcn/ui** - Pre-built accessible components built on Radix UI
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icons library
- **class-variance-authority** - Component variant management

### Form Management
- **React Hook Form 7.62.0** - Performant forms with minimal re-renders
- **Zod 4.1.9** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod integration for React Hook Form

### Backend & Data
- **Supabase 2.57.4** - PostgreSQL database with real-time features
- **Supabase Auth** - Authentication and user management
- **Supabase Storage** - File storage for repair images/documents

### Development Tools
- **Biome 1.9.4** - Fast linter and formatter (replaces ESLint/Prettier)
- **Vitest 3.0.5** - Fast unit testing framework
- **Testing Library** - React component testing utilities
- **jsdom** - DOM implementation for testing

### Package Management
- **pnpm** - Fast, disk space efficient package manager

### Deployment
- **Docker** - Containerized development and production environments
- **Docker Compose** - Multi-service orchestration

## Architecture Patterns

### Component Architecture
- **shadcn/ui pattern** - Reusable, accessible components
- **File-based routing** - Automatic route generation
- **Page components** - Business logic separation in `src/components/pages/`

### State Management
- **React built-in state** - useState, useEffect for local state
- **TanStack Router state** - Navigation and route state
- **Supabase real-time** - Server state synchronization

### Styling Strategy
- **Utility-first** - Tailwind CSS for rapid development
- **Component variants** - CVA for systematic component styling
- **Design system** - shadcn/ui for consistency

### Data Flow
- **Supabase Client** - Direct database queries and mutations
- **Real-time subscriptions** - Live updates for repair status
- **Form validation** - Client-side with Zod schemas

## Key Dependencies

### UI Components
```json
{
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-collapsible": "^1.1.12",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-tooltip": "^1.2.8"
}
```

### Utilities
```json
{
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.0.2",
  "sonner": "^2.0.7"
}
```

## Version Strategy
- **React 19** - Latest stable for performance benefits
- **TypeScript 5.7** - Latest for best developer experience
- **Node.js LTS** - Long-term support version for stability
- **pnpm latest** - Fast package management

## Environment Requirements
- **Node.js**: >=18.0.0
- **pnpm**: >=8.0.0
- **Docker**: >=20.0.0 (for development environment)
- **Docker Compose**: >=2.0.0

## Performance Considerations
- **Vite** - Fast HMR and build times
- **React 19** - Concurrent rendering and automatic batching
- **pnpm** - Efficient dependency management
- **Tailwind CSS** - Purged CSS for minimal bundle size
- **Code splitting** - Automatic with Vite and TanStack Router