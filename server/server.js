const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const sproutsRoutes = require('./routes/sproutsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const mealRoutes = require('./routes/mealRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    app: 'Protein Project Full-Stack API',
    timestamp: new Date().toISOString()
  });
});

// Razorpay Webhook listener (at root)
app.post('/payment/webhook', async (req, res, next) => {
  try {
    const event = req.body.event;
    console.log(`⚓ Razorpay Webhook Event Received: ${event}`);
    
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderNumber = paymentEntity?.notes?.orderNumber;

      if (orderNumber) {
        console.log(`💰 Webhook success for Order Number: ${orderNumber}`);
        
        const { PrismaClient } = require('@prisma/client');
        const db = new PrismaClient();
        
        // Find order in SQLite
        const order = await db.order.findUnique({
          where: { orderNumber }
        });

        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'ACCEPTED'
            }
          });
          console.log(`✅ Order ${orderNumber} updated to COMPLETED and ACCEPTED via webhook!`);
        }

        // Also update memoryDb fallback
        const { memoryDb } = require('./services/dbService');
        const mIndex = memoryDb.orders.findIndex(o => o.orderNumber === orderNumber);
        if (mIndex !== -1) {
          memoryDb.orders[mIndex].paymentStatus = 'COMPLETED';
          memoryDb.orders[mIndex].status = 'ACCEPTED';
          console.log(`✅ Order ${orderNumber} updated in memoryDb fallback via webhook!`);
        }
      }
    }
    
    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// API Routes Bindings
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/sprouts', sproutsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/meals', mealRoutes);

// Client Static Production Serving (if built)
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Global Error Middleware
app.use(errorHandler);

// Start HTTP Server
const http = require('http');
const { Server } = require('socket.io');
const initWebSocket = require('./websocket');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Initialize Realtime AI WebSocket Handler
initWebSocket(io);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Protein Project Full Stack Server Running!`);
    console.log(`🌐 API Server: http://localhost:${PORT}/api/health`);
    console.log(`🔌 WebSocket Server running on same port`);
    console.log(`==================================================`);
  });
}

module.exports = { app, server, io };
