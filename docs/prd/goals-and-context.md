# Goals and Background Context

## Goals
- Replace existing WordPress-based system with a modern, integrated repair shop management solution
- Streamline repair workflow from device intake to completion with 16-state status tracking
- Provide public repair status lookup system for customers without requiring authentication
- Enable efficient staff management with role-based access (Admin/Staff)
- Implement automated ticket code generation (LRP-YYYY-######) with proper sequencing
- Support real-time status updates and internal communication between staff members
- Create foundation for future features like inventory management and partner collaboration

## Background Context
This system serves a small Vietnamese laptop repair shop (<10 employees) currently using WordPress for business operations. The shop provides four main services: laptop repair (primary business), buying/selling used laptops and parts, repair training courses, and partnership services with other shops. The new system needs to replace the entire existing infrastructure while maintaining Vietnamese language support and local business practices like using phone numbers as customer primary keys.

The solution will be built as a modern web application with local Supabase development environment, designed to handle the complete repair lifecycle from initial device receipt through completion and warranty tracking.

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-01-25 | 1.0 | Initial goals and context extraction from full PRD | Product Owner |