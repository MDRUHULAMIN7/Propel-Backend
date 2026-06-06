# Task Module

## Overview
The Task module manages individual units of work within a Project.

### Problem Solved
Teams need to track granular pieces of work, assign them to specific people, set deadlines, and attach necessary files. This module solves this by enforcing unique task titles within a project, managing task statuses, and integrating deeply with Cloudinary for seamless file attachments.

### Key Features
- Granular CRUD operations for tasks.
- Duplicate Title Prevention (Compound indexing on `title` + `project`).
- Status and Priority tracking.
- File Attachments via Multer & Cloudinary.
- Strict Business Logic (e.g., Cannot reassign a completed task, team members can only edit tasks assigned to them).

---

## Schema Design
The `Task` schema includes:
- `title` & `description`
- `project`: Reference to Project.
- `assignedTo`: Reference to User.
- `createdBy`: Reference to User.
- `status`: (`To Do`, `In Progress`, `Review`, `Completed`)
- `priority`: (`Low`, `Medium`, `High`, `Urgent`)
- `dueDate` & `attachments` array.

---

## API Design & Frontend Implementation Guide

### 1. Create a Task
- **Route:** `POST /api/v1/tasks`
- **Payload:**
  ```json
  {
    "title": "Setup CI/CD",
    "project": "<project_id>",
    "assignedTo": "<user_id>",
    "priority": "High",
    "dueDate": "2026-12-31"
  }
  ```
- **Possible Errors:**
  - `409 Conflict`: "Task with this title already exists in this project".
  - `400 Bad Request`: "Assignee must be a member of the project".

### 2. Get Tasks (With Pagination & Filters)
- **Route:** `GET /api/v1/tasks`
- **Query Params:** `?projectId=<id>&status=To Do&priority=High&overdue=true&search=CI/CD`
- **Success Response:** Returns tasks. For team members, automatically filters to projects they belong to.

### 3. Update Task Details
- **Route:** `PATCH /api/v1/tasks/:id`
- **Payload:** Partial task fields.
- **Possible Errors:** `403 Forbidden` if a team member tries to edit a task not assigned to them.

### 4. Update Task Status (Kanban friendly)
- **Route:** `PATCH /api/v1/tasks/:id/status`
- **Payload:** `{ "status": "Completed" }`
- **Note:** This is specifically optimized for Kanban drag-and-drop interfaces.

### 5. Upload Attachments
- **Route:** `POST /api/v1/tasks/:id/attachments`
- **Headers:** `Content-Type: multipart/form-data`
- **Payload:** Key `files`, attach multiple files (Images/PDFs).
- **Success Response (200 OK):** Files are uploaded to Cloudinary, and URLs are saved in the task.

---

## Frontend Integration Tips
1. **Drag and Drop Boards:** Use the `/status` route for quick updates when a user drags a task card from one column to another.
2. **File Upload Forms:** Ensure you set `multipart/form-data` in your Axios headers when hitting the attachments endpoint.
3. **Overdue Indicators:** Pass `?overdue=true` to easily fetch tasks that need immediate attention and render them with red borders.
