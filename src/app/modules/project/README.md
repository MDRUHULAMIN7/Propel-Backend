# Project Module

## Overview
The Project Module is the core organizational unit of the application. It groups together tasks, members, and activity logs under a single namespace.

### Problem Solved
In enterprise project management, it's critical to isolate work boundaries, restrict access to authorized team members, and track the overall progression of a project. This module solves these problems by providing a robust system for member management, workload tracking, and high-level progress analytics.

### Key Features
- CRUD operations for Projects.
- Member Management (Add/Remove members).
- Workload Tracking (Analyze how many tasks each member has, pending vs. completed).
- Progress Tracking (Calculate total project completion percentage).
- RBAC validation (Only admins, owners, or PMs can modify projects).

---

## Schema Design
The `Project` schema includes:
- `name` & `description`: Basic info.
- `status`: Enum (`Active`, `On Hold`, `Completed`).
- `owner`: Reference to the `User` who created it.
- `members`: Array of `User` references who have access to the project.

---

## API Design & Frontend Implementation Guide

### 1. Create a Project
- **Route:** `POST /api/v1/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Payload:**
  ```json
  {
    "name": "Frontend Redesign",
    "description": "Revamp the UI to use React",
    "status": "Active"
  }
  ```
- **Success Response (201 Created):** Returns the project object. The owner is automatically added to the `members` array.

### 2. Get All Projects (Paginated & Filtered)
- **Route:** `GET /api/v1/projects`
- **Query Params:** `?page=1&limit=10&search=Frontend&status=Active&sortBy=-createdAt`
- **Success Response (200 OK):** Returns a list of projects the user is a member of (or all projects if Admin). Includes `meta` data for pagination.

### 3. Get Project Details
- **Route:** `GET /api/v1/projects/:id`
- **Success Response (200 OK):** Returns detailed project info populated with owner and member details.
- **Possible Errors:** `403 Forbidden` if the user is not a member of the project.

### 4. Update a Project
- **Route:** `PATCH /api/v1/projects/:id`
- **Payload:** Partial project object.
- **Possible Errors:** `403 Forbidden` if the user is not the owner or an admin.

### 5. Add a Member
- **Route:** `POST /api/v1/projects/:id/members`
- **Payload:** `{ "userId": "<user_id>" }`
- **Possible Errors:** `409 Conflict` if the user is already a member.

### 6. Remove a Member
- **Route:** `DELETE /api/v1/projects/:id/members`
- **Payload:** `{ "userId": "<user_id>" }`
- **Possible Errors:** `400 Bad Request` if attempting to remove the project owner.

### 7. Get Project Workload
- **Route:** `GET /api/v1/projects/:id/workload`
- **Success Response (200 OK):** Returns an array of members, displaying `totalTasks`, `completedTasks`, `pendingTasks`, and `overdueTasks` per member.

### 8. Get Project Progress
- **Route:** `GET /api/v1/projects/:id/progress`
- **Success Response (200 OK):** Returns high-level metrics including `progressPercentage`.

---

## Frontend Integration Tips
1. **Charts & UI:** Use the data from the `/workload` and `/progress` endpoints to render progress bars and member workload distribution charts (using Recharts or Chart.js).
2. **Access Control:** Hide the "Add Member" button if the logged-in user is not the project `owner`.
