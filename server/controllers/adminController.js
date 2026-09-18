const { prisma, memoryDb } = require('../services/dbService');
const bcrypt = require('bcryptjs');

const getDashboardStats = async (req, res, next) => {
  try {
    if (prisma) {
      const totalUsers = await prisma.user.count();
      const totalOrders = await prisma.order.count();
      const orders = await prisma.order.findMany();
      const todaySales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return res.json({
        success: true,
        todaySales,
        totalOrders,
        activeSubscriptions: 12,
        activeUsers: totalUsers,
        stats: {
          todaySales,
          totalOrders,
          activeSubscriptions: 12,
          activeUsers: totalUsers
        }
      });
    }

    const todaySales = memoryDb.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return res.json({
      success: true,
      todaySales,
      totalOrders: memoryDb.orders.length,
      activeSubscriptions: memoryDb.subscriptions.length,
      activeUsers: memoryDb.users.length,
      stats: {
        todaySales,
        totalOrders: memoryDb.orders.length,
        activeSubscriptions: memoryDb.subscriptions.length,
        activeUsers: memoryDb.users.length
      }
    });
  } catch (err) {
    next(err);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    if (prisma) {
      const customers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          dailyProteinGoal: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, count: customers.length, customers });
    }

    return res.json({ success: true, count: memoryDb.users.length, customers: memoryDb.users });
  } catch (err) {
    next(err);
  }
};

// ADMIN CREATE USER
const createCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, dailyProteinGoal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, Email, and Password are required.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    if (prisma) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists.' });
      }

      const newUser = await prisma.user.create({
        data: {
          id: `usr-${Date.now()}`,
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role: role || 'CUSTOMER',
          dailyProteinGoal: Number(dailyProteinGoal || 120)
        }
      });

      console.log(`👤 User "${newUser.email}" physically created in SQLite dev.db file!`);

      // Sync with memoryDb
      memoryDb.users.unshift(newUser);

      return res.status(201).json({
        success: true,
        message: `User ${newUser.name} created successfully!`,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          dailyProteinGoal: newUser.dailyProteinGoal
        }
      });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'CUSTOMER',
      dailyProteinGoal: Number(dailyProteinGoal || 120),
      createdAt: new Date()
    };

    memoryDb.users.unshift(newUser);

    return res.status(201).json({
      success: true,
      message: `User ${newUser.name} created successfully!`,
      user: newUser
    });
  } catch (err) {
    next(err);
  }
};

// ADMIN UPDATE USER
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, dailyProteinGoal, password } = req.body;

    if (prisma) {
      const dataToUpdate = {
        name: name || undefined,
        email: email || undefined,
        phone: phone !== undefined ? phone : undefined,
        role: role || undefined,
        dailyProteinGoal: dailyProteinGoal !== undefined ? Number(dailyProteinGoal) : undefined
      };

      if (password) {
        dataToUpdate.password = bcrypt.hashSync(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          dailyProteinGoal: true
        }
      });

      console.log(`👤 User "${updatedUser.email}" updated in SQLite dev.db!`);

      const memoryIndex = memoryDb.users.findIndex(u => u.id === id);
      if (memoryIndex !== -1) memoryDb.users[memoryIndex] = { ...memoryDb.users[memoryIndex], ...updatedUser };

      return res.json({
        success: true,
        message: 'User details updated in SQLite Database!',
        user: updatedUser
      });
    }

    const usr = memoryDb.users.find(u => u.id === id);
    if (!usr) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) usr.name = name;
    if (email) usr.email = email;
    if (phone) usr.phone = phone;
    if (role) usr.role = role;
    if (dailyProteinGoal) usr.dailyProteinGoal = Number(dailyProteinGoal);
    if (password) usr.password = bcrypt.hashSync(password, 10);

    return res.json({
      success: true,
      message: 'User details updated successfully!',
      user: usr
    });
  } catch (err) {
    next(err);
  }
};

const updateCustomerRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'CUSTOMER'].includes(role.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Valid role (ADMIN or CUSTOMER) is required.' });
    }

    if (prisma) {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: role.toUpperCase() },
        select: { id: true, name: true, email: true, role: true }
      });

      const idx = memoryDb.users.findIndex(u => u.id === id);
      if (idx !== -1) memoryDb.users[idx].role = role.toUpperCase();

      return res.json({
        success: true,
        message: `User ${updatedUser.name} role changed to ${updatedUser.role}`,
        user: updatedUser
      });
    }

    const user = memoryDb.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.role = role.toUpperCase();

    return res.json({
      success: true,
      message: `User ${user.name} role changed to ${user.role}`,
      user
    });
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const deleted = await prisma.user.delete({
        where: { id }
      });

      console.log(`👤 User "${deleted.email}" deleted from SQLite dev.db!`);

      const idx = memoryDb.users.findIndex(u => u.id === id);
      if (idx !== -1) memoryDb.users.splice(idx, 1);

      return res.json({
        success: true,
        message: `User ${deleted.name} deleted from SQLite Database!`,
        user: deleted
      });
    }

    const idx = memoryDb.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const removed = memoryDb.users.splice(idx, 1);
      return res.json({
        success: true,
        message: `User ${removed[0].name} deleted successfully!`,
        user: removed[0]
      });
    }

    return res.status(404).json({ success: false, message: 'User not found.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  updateCustomerRole,
  deleteCustomer
};
