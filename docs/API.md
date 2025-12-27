# API Documentation
## Multi-Tenant SaaS Platform

**Version:** 1.0  
**Base URL:** `http://localhost:5000/api`  
**Date:** December 26, 2025  

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Tenants](#2-tenants)
3. [Users](#3-users)
4. [Projects](#4-projects)
5. [Tasks](#5-tasks)
6. [Error Handling](#6-error-handling)
7. [Rate Limiting](#7-rate-limiting)

---

## Overview

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Response Format
All responses are in JSON format.

**Success Response:**
```json
{
  "id": "uuid",
  "message": "Success message",
  "data": {}
}
```

**Error Response:**
```json
{
  "message": "Error message",
  "error": "Error details"
}
```

---

## 1. Authentication

### 1.1 Register Tenant

Create a new tenant organization with admin user.

**Endpoint:** `POST /api/auth/register`  
**Authentication:** None  

**Request Body:**
```json
{
  "tenantName": "Acme Corporation",
  "subdomain": "acme",
  "email": "admin@acme.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "message": "Tenant registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corporation",
    "subdomain": "acme"
  }
}
```

**Validation Rules:**
- `tenantName`: Required, 1-255 characters
- `subdomain`: Required, lowercase, alphanumeric + hyphens, unique
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `fullName`: Required, 1-255 characters

**Error Responses:**
- `400 Bad Request`: Validation error or subdomain/email already exists
- `500 Internal Server Error`: Server error

---

### 1.2 Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`  
**Authentication:** None  

**Request Body:**
```json
{
  "email": "admin@demo.com",
  "password": "Demo@123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@demo.com",
    "fullName": "Demo Tenant Admin",
    "role": "tenant_admin",
    "tenantId": "660e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials or user deactivated
- `500 Internal Server Error`: Server error

---

### 1.3 Get Current User

Retrieve authenticated user's information.

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@demo.com",
  "fullName": "Demo Tenant Admin",
  "role": "tenant_admin",
  "tenantId": "660e8400-e29b-41d4-a716-446655440000",
  "isActive": true
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

### 1.4 Logout

Logout user (client-side token removal).

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

## 2. Tenants

### 2.1 Create Tenant

Create a new tenant (mainly used internally via register).

**Endpoint:** `POST /api/tenants`  
**Authentication:** Optional (super_admin recommended)  

**Request Body:**
```json
{
  "name": "New Company",
  "subdomain": "newco",
  "subscription_plan": "pro",
  "max_users": 20,
  "max_projects": 50
}
```

**Response:** `201 Created`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "message": "Tenant created successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Validation error or subdomain exists
- `500 Internal Server Error`: Server error

---

### 2.2 List All Tenants

List all tenants (super_admin only).

**Endpoint:** `GET /api/tenants`  
**Authentication:** Required (super_admin)  

**Response:** `200 OK`
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Demo Company",
    "subdomain": "demo",
    "status": "active",
    "subscription_plan": "pro",
    "max_users": 10,
    "max_projects": 20,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not super_admin
- `500 Internal Server Error`: Server error

---

### 2.3 Get Tenant Details

Get specific tenant information.

**Endpoint:** `GET /api/tenants/:id`  
**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Demo Company",
  "subdomain": "demo",
  "status": "active",
  "subscription_plan": "pro",
  "max_users": 10,
  "max_projects": 20,
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Tenant not found
- `500 Internal Server Error`: Server error

---

### 2.4 Update Tenant

Update tenant information.

**Endpoint:** `PUT /api/tenants/:id`  
**Authentication:** Required (tenant_admin or super_admin)  

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "subscription_plan": "enterprise",
  "max_users": 50
}
```

**Response:** `200 OK`
```json
{
  "message": "Tenant updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: No valid fields to update
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Tenant not found
- `500 Internal Server Error`: Server error

---

## 3. Users

### 3.1 Create User

Create a new user in the tenant (tenant_admin only).

**Endpoint:** `POST /api/users`  
**Authentication:** Required (tenant_admin)  

**Request Body:**
```json
{
  "email": "newuser@demo.com",
  "password": "SecurePass123",
  "full_name": "New User",
  "role": "user"
}
```

**Response:** `201 Created`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "message": "User created successfully"
}
```

**Validation Rules:**
- `email`: Required, valid format, unique within tenant
- `password`: Required, minimum 6 characters
- `full_name`: Required
- `role`: Required, must be "tenant_admin" or "user"

**Error Responses:**
- `400 Bad Request`: Validation error or email exists
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not tenant_admin
- `500 Internal Server Error`: Server error

---

### 3.2 List Users

List all active users in the tenant.

**Endpoint:** `GET /api/users`  
**Authentication:** Required  

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@demo.com",
    "full_name": "Demo Tenant Admin",
    "role": "tenant_admin",
    "created_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "email": "user1@demo.com",
    "full_name": "Demo User One",
    "role": "user",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### 3.3 Get User

Get specific user details.

**Endpoint:** `GET /api/users/:id`  
**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@demo.com",
  "full_name": "Demo Tenant Admin",
  "role": "tenant_admin",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

### 3.4 Update User

Update user information (tenant_admin only).

**Endpoint:** `PUT /api/users/:id`  
**Authentication:** Required (tenant_admin)  

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "role": "tenant_admin"
}
```

**Response:** `200 OK`
```json
{
  "message": "User updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: No valid fields to update
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not tenant_admin
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

### 3.5 Deactivate User

Deactivate a user (tenant_admin only).

**Endpoint:** `DELETE /api/users/:id`  
**Authentication:** Required (tenant_admin)  

**Response:** `200 OK`
```json
{
  "message": "User deactivated successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Not tenant_admin
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

## 4. Projects

### 4.1 Create Project

Create a new project in the tenant.

**Endpoint:** `POST /api/projects`  
**Authentication:** Required  

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "active"
}
```

**Response:** `201 Created`
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "message": "Project created successfully"
}
```

**Validation Rules:**
- `name`: Required, 1-255 characters
- `description`: Optional
- `status`: Optional, must be "active", "archived", or "completed" (default: "active")

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### 4.2 List Projects

List all projects in the tenant.

**Endpoint:** `GET /api/projects`  
**Authentication:** Required  

**Response:** `200 OK`
```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Demo Project Alpha",
    "description": "First demo project",
    "status": "active",
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### 4.3 Update Project

Update project information.

**Endpoint:** `PUT /api/projects/:id`  
**Authentication:** Required  

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed"
}
```

**Response:** `200 OK`
```json
{
  "message": "Project updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: No valid fields to update
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Project not found
- `500 Internal Server Error`: Server error

---

### 4.4 Delete Project

Delete a project and all associated tasks.

**Endpoint:** `DELETE /api/projects/:id`  
**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Project not found
- `500 Internal Server Error`: Server error

---

## 5. Tasks

### 5.1 Create Task

Create a new task within a project.

**Endpoint:** `POST /api/tasks`  
**Authentication:** Required  

**Request Body:**
```json
{
  "project_id": "990e8400-e29b-41d4-a716-446655440000",
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "assigned_to": "660e8400-e29b-41d4-a716-446655440000",
  "due_date": "2025-12-31"
}
```

**Response:** `201 Created`
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440000",
  "message": "Task created successfully"
}
```

**Validation Rules:**
- `project_id`: Required, must belong to tenant
- `title`: Required, 1-255 characters
- `description`: Optional
- `status`: Optional, must be "todo", "in_progress", or "completed" (default: "todo")
- `priority`: Optional, must be "low", "medium", or "high" (default: "medium")
- `assigned_to`: Optional, must be user in tenant
- `due_date`: Optional, ISO date format

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Project not found
- `500 Internal Server Error`: Server error

---

### 5.2 List Tasks

List all tasks in the tenant, optionally filtered by project.

**Endpoint:** `GET /api/tasks?project_id=<uuid>`  
**Authentication:** Required  

**Query Parameters:**
- `project_id` (optional): Filter by project

**Response:** `200 OK`
```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "660e8400-e29b-41d4-a716-446655440000",
    "project_id": "990e8400-e29b-41d4-a716-446655440000",
    "title": "Setup project repo",
    "description": null,
    "status": "todo",
    "priority": "high",
    "assigned_to": "660e8400-e29b-41d4-a716-446655440000",
    "due_date": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### 5.3 Update Task

Update task information.

**Endpoint:** `PUT /api/tasks/:id`  
**Authentication:** Required  

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "status": "in_progress",
  "priority": "medium",
  "assigned_to": "770e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** `200 OK`
```json
{
  "message": "Task updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: No valid fields to update
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

---

### 5.4 Delete Task

Delete a task.

**Endpoint:** `DELETE /api/tasks/:id`  
**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

---

## 6. Error Handling

### Standard Error Response Format

```json
{
  "message": "Human-readable error message",
  "error": "Technical error details (development only)"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Common Error Messages

**Authentication Errors:**
- "Unauthorized" - Missing or invalid token
- "Invalid credentials" - Wrong email/password
- "Invalid token" - Expired or malformed JWT

**Authorization Errors:**
- "Forbidden" - Insufficient role permissions
- "Cross-tenant access denied" - Attempting to access another tenant's data

**Validation Errors:**
- "All fields are required" - Missing required fields
- "Email already exists" - Duplicate email
- "Invalid role" - Invalid role value
- "Project name is required" - Missing project name

---

## 7. Rate Limiting

**Current Status:** Not implemented  
**Future Implementation:** 100 requests per 15 minutes per IP

---

## 8. Changelog

### Version 1.0 (2025-12-26)
- Initial API release
- 19 endpoints implemented
- JWT authentication
- Multi-tenant isolation
- Role-based access control
- Audit logging

---

## 9. Support

For API support:
- GitHub Issues: <repository-url>/issues
- Email: support@example.com
- Documentation: docs/

---

**Last Updated:** December 26, 2025  
**API Version:** 1.0 