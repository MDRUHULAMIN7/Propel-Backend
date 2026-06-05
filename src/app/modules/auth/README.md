# Auth Module

## Overview
The Auth module is responsible for handling all authentication and authorization logic within the application. 

### Problem Solved
In a modern web application, verifying user identity securely and managing access to protected resources is crucial. This module solves the problem of securely hashing passwords, issuing JSON Web Tokens (JWT) for stateless authentication, and managing token lifecycles (access and refresh tokens). 

### Key Features
- User Registration
- User Login (Email & Password)
- Demo Login (Role-based quick login for portfolios/demonstrations)
- Secure Token Refresh Mechanism
- Logout (Session invalidation)
- Current User Profile Identification (`/me`)

---

## Schema Design
This module does not have a dedicated database schema. It tightly integrates with the **User Schema** (`src/app/modules/user/user.model.ts`) to verify credentials and extract payload information.

---

## API Design & Frontend Implementation Guide

### 1. Register a New User
- **Route:** `POST /api/v1/auth/register`
- **Headers:** `Content-Type: application/json`
- **Payload:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (200 OK):** Returns the created user object along with `accessToken` and `refreshToken`.
- **Possible Errors:**
  - `400 Bad Request`: Validation errors (e.g., password too weak, missing fields).
  - `409 Conflict`: "This email is already in use".

### 2. Login
- **Route:** `POST /api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Payload:**
  ```json
  {
    "email": "john@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (200 OK):** Returns user profile, `accessToken`, and `refreshToken`. **Note:** You should store the `accessToken` in memory or local storage, and the `refreshToken` in an HTTP-only cookie (if configured) or local storage for session persistence.
- **Possible Errors:**
  - `401 Unauthorized`: "No account found with this email" or "Incorrect password".

### 3. Demo Login
- **Route:** `POST /api/v1/auth/demo-login`
- **Headers:** `Content-Type: application/json`
- **Payload:**
  ```json
  {
    "role": "ADMIN" // Or "PROJECT_MANAGER", "TEAM_MEMBER"
  }
  ```
- **Success Response (200 OK):** Bypasses manual credential entry and logs into a predefined demo account.

### 4. Refresh Token
- **Route:** `POST /api/v1/auth/refresh-token`
- **Headers/Cookies:** Pass the `refreshToken` either via cookies or in the `Authorization` header.
- **Payload:** None.
- **Success Response (200 OK):** Returns a fresh `accessToken`. Hit this endpoint silently from the frontend when the `accessToken` expires.
- **Possible Errors:**
  - `401 Unauthorized`: "Token expired, please login again" or "Invalid token".

### 5. Get Current Auth State
- **Route:** `GET /api/v1/auth/me`
- **Headers:** `Authorization: Bearer <your_access_token>`
- **Success Response (200 OK):** Returns the basic JWT payload (id, name, email, role).
- **Possible Errors:**
  - `401 Unauthorized`: "Invalid request" (if no token is passed).

### 6. Logout
- **Route:** `POST /api/v1/auth/logout`
- **Headers:** `Authorization: Bearer <your_access_token>`
- **Success Response (200 OK):** Logs the user out.

---

## Frontend Integration Tips
1. **Axios Interceptor:** Set up an Axios interceptor on the frontend. If any API request returns a `401 Unauthorized` (specifically Token Expired), catch it, hit `/api/v1/auth/refresh-token`, get the new token, and automatically retry the failed request.
2. **State Management:** Store the logged-in user state in Redux, Zustand, or React Context. Upon successful login or registration, dispatch the user payload to your global state.
3. **Protected Routes:** Use the `role` property from the user payload to build Role-Based Access Control (RBAC) on your React/Next.js frontend.
