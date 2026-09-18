const crypto = require('crypto');
const { prisma, memoryDb } = require('../services/dbService');
const { generateMealCalendar } = require('../services/mealService');
let Razorpay = null;

try {
  const RazorpaySDK = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    Razorpay = new RazorpaySDK({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('💳 Razorpay SDK initialized successfully!');
  } else {
    console.log('⚠️ Razorpay credentials missing. Running in Simulated Test Mode.');
  }
} catch (e) {
  console.log('⚠️ Razorpay package not found or initialization failed. Running in Simulated Test Mode.');
}

// In-memory cache for webhook event idempotency
const processedWebhookEvents = new Set();

const createPaymentOrder = async (req, res, next) => {
  try {
    const { planId, deliveryAddress, deliveryTime, start_date, personalInfo } = req.body;
    const userId = req.user.id;

    if (!planId || !deliveryAddress || !deliveryTime || !start_date) {
      return res.status(400).json({ success: false, message: 'All details including plan, address, time, and start date are required.' });
    }

    // 1. Fetch Subscription Plan
    let plan = null;
    if (prisma) {
      plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    } else {
      plan = memoryDb.subscriptionPlans.find(p => p.id === planId);
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
    }

    const price = plan.monthly_price;
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(startDateObj.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subNumber = `SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `pay-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let subscription = null;
    let payment = null;

    if (prisma) {
      // Create Subscription in PENDING_PAYMENT state
      subscription = await prisma.subscription.create({
        data: {
          id: `sub-${Date.now()}`,
          userId,
          planId: plan.id,
          subscription_number: subNumber,
          start_date: startDateObj,
          end_date: endDateObj,
          status: 'PENDING_PAYMENT',
          delivery_address: deliveryAddress,
          delivery_time: deliveryTime,
          next_billing_date: endDateObj,
          next_delivery_date: startDateObj,
          payment_status: 'PENDING'
        }
      });

      // Create Payment Transaction Record
      payment = await prisma.subscriptionPayment.create({
        data: {
          id: paymentId,
          subscriptionId: subscription.id,
          userId,
          amount: price,
          gateway: 'RAZORPAY',
          status: 'CREATED'
        }
      });
    } else {
      subscription = {
        id: `sub-${Date.now()}`,
        userId,
        planId: plan.id,
        subscription_number: subNumber,
        start_date: startDateObj,
        end_date: endDateObj,
        status: 'PENDING_PAYMENT',
        delivery_address: deliveryAddress,
        delivery_time: deliveryTime,
        next_billing_date: endDateObj,
        next_delivery_date: startDateObj,
        payment_status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      payment = {
        id: paymentId,
        subscriptionId: subscription.id,
        userId,
        amount: price,
        gateway: 'RAZORPAY',
        status: 'CREATED',
        created_at: new Date()
      };
      memoryDb.subscriptions = memoryDb.subscriptions || [];
      memoryDb.subscriptions.unshift(subscription);
      memoryDb.subscriptionPayments = memoryDb.subscriptionPayments || [];
      memoryDb.subscriptionPayments.unshift(payment);
    }

    // 2. Interface with Razorpay Gateway
    if (Razorpay) {
      try {
        const rzpOrder = await Razorpay.orders.create({
          amount: Math.round(price * 100), // In paise
          currency: 'INR',
          receipt: payment.id,
          notes: {
            subscriptionId: subscription.id,
            userId,
            subNumber
          }
        });

        if (prisma) {
          await prisma.subscriptionPayment.update({
            where: { id: payment.id },
            data: { gateway_order_id: rzpOrder.id }
          });
        } else {
          payment.gateway_order_id = rzpOrder.id;
        }

        return res.json({
          success: true,
          mode: 'RAZORPAY',
          key: process.env.RAZORPAY_KEY_ID,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          orderId: rzpOrder.id,
          subscriptionId: subscription.id,
          paymentId: payment.id,
          subNumber
        });
      } catch (err) {
        console.error('Razorpay order creation error. Falling back to Simulated mode:', err);
        const simOrderId = `rzp-sim-${Date.now()}`;
        if (prisma) {
          await prisma.subscriptionPayment.update({
            where: { id: payment.id },
            data: { 
              gateway_order_id: simOrderId,
              gateway: 'SIMULATED'
            }
          });
        } else {
          payment.gateway_order_id = simOrderId;
          payment.gateway = 'SIMULATED';
        }

        return res.json({
          success: true,
          mode: 'SIMULATED',
          key: 'simulated_test_key',
          amount: price * 100,
          currency: 'INR',
          orderId: simOrderId,
          subscriptionId: subscription.id,
          paymentId: payment.id,
          subNumber
        });
      }
    }

    // Fallback: Simulated Test Mode
    if (prisma) {
      await prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: { gateway_order_id: `rzp-sim-${Date.now()}` }
      });
    } else {
      payment.gateway_order_id = `rzp-sim-${Date.now()}`;
    }

    return res.json({
      success: true,
      mode: 'SIMULATED',
      key: 'simulated_test_key',
      amount: price * 100,
      currency: 'INR',
      orderId: payment.gateway_order_id,
      subscriptionId: subscription.id,
      paymentId: payment.id,
      subNumber
    });
  } catch (err) {
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, subscriptionId, rzpPaymentId, simulateSuccess } = req.body;
    const userId = req.user.id;

    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: 'Subscription ID is required.' });
    }

    let subscription = null;
    let payment = null;

    if (prisma) {
      subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true }
      });
      payment = await prisma.subscriptionPayment.findFirst({
        where: { subscriptionId }
      });
    } else {
      subscription = memoryDb.subscriptions.find(s => s.id === subscriptionId);
      payment = memoryDb.subscriptionPayments.find(p => p.subscriptionId === subscriptionId);
      if (subscription) {
        subscription.plan = memoryDb.subscriptionPlans.find(p => p.id === subscription.planId);
      }
    }

    if (!subscription || !payment) {
      return res.status(404).json({ success: false, message: 'Subscription or associated payment transaction not found.' });
    }

    let isLegit = false;

    // Verify signature if running in production/live mode
    if (Razorpay && signature && orderId && rzpPaymentId) {
      const text = orderId + '|' + rzpPaymentId;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      isLegit = generated_signature === signature;
    } else if (rzpPaymentId) {
      // If we got a payment ID from the frontend Razorpay standard checkout, count it as verified
      isLegit = true;
    } else if (simulateSuccess) {
      // In simulated test mode, verify using the test success flag
      isLegit = true;
    }

    if (isLegit) {
      // Update Payment and Subscription details to SUCCESS and ACTIVE
      const transactionId = rzpPaymentId || `tx-sim-${Date.now()}`;
      
      if (prisma) {
        await prisma.subscriptionPayment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            paid_at: new Date(),
            gateway_payment_id: rzpPaymentId || null,
            transaction_id: transactionId
          }
        });

        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'ACTIVE',
            payment_status: 'SUCCESS'
          }
        });
      } else {
        payment.status = 'SUCCESS';
        payment.paid_at = new Date();
        payment.gateway_payment_id = rzpPaymentId || null;
        payment.transaction_id = transactionId;

        subscription.status = 'ACTIVE';
        subscription.payment_status = 'SUCCESS';
      }

      // Generate the daily meal calendar/schedule (30 days)
      await generateMealCalendar(subscription);

      return res.json({
        success: true,
        message: 'Payment verified and Subscription activated successfully!',
        subscription: {
          ...subscription,
          status: 'ACTIVE',
          payment_status: 'SUCCESS'
        }
      });
    } else {
      // Mark payment as FAILED
      if (prisma) {
        await prisma.subscriptionPayment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failure_reason: 'Signature mismatch / Invalid request verification'
          }
        });
      } else {
        payment.status = 'FAILED';
        payment.failure_reason = 'Signature mismatch / Invalid request verification';
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed.'
      });
    }
  } catch (err) {
    next(err);
  }
};

const handlePaymentWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body.event;
    const eventId = req.body.id;

    // Idempotency: Check if already processed
    if (processedWebhookEvents.has(eventId)) {
      return res.json({ success: true, message: 'Duplicate event ignored.' });
    }
    processedWebhookEvents.add(eventId);

    console.log(`⚓ Webhook received: ${event} (Event ID: ${eventId})`);

    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;

      if (orderId) {
        let paymentRecord = null;
        if (prisma) {
          paymentRecord = await prisma.subscriptionPayment.findFirst({
            where: { gateway_order_id: orderId }
          });
        } else {
          paymentRecord = memoryDb.subscriptionPayments.find(p => p.gateway_order_id === orderId);
        }

        if (paymentRecord && paymentRecord.status !== 'SUCCESS') {
          const subscriptionId = paymentRecord.subscriptionId;

          if (prisma) {
            await prisma.subscriptionPayment.update({
              where: { id: paymentRecord.id },
              data: {
                status: 'SUCCESS',
                paid_at: new Date(),
                gateway_payment_id: rzpPaymentId,
                transaction_id: rzpPaymentId
              }
            });

            const subscription = await prisma.subscription.update({
              where: { id: subscriptionId },
              data: {
                status: 'ACTIVE',
                payment_status: 'SUCCESS'
              },
              include: { plan: true }
            });

            await generateMealCalendar(subscription);
          } else {
            paymentRecord.status = 'SUCCESS';
            paymentRecord.paid_at = new Date();
            paymentRecord.gateway_payment_id = rzpPaymentId;
            paymentRecord.transaction_id = rzpPaymentId;

            const subscription = memoryDb.subscriptions.find(s => s.id === subscriptionId);
            if (subscription) {
              subscription.status = 'ACTIVE';
              subscription.payment_status = 'SUCCESS';
              subscription.plan = memoryDb.subscriptionPlans.find(pl => pl.id === subscription.planId);
              await generateMealCalendar(subscription);
            }
          }
          console.log(`✅ Webhook verified and activated Subscription ID: ${subscriptionId}`);
        }
      }
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (prisma) {
      const history = await prisma.subscriptionPayment.findMany({
        where: { userId },
        include: {
          subscription: {
            include: { plan: true }
          }
        },
        orderBy: { created_at: 'desc' }
      });
      return res.json({ success: true, history });
    }

    const history = memoryDb.subscriptionPayments
      .filter(p => p.userId === userId)
      .map(p => {
        const subscription = memoryDb.subscriptions.find(s => s.id === p.subscriptionId) || {};
        const plan = memoryDb.subscriptionPlans.find(pl => pl.id === subscription.planId) || {};
        return {
          ...p,
          subscription: {
            ...subscription,
            plan
          }
        };
      });

    return res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
};

const getAllPaymentsAdmin = async (req, res, next) => {
  try {
    if (prisma) {
      const payments = await prisma.subscriptionPayment.findMany({
        include: {
          user: {
            select: { name: true, email: true, phone: true }
          },
          subscription: {
            include: { plan: true }
          }
        },
        orderBy: { created_at: 'desc' }
      });
      return res.json({ success: true, payments });
    }

    const payments = memoryDb.subscriptionPayments.map(p => {
      const user = memoryDb.users.find(u => u.id === p.userId) || {};
      const subscription = memoryDb.subscriptions.find(s => s.id === p.subscriptionId) || {};
      const plan = memoryDb.subscriptionPlans.find(pl => pl.id === subscription.planId) || {};
      return {
        ...p,
        user: { name: user.name, email: user.email, phone: user.phone },
        subscription: { ...subscription, plan }
      };
    });

    return res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handlePaymentWebhook,
  getPaymentHistory,
  getAllPaymentsAdmin
};
