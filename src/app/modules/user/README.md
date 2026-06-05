# User Module

## Overview
The User module is responsible for managing user accounts, profiles, and role assignments across the application. 

### Problem Solved
As applications scale, administrators need a robust way to manage the user base, upgrade user roles, and moderate accounts. Users also need a way to view and update their profiles. This module solves these problems by providing secure, role-based CRUD (Create, Read, Update, Delete) operations for the user entity.

### Key Features
- Centralized user querying with advanced Search, Filter, Sort, and Pagination.
- Role-based Access Control (RBAC) ensuring only Admins can list all users or change roles.
- Self-service profile updates for users.
- Soft-delete functionality to preserve data integrity while disabling accounts.

---

## Schema Design
**Collection:** `users`

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `name` | String | Required, Min 2, Max 50 | The user's full name. |
| `email` | String | Required, Unique | The user's email address. |
| `password` | String | Required, Select: false | Hashed password. Hidden from normal queries by default for security. |
| `role` | String | Enum | Defines privileges: `ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`. |
| `avatar` | String | Optional | URL to the user's profile picture. |
| `isActive` | Boolean | Default: true | Used for soft-deleting users without dropping database records. |
| `createdAt` / `updatedAt` | Date | Auto-generated | Mongoose timestamps. |

---

## API Design & Frontend Implementation Guide

### 1. Get All Users (Admin Only)
- **Route:** `GET /api/v1/user`
- **Headers:** `Authorization: Bearer <admin_access_token>`
- **Query Parameters:**
  - `searchTerm`: Search by name or email (e.g., `?searchTerm=john`)
  - `page` & `limit`: Pagination (e.g., `?page=1&limit=10`)
  - `sort`: Sorting (e.g., `?sort=-createdAt` or `?sort=name`)
- **Success Response (200 OK):** 
  ```json
  {
    "success": true,
    "data": [...users],
    "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
  }
  ```
- **Frontend Tip:** Use these query parameters directly with your frontend data tables (like TanStack Table or Ant Design Table) to handle server-side pagination and search seamlessly.

### 2. Get My Profile
- **Route:** `GET /api/v1/user/me`
- **Headers:** `Authorization: Bearer <your_access_token>`
- **Success Response (200 OK):** Returns the full profile of the currently authenticated user.

### 3. Get Single User By ID
- **Route:** `GET /api/v1/user/:id`
- **Headers:** `Authorization: Bearer <your_access_token>`
- **Success Response (200 OK):** Returns the user document for the given ID.
- **Possible Errors:** `404 Not Found` ("User not found").

### 4. Update Profile
- **Route:** `PATCH /api/v1/user/:id`
- **Headers:** `Authorization: Bearer <your_access_token>`
- **Payload:**
  ```json
  {
    "name": "John Updated",
    "avatar": "https://example.com/new-avatar.jpg"
  }
  ```
- **Success Response (200 OK):** Returns the updated user profile.
- **Possible Errors:** `403 Forbidden` ("You do not have permission" - if trying to update someone else's profile without Admin rights).

### 5. Update User Role (Admin Only)
- **Route:** `PATCH /api/v1/user/:id/role`
- **Headers:** `Authorization: Bearer <admin_access_token>`
- **Payload:**
  ```json
  {
    "role": "PROJECT_MANAGER"
  }
  ```
- **Success Response (200 OK):** Returns the updated user document.
- **Possible Errors:** `400 Bad Request` ("You cannot change your own role").

### 6. Delete User
- **Route:** `DELETE /api/v1/user/:id`
- **Headers:** `Authorization: Bearer <your_access_token>`
- **Success Response (200 OK):** Performs a soft-delete (sets `isActive: false`).
- **Possible Errors:** `400 Bad Request` ("You cannot delete yourself").
