const { prisma, memoryDb } = require('../services/dbService');
const RazorpaySDK = require('razorpay');

let Razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    Razorpay = new RazorpaySDK({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
} catch (error) {
  console.log('Razorpay package not found or initialization failed in orderController.');
}

const getMyOrders = async (req, res, next) => {
  try {
    if (prisma) {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      });

      const enrichedOrders = orders.map(o => {
        const isSub = o.items.some(i => i.name.toLowerCase().includes('subscription') || i.name.toLowerCase().includes('combo') || i.name.toLowerCase().includes('30-day'));
        const memoryMatch = memoryDb.orders.find(mo => mo.id === o.id);
        return {
          ...o,
          dailyDeliveryLogs: memoryMatch?.dailyDeliveryLogs || (isSub ? generateDefault30DayLogs(o.createdAt) : null)
        };
      });

      return res.json({ success: true, count: enrichedOrders.length, orders: enrichedOrders });
    }

    const orders = memoryDb.orders.filter(o => o.userId === req.user.id);
    return res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    if (prisma) {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: { items: true }
      });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to order.' });
      }
      return res.json({ success: true, order });
    }

    const order = memoryDb.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    return res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// Helper: Generate default 30-day delivery log array for monthly subscriptions (ALL SCHEDULED BY DEFAULT)
const generateDefault30DayLogs = (startDate = new Date()) => {
  const days = [];
  const start = new Date(startDate);
  for (let i = 1; i <= 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + (i - 1));
    days.push({
      dayNum: i,
      dateStr: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      status: 'SCHEDULED', // By default, every day is SCHEDULED until Admin marks it DELIVERED/IN_TRANSIT
      note: '',
      protein: 42.5
    });
  }
  return days;
};

