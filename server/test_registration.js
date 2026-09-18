const http = require('http');

const postRequest = (path, data) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

async function testRegistrationSuite() {
  console.log('🧪 Starting Comprehensive Registration Error Handling Test Suite...\n');

  // Test 1: Short Password
  const shortPassRes = await postRequest('/api/auth/register', {
    name: 'Short Pass User',
    email: 'shortpass@example.com',
    password: '123',
    phone: '+91 99999 88888'
  });
  console.log('Test 1 (Short Password):', shortPassRes.status === 400 ? '✅ PASSED' : '❌ FAILED', '-', shortPassRes.data.message);

  // Test 2: Invalid Email
  const invalidEmailRes = await postRequest('/api/auth/register', {
    name: 'Invalid Email User',
    email: 'invalid-email-format',
    password: 'securepassword123',
    phone: '+91 99999 88888'
  });
  console.log('Test 2 (Invalid Email):', invalidEmailRes.status === 400 ? '✅ PASSED' : '❌ FAILED', '-', invalidEmailRes.data.message);

  // Test 3: Duplicate Email (Existing user alex@example.com)
  const dupRes = await postRequest('/api/auth/register', {
    name: 'Alex Duplicate',
    email: 'alex@example.com',
    password: 'securepassword123',
    phone: '+91 99999 88888'
  });
  console.log('Test 3 (Duplicate Registration):', dupRes.status === 400 ? '✅ PASSED' : '❌ FAILED', '-', dupRes.data.message);

  // Test 4: Valid Registration
  const testEmail = `newuser_${Date.now()}@example.com`;
  const validRes = await postRequest('/api/auth/register', {
    name: 'Fitness Enthusiast',
    email: testEmail,
    password: 'strongpassword123',
    phone: '+91 98765 12345',
    dailyProteinGoal: 140
  });
  console.log('Test 4 (Valid Registration & DB Save):', validRes.status === 201 ? '✅ PASSED' : '❌ FAILED', '-', validRes.data.message, '| User Email:', validRes.data.user?.email);

  console.log('\n🎉 REGISTRATION ERROR HANDLING & DATABASE SAVE TEST COMPLETE!');
}

// Start test server on 5001 & run tests
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));

const server = app.listen(5001, () => {
  testRegistrationSuite().finally(() => server.close());
});
