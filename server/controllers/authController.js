const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma, memoryDb } = require('../services/dbService');

const JWT_SECRET = process.env.JWT_SECRET || 'protein_project_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, dailyProteinGoal } = req.body;

    // 1. Input Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format. Example: user@example.com' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check Existing User & Save to SQLite dev.db via Prisma ORM
    if (prisma) {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in instead.'
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const userId = `usr-${Date.now()}`;

      const newUser = await prisma.user.create({
        data: {
          id: userId,
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          phone: phone ? phone.trim() : null,
          role: 'CUSTOMER',
          dailyProteinGoal: Number(dailyProteinGoal || 120)
        }
      });

      console.log(`👤 New User "${newUser.email}" registered & saved to SQLite dev.db file!`);

      // Sync to memoryDb
      memoryDb.users.unshift(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const { password: _, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        token,
        user: userWithoutPassword
      });
    }

    // Fallback Mode Memory Check
    const existingMemoryUser = memoryDb.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existingMemoryUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'CUSTOMER',
      dailyProteinGoal: Number(dailyProteinGoal || 120),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memoryDb.users.unshift(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Registration failed due to a server error. Please try again.'
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = null;
    if (prisma) {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    }

    if (!user) {
      user = memoryDb.users.find(u => u.email.toLowerCase() === normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Login failed due to a server error. Please try again.'
    });
  }
};

const getMe = async (req, res, next) => {
  try {
    let user = null;
    if (prisma) {
      user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
    }

    if (!user) {
      user = memoryDb.users.find(u => u.id === req.user.id);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, dailyProteinGoal } = req.body;

    if (prisma) {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name: name || undefined,
          phone: phone !== undefined ? phone : undefined,
          dailyProteinGoal: dailyProteinGoal !== undefined ? Number(dailyProteinGoal) : undefined
        }
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        user: userWithoutPassword
      });
    }

    const user = memoryDb.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dailyProteinGoal !== undefined) user.dailyProteinGoal = Number(dailyProteinGoal);

    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: userWithoutPassword
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    let user = null;
    if (prisma) {
      user = await prisma.user.findUnique({ where: { id: req.user.id } });
    }
    if (!user) {
      user = memoryDb.users.find(u => u.id === req.user.id);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHashed = bcrypt.hashSync(newPassword, 10);

    if (prisma) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: newHashed }
      });
    }

    user.password = newHashed;

    return res.json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
