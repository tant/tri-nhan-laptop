# Functional Requirements

## Core Repair Management
- **REQ-001**: System SHALL implement a 16-state repair workflow (Device Received → Assessment → Quote Provided → Approved → Parts Ordered → In Progress → Testing → Quality Check → Completed → Ready for Pickup → Delivered → Paid → Closed → Cancelled → On Hold → Warranty)
- **REQ-002**: System SHALL auto-generate unique ticket codes in format LRP-YYYY-XXXXXX using database sequences
- **REQ-003**: System SHALL provide real-time status updates via Supabase realtime subscriptions
- **REQ-004**: System SHALL support photo attachments for repair documentation with private storage
- **REQ-005**: System SHALL track repair history and warranty information per device

## Customer Management
- **REQ-006**: System SHALL use phone numbers as primary customer identifiers (Vietnamese business practice)
- **REQ-007**: System SHALL automatically create customer records when first repair ticket is submitted
- **REQ-008**: System SHALL maintain complete repair history per customer
- **REQ-009**: System SHALL provide public repair status lookup without authentication requirements

## Inventory & Parts Management
- **REQ-010**: System SHALL maintain parts catalog with laptop model compatibility tracking
- **REQ-011**: System SHALL log parts usage in repairs with pricing information
- **REQ-012**: System SHALL monitor current inventory levels (foundation for future expansion)

## Staff Management & Authentication
- **REQ-013**: System SHALL support role-based access with Shop Owner (admin) and Staff roles
- **REQ-014**: System SHALL integrate with Supabase Auth with Vietnamese error messages
- **REQ-015**: System SHALL track staff assignments per repair ticket
- **REQ-016**: System SHALL enforce Row Level Security policies for data access control

## Business Analytics
- **REQ-017**: System SHALL provide business metrics including revenue, repair counts, and popular devices
- **REQ-018**: System SHALL display repair status distribution with visual breakdown
- **REQ-019**: System SHALL track repair completion times and success rates