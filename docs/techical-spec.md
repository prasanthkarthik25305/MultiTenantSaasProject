# Technical Specifications
## Multi-Tenant SaaS Platform

**Version:** 1.0  
**Date:** December 26, 2025  

---

## 1. Development Environment Setup

### 1.1 Prerequisites

**Required Software:**
- Docker Desktop 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)
- Git 2.30+
- Code Editor (VS Code recommended)

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- Docker
- PostgreSQL
- REST Client

### 1.2 Local Development Setup

**Step 1: Clone Repository**
```bash
git clone <repository-url>
cd multi-tenant-saas
```

**Step 2: Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**Step 3: Configure Environment**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your settings
```

**Step 4: Start Database**
```bash
docker-compose up -d database
```

**Step 5: Run Migrations and Seeds**
```bash
cd backend
npx knex migrate:latest
npx knex seed:run
```

**Step 6: Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 2. Docker Deployment

### 2.1 Quick Start with Docker Compose

**Single Command Deployment:**
```bash
docker-compose up -d
```

This command will:
1. Build frontend and backend images
2. Start PostgreSQL database
3. Run migrations and seeds automatically
4. Start all services

**Verify Deployment:**
```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:5000/api/health
```

### 2.2 Docker Compose Configuration

**File: docker-compose.yml**
```yaml
version: "3.9"

services:
  database:
    image: postgres:15
    container_name: database
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: backend
    ports:
      - "5000:5000"
    env_file:
      - .env
    depends_on:
      database:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  pgdata:
```

### 2.3 Docker Commands Reference

**Start Services:**
```bash
docker-compose up -d
```

**Stop Services:**
```bash
docker-compose down
```

**Rebuild and Restart:**
```bash
docker-compose up -d --build
```

**View Logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

**Execute Commands in Container:**
```bash
# Backend shell
docker-compose exec backend sh

# Database shell
docker-compose exec database psql -U postgres -d multitenant_db
```

**Clean Up (Including Volumes):**
```bash
docker-compose down -v
```

---

## 3. Database Management

### 3.1 Migration Management

**Create New Migration:**
```bash
cd backend
npx knex migrate:make migration_name
```

**Run Migrations:**
```bash
npx knex migrate:latest
```

**Rollback Migration:**
```bash
npx knex migrate:rollback
```

**Check Migration Status:**
```bash
npx knex migrate:status
```

### 3.2 Seed Data Management

**Run All Seeds:**
```bash
npx knex seed:run
```

**Run Specific Seed:**
```bash
npx knex seed:run --specific=001_super_admin.js
```

**Create New Seed:**
```bash
npx knex seed:make seed_name
```

### 3.3 Database Connection

**Connection String:**
```
postgresql://postgres:postgres@localhost:5432/multitenant_db
```

**Direct Connection:**
```bash
psql -h localhost -U postgres -d multitenant_db
```

**Common SQL Queries:**
```sql
-- List all tables
\dt

-- Describe table
\d users

-- Count records
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM tasks;

-- View seed data
SELECT * FROM tenants;
SELECT email, role FROM users;
```

---

## 4. API Testing

### 4.1 Using cURL

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Register Tenant:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Company",
    "subdomain": "test",
    "email": "admin@test.com",
    "password": "Test@123",
    "fullName": "Test Admin"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123"
  }'
```

**Get Current User:**
```bash
TOKEN="your-jwt-token"
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Create Project:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Test project",
    "status": "active"
  }'
```

### 4.2 Using Postman

**Import Collection:**
1. Create new collection "Multi-Tenant SaaS"
2. Add environment variables:
   - `base_url`: http://localhost:5000
   - `token`: (set after login)

**Collection Structure:**
```
Multi-Tenant SaaS/
├── Auth/
│   ├── Register
│   ├── Login
│   ├── Get Current User
│   └── Logout
├── Tenants/
│   ├── List All (Super Admin)
│   ├── Get Tenant
│   └── Update Tenant
├── Users/
│   ├── Create User
│   ├── List Users
│   ├── Get User
│   ├── Update User
│   └── Deactivate User
├── Projects/
│   ├── Create Project
│   ├── List Projects
│   ├── Update Project
│   └── Delete Project
└── Tasks/
    ├── Create Task
    ├── List Tasks
    ├── Update Task
    └── Delete Task
```

