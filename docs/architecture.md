# System Architecture Document
## Multi-Tenant SaaS Platform

**Version:** 1.0  
**Date:** December 26, 2025  

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

The Multi-Tenant SaaS Platform follows a three-tier architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Login      │  │  Dashboard   │  │   Projects   │     │
│  │   Register   │  │    Users     │  │    Tasks     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│                    React SPA (Port 3000)                     │
└──────────────────────────┬───────────────────────────────────┘
                          │ HTTPS/REST API
                          │ JWT Authentication
┌──────────────────────────┴───────────────────────────────────┐
│                   Application Layer                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Express.js API Server                    │  │
│  │                                                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Auth     │  │  Tenants   │  │   Users    │    │  │
│  │  │ Controller │  │ Controller │  │ Controller │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                        │  │
│  │  ┌────────────┐  ┌────────────┐                     │  │
│  │  │  Projects  │  │   Tasks    │                     │  │
│  │  │ Controller │  │ Controller │                     │  │
│  │  └────────────┘  └────────────┘                     │  │
│  │                                                        │  │
│  │              Middleware Layer                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │   Auth   │ │   Role   │ │  Tenant  │            │  │
│  │  │Middleware│ │Middleware│ │Middleware│            │  │
│  │  └──────────┘ └──────────┘ └──────────┘            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                   Node.js Runtime (Port 5000)                │
└──────────────────────────┬───────────────────────────────────┘
                          │ SQL Queries
                          │ Connection Pool
┌──────────────────────────┴───────────────────────────────────┐
│                    Data Layer                                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL Database                        │ │
│  │                                                          │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │ │
│  │  │ tenants │  │  users  │  │projects │  │  tasks  │  │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │ │
│  │                                                          │ │
│  │  ┌─────────────┐                                        │ │
│  │  │ audit_logs  │                                        │ │
│  │  └─────────────┘                                        │ │
│  │                                                          │ │
│  │              Indexes & Constraints                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│                   PostgreSQL 15 (Port 5432)                  │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Host                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Docker Compose Orchestration                  │  │
│  │                                                        │  │
│  │  ┌─────────────────┐  ┌─────────────────┐           │  │
│  │  │   Frontend      │  │    Backend      │           │  │
│  │  │   Container     │  │   Container     │           │  │
│  │  │                 │  │                 │           │  │
│  │  │  React + Vite   │  │  Node.js +     │           │  │
│  │  │  Port: 3000     │  │  Express       │           │  │
│  │  │                 │  │  Port: 5000     │           │  │
│  │  └────────┬────────┘  └────────┬────────┘           │  │
│  │           │                     │                     │  │
│  │           │                     │                     │  │
│  │           └──────────┬──────────┘                     │  │
│  │                      │                                 │  │
│  │           ┌──────────┴──────────┐                     │  │
│  │           │    Database         │                     │  │
│  │           │    Container        │                     │  │
│  │           │                     │                     │  │
│  │           │  PostgreSQL 15      │                     │  │
│  │           │  Port: 5432         │                     │  │
│  │           │  Volume: pgdata     │                     │  │
│  │           └─────────────────────┘                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                              │
│                     Docker Network                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend Architecture (React)

```
frontend/
├── src/
│   ├── api/
│   │   └── api.js                 # API client with auth headers
│   │
│   ├── auth/
│   │   └── AuthContext.jsx        # Authentication state management
│   │
│   ├── components/
│   │   └── Navbar.jsx             # Navigation component
│   │
│   ├── pages/
│   │   ├── Login.jsx              # Login page
│   │   ├── Register.jsx           # Tenant registration
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── Users.jsx              # User management
│   │   ├── Projects.jsx           # Project list
│   │   └── Tasks.jsx              # Task list
│   │
│   ├── App.jsx                    # Main app component with routing
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles
│
└── public/                        # Static assets
```

**Key Design Patterns:**
- **Context API**: Global authentication state
- **Protected Routes**: Route guards for authenticated pages
- **Component Composition**: Reusable UI components
- **Hooks**: useState, useEffect for state management

### 2.2 Backend Architecture (Node.js/Express)

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                  # Database connection
│   │
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   ├── tenantController.js    # Tenant CRUD
│   │   ├── userController.js      # User CRUD
│   │   ├── projectController.js   # Project CRUD
│   │   └── taskController.js      # Task CRUD
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT validation
│   │   ├── roleMiddleware.js      # Role checking
│   │   └── tenantMiddleware.js    # Tenant isolation
│   │
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── tenantRoutes.js        # Tenant endpoints
│   │   ├── userRoutes.js          # User endpoints
│   │   ├── projectRoutes.js       # Project endpoints
│   │   └── taskRoutes.js          # Task endpoints
│   │
│   ├── utils/
│   │   ├── jwt.js                 # JWT helper functions
│   │   ├── auditLogger.js         # Audit logging
│   │   └── waitForDb.js           # DB connection waiter
│   │
│   ├── app.js                     # Express app setup
│   └── server.js                  # Server entry point
│
├── migrations/                    # Knex migrations
│   ├── 001_create_tenants.js
│   ├── 002_create_users.js
│   ├── 003_create_projects.js
│   ├── 004_create_tasks.js
│   └── 005_create_audit_logs.js
│
└── seeds/                         # Seed data
    ├── 001_super_admin.js
    ├── 002_demo_tenant.js
    ├── 003_users.js
    ├── 004_projects.js
    └── 005_tasks.js
