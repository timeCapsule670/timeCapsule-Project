// Test file for forgot password API endpoints
// Run this with: node test-forgot-password-api.js

const BASE_URL = 'https://timecapsule-backend-z21v.onrender.com/api';

async function testForgotPasswordFlow() {
  const testEmail = 'test@example.com';
  
  console.log('🧪 Testing Forgot Password API Flow...\n');

  try {
    // Test 1: Request OTP
    console.log('1️⃣ Testing /auth/forgot-password...');
    const forgotPasswordResponse = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      })
    });
    
    const forgotPasswordData = await forgotPasswordResponse.json();
    console.log('Response:', forgotPasswordData);
    
    if (forgotPasswordData.success) {
      console.log('✅ OTP request successful\n');
    } else {
      console.log('❌ OTP request failed\n');
      return;
    }

    // Test 2: Verify OTP (using a dummy OTP for testing)
    console.log('2️⃣ Testing /auth/verify-otp...');
    const verifyOtpResponse = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        otp: '123456' // This would be the actual OTP sent to email
      })
    });
    
    const verifyOtpData = await verifyOtpResponse.json();
    console.log('Response:', verifyOtpData);
    
    if (verifyOtpData.success) {
      console.log('✅ OTP verification successful\n');
    } else {
      console.log('❌ OTP verification failed\n');
      return;
    }

    // Test 3: Reset Password with OTP
    console.log('3️⃣ Testing /auth/reset-password-with-otp...');
    const resetPasswordResponse = await fetch(`${BASE_URL}/auth/reset-password-with-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        otp: '123456', // This would be the actual OTP sent to email
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123'
      })
    });
    
    const resetPasswordData = await resetPasswordResponse.json();
    console.log('Response:', resetPasswordData);
    
    if (resetPasswordData.success) {
      console.log('✅ Password reset successful\n');
    } else {
      console.log('❌ Password reset failed\n');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Test health endpoint first
async function testHealth() {
  try {
    console.log('🏥 Testing backend health...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);
    console.log('');
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    console.log('');
  }
}

// Run tests
async function runTests() {
  await testHealth();
  await testForgotPasswordFlow();
  console.log('🎯 API testing completed!');
}

runTests();
