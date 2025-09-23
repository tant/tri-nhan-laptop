# Technical Assumptions

## Development Environment
- **TECH-001**: Local development uses Supabase CLI with Docker containers for backend services
- **TECH-002**: Development team has access to machines with 7GB+ RAM for running full Supabase stack
- **TECH-003**: Development uses Node.js 18+ and pnpm package manager
- **TECH-004**: Development environment supports Docker and has ports 54321-54324 available

## Technology Stack
- **TECH-005**: Frontend built with Vite + React 19 + TypeScript for modern development experience
- **TECH-006**: UI components use shadcn/ui + Tailwind CSS 4.0 for consistent design system
- **TECH-007**: Routing handled by TanStack Router with file-based routing for type safety
- **TECH-008**: State management uses React Context + custom hooks (no external state library)
- **TECH-009**: Form handling uses React Hook Form + Zod for validation and type safety

## Backend & Infrastructure
- **TECH-010**: Supabase provides all backend services (PostgreSQL, Auth, Storage, Realtime)
- **TECH-011**: Database uses PostgreSQL 15+ with JSONB for flexible data structures
- **TECH-012**: Authentication handled by Supabase Auth with JWT tokens
- **TECH-013**: File storage uses Supabase Storage with Row Level Security policies
- **TECH-014**: Real-time updates delivered via Supabase Realtime WebSocket connections

## Deployment & Production
- **TECH-015**: Production frontend deployable to static hosting (Vercel, Netlify, CDN)
- **TECH-016**: Production backend uses self-hosted Supabase with Docker Compose
- **TECH-017**: Database backups handled by production Supabase instance configuration
- **TECH-018**: SSL certificates and HTTPS termination managed at infrastructure level

## Security & Compliance
- **TECH-019**: Row Level Security (RLS) policies enforce all data access controls
- **TECH-020**: Environment variables manage all sensitive configuration (no hardcoded secrets)
- **TECH-021**: API keys and tokens stored securely and rotated as needed
- **TECH-022**: Customer data protected according to Vietnamese data protection practices

## Performance & Monitoring
- **TECH-023**: Application targets modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- **TECH-024**: Bundle size optimized with code splitting and tree shaking
- **TECH-025**: Database queries optimized with appropriate indexes and query patterns
- **TECH-026**: Error tracking and monitoring integrated into production deployment

## Integration & Extensibility
- **TECH-027**: System designed for future integration with accounting software via APIs
- **TECH-028**: Database schema allows extension for additional business services
- **TECH-029**: Component architecture supports addition of new features without major refactoring
- **TECH-030**: Vietnamese language support extensible to other Southeast Asian languages