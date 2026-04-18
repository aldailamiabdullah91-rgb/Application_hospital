const express = require('express');
const { body, query } = require('express-validator');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { generateFileNumber, paginate, formatPaginationResponse } = require('../utils/helpers');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorize('admin', 'doctor', 'nurse', 'receptionist'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const { skip, take } = paginate(page, limit);

      const where = search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { fileNumber: { contains: search } },
              { phone: { contains: search } },
              { nationalId: { contains: search } },
            ],
          }
        : {};

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, email: true, name: true, role: true } } },
        }),
        prisma.patient.count({ where }),
      ]);

      res.json({
        success: true,
        ...formatPaginationResponse(patients, total, page, limit),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  authenticate,
  authorize('admin', 'doctor', 'nurse', 'receptionist'),
  async (req, res, next) => {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: req.params.id },
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
          appointments: {
            orderBy: { date: 'desc' },
            take: 5,
            include: { doctor: { select: { id: true, name: true, specialty: true } } },
          },
          medicalRecords: { orderBy: { visitDate: 'desc' }, take: 10 },
          vitalSigns: { orderBy: { recordedAt: 'desc' }, take: 5 },
          documents: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });

      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      res.json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'receptionist', 'doctor'),
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('nationalId').optional().isString(),
    body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('allergies').optional().isString(),
    body('chronicDiseases').optional().isString(),
    body('address').optional().isString(),
    body('emergencyContact').optional().isString(),
    body('emergencyPhone').optional().isString(),
    body('notes').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        firstName, lastName, dateOfBirth, gender, phone, email,
        nationalId, bloodType, allergies, chronicDiseases,
        address, emergencyContact, emergencyPhone, notes,
      } = req.body;

      if (nationalId) {
        const existing = await prisma.patient.findUnique({ where: { nationalId } });
        if (existing) {
          return res.status(409).json({ success: false, message: 'Patient with this national ID already exists' });
        }
      }

      const patient = await prisma.patient.create({
        data: {
          fileNumber: generateFileNumber(),
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          phone,
          email,
          nationalId,
          bloodType,
          allergies,
          chronicDiseases,
          address,
          emergencyContact,
          emergencyPhone,
          notes,
          createdById: req.user.id,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: patient,
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
      const existing = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const {
        firstName, lastName, dateOfBirth, gender, phone, email,
        nationalId, bloodType, allergies, chronicDiseases,
        address, emergencyContact, emergencyPhone, notes,
      } = req.body;

      const patient = await prisma.patient.update({
        where: { id: req.params.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(gender && { gender }),
          ...(phone && { phone }),
          ...(email !== undefined && { email }),
          ...(nationalId !== undefined && { nationalId }),
          ...(bloodType !== undefined && { bloodType }),
          ...(allergies !== undefined && { allergies }),
          ...(chronicDiseases !== undefined && { chronicDiseases }),
          ...(address !== undefined && { address }),
          ...(emergencyContact !== undefined && { emergencyContact }),
          ...(emergencyPhone !== undefined && { emergencyPhone }),
          ...(notes !== undefined && { notes }),
        },
      });

      res.json({ success: true, message: 'Patient updated successfully', data: patient });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const existing = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      await prisma.patient.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/vital-signs',
  authenticate,
  authorize('nurse', 'doctor'),
  [
    body('temperature').optional().isFloat(),
    body('bloodPressureSys').optional().isInt(),
    body('bloodPressureDia').optional().isInt(),
    body('heartRate').optional().isInt(),
    body('respiratoryRate').optional().isInt(),
    body('oxygenSaturation').optional().isFloat(),
    body('weight').optional().isFloat(),
    body('height').optional().isFloat(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const vitalSign = await prisma.vitalSign.create({
        data: {
          patientId: req.params.id,
          ...req.body,
          recordedBy: req.user.name,
        },
      });

      res.status(201).json({ success: true, message: 'Vital signs recorded', data: vitalSign });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/medical-records',
  authenticate,
  authorize('doctor'),
  [
    body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
    body('symptoms').optional().isString(),
    body('treatment').optional().isString(),
    body('medications').optional().isString(),
    body('notes').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const record = await prisma.medicalRecord.create({
        data: {
          patientId: req.params.id,
          ...req.body,
          doctorName: req.user.name,
        },
      });

      res.status(201).json({ success: true, message: 'Medical record created', data: record });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
