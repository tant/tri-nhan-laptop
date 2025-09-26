# Vietnamese Laptop Repair Management System - Product Requirements Document

## 📋 Project Overview

### **Business Context**
> For detailed business context and current operations analysis, see: **[Project Brief](./project-brief.md)** (Vietnamese)

This system serves a small Vietnamese laptop repair shop (<10 employees) transitioning from WordPress to a modern integrated management solution.

### **Goals**
- Replace existing WordPress-based system with a modern, integrated repair shop management solution
- Streamline repair workflow from device intake to completion with 16-state status tracking
- Provide public repair status lookup system for customers without requiring authentication
- Enable efficient staff management with role-based access (Admin/Staff)
- Implement automated ticket code generation (LRP-YYYY-######) with proper sequencing
- Support real-time status updates and internal communication between staff members
- Create foundation for future features like inventory management and partner collaboration

---

## 🎯 Functional Requirements

### Core Repair Management
- **REQ-001**: System SHALL implement a 16-state repair workflow (Device Received → Assessment → Quote Provided → Approved → Parts Ordered → In Progress → Testing → Quality Check → Completed → Ready for Pickup → Delivered → Paid → Closed → Cancelled → On Hold → Warranty)
- **REQ-002**: System SHALL auto-generate unique ticket codes in format LRP-YYYY-XXXXXX using database sequences
- **REQ-003**: System SHALL provide real-time status updates via Supabase realtime subscriptions
- **REQ-004**: System SHALL support photo attachments for repair documentation with private storage
- **REQ-005**: System SHALL track repair history and warranty information per device

### Customer Management
- **REQ-006**: System SHALL use phone numbers as primary customer identifiers (Vietnamese business practice)
- **REQ-007**: System SHALL automatically create customer records when first repair ticket is submitted
- **REQ-008**: System SHALL maintain complete repair history per customer
- **REQ-009**: System SHALL provide public repair status lookup without authentication requirements

### Inventory & Parts Management
- **REQ-010**: System SHALL maintain parts catalog with laptop model compatibility tracking
- **REQ-011**: System SHALL log parts usage in repairs with pricing information
- **REQ-012**: System SHALL monitor current inventory levels (foundation for future expansion)

### Staff Management & Authentication
- **REQ-013**: System SHALL support role-based access with Shop Owner (admin) and Staff roles
- **REQ-014**: System SHALL integrate with Supabase Auth with Vietnamese error messages
- **REQ-015**: System SHALL track staff assignments per repair ticket
- **REQ-016**: System SHALL enforce Row Level Security policies for data access control

### Business Analytics
- **REQ-017**: System SHALL provide business metrics including revenue, repair counts, and popular devices
- **REQ-018**: System SHALL display repair status distribution with visual breakdown
- **REQ-019**: System SHALL track repair completion times and success rates

---

## ⚡ Non-Functional Requirements

### Performance & Scalability
- **NFR-001**: System SHALL support <10 concurrent users (small shop requirement)
- **NFR-002**: System SHALL respond to user interactions within 2 seconds
- **NFR-003**: System SHALL handle 1000+ repair tickets without performance degradation

### Localization & Usability
- **NFR-004**: System SHALL display all user interface text in Vietnamese language
- **NFR-005**: System SHALL format dates/times according to Vietnamese locale (Asia/Ho_Chi_Minh)
- **NFR-006**: System SHALL format currency in Vietnamese Dong (VND)
- **NFR-007**: System SHALL provide intuitive interface suitable for non-technical staff

### Security & Compliance
- **NFR-008**: System SHALL implement comprehensive Row Level Security policies
- **NFR-009**: System SHALL protect customer data with appropriate access controls
- **NFR-010**: System SHALL use secure authentication via Supabase Auth
- **NFR-011**: System SHALL store sensitive files in private Supabase storage buckets

### Technical Architecture
- **NFR-012**: System SHALL be built as modern web application using React 19 + TypeScript
- **NFR-013**: System SHALL use Supabase for backend services (database, auth, storage, realtime)
- **NFR-014**: System SHALL support local development environment with Docker
- **NFR-015**: System SHALL maintain type safety throughout the application stack

---

## 🎨 UI Goals and Design Principles

### Vietnamese-First Design
- **UI-001**: All interface elements SHALL be designed with Vietnamese text as primary content (not translated afterthought)
- **UI-002**: Interface SHALL use Vietnamese typography optimized for readability with diacritical marks
- **UI-003**: Date, time, and number formats SHALL follow Vietnamese conventions (dd/mm/yyyy, 24-hour time, comma decimal separator)
- **UI-004**: Currency display SHALL use Vietnamese Dong formatting (₫123.456.789)

### Accessibility & Usability
- **UI-005**: Interface SHALL be usable by non-technical staff with minimal computer experience
- **UI-006**: Navigation SHALL be intuitive with clear visual hierarchy and consistent patterns
- **UI-007**: Critical actions SHALL have confirmation dialogs to prevent accidental data loss
- **UI-008**: System SHALL provide visual feedback for all user actions (loading states, success/error messages)

### Mobile & Responsive Design
- **UI-009**: Interface SHALL be fully responsive and usable on tablets and mobile devices
- **UI-010**: Touch targets SHALL be minimum 44px for mobile usability
- **UI-011**: Mobile layout SHALL prioritize essential functions for on-the-go repair status checking

### Visual Design & Branding
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

---

## 📈 Planning & Management

### Planning Documents
- **[Epic Timeline & Phases](./prd/epic-timeline.md)** - 6-phase development plan with 13 epics, current progress tracking, and 20-27 week timeline
- **[Technical Assumptions](./prd/technical-assumptions.md)** - 30 technical assumptions covering development environment, technology stack, deployment, and extensibility

### Quick Reference
- **[Epic Overview](./epics-overview.md)** - Comprehensive status review of all 13 epics with implementation analysis and gap identification

---

## 🎯 **Current Status** (Updated: 2025-01-25)

### ✅ **Completed Work** (8/13 epics) - **Phase 1 Complete!**
- **Foundation Setup**: Development environment, database schema, admin creation
- **Core Application**: React 19 + TypeScript, routing, UI components
- **Customer Management**: Phone-based system with history tracking
- **Repair System**: 16-state workflow with real-time sync and advanced features
- **Parts Management**: Complete catalog and repair integration systems
- **Authentication**: Complete Vietnamese localization with email templates

### 📋 **Next Priority** (1/13 epics) - **Phase 2 Ready**
- **Public Repair Lookup**: Customer-facing status checking system

### 📈 **Future Development** (4/13 epics)
- Business analytics, file management, system administration, production readiness

---

## 🤝 **Team Collaboration Notes**

This sharded PRD structure allows different team members to focus on their areas of expertise:
- **Business Stakeholders**: Goals, functional requirements, user flows
- **Technical Team**: Technical assumptions, non-functional requirements, epic details
- **Design Team**: UI goals, design principles, user experience flows
- **Project Management**: Timeline, epic details, project management plans

Each document is self-contained but cross-references related sections for comprehensive coverage.

---

**PRD Version**: 1.0 (Sharded)
**Original Document**: 488 lines → 8 focused documents
**Last Updated**: 2025-01-25
**Status**: Ready for stakeholder review and development continuation