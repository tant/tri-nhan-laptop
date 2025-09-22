# Story 01.1: Docker Infrastructure Setup

## User Story

**As a** system administrator,
**I want** a complete Docker Compose setup with all Supabase services running,
**So that** the development team có môi trường backend infrastructure ổn định để phát triển ứng dụng.

## Story Context

**Project Foundation:**
- Greenfield project bắt đầu từ đầu
- Self-hosted Supabase stack với Docker Compose
- Kong API Gateway cho internal service routing
- 3-phase deployment process: env → init → data

**Technology Stack:**
- Docker & Docker Compose
- Supabase full stack (db, auth, rest, storage, realtime, functions, kong)
- PostgreSQL database
- Kong API Gateway (internal)

## Acceptance Criteria

### **Functional Requirements:**

**AC-F1: Docker Compose Configuration**
```gherkin
GIVEN a fresh development environment
WHEN I run `make env` command
THEN all Supabase services start successfully
AND services include: db, auth, rest, storage, realtime, functions, kong, studio
AND all services reach healthy status within 120 seconds
```

**AC-F2: Network & Port Configuration**
```gherkin
GIVEN Docker services are running
WHEN I check exposed ports
THEN port 8000 serves Kong HTTP gateway
AND port 8443 serves Kong HTTPS gateway
AND port 3010 serves Supabase Studio
AND port 5433 serves PostgreSQL (for external tools)
AND internal services are NOT exposed externally
```

**AC-F3: Service Health Checks**
```gherkin
GIVEN all services are started
WHEN I perform health checks
THEN Kong gateway responds with 200 on localhost:8000/health
AND Studio UI loads successfully on localhost:3010
AND PostgreSQL accepts connections on localhost:5433
AND all internal services report healthy status
```

**AC-F4: Environment Variables Loading**
```gherkin
GIVEN .env.supabase file exists with required variables
WHEN Docker Compose starts services
THEN JWT_SECRET is properly configured
AND ANON_KEY and SERVICE_ROLE_KEY are set
AND PostgreSQL credentials are configured
AND Kong routing is set to internal services
```

### **Integration Requirements:**

**AC-I1: Kong Internal Routing**
```gherkin
GIVEN Kong gateway is running
WHEN I make requests to Kong endpoints
THEN /auth/* routes to auth service (port 9999)
AND /rest/* routes to PostgREST service (port 3000)
AND /storage/* routes to storage service (port 5000)
AND /realtime/* routes to realtime service (port 4000)
AND /functions/* routes to functions service (port 8081)
```

**AC-I2: Data Persistence**
```gherkin
GIVEN services are running
WHEN I stop and restart Docker Compose
THEN database data persists in supabase/volumes/db
AND storage files persist in supabase/volumes/storage
AND all configurations remain intact
```

**AC-I3: Service Dependencies**
```gherkin
GIVEN Docker Compose starts services
WHEN services initialize
THEN database starts before dependent services
AND Kong starts after all backend services are healthy
AND startup order prevents connection failures
```

### **Quality Requirements:**

**AC-Q1: Clean Environment Reset**
```gherkin
GIVEN existing Docker environment (if any)
WHEN I run `make clean` command
THEN all project containers are removed
AND all project volumes are removed
AND all project networks are removed
AND system is ready for fresh installation
```

**AC-Q2: Error Handling**
```gherkin
GIVEN Docker Compose environment
WHEN any service fails to start
THEN error messages are clear and actionable
AND failing service logs are accessible
AND restart attempts follow backoff strategy
```

**AC-Q3: Development Environment Isolation**
```gherkin
GIVEN multiple developers on same machine
WHEN Docker Compose runs
THEN containers use unique project prefix
AND ports do not conflict with other projects
AND volumes are project-specific
```

### **Security Requirements:**

**AC-S1: Secret Management**
```gherkin
GIVEN environment setup
WHEN services start with secrets
THEN JWT secrets are properly configured
AND database passwords are unique and strong
AND service role keys are properly restricted
AND no secrets appear in Docker logs
```

