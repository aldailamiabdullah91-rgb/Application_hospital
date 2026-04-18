const express = require('express');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {};

    if (['admin', 'receptionist'].includes(req.user.role)) {
      const [totalPatients, totalDoctors, todayAppointments, totalAppointments] = await Promise.all([
        prisma.patient.count(),
        prisma.user.count({ where: { role: 'doctor', isActive: true } }),
        prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
        prisma.appointment.count(),
      ]);

      stats.totalPatients = totalPatients;
      stats.totalDoctors = totalDoctors;
      stats.todayAppointments = todayAppointments;
      stats.totalAppointments = totalAppointments;
    }

    if (req.user.role === 'doctor') {
      const [todayAppointments, totalPatients, pendingAppointments] = await Promise.all([
        prisma.appointment.count({
          where: { doctorId: req.user.id, date: { gte: today, lt: tomorrow } },
        }),
        prisma.appointment.findMany({
          where: { doctorId: req.user.id },
          select: { patientId: true },
          distinct: ['patientId'],
        }),
        prisma.appointment.count({
          where: { doctorId: req.user.id, status: 'scheduled' },
        }),
      ]);

      stats.todayAppointments = todayAppointments;
      stats.totalPatients = totalPatients.length;
      stats.pendingAppointments = pendingAppointments;
    }

    if (req.user.role === 'nurse') {
      const [todayAppointments, totalPatients] = await Promise.all([
        prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
        prisma.patient.count(),
      ]);

      stats.todayAppointments = todayAppointments;
      stats.totalPatients = totalPatients;
    }

    const recentAppointments = await prisma.appointment.findMany({
      where: req.user.role === 'doctor' ? { doctorId: req.user.id } : {},
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        patient: { select: { firstName: true, lastName: true, fileNumber: true } },
        doctor: { select: { name: true, specialty: true } },
      },
    });

    res.json({ success: true, data: { stats, recentAppointments } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
