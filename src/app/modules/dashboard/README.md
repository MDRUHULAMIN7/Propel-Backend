# Dashboard Module

## Overview
The Dashboard module aggregates data across the application to provide high-level insights, KPIs, and visual charts.

### Problem Solved
Managers and Team Members need a quick bird's-eye view of their workloads, overdue tasks, and general progress without having to click through multiple screens. This module uses MongoDB Aggregation Pipelines to perform heavy data crunching on the server and returns highly optimized charting data.

### Key Features
- **Role-Based Data Scoping:** Admins see everything, Project Managers see data for projects they are in, Team Members only see data for tasks strictly assigned to them.
- **KPI Generation:** Calculates total projects, overdue tasks, completed tasks, etc.
- **Chart Formatting:** Data is pre-formatted for easy ingestion by frontend charting libraries.

---

## Schema Design
This module does not have a dedicated schema. It queries `Project`, `Task`, `User`, and `ActivityLog` collections via aggregation.

---

## API Design & Frontend Implementation Guide

### 1. Get General Stats
- **Route:** `GET /api/v1/dashboard/stats`
- **Success Response (200 OK):** 
  ```json
  {
    "totalProjects": 5,
    "completedTasks": 12,
    "overdueTasks": 2,
    ...
  }
  ```

### 2. Get Chart Data
- **Route:** `GET /api/v1/dashboard/charts`
- **Success Response (200 OK):** Returns arrays ready for charts:
  - `tasksByPriority` (Pie Chart data)
  - `tasksByStatus` (Bar Chart data)
  - `projectProgress` (Progress bars)
  - `weeklyActivity` (Line chart of logs over 7 days)

### 3. Get Team Member Summary
- **Route:** `GET /api/v1/dashboard/my-summary`
- **Success Response (200 OK):** Returns stats strictly assigned to the current user, along with an array of `upcomingTasks` due within the next 7 days.

---

## Frontend Integration Tips
1. **Charting Library:** Use **Recharts** or **Chart.js**. The data from `/charts` is already in a `{ name/status/priority: string, count: number }` format, making it essentially plug-and-play.
2. **Role UI:** If the logged-in user is a `TEAM_MEMBER`, hit `/my-summary` instead of `/stats` to render their personalized dashboard view.
