# Moments Selection API Implementation

This document describes the implementation of the Moments Selection API endpoints for the TimeCapsule project.

## Overview

The Moments Selection API allows users to:
1. Retrieve all available categories with their associated emojis
2. Save selected categories for a specific director

## API Endpoints

### 1. Get All Categories

**Endpoint**: `GET /categories`

**Description**: Retrieves all available categories from the system. Each category includes an ID, name, and associated emoji.

**Authentication**: Required (JWT token)

**Headers**:
- `Authorization: Bearer <jwt-token>`
- `Content-Type: application/json`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "19d8702d-4a37-4bf7-902e-571bd5416b1d",
      "name": "Life Advice",
      "emoji": "💬"
    },
    {
      "id": "4269de96-1610-42aa-847d-811112896224",
      "name": "Celebrations and Encouragement",
      "emoji": "🎉"
    },
    {
      "id": "45dfda76-24a9-47f2-8856-5684814f939b",
      "name": "Milestones",
      "emoji": "🎓"
    },
    {
      "id": "50655bf2-811a-469d-9482-2f7cd4e7f831",
      "name": "Emotional Support",
      "emoji": "😊"
    },
    {
      "id": "7d73d3b0-2736-4484-b99f-a4b807be8210",
      "name": "Just Because",
      "emoji": "❤️"
    }
  ]
}
```

### 2. Save Director Categories

**Endpoint**: `POST /categories/director`

**Description**: Saves the selected categories for a specific director. This creates relationships between the director and their chosen categories.

**Authentication**: Required (JWT token)

**Headers**:
- `Authorization: Bearer <jwt-token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "category_ids": [
    "19d8702d-4a37-4bf7-902e-571bd5416b1d",
    "45dfda76-24a9-47f2-8856-5684814f939b"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Categories saved successfully",
  "data": {
    "saved_count": 2,
    "existing_count": 0
  }
}
```

## Implementation Details

### Frontend Changes

1. **API Service Updates** (`project/libs/api.ts`):
   - Added new interfaces for Category, GetCategoriesResponse, SaveDirectorCategoriesRequest, and SaveDirectorCategoriesResponse
   - Implemented `getCategories()` method
   - Implemented `saveDirectorCategories()` method

2. **Component Updates** (`project/app/moments-selection.tsx`):
   - Replaced Supabase calls with API service calls
   - Updated error handling to work with the new API response format
   - Simplified the save process by using the new API endpoint

### Backend Requirements

The backend should implement these endpoints:

1. **GET /categories**:
   - Query the `categories` table
   - Return categories with `id`, `name`, and `emoji` fields
   - Apply proper authentication middleware

2. **POST /categories/director**:
   - Extract user ID from JWT token
   - Find or create director record
   - Insert relationships into `director_categories` table
   - Handle duplicate entries gracefully
   - Return success/failure status with counts

## Testing

A test file has been created at `project/test-api.js` to verify the API endpoints work correctly.

**To run the tests**:
```bash
cd project
node test-api.js
```

**Note**: The authenticated endpoints require a valid JWT token. Replace `YOUR_JWT_TOKEN_HERE` in the test file with an actual token.

## Error Handling

The API implements comprehensive error handling:

- **Authentication errors**: Proper JWT validation
- **Validation errors**: Request body validation
- **Database errors**: Graceful handling of database operations
- **Network errors**: Proper error messages for network issues

## Security Considerations

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **User Isolation**: Directors can only access their own category selections
3. **Input Validation**: Category IDs are validated before processing
4. **Rate Limiting**: Consider implementing rate limiting for production use

## Migration from Supabase

The implementation has been migrated from direct Supabase calls to a centralized API service:

**Before (Supabase)**:
```typescript
const { data, error } = await supabase
  .from('categories')
  .select('id, name')
  .order('name');
```

**After (API Service)**:
```typescript
const response = await apiService.getCategories();
if (response.success) {
  setCategories(response.data);
}
```

## Future Enhancements

1. **Caching**: Implement client-side caching for categories
2. **Real-time Updates**: Add WebSocket support for real-time category updates
3. **Bulk Operations**: Support for bulk category operations
4. **Analytics**: Track category selection patterns
5. **Personalization**: Suggest categories based on user behavior

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Ensure JWT token is valid and not expired
   - Check token format in Authorization header

2. **Category Not Found**:
   - Verify category IDs exist in the database
   - Check category table structure

3. **Save Failures**:
   - Ensure director record exists
   - Check database constraints and permissions

### Debug Mode

Enable debug logging by setting the appropriate log level in your environment configuration.

## Support

For API-related issues, check:
1. Network connectivity to the backend
2. JWT token validity
3. Backend service status
4. Database connectivity

For frontend issues, check:
1. API service configuration
2. Component state management
3. Error handling implementation
