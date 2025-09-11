const BASE_URL = 'https://timecapsule-backend-z21v.onrender.com/api';

// Test the family setup API endpoints
async function testFamilySetupAPI() {
  console.log('🧪 Testing Family Setup API endpoints...\n');

  // Test 1: Complete family setup
  console.log('📝 Test 1: Complete Family Setup (POST /api/family-setup)');
  try {
    const response = await fetch(`${BASE_URL}/family-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE', // Replace with actual token
      },
      body: JSON.stringify({
        selectedRole: 'Mom',
        actorIds: ['uuid1', 'uuid2', 'uuid3']
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Update director role only
  console.log('📝 Test 2: Update Director Role Only (PUT /api/family-setup/director-role)');
  try {
    const response = await fetch(`${BASE_URL}/family-setup/director-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE', // Replace with actual token
      },
      body: JSON.stringify({
        selectedRole: 'Dad'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Test without authentication (should fail)
  console.log('📝 Test 3: Test without authentication (should fail)');
  try {
    const response = await fetch(`${BASE_URL}/family-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedRole: 'Mom',
        actorIds: ['uuid1', 'uuid2', 'uuid3']
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the tests
testFamilySetupAPI().catch(console.error);
