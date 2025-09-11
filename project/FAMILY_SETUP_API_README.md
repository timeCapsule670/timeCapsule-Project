# Family Setup API Integration

This document describes the integration of the Family Setup API endpoints in the TimeCapsule project.

## API Endpoints

### 1. Complete Family Setup
**POST** `/api/family-setup`

Updates the director's role and creates relationships with child profiles in a single request.

**Request Body:**
```json
{
  "selectedRole": "Mom",
  "actorIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "director_role_updated": true,
    "relationships_created": 3,
    "message": "Family setup completed successfully"
  },
  "message": "Family setup completed successfully"
}
```

### 2. Update Director Role Only
**PUT** `/api/family-setup/director-role`

Updates only the director's role/type without affecting relationships.

**Request Body:**
```json
{
  "selectedRole": "Dad"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "director_role_updated": true,
    "message": "Director role updated successfully"
  },
  "message": "Director role updated successfully"
}
```

## Implementation Details

### API Service Integration
The family setup functionality has been integrated into the existing `ApiService` class in `project/libs/api.ts`:

- **Interfaces**: Added `FamilySetupRequest`, `FamilySetupResponse`, `UpdateDirectorRoleRequest`, and `UpdateDirectorRoleResponse`
- **Methods**: Added `familySetup()` and `updateDirectorRole()` methods

### Component Updates
The `FamilySetupScreen` component (`project/app/family-setup.tsx`) has been updated to:

1. **Import**: Use `apiService` instead of direct Supabase calls
2. **Simplify**: Replace complex database operations with a single API call
3. **Error Handling**: Improved error handling with user-friendly messages
4. **Logging**: Maintained comprehensive logging for debugging

### Key Changes Made

#### Before (Direct Supabase):
- Multiple database queries (session, director profile, relationships)
- Complex relationship checking and creation logic
- Manual error handling for each database operation

#### After (API Integration):
- Single API call to `/api/family-setup`
- Backend handles all database operations
- Simplified error handling
- Cleaner, more maintainable code

## Usage Examples

### Complete Family Setup
```typescript
import { apiService } from '@/libs/api';

try {
  const response = await apiService.familySetup({
    selectedRole: 'Mom',
    actorIds: ['uuid1', 'uuid2', 'uuid3']
  });
  
  if (response.success) {
    console.log(`Relationships created: ${response.data.relationships_created}`);
    // Navigate to next screen
  }
} catch (error) {
  console.error('Family setup failed:', error);
}
```

### Update Director Role Only
```typescript
import { apiService } from '@/libs/api';

try {
  const response = await apiService.updateDirectorRole({
    selectedRole: 'Dad'
  });
  
  if (response.success) {
    console.log('Director role updated successfully');
  }
} catch (error) {
  console.error('Role update failed:', error);
}
```

## Testing

A test file `test-family-setup-api.js` has been created to verify the API endpoints work correctly. To use it:

1. Replace `YOUR_JWT_TOKEN_HERE` with an actual JWT token
2. Run the test file to verify both endpoints work
3. Test authentication requirements

## Security

- Both endpoints are **protected** and require valid JWT authentication
- The `Authorization: Bearer <token>` header is automatically added by the API service
- User authentication is handled by the backend

## Error Handling

The API service includes comprehensive error handling:

- Network errors are caught and re-thrown with user-friendly messages
- API errors (4xx, 5xx) are properly handled
- Authentication errors are handled gracefully
- User feedback is provided through Alert dialogs

## Benefits of This Integration

1. **Simplified Frontend**: Reduced complexity in the React Native component
2. **Better Error Handling**: Centralized error handling in the API service
3. **Maintainability**: Cleaner separation of concerns
4. **Scalability**: Backend can handle complex business logic
5. **Security**: Authentication and validation handled server-side
6. **Testing**: Easier to test and debug API endpoints

## Next Steps

1. **Backend Implementation**: Ensure the backend endpoints are implemented and working
2. **Testing**: Test with real JWT tokens and actual data
3. **Error Scenarios**: Test various error conditions (invalid tokens, missing data, etc.)
4. **Performance**: Monitor API response times and optimize if needed
