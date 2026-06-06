# Activity Log Module

## Overview
The Activity Log module is an automated system that records critical actions happening across the application.

### Problem Solved
For accountability and transparency in project management, teams must know "who did what, and when." This module acts as an immutable audit trail, tracking everything from task creation to member removals without cluttering the core business logic.

### Key Features
- Centralized logging via the `logActivity` helper.
- Fire-and-forget architecture (Logs are created asynchronously without blocking API responses).
- Project-specific histories.

---

## Schema Design
- `action`: E.g., `TASK_CREATED`, `MEMBER_ADDED`.
- `performedBy`: Reference to User.
- `targetType`: (`Project`, `Task`, `User`, `Comment`).
- `targetId`: ID of the affected resource.
- `projectId`: Helps group logs by project.
- `description`: Human-readable summary.

---

## API Design & Frontend Implementation Guide

### 1. Get Project Activity Logs
- **Route:** `GET /api/v1/activity-logs/project/:projectId`
- **Query Params:** `?page=1&limit=20`
- **Success Response (200 OK):** Returns logs sorted newest first.

---

## Frontend Integration Tips
1. **Audit Drawer/Sidebar:** Create an "Activity History" tab inside your Project Dashboard that renders these logs as a vertical timeline.
2. **Rich Text Formatting:** Use the `action` string to determine the icon (e.g., `TASK_CREATED` shows a checklist icon, `COMMENT_ADDED` shows a chat bubble).