```

**Key Design Patterns:**
- **MVC Pattern**: Separation of concerns
- **Middleware Chain**: Request processing pipeline
- **Repository Pattern**: Database abstraction via Knex
- **Dependency Injection**: Configuration via environment variables

---

## 3. Database Architecture

### 3.1 Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│      tenants        │
├─────────────────────┤
│ id (PK)            │
│ name               │
│ subdomain (UNIQUE) │
│ status             │
│ subscription_plan  │
│ max_users          │
│ max_projects       │
│ created_at         │
│ updated_at         │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────┴──────────┐
│       users         │
├─────────────────────┤
│ id (PK)            │
│ tenant_id (FK)     │◄────────┐
│ email              │         │
│ password_hash      │         │
│ full_name          │         │
│ role               │         │
│ is_active          │         │
│ created_at         │         │
│ updated_at         │         │
└──────────┬──────────┘         │
           │                    │
           │ 1:N                │
           │                    │
┌──────────┴──────────┐         │
│      projects       │         │
├─────────────────────┤         │
│ id (PK)            │         │
│ tenant_id (FK)     │─────────┤
│ name               │         │
│ description        │         │
│ status             │         │
│ created_by (FK)    │─────────┘
│ created_at         │
│ updated_at         │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────┴──────────┐
│       tasks         │
├─────────────────────┤
│ id (PK)            │
│ tenant_id (FK)     │─────────┐
│ project_id (FK)    │─────────┤
│ title              │         │
│ description        │         │
│ status             │         │
│ priority           │         │
│ assigned_to (FK)   │─────────┤
│ due_date           │         │
│ created_at         │         │
│ updated_at         │         │
└─────────────────────┘         │
                                │
                                │
┌───────────────────────────────┴─┐
│        audit_logs               │
├─────────────────────────────────┤
│ id (PK)                        │
│ tenant_id (FK)                 │
│ user_id (FK)                   │
│ action                         │
│ entity_type                    │
│ entity_id                      │
│ ip_address                     │
│ created_at                     │
└─────────────────────────────────┘
```

### 3.2 Tenant Isolation Strategy

**Row-Level Isolation:**
Every table (except super_admin users) includes `tenant_id` column.

**Query Pattern:**
```sql
-- All queries must include tenant_id filter
SELECT * FROM projects WHERE tenant_id = :tenant_id;
SELECT * FROM tasks WHERE tenant_id = :tenant_id AND project_id = :project_id;
```

**Enforcement:**
- Middleware extracts tenant_id from JWT
- Controllers include tenant_id in all queries
- Database indexes on tenant_id for performance

### 3.3 Indexing Strategy

```sql
-- Tenants
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);

-- Users
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_tenant_email ON users(tenant_id, email);

-- Projects
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- Tasks
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_tasks_tenant_project ON tasks(tenant_id, project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Audit Logs
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │ Backend │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  1. POST /api/auth/login                    │
     │     { email, password }                     │
     ├────────────────────────────────────────────►│
     │                                              │
     │                                              │ 2. Validate
     │                                              │    credentials
     │                                              │
     │  3. Return JWT token                        │
     │     { token, user }                         │
     │◄────────────────────────────────────────────┤
     │                                              │
     │  4. Store token in localStorage             │
     │                                              │
     │  5. Subsequent requests                     │
     │     Authorization: Bearer <token>           │
     ├────────────────────────────────────────────►│
     │                                              │
     │                                              │ 6. Verify JWT
     │                                              │    Extract payload
     │                                              │
     │  7. Return data                             │
     │◄────────────────────────────────────────────┤
     │                                              │
```

### 4.2 Authorization Layers

**Layer 1: Authentication Middleware**
- Validates JWT token
- Extracts user context (userId, tenantId, role)
- Rejects invalid/expired tokens

**Layer 2: Role Middleware**
- Checks user role against required roles
- Enforces role hierarchy
- Returns 403 for unauthorized access

**Layer 3: Tenant Middleware**
- Validates tenant context
- Prevents cross-tenant access
- Allows super_admin to access all tenants

**Layer 4: Resource-Level Authorization**
- Validates resource ownership
- Checks tenant association
- Enforces business rules

### 4.3 Data Protection

**At Rest:**
- Password hashing: bcrypt (10 rounds)
- Database encryption: PostgreSQL native encryption
- Backup encryption: Enabled

**In Transit:**
- HTTPS/TLS 1.3
- Secure headers (Helmet.js)
- CORS configuration

**Application Level:**
- Input validation
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)
- CSRF protection (SameSite cookies)

---

## 5. API Architecture

### 5.1 RESTful Design Principles

**Resource-Based URLs:**
```
/api/tenants
/api/users
/api/projects
/api/tasks
```

**HTTP Methods:**
- GET: Retrieve resources
- POST: Create resources
- PUT: Update resources
- DELETE: Delete resources

**Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### 5.2 Request/Response Format

**Request:**
```http
POST /api/projects
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description",
  "status": "active"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "uuid",
  "message": "Project created successfully"
}
```

**Error Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "message": "Project name is required",
  "error": "Validation error"
}
```

---

## 6. Scalability Considerations

### 6.1 Horizontal Scaling

**Stateless Design:**
- No server-side sessions
- JWT-based authentication
- Database connection pooling

**Load Balancing:**
```
┌─────────┐
│  Load   │
│Balancer │
└────┬────┘
     │
     ├──────────┬──────────┬──────────┐
     │          │          │          │
┌────▼────┐┌───▼────┐┌───▼────┐┌───▼────┐
│Backend 1││Backend 2││Backend 3││Backend 4│
└─────────┘└────────┘└────────┘└────────┘
     │          │          │          │
     └──────────┴──────────┴──────────┘
                    │
              ┌─────▼─────┐
              │ PostgreSQL│
              │  Primary  │
              └───────────┘
```

### 6.2 Database Scaling

**Connection Pooling:**
- Pool size: 20 connections
- Idle timeout: 30 seconds
- Connection reuse

**Read Replicas (Future):**
- Primary for writes
- Replicas for reads
- Replication lag monitoring

**Partitioning (Future):**
- Partition by tenant_id
- Improved query performance
- Easier tenant migration

### 6.3 Caching Strategy (Future)

**Application Cache:**
- Redis for session data
- Cache tenant configurations
- Cache user permissions

**Database Query Cache:**
- Frequent queries cached
- TTL-based invalidation
- Cache warming strategies

---

## 7. Monitoring and Observability

### 7.1 Logging Strategy

**Application Logs:**
- Request/response logging
- Error logging with stack traces
- Audit trail logging
- Performance metrics

**Log Levels:**
- ERROR: Critical issues
- WARN: Potential problems
- INFO: General information
- DEBUG: Detailed debugging

### 7.2 Metrics to Track

**System Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

**Application Metrics:**
- Request rate
- Response time (p50, p95, p99)
- Error rate
- Active users

**Business Metrics:**
- Tenant count
- User count per tenant
- Project/task creation rate
- API usage per tenant

### 7.3 Health Checks

**Endpoint:** `GET /api/health`

**Checks:**
- Database connectivity
- Application status
- Memory usage
- Uptime

---

## 8. Disaster Recovery

### 8.1 Backup Strategy

**Database Backups:**
- Daily full backups
- Hourly incremental backups
- 30-day retention
- Geo-redundant storage

**Application Backups:**
- Docker images versioned
- Configuration backed up
- Infrastructure as code

### 8.2 Recovery Procedures

**RTO (Recovery Time Objective):** 1 hour  
**RPO (Recovery Point Objective):** 1 hour

**Recovery Steps:**
1. Identify failure scope
2. Restore from latest backup
3. Verify data integrity
4. Resume operations
5. Post-mortem analysis

---

## 9. Technology Decisions

### 9.1 Why Node.js + Express?

**Pros:**
- Excellent async I/O performance
- Large ecosystem (npm)
- JavaScript full-stack
- Easy horizontal scaling
- Strong community support

**Cons:**
- Single-threaded (mitigated by clustering)
- Callback complexity (mitigated by async/await)

### 9.2 Why PostgreSQL?

**Pros:**
- ACID compliance
- Advanced features (JSON, full-text search)
- Strong data integrity
- Excellent performance
- Open source

**Cons:**
- More complex than MySQL
- Requires tuning for optimal performance

### 9.3 Why React?

**Pros:**
- Component-based architecture
- Virtual DOM performance
- Large ecosystem
- Strong community
- Easy to learn

**Cons:**
- Requires build tooling
- State management complexity (mitigated by Context API)

### 9.4 Why Docker?

**Pros:**
- Consistent environments
- Easy deployment
- Isolation
- Portability
- Scalability

**Cons:**
- Learning curve
- Resource overhead
- Networking complexity

---

## 10. Future Enhancements

### 10.1 Short-Term (3-6 months)
- Redis caching layer
- Rate limiting per tenant
- Advanced monitoring (Prometheus + Grafana)
- Automated testing suite
- CI/CD pipeline

### 10.2 Medium-Term (6-12 months)
- Microservices architecture
- Message queue (RabbitMQ/Kafka)
- Real-time features (WebSockets)
- Advanced analytics
- Mobile applications

### 10.3 Long-Term (12+ months)
- Multi-region deployment
- AI/ML features
- Advanced workflow automation
- Custom integrations
- White-label solution

---

## 11. Conclusion

This architecture provides a solid foundation for a scalable, secure, and maintainable multi-tenant SaaS platform. The design emphasizes:

- **Security**: Multiple layers of authentication and authorization
- **Scalability**: Stateless design enabling horizontal scaling
- **Maintainability**: Clean separation of concerns and comprehensive documentation
- **Performance**: Optimized database queries and efficient resource usage
- **Reliability**: Comprehensive error handling and disaster recovery procedures

The architecture is designed to evolve with business needs while maintaining backward compatibility and system stability.