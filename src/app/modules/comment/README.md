# Comment Module

## Overview
The Comment module enables contextual discussion directly on Tasks.

### Problem Solved
Team members need a place to ask questions, post updates, or leave feedback on specific tasks without cluttering a global chat. This module solves that by linking comments directly to Tasks (and by extension, Projects), ensuring all communication is contextual and preserved.

### Key Features
- Add, Edit, and Delete comments.
- Automatic logging to the Project's Activity Log.
- Real-time Notifications sent to the assigned Task owner when someone comments.
- Cascading Deletes (if a task is deleted, its comments are deleted).

---

## Schema Design
- `task`: Reference to Task.
- `project`: Reference to Project.
- `author`: Reference to User.
- `content`: Text content.
- `isEdited`: Boolean flag for UI representation.

---

## API Design & Frontend Implementation Guide

### 1. Add a Comment
- **Route:** `POST /api/v1/comments`
- **Payload:**
  ```json
  {
    "taskId": "<task_id>",
    "content": "I have finished the UI draft."
  }
  ```
- **Success Response (201 Created):** Returns populated comment.

### 2. Get Task Comments
- **Route:** `GET /api/v1/comments?taskId=<task_id>`
- **Success Response (200 OK):** Returns comments sorted by oldest first (standard chat flow).

### 3. Update Comment
- **Route:** `PATCH /api/v1/comments/:id`
- **Payload:** `{ "content": "Updated draft is ready." }`
- **Possible Errors:** `403 Forbidden` if user is not the author.

### 4. Delete Comment
- **Route:** `DELETE /api/v1/comments/:id`
- **Possible Errors:** `403 Forbidden` if user is not the author or an admin.

---

## Frontend Integration Tips
1. **Chat UI:** Render these comments in a scrolling list inside a Task Modal. Sort them oldest-to-newest so new messages appear at the bottom.
2. **Edit Indicator:** Use the `isEdited` boolean to show a subtle `(edited)` tag next to the timestamp.
