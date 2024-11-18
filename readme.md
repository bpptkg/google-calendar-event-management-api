# Google Calendar Event Management API Documentation

## Overview

The Calendar Event Management API provides a RESTful interface for seamlessly integrating Google Calendar functionality into your applications. This comprehensive API enables developers to programmatically manage calendar events with features including event creation, modification, deletion, and retrieval. Built with Node.js and Express, it offers secure authentication and robust input validation for reliable calendar operations.

### Key Features

- **Full Event Management**: Create, read, update, and delete (CRUD) calendar events
- **Secure Authentication**: Bearer token authentication for API access control
- **Real-time Notifications**: Automatic email notifications to event attendees
- **Input Validation**: Comprehensive validation for all event data
- **Google Calendar Integration**: Direct integration with Google Calendar API v3
- **JSON Response Format**: Standardized JSON responses for all endpoints

### Use Cases

- Schedule and manage company meetings
- Coordinate event planning
- Automate calendar operations
- Integrate calendar functionality into existing applications
- Synchronize events across multiple platforms

## Base URL

```
http://localhost:3000
```

## Authentication

All endpoints require authentication using a Bearer token.

**Headers:**

```
Authorization: Bearer <your-auth-token>
```

**Error Response (401 Unauthorized):**

```json
{
  "message": "Missing or invalid authorization header"
}
```

or

```json
{
  "message": "Invalid token"
}
```

## Endpoints

### Create Calendar Event

Creates a new calendar event and sends notifications to all attendees.

**Endpoint:** `POST /calendar`

**Headers:**

```
Authorization: Bearer <your-auth-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "summary": "Meeting Title",
  "description": "Meeting description",
  "location": "Meeting Room 1",
  "start": "2024-11-20",
  "end": "2024-11-21",
  "attendees": ["user@example.com", "another@example.com"]
}
```

**Required Fields:**

- `summary` (string): Event title
- `description` (string): Event description
- `location` (string): Event location
- `start` (string): Start date in YYYY-MM-DD format
- `end` (string): End date in YYYY-MM-DD format
- `attendees` (array): List of attendee email addresses (minimum 1 required)

**Success Response:**

```json
{
  "message": "Event created",
  "id": "event123",
  "htmlLink": "https://calendar.google.com/calendar/event?eid=..."
}
```

**Status Codes:**

- `201`: Event created successfully
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

### Update Calendar Event

Updates an existing calendar event and sends notifications to all attendees.

**Endpoint:** `PUT /calendar/:eventId`

**Headers:**

```
Authorization: Bearer <your-auth-token>
Content-Type: application/json
```

**URL Parameters:**

- `eventId`: The ID of the event to update

**Request Body:**

```json
{
  "summary": "Updated Meeting Title",
  "description": "Updated description",
  "location": "Meeting Room 2",
  "start": "2024-11-20",
  "end": "2024-11-21",
  "attendees": ["user@example.com", "another@example.com"]
}
```

**Required Fields:**

- Same as Create Calendar Event

**Success Response:**

```json
{
  "message": "Event updated",
  "id": "event123",
  "htmlLink": "https://calendar.google.com/calendar/event?eid=..."
}
```

**Status Codes:**

- `200`: Event updated successfully
- `400`: Validation error
- `401`: Unauthorized
- `404`: Event not found
- `500`: Server error

### Delete Calendar Event

Deletes an existing calendar event and sends notifications to all attendees.

**Endpoint:** `DELETE /calendar/:eventId`

**Headers:**

```
Authorization: Bearer <your-auth-token>
```

**URL Parameters:**

- `eventId`: The ID of the event to delete

**Success Response:**

```json
{
  "message": "Event deleted successfully",
  "id": "event123"
}
```

**Status Codes:**

- `200`: Event deleted successfully
- `401`: Unauthorized
- `404`: Event not found
- `500`: Server error

### Get Calendar Event

Retrieves details of a specific calendar event.

**Endpoint:** `GET /calendar/:eventId`

**Headers:**

```
Authorization: Bearer <your-auth-token>
```

**URL Parameters:**

- `eventId`: The ID of the event to retrieve

**Success Response:**

```json
{
  "id": "event123",
  "summary": "Meeting Title",
  "description": "Meeting description",
  "location": "Meeting Room 1",
  "start": {
    "date": "2024-11-20"
  },
  "end": {
    "date": "2024-11-21"
  },
  "attendees": [
    {
      "email": "user@example.com"
    },
    {
      "email": "another@example.com"
    }
  ],
  "htmlLink": "https://calendar.google.com/calendar/event?eid=..."
}
```

**Status Codes:**

- `200`: Success
- `401`: Unauthorized
- `404`: Event not found
- `500`: Server error

## Error Responses

### Authentication Error

```json
{
  "message": "Missing or invalid authorization header"
}
```

### Validation Error

```json
{
  "message": "Validation error",
  "errors": ["Summary is required", "Invalid email format"]
}
```

### Server Error

```json
{
  "message": "Error creating/updating/deleting/fetching event",
  "error": "Error message details"
}
```

## Notes

- All requests must include a valid Bearer token in the Authorization header
- All dates must be in `YYYY-MM-DD` format
- At least one attendee is required for creating or updating events
- All attendee emails must be valid email addresses
- Changes to events (create, update, delete) will trigger email notifications to all attendees
- If an update request contains the same data as the existing event, no update will be performed
