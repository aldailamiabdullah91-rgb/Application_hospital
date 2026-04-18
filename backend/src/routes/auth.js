const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const prisma = require('../utils/prisma');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('role')
      .optional()
      .isIn(['admin', 'doctor', 'nurse', 'receptionist', 'patient'])
      .withMessage('Invalid role'),
    body('specialty').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password, name, phone, role, specialty } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
      });

      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email or phone already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name, phone, role: role || 'patient', specialty },
        select: { id: true, email: true, name: true, role: true, phone: true, specialty: true, createdAt: true },
      });

      if (user.role === 'patient') {
        const { generateFileNumber } = require('../utils/helpers');
        await prisma.patient.create({
          data: {
            fileNumber: generateFileNumber(),
            userId: user.id,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || '',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'not_specified',
            phone: phone || '',
            email,
          },
        });
      }

      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true, email: true, name: true, role: true, phone: true,
          specialty: true, avatar: true, password: true, isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user.id);

      const { password: _, ...userData } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: { user: userData, token },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, name: true, role: true, phone: true,
        specialty: true, avatar: true, createdAt: true,
      },
    });
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
});

router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({ where: { id: req.user.id } });

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword },
      });

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
