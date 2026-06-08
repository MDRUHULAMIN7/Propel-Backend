# Propel Backend
Production-ready Express and TypeScript backend for the Propel Project & Task Collaboration System. This service powers authentication, project workflows, realtime notifications, media uploads, and role-based data delivery for the Propel platform.

## Links
- **Live API Health Check**: [https://propel-backend-1psh.onrender.com/health](https://propel-backend-1psh.onrender.com/health)
- **Connected Frontend Live URL**: [https://propel-frontend-phi.vercel.app/](https://propel-frontend-phi.vercel.app/)
- **Frontend Repository**: [https://github.com/MDRUHULAMIN7/Propel-Frontend](https://github.com/MDRUHULAMIN7/Propel-Frontend)
- **Backend Repository**: [https://github.com/MDRUHULAMIN7/Propel-Backend](https://github.com/MDRUHULAMIN7/Propel-Backend)

## Project Overview
| Item | Details |
|---|---|
| API Base URL | `https://propel-backend-1psh.onrender.com/api/v1` |
| Deployment | Render Web Service |
| Main Goal | Centralize secure project management, task collaboration, and realtime team communication. |

This backend was built to solve the operational side of project and task management. It brings authentication, task tracking, notifications, project structures, and media handling into one API layer that the frontend dashboard relies on.

## Backend Architecture
This backend is implemented as a modular monolith with a layered (N-tier) organization and a RESTful API surface augmented by a partial event-driven layer using Socket.IO. 

### Architectural Pillars
- **Modular Monolith:** Feature modules live under `src/app/modules/*`, each exposing route, controller, service, model, and validation boundaries. 
- **Layered / N-Tier Architecture:** Responsibilities are separated into presentation (routes), orchestration (controllers), domain (services), persistence (models), and cross-cutting helpers.
- **RESTful API Architecture:** A consistent `/api/v1` RESTful API with clear resource-oriented routes.
- **Partial Event-Driven:** Socket.IO provides realtime push for notifications; event emission is driven by service-layer state changes.

### Layer Responsibilities
- `src/app/routes/` — central route registration and versioning.
- `src/app/modules/*/` — feature module folders containing routes, controllers, services, and models.
- `src/app/utils/` — shared helpers such as Cloudinary wrappers, error handlers, and generic utilities.

## REST + Realtime Flow
```text
Client → HTTP REST → Route → Controller → Service → Model (MongoDB)
                     ↓
                  Socket.IO → Connected Clients
```

## Problem Breakdown & Features
| Problem | Feature Added | Solution Outcome |
|---|---|---|
| Projects and tasks were tracked manually. | Modular REST API for projects, tasks, and users. | Full project lifecycle management from one backend service. |
| Different roles needed varied access. | JWT authentication, refresh-token flow, and role-based authorization for Admin, PM, and Team Member. | Sensitive operations stay protected while each user gets the right visibility. |
| Critical updates required manual refresh. | Socket.IO-based realtime notification delivery with unread counters. | Users receive updates instantly, keeping the dashboard responsive. |
| Task discussions needed a dedicated channel. | Comment module with create, update, and delete endpoints per task. | Comments stay linked to tasks for traceability. |
| Files needed to be shared alongside tasks. | Task attachment upload endpoint supporting up to 5 files via Multer + Cloudinary. | Attachments are stored in the cloud and linked to the relevant task. |
| Admin needed centralized user control. | User management API with role update (`PATCH /users/:id/role`) and user deletion. | Admins can promote/demote or remove users via a single API. |

## Features by User Type
**Admin**
- Manage all users — list, update roles, and delete accounts.
- Full CRUD on projects, tasks, comments, and attachments.
- Oversee system-level operations and realtime logs.

**Project Manager (PM)**
- Create and edit projects, assign tasks to Team Members.
- Post comments and upload file attachments to tasks.
- Monitor project workload and progress via dedicated analytics APIs.

**Team Member**
- Access assigned tasks and update task status.
- Post comments and upload attachments on assigned tasks.
- Receive notifications when assigned to new tasks or projects.
- Self-profile and media management.

## Tech Stack
- **Node.js & Express 5**
- **TypeScript**
- **MongoDB & Mongoose**
- **JWT & bcryptjs**
- **Zod Validation**
- **Socket.IO**
- **Cloudinary & Multer**

## Environment Variables
Create a `.env` file based on your environment:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
CLIENT_URL=https://propel-frontend-phi.vercel.app
```

## Local Development
```bash
npm install
npm run dev
```
*(Runs with `tsx watch src/server.ts`)*

## Quality and Maintenance
This backend is structured for ongoing growth:
- Modular feature-based folders.
- Central route registration.
- Shared validation and error handling.
- Reusable auth and response helpers.
- Realtime delivery support through Socket.IO.
- Deployable health-check support for monitoring.