---

## 5. Testing Strategy

### 5.1 Manual Testing Checklist

**Authentication:**
- [ ] Register new tenant
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Access protected route without token
- [ ] Access protected route with expired token
- [ ] Logout

**Tenant Isolation:**
- [ ] Create project in Tenant A
- [ ] Login as Tenant B
- [ ] Verify cannot see Tenant A's projects
- [ ] Verify cannot access Tenant A's resources

**Role-Based Access:**
- [ ] Login as regular user
- [ ] Verify cannot access user management
- [ ] Login as tenant admin
- [ ] Verify can access user management
- [ ] Login as super admin
- [ ] Verify can access all tenants

**CRUD Operations:**
- [ ] Create project
- [ ] Read project list
- [ ] Update project
- [ ] Delete project
- [ ] Create task
- [ ] Update task status
- [ ] Assign task to user
- [ ] Delete task

### 5.2 Automated Testing (Future)

**Unit Tests:**
```javascript
// Example: Test JWT generation
describe('JWT Utils', () => {
  test('should generate valid token', () => {
    const payload = { userId: '123', tenantId: '456', role: 'user' };
    const token = generateToken(payload);
    expect(token).toBeDefined();
  });

  test('should verify valid token', () => {
    const payload = { userId: '123', tenantId: '456', role: 'user' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('123');
  });
});
```

**Integration Tests:**
```javascript
// Example: Test API endpoints
describe('Projects API', () => {
  let token;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@demo.com', password: 'Demo@123' });
    token = response.body.token;
  });

  test('should create project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project', status: 'active' });
    expect(response.status).toBe(201);
  });
});
```

---

## 6. Environment Variables

### 6.1 Required Variables

**File: .env**
```env
# Database Configuration
POSTGRES_DB=multitenant_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_HOST=database

# Backend Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Frontend Configuration (if needed)
REACT_APP_API_URL=http://localhost:5000
```

### 6.2 Production Variables

**Additional for Production:**
```env
# Security
JWT_SECRET=<strong-random-secret-256-bits>
BCRYPT_ROUNDS=12

# Database
DB_SSL=true
DB_POOL_MIN=2
DB_POOL_MAX=10

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=<your-sentry-dsn>

# CORS
ALLOWED_ORIGINS=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

---

## 7. Performance Optimization

### 7.1 Database Optimization

**Connection Pooling:**
```javascript
// knexfile.js
module.exports = {
  development: {
    client: 'pg',
    connection: {
      // connection details
    },
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000
    }
  }
};
```

**Query Optimization:**
```javascript
// Bad: N+1 query problem
const projects = await knex('projects').where({ tenant_id });
for (const project of projects) {
  project.tasks = await knex('tasks').where({ project_id: project.id });
}

// Good: Use joins
const projects = await knex('projects')
  .leftJoin('tasks', 'projects.id', 'tasks.project_id')
  .where('projects.tenant_id', tenant_id)
  .select('projects.*', 'tasks.*');
```

### 7.2 API Performance

**Response Compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

**Pagination:**
```javascript
// GET /api/projects?page=1&limit=20
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const offset = (page - 1) * limit;

const projects = await knex('projects')
  .where({ tenant_id })
  .limit(limit)
  .offset(offset);
```

### 7.3 Frontend Performance

**Code Splitting:**
```javascript
// Use React.lazy for route-based code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Projects = React.lazy(() => import('./pages/Projects'));
```

**Memoization:**
```javascript
// Use React.memo for expensive components
const ProjectCard = React.memo(({ project }) => {
  // component code
});
```

---

## 8. Security Best Practices

### 8.1 Code Security

**Input Validation:**
```javascript
// Always validate and sanitize input
const { name, description } = req.body;

if (!name || name.trim().length === 0) {
  return res.status(400).json({ message: 'Name is required' });
}

