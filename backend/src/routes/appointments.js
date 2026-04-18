const express = require('express');
const { body } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, doctorId, patientId, date } = req.query;
    const { skip, take } = paginate(page, limit);

    const where = {};

    if (req.user.role === 'doctor') {
      where.doctorId = req.user.id;
    } else if (req.user.role === 'patient') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      if (patient) where.patientId = patient.id;
    }

    if (status) where.status = status;
    if (doctorId && req.user.role !== 'doctor') where.doctorId = doctorId;
    if (patientId && req.user.role !== 'patient') where.patientId = patientId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take,
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, fileNumber: true, phone: true } },
          doctor: { select: { id: true, name: true, specialty: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      ...formatPaginationResponse(appointments, total, page, limit),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true, specialty: true, email: true, phone: true } },
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  authenticate,
  authorize('admin', 'receptionist', 'doctor', 'patient'),
  [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Start time must be HH:MM format'),
    body('endTime').matches(/^\d{2}:\d{2}$/).withMessage('End time must be HH:MM format'),
    body('type').optional().isIn(['consultation', 'follow_up', 'emergency']),
    body('reason').optional().isString(),
    body('notes').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { patientId, doctorId, date, startTime, endTime, type, reason, notes } = req.body;

      const doctor = await prisma.user.findFirst({
        where: { id: doctorId, role: 'doctor' },
      });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      const patient = await prisma.patient.findUnique({ where: { id: patientId } });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const appointmentDate = new Date(date);
      const startOfDay = new Date(appointmentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointmentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const conflicting = await prisma.appointment.findFirst({
        where: {
          doctorId,
          date: { gte: startOfDay, lte: endOfDay },
          status: { notIn: ['cancelled', 'no_show'] },
          OR: [
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
            { startTime: { gte: startTime }, endTime: { lte: endTime } },
          ],
        },
      });

      if (conflicting) {
        return res.status(409).json({ success: false, message: 'Time slot conflicts with an existing appointment' });
      }

      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          date: appointmentDate,
          startTime,
          endTime,
          type: type || 'consultation',
          reason,
          notes,
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, fileNumber: true } },
          doctor: { select: { id: true, name: true, specialty: true } },
        },
      });

      await prisma.notification.create({
        data: {
          userId: doctorId,
          title: 'New Appointment',
          message: `New appointment with ${patient.firstName} ${patient.lastName} on ${date} at ${startTime}`,
          type: 'appointment',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'receptionist', 'doctor'),
  async (req, res, next) => {
    try {
      const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const { date, startTime, endTime, status, type, reason, notes } = req.body;

      const appointment = await prisma.appointment.update({
        where: { id: req.params.id },
        data: {
          ...(date && { date: new Date(date) }),
          ...(startTime && { startTime }),
          ...(endTime && { endTime }),
          ...(status && { status }),
          ...(type && { type }),
          ...(reason !== undefined && { reason }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, fileNumber: true } },
          doctor: { select: { id: true, name: true, specialty: true } },
        },
      });

      res.json({ success: true, message: 'Appointment updated successfully', data: appointment });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/cancel',
  authenticate,
  async (req, res, next) => {
    try {
      const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (existing.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
      }

      const appointment = await prisma.appointment.update({
        where: { id: req.params.id },
        data: { status: 'cancelled' },
      });

      res.json({ success: true, message: 'Appointment cancelled successfully', data: appointment });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/doctor/:doctorId/schedule', authenticate, async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: req.params.doctorId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['cancelled', 'no_show'] },
      },
      orderBy: { startTime: 'asc' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, fileNumber: true, phone: true } },
      },
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
