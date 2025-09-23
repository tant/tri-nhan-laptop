# Non-Functional Requirements

## Performance & Scalability
- **NFR-001**: System SHALL support <10 concurrent users (small shop requirement)
- **NFR-002**: System SHALL respond to user interactions within 2 seconds
- **NFR-003**: System SHALL handle 1000+ repair tickets without performance degradation

## Localization & Usability
- **NFR-004**: System SHALL display all user interface text in Vietnamese language
- **NFR-005**: System SHALL format dates/times according to Vietnamese locale (Asia/Ho_Chi_Minh)
- **NFR-006**: System SHALL format currency in Vietnamese Dong (VND)
- **NFR-007**: System SHALL provide intuitive interface suitable for non-technical staff

## Security & Compliance
- **NFR-008**: System SHALL implement comprehensive Row Level Security policies
- **NFR-009**: System SHALL protect customer data with appropriate access controls
- **NFR-010**: System SHALL use secure authentication via Supabase Auth
- **NFR-011**: System SHALL store sensitive files in private Supabase storage buckets

## Technical Architecture
- **NFR-012**: System SHALL be built as modern web application using React 19 + TypeScript
- **NFR-013**: System SHALL use Supabase for backend services (database, auth, storage, realtime)
- **NFR-014**: System SHALL support local development environment with Docker
- **NFR-015**: System SHALL maintain type safety throughout the application stack