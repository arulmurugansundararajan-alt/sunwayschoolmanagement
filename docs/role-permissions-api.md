# Role Permissions API Reference

**Base URL:** `https://<your-domain>/api/admin/role-permissions`

> All endpoints require an active **admin** session (NextAuth cookie or token).  
> Unauthenticated or non-admin requests receive `401 Unauthorized`.

---

## Available Modules

These are the valid module keys you can assign to any role:

| Key             | Label           | Description                            |
|-----------------|-----------------|----------------------------------------|
| `dashboard`     | Dashboard       | Staff home dashboard (always included) |
| `classes`       | Classes         | View and manage classes                |
| `marks`         | Marks Entry     | Enter and view student marks           |
| `attendance`    | Attendance      | Mark daily attendance                  |
| `assignments`   | Assignments     | Create and manage assignments          |
| `fees`          | Fees            | Add and view fee records               |
| `expenses`      | Expenses        | Record and view expenses               |
| `communication` | Communication   | Messages and announcements             |
| `calendar`      | Calendar        | View school calendar and events        |

> **Note:** `dashboard` is always force-included regardless of what you send.

---

## System Roles (Built-in)

These two roles are seeded automatically and **cannot be deleted**:

| Role Key     | Label      | Default Modules                                                        |
|--------------|------------|------------------------------------------------------------------------|
| `teacher`    | Teacher    | dashboard, classes, marks, attendance, assignments, communication, calendar |
| `accountant` | Accountant | dashboard, fees, expenses, calendar                                    |

System roles (`isSystem: true`) can be **updated** (modules changed) but not deleted.

---

## 1. GET — List All Roles

Fetch all roles and their module assignments.

**Request**
```
GET /api/admin/role-permissions
```

**Response `200 OK`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "664a1b2c3d4e5f6789abcdef",
      "role": "teacher",
      "label": "Teacher",
      "isSystem": true,
      "modules": ["dashboard", "classes", "marks", "attendance", "assignments", "communication", "calendar"],
      "updatedBy": "admin",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "664a1b2c3d4e5f6789abcdf0",
      "role": "accountant",
      "label": "Accountant",
      "isSystem": true,
      "modules": ["dashboard", "fees", "expenses", "calendar"],
      "updatedBy": "admin",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "allModules": [
    { "key": "dashboard", "label": "Dashboard", "description": "Staff home dashboard" },
    { "key": "classes",   "label": "Classes",   "description": "View and manage classes" }
    // ... rest of modules
  ]
}
```

---

## 2. POST — Create a New Custom Role

Create a new role with selected modules.

**Request**
```
POST /api/admin/role-permissions
Content-Type: application/json
```

**Body**
```json
{
  "role": "librarian",
  "label": "Librarian",
  "modules": ["classes", "communication", "calendar"]
}
```

| Field     | Type     | Required | Notes                                                        |
|-----------|----------|----------|--------------------------------------------------------------|
| `role`    | string   | Yes      | Unique key — auto-lowercased, spaces converted to `_`        |
| `label`   | string   | Yes      | Display name shown in the UI                                 |
| `modules` | string[] | Yes      | Array of valid module keys. `dashboard` is always prepended. |

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "_id": "664a1b2c3d4e5f6789abce01",
    "role": "librarian",
    "label": "Librarian",
    "isSystem": false,
    "modules": ["dashboard", "classes", "communication", "calendar"],
    "updatedBy": "Admin User",
    "createdAt": "2025-04-22T10:00:00.000Z",
    "updatedAt": "2025-04-22T10:00:00.000Z"
  }
}
```

**Error — Role already exists `409 Conflict`**
```json
{ "success": false, "message": "Role \"librarian\" already exists" }
```

---

## 3. PUT — Update Modules for an Existing Role

Update which modules a role has access to. Works for both system and custom roles.

**Request**
```
PUT /api/admin/role-permissions
Content-Type: application/json
```

**Body**
```json
{
  "role": "teacher",
  "modules": ["classes", "marks", "attendance", "assignments"]
}
```

| Field     | Type     | Required | Notes                                          |
|-----------|----------|----------|------------------------------------------------|
| `role`    | string   | Yes      | The role key to update (e.g. `teacher`)        |
| `modules` | string[] | Yes      | Full replacement list of modules for this role |

> This is a **full replace** — send the complete list of modules you want, not just the ones to add.

**Response `200 OK`**
```json
{
  "success": true,
  "data": {
    "_id": "664a1b2c3d4e5f6789abcdef",
    "role": "teacher",
    "label": "Teacher",
    "isSystem": true,
    "modules": ["dashboard", "classes", "marks", "attendance", "assignments"],
    "updatedBy": "Admin User",
    "updatedAt": "2025-04-22T11:00:00.000Z"
  }
}
```

**Error — Invalid module key `400 Bad Request`**
```json
{ "success": false, "message": "Invalid modules: unknown_module" }
```

---

## 4. DELETE — Delete a Custom Role

Delete a custom role. System roles (`teacher`, `accountant`) **cannot** be deleted.

**Request**
```
DELETE /api/admin/role-permissions?role=librarian
```

| Query Param | Required | Notes                     |
|-------------|----------|---------------------------|
| `role`      | Yes      | The role key to delete    |

**Response `200 OK`**
```json
{ "success": true, "message": "Role deleted" }
```

**Error — Trying to delete a system role `403 Forbidden`**
```json
{ "success": false, "message": "System roles cannot be deleted" }
```

**Error — Role does not exist `404 Not Found`**
```json
{ "success": false, "message": "Role not found" }
```

---

## Quick Reference — cURL Examples

### List all roles
```bash
curl -X GET https://your-domain.vercel.app/api/admin/role-permissions \
  -H "Cookie: next-auth.session-token=<your-session-token>"
```

### Create a new role
```bash
curl -X POST https://your-domain.vercel.app/api/admin/role-permissions \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<your-session-token>" \
  -d '{"role":"librarian","label":"Librarian","modules":["classes","communication","calendar"]}'
```

### Update modules for a role
```bash
curl -X PUT https://your-domain.vercel.app/api/admin/role-permissions \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<your-session-token>" \
  -d '{"role":"teacher","modules":["classes","marks","attendance","assignments","calendar"]}'
```

### Delete a custom role
```bash
curl -X DELETE "https://your-domain.vercel.app/api/admin/role-permissions?role=librarian" \
  -H "Cookie: next-auth.session-token=<your-session-token>"
```

---

## Error Response Format

All error responses follow this shape:
```json
{ "success": false, "message": "Human-readable error description" }
```

| HTTP Status | Meaning                                              |
|-------------|------------------------------------------------------|
| `400`       | Missing or invalid request body / query params       |
| `401`       | Not logged in or not an admin                        |
| `403`       | Forbidden — e.g. trying to delete a system role      |
| `404`       | Role not found                                       |
| `409`       | Conflict — role key already exists (POST)            |
| `500`       | Internal server error                                |

---

## Database Schema (MongoDB)

Collection: `rolepermissions`

```
{
  role:       String  — unique key (e.g. "teacher", "librarian")
  label:      String  — display name (e.g. "Teacher")
  isSystem:   Boolean — true = cannot be deleted via API
  modules:    [String] — array of module keys
  updatedBy:  String  — name/email of the admin who last modified
  createdAt:  Date    — auto
  updatedAt:  Date    — auto
}
```

---

*Generated for Sunway School Management System — API version April 2026*