**AC-S2: Network Security**
```gherkin
GIVEN Docker network configuration
WHEN services communicate
THEN internal services only communicate within Docker network
AND external access is limited to designated ports only
AND no unauthorized service exposure occurs
```

## Technical Implementation Details

### **Docker Compose Structure:**
```yaml
services:
  # Database
  supabase-db-dev:
    image: supabase/postgres:15.1.0.X

  # Authentication
  supabase-auth-dev:
    image: supabase/gotrue:v2.X.X
    depends_on: [supabase-db-dev]

  # REST API
  supabase-rest-dev:
    image: postgrest/postgrest:v11.X.X
    depends_on: [supabase-db-dev]

  # Storage
  supabase-storage-dev:
    image: supabase/storage-api:v0.X.X
    depends_on: [supabase-db-dev, supabase-rest-dev]

  # Realtime
  supabase-realtime-dev:
    image: supabase/realtime:v2.X.X
    depends_on: [supabase-db-dev]

  # Functions
  supabase-functions-dev:
    image: supabase/edge-runtime:v1.X.X

  # API Gateway
  supabase-kong-dev:
    image: kong:2.8-alpine
    depends_on: [supabase-auth-dev, supabase-rest-dev, supabase-storage-dev]

  # Studio
  supabase-studio-dev:
    image: supabase/studio:20231X.X.X
    depends_on: [supabase-rest-dev]
```

### **Makefile Commands:**
```bash
make env     # Start all services
make dev     # Start services + app (future)
make clean   # Complete environment reset
make logs    # View service logs
make status  # Check service health
```

### **Automated Testing Scenarios:**

**Test Suite: Infrastructure Validation**
```typescript
describe('Docker Infrastructure Setup', () => {
  test('AC-F1: All services start successfully', async () => {
    await execCommand('make clean && make env');
    const services = await getDockerServices();
    expect(services).toHaveProperty('supabase-db-dev', 'healthy');
    expect(services).toHaveProperty('supabase-kong-dev', 'healthy');
    // ... validate all services
  });

  test('AC-F2: Correct ports are exposed', async () => {
    const ports = await getExposedPorts();
    expect(ports).toContain('8000'); // Kong HTTP
    expect(ports).toContain('8443'); // Kong HTTPS
    expect(ports).toContain('3010'); // Studio
    expect(ports).not.toContain('9999'); // Auth internal
  });

  test('AC-I1: Kong routing works correctly', async () => {
    const authResponse = await fetch('http://localhost:8000/auth/v1/settings');
    expect(authResponse.status).toBe(200);

    const restResponse = await fetch('http://localhost:8000/rest/v1/');
    expect(restResponse.status).toBe(200);
  });
});
```

## Definition of Done

- [ ] **AC-F1:** Docker Compose starts all services successfully
- [ ] **AC-F2:** Correct ports exposed, internal services isolated
- [ ] **AC-F3:** All health checks pass consistently
- [ ] **AC-F4:** Environment variables loaded correctly
- [ ] **AC-I1:** Kong routing to all internal services works
- [ ] **AC-I2:** Data persistence verified through restart
- [ ] **AC-I3:** Service startup dependencies work correctly
- [ ] **AC-Q1:** Clean environment reset functional
- [ ] **AC-Q2:** Error handling provides clear feedback
- [ ] **AC-Q3:** Environment isolation working
- [ ] **AC-S1:** Secret management secure
- [ ] **AC-S2:** Network security properly configured
- [ ] **Documentation:** Setup instructions clear and complete
- [ ] **Automated Tests:** All acceptance criteria have corresponding tests

## Risk Mitigation

- **Primary Risk:** Service startup failures or dependency issues
- **Mitigation:** Comprehensive health checks, proper dependency ordering
- **Rollback Plan:** `make clean` provides complete environment reset

## Story Dependencies

- **Prerequisites:** None (foundation story)
- **Enables:** All subsequent stories require this infrastructure
- **Estimated Effort:** 1-2 days
- **Priority:** Highest (blocker for all other work)