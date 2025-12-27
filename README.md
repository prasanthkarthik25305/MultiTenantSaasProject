# Multi-Tenant SaaS Platform

A production-ready multi-tenant SaaS project and task management system built with Node.js, Express, PostgreSQL, and React.

## 🚀 Features

- **Multi-Tenant Architecture**: Complete data isolation between tenants
- **Role-Based Access Control**: Three roles (super_admin, tenant_admin, user)
- **JWT Authentication**: Secure stateless authentication
- **Audit Logging**: Comprehensive activity tracking
- **Project Management**: Create and manage projects per tenant
- **Task Management**: Assign and track tasks within projects
- **User Management**: Tenant admins can manage users
- **Docker Support**: One-command deployment
- **Automatic Migrations**: Database schema managed via Knex.js
- **Seed Data**: Pre-populated demo data for testing

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if running locally)

## 🏃 Quick Start

### Using Docker (Recommended)

1. Clone the repository
2. Navigate to the project directory
3. Start all services:

```bash
docker-compose up -d
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

### Local Development

#### Backend

```bash
cd backend
npm install
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Demo Credentials

### Super Admin
- **Email**: superadmin@system.com
- **Password**: Admin@123
- **Access**: All tenants

### Tenant Admin (Demo Company)
- **Email**: admin@demo.com
- **Password**: Demo@123
- **Access**: Demo Company tenant only

### Regular Users (Demo Company)
- **User 1**: user1@demo.com / User@123
- **User 2**: user2@demo.com / User@123

## 📚 API Documentation

### Authentication Endpoints

#### Register Tenant
```http
POST /api/auth/register
Content-Type: application/json

{
  "tenantName": "Acme Corp",
  "subdomain": "acme",
  "email": "admin@acme.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@demo.com",
  "password": "Demo@123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Tenant Endpoints

#### List All Tenants (Super Admin Only)
```http
GET /api/tenants
Authorization: Bearer <token>
```

#### Get Tenant Details
```http
GET /api/tenants/:id
Authorization: Bearer <token>
```

#### Update Tenant
```http
PUT /api/tenants/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "subscription_plan": "pro"
}
```

### User Endpoints

#### Create User (Tenant Admin Only)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@demo.com",
  "password": "Password123",
  "full_name": "New User",
  "role": "user"
}
```

#### List Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User (Tenant Admin Only)
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "role": "tenant_admin"
}
```

#### Deactivate User (Tenant Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Project Endpoints

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description",
  "status": "active"
}
```

#### List Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

#### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project",
  "status": "completed"
}
```

#### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

### Task Endpoints

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "uuid",
  "title": "Task Title",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "assigned_to": "user_uuid",
  "due_date": "2025-12-31"
}
```

#### List Tasks
```http
GET /api/tasks?project_id=uuid
Authorization: Bearer <token>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "medium"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Tables

- **tenants**: Organization/tenant information
- **users**: User accounts with tenant association
- **projects**: Projects per tenant
- **tasks**: Tasks within projects
- **audit_logs**: Activity audit trail

### Tenant Isolation

Every table (except users with role=super_admin) includes a `tenant_id` column. All queries automatically filter by the authenticated user's tenant_id, ensuring complete data isolation.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt with salt rounds
- **Tenant Isolation**: Middleware-enforced data separation
- **Role-Based Access**: Fine-grained permission control
- **Audit Logging**: Track all critical actions
- **Input Validation**: Prevent invalid data

## 🏗️ Project Structure

```
multi-tenant-saas/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth, role, tenant checks
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── migrations/         # Database migrations
│   ├── seeds/              # Seed data
│   ├── Dockerfile
│   ├── knexfile.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── auth/           # Auth context
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
├── docs/                   # Documentation
├── docker-compose.yml
├── .env
├── submission.json
└── README.md
```

## 🧪 Testing

### Manual Testing Steps

1. **Register a new tenant**
   - Go to http://localhost:3000/register
   - Fill in organization details
   - Verify login and dashboard access

2. **Test tenant isolation**
   - Login as admin@demo.com
   - Create a project
   - Logout and login as superadmin@system.com
   - Verify you can see all tenants

3. **Test role-based access**
   - Login as user1@demo.com
   - Try to access /users (should be hidden)
   - Login as admin@demo.com
   - Access /users (should work)

4. **Test CRUD operations**
   - Create projects
   - Create tasks
   - Update and delete items
   - Verify audit logs in database

## 🐛 Troubleshooting

### Database connection issues
```bash
docker-compose down -v
docker-compose up -d
```

### Port conflicts
Edit `docker-compose.yml` and change port mappings

### Frontend can't connect to backend
Check CORS settings in `backend/src/app.js`

## 📝 Environment Variables

```env
# Database
POSTGRES_DB=multitenant_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_HOST=database

# Backend
PORT=5000
JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=24h
```

## 🚢 Deployment

### Production Considerations

1. **Change JWT_SECRET** to a strong random value
2. **Use strong database passwords**
3. **Enable HTTPS** with reverse proxy (nginx/Caddy)
4. **Set up database backups**
5. **Configure logging** (Winston, Morgan)
6. **Add rate limiting** (express-rate-limit)
7. **Set up monitoring** (PM2, New Relic)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributors

- Prasanth Karthik Varma - Initial work

## 🙏 Acknowledgments

- Express.js team
- React team
- PostgreSQL community
- Docker community