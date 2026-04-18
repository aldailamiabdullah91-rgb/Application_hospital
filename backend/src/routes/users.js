const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const { skip, take } = paginate(page, limit);

      const where = {};
      if (role) where.role = role;
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          select: {
            id: true, email: true, name: true, role: true,
            phone: true, specialty: true, isActive: true, createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({ success: true, ...formatPaginationResponse(users, total, page, limit) });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/doctors', authenticate, async (req, res, next) => {
  try {
    const { specialty } = req.query;
    const where = { role: 'doctor', isActive: true };
    if (specialty) where.specialty = specialty;

    const doctors = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, specialty: true, avatar: true },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:id/toggle-active',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: !user.isActive },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });

      res.json({ success: true, message: `User ${updated.isActive ? 'activated' : 'deactivated'}`, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
