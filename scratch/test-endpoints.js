const API_URL = 'http://localhost:5000/api';

async function test() {
  const email = `test_${Date.now()}@test.com`;
  const password = 'password123';
  
  console.log('--- Testing Registration ---');
  try {
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password
      })
    });
    console.log('Registration Response Status:', regRes.status);
    const data = await regRes.json();
    console.log('Registration Response Data:', data);
  } catch (err) {
    console.error('Registration Error:', err.message);
  }

  console.log('\n--- Testing Login ---');
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password
      })
    });
    console.log('Login Response Status:', loginRes.status);
    const data = await loginRes.json();
    console.log('Login Response Data:', data);
  } catch (err) {
    console.error('Login Error:', err.message);
  }
}

test();