const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod, paymentStatus, subtotal, gst, deliveryCharge, totalAmount, estimatedDeliveryTime } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    const orderNum = `PROT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const totalProtein = items.reduce((acc, item) => acc + ((item.protein || 0) * (item.quantity || 1)), 0);
    const totalCalories = items.reduce((acc, item) => acc + ((item.calories || 0) * (item.quantity || 1)), 0);

    const calcSubtotal = subtotal || items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const calcGst = gst || Math.round(calcSubtotal * 0.05);
    const calcDeliv = deliveryCharge !== undefined ? deliveryCharge : 30;
    const calcTotal = totalAmount || (calcSubtotal + calcGst + calcDeliv);

    const isSubscriptionOrder = items.some(i => i.name.toLowerCase().includes('subscription') || i.name.toLowerCase().includes('combo') || i.name.toLowerCase().includes('30-day'));
    const initialLogs = isSubscriptionOrder ? generateDefault30DayLogs() : null;

    if (prisma) {
      const createdOrder = await prisma.order.create({
        data: {
          id: `ord-${Date.now()}`,
          orderNumber: orderNum,
          userId: req.user.id,
          status: 'PENDING',
          subtotal: Number(calcSubtotal),
          gst: Number(calcGst),
          deliveryCharge: Number(calcDeliv),
          totalAmount: Number(calcTotal),
          paymentMethod: paymentMethod || 'RAZORPAY',
          paymentStatus: paymentStatus || 'COMPLETED',
          deliveryAddress: deliveryAddress || 'Default Address',
          totalProtein: Number(totalProtein.toFixed(1)),
          totalCalories: Number(totalCalories.toFixed(0)),
          items: {
            create: items.map(item => ({
              id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              name: item.name,
              itemType: isSubscriptionOrder ? 'SUBSCRIPTION' : 'PRESET',
              price: Number(item.price),
              quantity: Number(item.quantity || 1),
              protein: Number(item.protein || 0),
              calories: Number(item.calories || 0)
            }))
          }
        },
        include: { items: true }
      });

      createdOrder.dailyDeliveryLogs = initialLogs;

      console.log(`📦 Order ${createdOrder.orderNumber} (Sub: ${isSubscriptionOrder}) created in SQLite dev.db!`);
      memoryDb.orders.unshift(createdOrder);

      let rzpData = null;
      if ((paymentMethod === 'RAZORPAY' || !paymentMethod) && Razorpay) {
        try {
          const rzpOrder = await Razorpay.orders.create({
            amount: Math.round(calcTotal * 100),
            currency: 'INR',
            receipt: createdOrder.id
          });
          rzpData = {
            razorpayOrderId: rzpOrder.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID
          };
        } catch (err) {
          console.error('Razorpay order creation error:', err);
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully and saved to SQLite Database!',
        order: createdOrder,
        ...rzpData
      });
    }

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      userId: req.user.id,
      status: 'PENDING',
      subtotal: Number(calcSubtotal),
      gst: Number(calcGst),
      deliveryCharge: Number(calcDeliv),
      totalAmount: Number(calcTotal),
      paymentMethod: paymentMethod || 'RAZORPAY',
      paymentStatus: paymentStatus || 'COMPLETED',
      deliveryAddress: deliveryAddress || 'Default Address',
      totalProtein: Number(totalProtein.toFixed(1)),
      totalCalories: Number(totalCalories.toFixed(0)),
      estimatedDeliveryTime: estimatedDeliveryTime || '30 Minutes',
      dailyDeliveryLogs: initialLogs,
      items: items.map(item => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity || 1),
        protein: Number(item.protein || 0),
        calories: Number(item.calories || 0)
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memoryDb.orders.unshift(newOrder);

    let rzpData = null;
    if ((paymentMethod === 'RAZORPAY' || !paymentMethod) && Razorpay) {
      try {
        const rzpOrder = await Razorpay.orders.create({
          amount: Math.round(calcTotal * 100),
          currency: 'INR',
          receipt: newOrder.id
        });
        rzpData = {
          razorpayOrderId: rzpOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID
        };
      } catch (err) {
        console.error('Razorpay order creation error:', err);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder,
      ...rzpData
    });
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    if (prisma) {
      const orders = await prisma.order.findMany({
        include: { items: true, user: true },
        orderBy: { createdAt: 'desc' }
      });

      const enrichedOrders = orders.map(o => {
        const isSub = o.items.some(i => i.name.toLowerCase().includes('subscription') || i.name.toLowerCase().includes('combo') || i.name.toLowerCase().includes('30-day'));
        const memoryMatch = memoryDb.orders.find(mo => mo.id === o.id);
        return {
          ...o,
          dailyDeliveryLogs: memoryMatch?.dailyDeliveryLogs || (isSub ? generateDefault30DayLogs(o.createdAt) : null)
        };
      });

      return res.json({ success: true, count: enrichedOrders.length, orders: enrichedOrders });
    }

    const enriched = memoryDb.orders.map(o => {
      const u = memoryDb.users.find(user => user.id === o.userId);
      return { ...o, user: u };
    });
    return res.json({ success: true, count: enriched.length, orders: enriched });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, estimatedDeliveryTime } = req.body;

    if (prisma) {
      const updated = await prisma.order.update({
        where: { id },
        data: { status: status ? status.toUpperCase() : undefined },
        include: { items: true }
      });

      const memoryIndex = memoryDb.orders.findIndex(o => o.id === id);
      if (memoryIndex !== -1) {
        if (status) memoryDb.orders[memoryIndex].status = status.toUpperCase();
        if (estimatedDeliveryTime) memoryDb.orders[memoryIndex].estimatedDeliveryTime = estimatedDeliveryTime;
      }

      console.log(`📦 Order ${updated.orderNumber} status updated to ${updated.status} in SQLite dev.db!`);
      return res.json({ success: true, message: `Order status updated to ${updated.status}!`, order: { ...updated, estimatedDeliveryTime } });
    }

    const order = memoryDb.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (status) order.status = status.toUpperCase();
    if (estimatedDeliveryTime) order.estimatedDeliveryTime = estimatedDeliveryTime;

    return res.json({ success: true, message: `Order status updated to ${order.status}!`, order });
  } catch (err) {
    next(err);
  }
};

// ADMIN UPDATE SPECIFIC DAY STATUS IN MONTHLY SUBSCRIPTION DELIVERIES
const updateDailyDeliveryLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dayNum, status, note } = req.body;

    let order = memoryDb.orders.find(o => o.id === id);
    if (!order) {
      if (prisma) {
        const dbOrder = await prisma.order.findUnique({ where: { id }, include: { items: true } });
        if (dbOrder) {
          dbOrder.dailyDeliveryLogs = generateDefault30DayLogs(dbOrder.createdAt);
          memoryDb.orders.unshift(dbOrder);
          order = dbOrder;
        }
      }
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!order.dailyDeliveryLogs) {
      order.dailyDeliveryLogs = generateDefault30DayLogs(order.createdAt);
    }

    const dayObj = order.dailyDeliveryLogs.find(d => d.dayNum === Number(dayNum));
    if (dayObj) {
      if (status) dayObj.status = status.toUpperCase();
      if (note !== undefined) dayObj.note = note;
    }

    console.log(`📅 Daily Delivery Day ${dayNum} for Order ${order.orderNumber} updated to ${status} ("${note}")!`);

    return res.json({
      success: true,
      message: `Day ${dayNum} status updated to ${status}!`,
      dailyDeliveryLogs: order.dailyDeliveryLogs
    });
  } catch (err) {
    next(err);
  }
};

const updateOrderPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (prisma) {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized access.' });
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { 
          paymentStatus,
          status: paymentStatus === 'COMPLETED' ? 'ACCEPTED' : order.status
        }
      });
      return res.json({ success: true, message: 'Payment status updated successfully.', order: updated });
    }

    const orderIndex = memoryDb.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (req.user.role !== 'ADMIN' && memoryDb.orders[orderIndex].userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access.' });
    }

    memoryDb.orders[orderIndex].paymentStatus = paymentStatus;
    if (paymentStatus === 'COMPLETED') {
      memoryDb.orders[orderIndex].status = 'ACCEPTED';
    }

    return res.json({ success: true, message: 'Payment status updated successfully.', order: memoryDb.orders[orderIndex] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  createOrder,
  getAllOrders,
  updateOrderStatus,
  updateDailyDeliveryLog,
  updateOrderPaymentStatus
};
