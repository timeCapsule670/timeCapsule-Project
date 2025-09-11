// Simple test file to verify the API endpoints
// Run this with: node test-api.js

const BASE_URL = 'https://timecapsule-backend-z21v.onrender.com/api';

// Test 1: Get Categories (requires auth)
async function testGetCategories() {
  console.log('🧪 Testing GET /categories...');
  
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });
    
    const data = await response.json();
    console.log('✅ Response:', data);
    
    if (response.ok) {
      console.log('✅ GET /categories successful');
      console.log(`📊 Found ${data.data?.length || 0} categories`);
    } else {
      console.log('❌ GET /categories failed:', data.message || data.error);
    }
  } catch (error) {
    console.error('💥 Error testing GET /categories:', error.message);
  }
}

// Test 2: Save Director Categories (requires auth)
async function testSaveDirectorCategories() {
  console.log('\n🧪 Testing POST /categories/director...');
  
  try {
    const requestBody = {
      category_ids: [
        "19d8702d-4a37-4bf7-902e-571bd5416b1d",
        "45dfda76-24a9-47f2-8856-5684814f939b"
      ]
    };
    
    const response = await fetch(`${BASE_URL}/categories/director`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    console.log('✅ Response:', data);
    
    if (response.ok) {
      console.log('✅ POST /categories/director successful');
      console.log(`📊 Saved: ${data.data?.saved_count || 0}, Existing: ${data.data?.existing_count || 0}`);
    } else {
      console.log('❌ POST /categories/director failed:', data.message || data.error);
    }
  } catch (error) {
    console.error('💥 Error testing POST /categories/director:', error.message);
  }
}

// Test 3: Health check (no auth required)
async function testHealthCheck() {
  console.log('\n🧪 Testing GET /health...');
  
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET'
    });
    
    const data = await response.json();
    console.log('✅ Response:', data);
    
    if (response.ok) {
      console.log('✅ GET /health successful');
    } else {
      console.log('❌ GET /health failed:', data.message || data.error);
    }
  } catch (error) {
    console.error('💥 Error testing GET /health:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  // Test health check first (no auth required)
  await testHealthCheck();
  
  // Test authenticated endpoints
  await testGetCategories();
  await testSaveDirectorCategories();
  
  console.log('\n🏁 API Tests completed!');
  console.log('\n📝 Note: Authenticated endpoints require a valid JWT token.');
  console.log('   Replace "YOUR_JWT_TOKEN_HERE" with an actual token to test those endpoints.');
}

runTests().catch(console.error);
