# Propel - Backend API

Welcome to the **Propel** backend API. This is an industry-standard, production-ready RESTful API built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Overview

Propel is a comprehensive Project Management tool designed to handle multiple projects, assign tasks, manage team member workloads, track real-time progress, and maintain a secure, auditable trail of actions.

### Core Modules
1. **Auth & User:** JWT-based authentication, RBAC (Admin, Project Manager, Team Member).
2. **Project:** Manage overarching projects, add/remove members, track aggregate progress and workloads.
3. **Task:** Manage granular tasks, Kanban statuses, priorities, deadlines, and Cloudinary file attachments.
4. **Comment:** Contextual discussion threads tied to specific tasks.
5. **Activity Log:** Immutable audit trails for project history.
6. **Notification:** Database-persisted alerts with real-time Socket.IO emissions.
7. **Dashboard:** High-performance MongoDB Aggregation pipelines for dynamic charts and KPIs.
8. **Search:** Unified, cross-collection global search.

> 📚 **Detailed Module Documentation:**
> Every module has its own dedicated `README.md` inside `src/app/modules/`. Please refer to them for specific API routes, payloads, and frontend integration tips!

---

## 🏗️ Architecture & Patterns

This codebase adheres to strict software engineering standards to ensure maintainability, scalability, and predictable error handling.

### 1. Layered Architecture (Controller-Service Pattern)
- **Routes (`*.routes.ts`):** Define endpoints, attach authentication/authorization middlewares, and hook up Zod validators.
- **Controllers (`*.controller.ts`):** Strictly handle the HTTP Request/Response cycle. They extract data, call the Service, and use a standard `sendResponse` utility. *No business logic exists here.*
- **Services (`*.service.ts`):** Contain 100% of the business logic and MongoDB queries.

### 2. Standardized Error Handling
- All asynchronous controllers are wrapped in a custom `asyncHandler`.
- Business logic throws custom `AppError` instances (e.g., `throw new AppError(MESSAGES.USER.NOT_FOUND, 404)`).
- A `globalErrorHandler` catches these errors and formats them into a consistent JSON response.

### 3. Centralized Constants
- Hardcoded strings are avoided. All messages (success/error) live in `messages.constant.ts`.
- Roles live in `roles.constant.ts`.
- Statuses live in `status.constant.ts`.

### 4. Fire-and-Forget Side Effects
To maintain lightning-fast API responses, secondary actions like Activity Logging and Notifications are handled via asynchronous helpers (`logActivity`, `sendNotification`) that execute concurrently without blocking the main thread's return statement.

---

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Validation:** Zod
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **File Uploads:** Multer (Memory Storage) & Cloudinary
- **Real-Time:** Socket.IO

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Cloudinary Account (for attachments)

### Setup
1. Clone the repository and run `npm install`.
2. Create a `.env` file based on your configuration requirements:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=mongodb+srv://...
   BCRYPT_SALT_ROUNDS=12
   JWT_ACCESS_SECRET=your_secret
   JWT_ACCESS_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRES_IN=365d
   CLOUDINARY_CLOUD_NAME=your_cloud
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing with Postman
Refer to the internal artifacts or Postman collections to step through the application flow: Login -> Create Project -> Add Members -> Create Task -> Add Comment -> View Dashboard.

Remember to pass your `Authorization: Bearer <token>` in the headers!
