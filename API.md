# TaskFlow API Documentation

All API responses follow this structure:
```json
{ "success": true, "data": { ... } }
// Or in case of failure:
{ "success": false, "message": "Error message", "errors": { /* validation details */ } }
```

## Authentication Endpoints

### `POST /api/auth/register` (Register new user)
**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "message": "Account created successfully"
  }
}
```

### `POST /api/auth/login` (Login user)
**Request:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "message": "Logged in successfully"
  }
}
```

### `GET /api/auth/me` (Get Current User)
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109ca",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

### `POST /api/auth/logout` (Logout)
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

## Task Endpoints

### `POST /api/tasks` (Create task)
**Request:**
```json
{
  "title": "Set up database",
  "description": "Initialize MongoDB Atlas and set up connection strings.",
  "status": "todo"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109cb",
    "title": "Set up database",
    "description": "Initialize MongoDB Atlas and set up connection strings.",
    "status": "todo",
    "createdAt": "2024-05-18T10:00:00.000Z",
    "updatedAt": "2024-05-18T10:00:00.000Z"
  }
}
```

### `GET /api/tasks` (List tasks)
**Query Parameters:** `?page=1&limit=10&status=all&sortBy=createdAt&sortOrder=desc`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "60d0fe4f5311236168a109cb",
        "title": "Set up database",
        "description": "Initialize MongoDB Atlas and set up connection strings.",
        "status": "todo",
        "createdAt": "2024-05-18T10:00:00.000Z",
        "updatedAt": "2024-05-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### `GET /api/tasks/:id` (Get task)
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109cb",
    "title": "Set up database",
    "description": "Initialize MongoDB Atlas and set up connection strings.",
    "status": "todo",
    "createdAt": "2024-05-18T10:00:00.000Z",
    "updatedAt": "2024-05-18T10:00:00.000Z"
  }
}
```

### `PATCH /api/tasks/:id` (Update task)
**Request:**
```json
{
  "status": "in-progress"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109cb",
    "title": "Set up database",
    "description": "Initialize MongoDB Atlas and set up connection strings.",
    "status": "in-progress",
    "createdAt": "2024-05-18T10:00:00.000Z",
    "updatedAt": "2024-05-18T15:30:00.000Z"
  }
}
```

### `DELETE /api/tasks/:id` (Delete task)
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```
