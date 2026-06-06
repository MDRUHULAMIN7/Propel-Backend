# Search Module

## Overview
The Search module provides a unified, cross-collection global search experience.

### Problem Solved
Users shouldn't have to navigate to three different pages to find a specific string of text. This module takes a single search query and concurrently scans Projects, Tasks, and (for Admins) Users to return a consolidated result set.

### Key Features
- Parallel execution using `Promise.all` for high performance.
- Case-insensitive regex matching.
- Role-based scoping (Users only get results from Projects/Tasks they have access to).
- Shared `queryBuilder` utility integration.

---

## Schema Design
No dedicated schema. Reads from existing collections.

---

## API Design & Frontend Implementation Guide

### 1. Global Search
- **Route:** `GET /api/v1/search?q=your_keyword`
- **Success Response (200 OK):** 
  ```json
  {
    "projects": [{ ... }],
    "tasks": [{ ... }],
    "users": [{ ... }],
    "totalResults": 3
  }
  ```

---

## Frontend Integration Tips
1. **Global Search Bar:** Place a single search input in your top navigation bar.
2. **Debounce:** Implement a debounce function (e.g., wait 300ms after the user stops typing) before hitting this endpoint to avoid overloading the server.
3. **Dropdown Results:** Render the results in a categorized dropdown (e.g., headers for "Projects", "Tasks", "Users") directly under the search bar for quick navigation.
