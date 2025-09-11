# Forgot Password API Integration

This document explains how the forgot password flow has been integrated with your backend API endpoints.

## API Endpoints Used

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|--------------|----------|
| `/auth/forgot-password` | POST | Request OTP | `{ email: string }` | `{ success: boolean, message: string, data?: { otp_sent: boolean } }` |
| `/auth/verify-otp` | POST | Verify OTP | `{ email: string, otp: string }` | `{ success: boolean, message: string, data?: { verified: boolean, reset_token?: string } }` |
| `/auth/reset-password-with-otp` | POST | Reset password | `{ email: string, otp: string, newPassword: string, confirmPassword: string }` | `{ success: boolean, message: string, data?: { password_reset: boolean } }` |

## Flow Overview

1. **Forgot Password Screen** (`/forgot-password`)
   - User enters email address
   - Calls `/auth/forgot-password` to request OTP
   - On success, navigates to verify code screen

2. **Verify Code Screen** (`/verify-code`)
   - User enters 6-digit OTP received via email
   - Calls `/auth/verify-otp` to verify the code
   - On success, navigates to reset password screen with email and OTP as params

3. **Reset Password Screen** (`/reset-password`)
   - User enters new password (with validation)
   - Calls `/auth/reset-password-with-otp` to reset password
   - On success, shows success message and redirects to sign in

## Key Changes Made

### 1. API Service (`/libs/api.ts`)
- Added new interfaces for forgot password requests/responses
- Added three new methods: `forgotPassword()`, `verifyOtp()`, `resetPasswordWithOtp()`

### 2. Forgot Password Screen (`/app/forgot-password.tsx`)
- Replaced Supabase implementation with API calls
- Simplified to only handle email (removed phone number support)
- Added proper error handling and user feedback
- Navigates to verify code screen on success

### 3. Verify Code Screen (`/app/verify-code.tsx`)
- Replaced placeholder implementation with API calls
- Added proper error handling
- Passes email and OTP to reset password screen
- Supports resending OTP

### 4. Reset Password Screen (`/app/reset-password.tsx`)
- Replaced placeholder implementation with API calls
- Receives email and OTP from navigation params
- Validates password requirements
- Calls API to reset password

## Error Handling

All screens now include comprehensive error handling:
- Network errors
- API response errors
- Validation errors
- User-friendly error messages

## Testing

A test file (`test-forgot-password-api.js`) has been created to verify the API endpoints work correctly. Run it with:

```bash
node test-forgot-password-api.js
```

## Security Features

- Password requirements validation (8+ chars, uppercase, lowercase, number)
- OTP verification before password reset
- Secure password input with show/hide toggle
- Proper error handling without exposing sensitive information

## User Experience

- Smooth animations and transitions
- Clear progress indicators
- Helpful error messages
- Auto-focus on OTP inputs
- Resend OTP functionality
- Password strength requirements display

## Navigation Flow

```
Forgot Password → Verify Code → Reset Password → Sign In
     ↓              ↓              ↓            ↓
  Enter Email   Enter OTP    New Password   Success
  Send OTP      Verify       Confirm        Redirect
```

## Notes

- The integration assumes your backend sends OTP codes via email
- OTP codes are 6 digits
- All API calls include proper error handling
- The flow maintains state between screens using navigation params
- Password validation is client-side for immediate feedback
- Server-side validation should also be implemented on your backend
