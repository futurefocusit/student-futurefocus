# FutureFocus API Documentation

## Base URL
```
https://api.futurefocus.com/v1
```

## Authentication

All API requests require authentication using JWT tokens.

```http
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Login
```http
POST /auth/login
```

Request body:
```json
{
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "string"
  }
}
```

### Courses

#### Get All Courses
```http
GET /courses
```

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "scholarshipPrice": "number",
      "active": "boolean",
      "category": "string"
    }
  ]
}
```

#### Create Course
```http
POST /courses
```

Request body:
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "scholarshipPrice": "number",
  "category": "string"
}
```

#### Update Course
```http
PUT /courses/:id
```

Request body:
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "scholarshipPrice": "number",
  "category": "string",
  "active": "boolean"
}
```

#### Delete Course
```http
DELETE /courses/:id
```

### Students

#### Get All Students
```http
GET /students
```

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "courses": ["string"],
      "status": "string"
    }
  ]
}
```

#### Create Student
```http
POST /students
```

Request body:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "courses": ["string"]
}
```

### Staff

#### Get All Staff
```http
GET /staff
```

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "permissions": ["string"]
    }
  ]
}
```

#### Create Staff
```http
POST /staff
```

Request body:
```json
{
  "name": "string",
  "email": "string",
  "role": "string",
  "permissions": ["string"]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "string",
  "message": "string"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

## Pagination

All list endpoints support pagination:

```http
GET /endpoint?page=1&limit=10
```

Response:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Webhooks

### Available Events
- `course.created`
- `course.updated`
- `course.deleted`
- `student.created`
- `student.updated`
- `staff.created`
- `staff.updated`

### Webhook Payload
```json
{
  "event": "string",
  "data": {},
  "timestamp": "string"
}
``` 