if (name.length > 255) {
  return res.status(400).json({ message: 'Name too long' });
}
```

**SQL Injection Prevention:**
```javascript
// Bad: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// Good: Parameterized queries (Knex does this automatically)
const user = await knex('users').where({ email }).first();
```

**XSS Prevention:**
```javascript
// React automatically escapes content
// But be careful with dangerouslySetInnerHTML
<div>{user.name}</div>  // Safe
<div dangerouslySetInnerHTML={{__html: user.bio}} />  // Dangerous!
```

### 8.2 Authentication Security

**Password Requirements:**
- Minimum 6 characters
- Hashed with bcrypt (10 rounds)
- Never logged or displayed

**JWT Security:**
- Short expiration (24 hours)
- Secure secret (256-bit random)
- HTTPS only in production
- HttpOnly cookies (future enhancement)

### 8.3 HTTPS Configuration

**Production Setup:**
```javascript
// Use helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// Force HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## 9. Monitoring and Logging

### 9.1 Application Logging

**Winston Logger Setup:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 9.2 Request Logging

**Morgan Middleware:**
```javascript
const morgan = require('morgan');

// Development
app.use(morgan('dev'));

// Production
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
```

### 9.3 Error Tracking

**Sentry Integration:**
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

---

## 10. Deployment Checklist

### 10.1 Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] SSL certificates ready
- [ ] Domain DNS configured

### 10.2 Deployment Steps

1. **Backup Production Database**
   ```bash
   pg_dump -h localhost -U postgres multitenant_db > backup.sql
   ```

2. **Pull Latest Code**
   ```bash
   git pull origin main
   ```

3. **Build Docker Images**
   ```bash
   docker-compose build
   ```

4. **Run Migrations**
   ```bash
   docker-compose exec backend npx knex migrate:latest
   ```

5. **Start Services**
   ```bash
   docker-compose up -d
   ```

6. **Verify Deployment**
   ```bash
   curl https://yourdomain.com/api/health
   ```

### 10.3 Post-Deployment

- [ ] Verify all services running
- [ ] Check application logs
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Verify database connectivity
- [ ] Test authentication
- [ ] Verify tenant isolation

---

## 11. Troubleshooting

### 11.1 Common Issues

**Issue: Database connection refused**
```bash
# Solution: Ensure database is running
docker-compose ps
docker-compose up -d database

# Check database logs
docker-compose logs database
```

**Issue: Port already in use**
```bash
# Solution: Find and kill process
lsof -i :5000
kill -9 <PID>

# Or change port in .env
PORT=5001
```

**Issue: Migrations fail**
```bash
# Solution: Rollback and retry
npx knex migrate:rollback
npx knex migrate:latest

# Or reset database
docker-compose down -v
docker-compose up -d
```

**Issue: Frontend can't connect to backend**
```bash
# Solution: Check CORS configuration
# Ensure backend allows frontend origin
# Check API_BASE URL in frontend
```

### 11.2 Debug Mode

**Enable Debug Logging:**
```env
LOG_LEVEL=debug
NODE_ENV=development
```

**Database Query Logging:**
```javascript
// knexfile.js
module.exports = {
  development: {
    // ...
    debug: true  // Enable query logging
  }
};
```

---

## 12. Maintenance

### 12.1 Regular Tasks

**Daily:**
- Monitor error logs
- Check system health
- Verify backups

**Weekly:**
- Review performance metrics
- Check disk space
- Update dependencies (security patches)

**Monthly:**
- Full system backup
- Performance optimization review
- Security audit
- Dependency updates

### 12.2 Backup Procedures

**Automated Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
docker-compose exec -T database pg_dump -U postgres multitenant_db > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

### 12.3 Update Procedures

**Update Dependencies:**
```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

**Update Docker Images:**
```bash
docker-compose pull
docker-compose up -d --build
```

---

## 13. Conclusion

This technical specification provides comprehensive guidance for developing, deploying, and maintaining the Multi-Tenant SaaS Platform. Follow these specifications to ensure consistent, secure, and high-performance operation of the system.

For additional support:
- Review API documentation: docs/API.md
- Check architecture diagrams: docs/architecture.md
- Refer to PRD: docs/PRD.md