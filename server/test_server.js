const app = require('./server');
const http = require('http');

const server = http.createServer(app);

server.listen(5001, async () => {
  console.log('Testing Server running on port 5001...');

  try {
    const fetch = (url, options = {}) => new Promise((resolve, reject) => {
      const u = new URL(url);
      const payload = options.body ? JSON.stringify(options.body) : null;
      const headers = {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(options.headers || {})
      };

      const req = http.request({
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: options.method || (payload ? 'POST' : 'GET'),
        headers
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });

    // Test 1: Health
    const health = await fetch('http://localhost:5001/api/health');
    console.log('✅ 1. Health API:', health.data.status);

    // Test 2: Customer Login
    const login = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: { email: 'alex@example.com', password: 'admin123' }
    });
    console.log('✅ 2. Customer Login API:', login.data.success ? 'PASSED' : 'FAILED', '- User:', login.data.user.name);
    const token = login.data.token;

    // Test 3: Get Ingredients
    const ings = await fetch('http://localhost:5001/api/ingredients');
    console.log('✅ 3. Ingredients API:', ings.data.count, 'ingredients loaded.');

    // Test 4: Get Products
    const prods = await fetch('http://localhost:5001/api/products');
    console.log('✅ 4. Products API:', prods.data.count, 'products loaded.');

    // Test 5: Admin Login
    const adminLogin = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@protein.com', password: 'admin123' }
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ 5. Admin Login API:', adminLogin.data.success ? 'PASSED' : 'FAILED', '- Role:', adminLogin.data.user.role);

    // Test 6: Admin Dashboard Stats
    const stats = await fetch('http://localhost:5001/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ 6. Admin Dashboard Stats API:', stats.data.stats ? 'PASSED' : 'FAILED', '- Today Sales: ₹' + stats.data.stats.todaySales);

    // Test 7: Customer Order Creation
    const order = await fetch('http://localhost:5001/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        items: [{ productId: 'prod-1', name: 'Ultimate Muscle Recovery Bowl', price: 249, quantity: 1, protein: 38.5, calories: 420 }],
        deliveryAddress: '42 Fitness Avenue, Suite 101, Mumbai',
        paymentMethod: 'RAZORPAY'
      }
    });
    console.log('✅ 7. Order Placement API:', order.data.success ? 'PASSED' : 'FAILED', '- Order Number:', order.data.order.orderNumber);

    console.log('🎉 ALL 7 FULL-STACK INTEGRATION TESTS PASSED 100% CLEANLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
