# Notification Module

## Overview
The Notification module is responsible for alerting users to events that require their attention.

### Problem Solved
Users need to know immediately when they are assigned a new task or added to a project. This module solves this by writing alerts to the database (for persistence) and simultaneously emitting real-time WebSocket events via Socket.IO.

### Key Features
- Centralized `sendNotification` helper.
- Fire-and-forget architecture (Does not slow down the main API response).
- Real-time Socket.IO integration.
- Read/Unread state management.

---

## Schema Design
- `recipient`: Reference to User receiving the notification.
- `sender`: Reference to User triggering the action.
- `type`: E.g., `task_assigned`, `member_added`, `comment_added`.
- `message`: Text message.
- `isRead`: Boolean (Default: false).
- `relatedProject` / `relatedTask`: Links to related data for easy navigation.

---

## API Design & Frontend Implementation Guide

### 1. Get Unread/All Notifications
- **Route:** `GET /api/v1/notifications`
- **Success Response (200 OK):** Returns all notifications for the logged-in user. Unread first.

### 2. Mark as Read
- **Route:** `PATCH /api/v1/notifications/:id/read`
- **Success Response (200 OK):** Sets `isRead: true`.

### 3. Real-Time Socket Connection (Frontend)
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// 1. Authenticate immediately after connecting
socket.emit('authenticate', accessToken);

// 2. Listen for new notifications
socket.on('notification', (data) => {
  console.log("New Notification Received!", data);
  // Show toast notification
  // Update unread badge counter
});
```

---

## Frontend Integration Tips
1. **Bell Icon Badge:** Fetch `/notifications` on initial load to get the unread count, then update this count dynamically when a socket event is received.
2. **Navigation:** Use the `relatedProject` or `relatedTask` IDs in the payload to make the notification clickable, routing the user directly to the relevant page.
