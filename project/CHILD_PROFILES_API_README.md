# Child Profiles API Documentation

This document describes the API endpoints for managing child profiles in the TimeCapsule application.

## Base URL
```
https://timecapsule-backend-z21v.onrender.com/api
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Child Profiles
Creates one or more child profiles with full setup flow.

**Endpoint:** `POST /api/child-profiles`

**Request Body:**
```json
{
  "children": [
    {
      "id": "1",
      "name": "John",
      "birthday": "12/25/2015",
      "username": "john123456"
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "children": [
      {
        "id": "uuid-123",
        "name": "John",
        "birthday": "12/25/2015",
        "username": "john123456",
        "first_name": "John",
        "last_name": "",
        "date_of_birth": "2015-12-25",
        "gender": null,
        "notes": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "relationships_created": 1
  },
  "message": "Child profiles created successfully"
}
```

**Response (Validation Error - 400):**
```json
{
  "success": false,
  "error": "Validation failed: Child 1 (John): Name must be at least 2 characters long"
}
```

**Response (Authentication Error - 401):**
```json
{
  "success": false,
  "error": "User not authenticated"
}
```

**Response (Permission Error - 403):**
```json
{
  "success": false,
  "error": "You do not have permission to create child profiles"
}
```

**Response (Server Error - 500):**
```json
{
  "success": false,
  "error": "Internal server error occurred"
}
```

### 2. Get All Child Profiles
Retrieves all child profiles for the authenticated user.

**Endpoint:** `GET /api/child-profiles`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "name": "John",
      "birthday": "12/25/2015",
      "username": "john123456",
      "first_name": "John",
      "last_name": "",
      "date_of_birth": "2015-12-25",
      "gender": null,
      "notes": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Child profiles retrieved successfully"
}
```

**Response (No Profiles - 200):**
```json
{
  "success": true,
  "data": [],
  "message": "No child profiles found"
}
```

### 3. Get Specific Child Profile
Retrieves a specific child profile by ID.

**Endpoint:** `GET /api/child-profiles/:id`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "John",
    "birthday": "12/25/2015",
    "username": "john123456",
    "first_name": "John",
    "last_name": "",
    "date_of_birth": "2015-12-25",
    "gender": null,
    "notes": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Child profile retrieved successfully"
}
```

**Response (Not Found - 404):**
```json
{
  "success": false,
  "error": "Child profile not found"
}
```

### 4. Update Child Profile
Updates a specific child profile.

**Endpoint:** `PUT /api/child-profiles/:id`

**Request Body:**
```json
{
  "name": "Johnny",
  "birthday": "12/25/2015",
  "username": "johnny123456",
  "notes": "Loves playing soccer"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Johnny",
    "birthday": "12/25/2015",
    "username": "johnny123456",
    "first_name": "Johnny",
    "last_name": "",
    "date_of_birth": "2015-12-25",
    "gender": null,
    "notes": "Loves playing soccer",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "message": "Child profile updated successfully"
}
```

**Response (Validation Error - 400):**
```json
{
  "success": false,
  "error": "Invalid birthday format. Use MM/DD/YYYY"
}
```

### 5. Delete Child Profile
Deletes a specific child profile and its relationships.

**Endpoint:** `DELETE /api/child-profiles/:id`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Child profile deleted successfully",
  "data": {
    "deleted": true,
    "relationships_removed": 2
  }
}
```

**Response (Not Found - 404):**
```json
{
  "success": false,
  "error": "Child profile not found"
}
```

### 6. Bulk Update Child Profiles
Updates multiple child profiles in a single request.

**Endpoint:** `PUT /api/child-profiles/bulk-update`

**Request Body:**
```json
{
  "children": [
    {
      "id": "uuid-123",
      "updates": {
        "name": "Johnny",
        "notes": "Loves playing soccer"
      }
    },
    {
      "id": "uuid-456",
      "updates": {
        "name": "Sarah",
        "notes": "Enjoys reading books"
      }
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "updated": [
      {
        "id": "uuid-123",
        "name": "Johnny",
        "birthday": "12/25/2015",
        "username": "john123456",
        "notes": "Loves playing soccer",
        "updated_at": "2024-01-15T11:00:00Z"
      },
      {
        "id": "uuid-456",
        "name": "Sarah",
        "birthday": "03/15/2018",
        "username": "sarah789012",
        "notes": "Enjoys reading books",
        "updated_at": "2024-01-15T11:00:00Z"
      }
    ],
    "failed": []
  },
  "message": "Bulk update completed successfully"
}
```

**Response (Partial Success - 200):**
```json
{
  "success": true,
  "data": {
    "updated": [
      {
        "id": "uuid-123",
        "name": "Johnny",
        "notes": "Loves playing soccer",
        "updated_at": "2024-01-15T11:00:00Z"
      }
    ],
    "failed": [
      {
        "id": "uuid-456",
        "error": "Child profile not found"
      }
    ]
  },
  "message": "Bulk update completed with some failures"
}
```

## Data Models

### ChildProfile
```typescript
interface ChildProfile {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  birthday: string;              // Birthday in MM/DD/YYYY format
  username: string;              // Unique username
  first_name?: string;           // First name (optional)
  last_name?: string;            // Last name (optional)
  date_of_birth?: string;        // Birthday in ISO format (YYYY-MM-DD)
  gender?: string | null;        // Gender (optional)
  notes?: string | null;         // Additional notes (optional)
  created_at?: string;           // Creation timestamp
  updated_at?: string;           // Last update timestamp
}
```

### CreateChildProfileRequest
```typescript
interface CreateChildProfileRequest {
  children: Array<{
    id: string;                  // Client-side ID for tracking
    name: string;                // Child's name
    birthday: string;            // Birthday in MM/DD/YYYY format
    username?: string;           // Optional username (auto-generated if not provided)
  }>;
}
```

### UpdateChildProfileRequest
```typescript
interface UpdateChildProfileRequest {
  name?: string;                 // Child's name
  birthday?: string;             // Birthday in MM/DD/YYYY format
  username?: string;             // Username
  first_name?: string;           // First name
  last_name?: string;            // Last name
  date_of_birth?: string;        // Birthday in ISO format
  gender?: string | null;        // Gender
  notes?: string | null;         // Additional notes
}
```

## Error Handling

### Common Error Codes
- **400**: Bad Request - Validation errors or invalid data
- **401**: Unauthorized - Missing or invalid authentication token
- **403**: Forbidden - User lacks permission for the operation
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists or conflicts with existing data
- **500**: Internal Server Error - Server-side error

### Error Response Format
```json
{
  "success": false,
  "error": "Detailed error message",
  "details": "Additional error context (optional)",
  "code": "ERROR_CODE (optional)"
}
```

## Usage Examples

### Creating Child Profiles
```typescript
import { apiService } from '@/libs/api';

const createProfiles = async () => {
  try {
    const response = await apiService.createChildProfiles({
      children: [
        {
          id: "1",
          name: "John",
          birthday: "12/25/2015"
        },
        {
          id: "2", 
          name: "Sarah",
          birthday: "03/15/2018"
        }
      ]
    });
    
    console.log('Profiles created:', response.data.children);
  } catch (error) {
    console.error('Failed to create profiles:', error);
  }
};
```

### Retrieving All Child Profiles
```typescript
const getProfiles = async () => {
  try {
    const response = await apiService.getChildProfiles();
    console.log('All profiles:', response.data);
  } catch (error) {
    console.error('Failed to get profiles:', error);
  }
};
```

### Updating a Child Profile
```typescript
const updateProfile = async (id: string) => {
  try {
    const response = await apiService.updateChildProfile(id, {
      name: "Johnny",
      notes: "Loves playing soccer"
    });
    
    console.log('Profile updated:', response.data);
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
};
```

### Deleting a Child Profile
```typescript
const deleteProfile = async (id: string) => {
  try {
    const response = await apiService.deleteChildProfile(id);
    console.log('Profile deleted:', response.message);
  } catch (error) {
    console.error('Failed to delete profile:', error);
  }
};
```

## Notes

1. **Username Generation**: If no username is provided when creating a profile, the system will auto-generate one based on the child's name and a timestamp.

2. **Date Formats**: 
   - Input: MM/DD/YYYY (e.g., "12/25/2015")
   - Storage: ISO format YYYY-MM-DD (e.g., "2015-12-25")

3. **Relationships**: When creating child profiles, the system automatically creates relationships with the authenticated user (director).

4. **Bulk Operations**: Bulk update operations are atomic - either all updates succeed or none do. Partial failures are reported in the response.

5. **Validation**: All endpoints validate input data and return appropriate error messages for invalid data.

