# API Integration Documentation

## Overview
This document describes the integration of the signup and signin functionality with the external API endpoint `http://localhost:3000/api/auth`.

## What Was Added

### 1. API Service (`project/libs/api.ts`)
- Handles HTTP requests to the authentication endpoints
- Provides type-safe interfaces for requests and responses
- Includes error handling and response validation

### 2. Password Validation (`project/utils/passwordValidation.ts`)
- Implements the required password requirements:
  - Minimum 8 characters
  - Must contain at least one number
  - Must contain at least one letter
- Provides password strength assessment

### 3. Storage Utility (`project/utils/storage.ts`)
- Manages JWT token storage using AsyncStorage
- Handles user data persistence
- Provides authentication state management

### 4. Authentication Context (`project/contexts/AuthContext.tsx`)
- Manages authentication state across the app
- Provides signIn, signOut, and checkAuth functions
- Integrates with the storage utility

## API Endpoints

### Sign Up
- **Endpoint**: `POST /api/auth/signup`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "username": "John Doe",
        "created_at": "2024-01-01T00:00:00.000Z"
      },
      "token": "jwt_token_here"
    },
    "message": "User registered successfully"
  }
  ```

### Sign In
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "username": "John Doe",
        "created_at": "2024-01-01T00:00:00.000Z"
      },
      "token": "jwt_token_here"
    },
    "message": "Login successful"
  }
  ```

## Integration Details

### API-Only Authentication
The integration now exclusively uses the external API endpoints:
1. All authentication requests go directly to `http://localhost:3000/api/auth`
2. No fallback to Supabase - the app requires the API to be available
3. Simplified authentication flow with direct API integration

### Password Requirements
- **Minimum length**: 8 characters
- **Must contain**: At least one number and one letter
- **Validation**: Real-time validation with specific error messages

### Token Management
- JWT tokens are automatically stored in AsyncStorage
- User data is persisted locally
- Authentication state is managed globally through React Context

## Files Modified

### Core Integration Files
- `project/libs/api.ts` - New API service
- `project/utils/passwordValidation.ts` - New password validation
- `project/utils/storage.ts` - New storage utility
- `project/contexts/AuthContext.tsx` - New auth context

### Modified Screens
- `project/app/create-account.tsx` - Integrated with API
- `project/app/sign-in.tsx` - Integrated with API
- `project/app/_layout.tsx` - Added AuthProvider wrapper

## Dependencies Added
- `@react-native-async-storage/async-storage` - For local storage

## Usage

### In Components
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, token, signIn, signOut } = useAuth();
  
  // Use authentication functions and state
}
```

### API Calls
```typescript
import { apiService } from '@/libs/api';

// Sign up
const response = await apiService.signUp({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

// Sign in
const response = await apiService.signIn({
  email: 'user@example.com',
  password: 'password123'
});
```

## Error Handling
- Network errors are caught and displayed to users
- API errors show specific error messages from the server
- Direct API integration provides clear error feedback

## Security Notes
- JWT tokens are stored securely in AsyncStorage
- Password validation happens both client-side and server-side
- Authentication state is managed centrally to prevent inconsistencies
