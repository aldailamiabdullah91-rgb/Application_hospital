const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@medixpro.com' },
    update: {},
    create: {
      email: 'admin@medixpro.com',
      password,
      name: 'System Admin',
      role: 'admin',
      phone: '+966500000001',
    },
  });

  const doctor1 = await prisma.user.upsert({
    where: { email: 'dr.ahmed@medixpro.com' },
    update: {},
    create: {
      email: 'dr.ahmed@medixpro.com',
      password,
      name: 'Dr. Ahmed Al-Farsi',
      role: 'doctor',
      specialty: 'Internal Medicine',
      phone: '+966500000002',
    },
  });

  const doctor2 = await prisma.user.upsert({
    where: { email: 'dr.sara@medixpro.com' },
    update: {},
    create: {
      email: 'dr.sara@medixpro.com',
      password,
      name: 'Dr. Sara Hassan',
      role: 'doctor',
      specialty: 'Pediatrics',
      phone: '+966500000003',
    },
  });

  const doctor3 = await prisma.user.upsert({
    where: { email: 'dr.omar@medixpro.com' },
    update: {},
    create: {
      email: 'dr.omar@medixpro.com',
      password,
      name: 'Dr. Omar Khalil',
      role: 'doctor',
      specialty: 'Cardiology',
      phone: '+966500000004',
    },
  });

  const nurse = await prisma.user.upsert({
    where: { email: 'nurse.fatima@medixpro.com' },
    update: {},
    create: {
      email: 'nurse.fatima@medixpro.com',
      password,
      name: 'Fatima Al-Rashid',
      role: 'nurse',
      phone: '+966500000005',
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'reception@medixpro.com' },
    update: {},
    create: {
      email: 'reception@medixpro.com',
      password,
      name: 'Layla Mohammed',
      role: 'receptionist',
      phone: '+966500000006',
    },
  });

  const patient1 = await prisma.patient.upsert({
    where: { fileNumber: 'MRN-001' },
    update: {},
    create: {
      fileNumber: 'MRN-001',
      firstName: 'Khalid',
      lastName: 'Al-Saud',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'male',
      phone: '+966501111111',
      email: 'khalid@email.com',
      nationalId: '1234567890',
      bloodType: 'A+',
      allergies: 'Penicillin',
      address: 'Riyadh, Saudi Arabia',
      emergencyContact: 'Mohammed Al-Saud',
      emergencyPhone: '+966502222222',
      createdById: receptionist.id,
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { fileNumber: 'MRN-002' },
    update: {},
    create: {
      fileNumber: 'MRN-002',
      firstName: 'Nora',
      lastName: 'Abdullah',
      dateOfBirth: new Date('1990-07-22'),
      gender: 'female',
      phone: '+966503333333',
      email: 'nora@email.com',
      nationalId: '0987654321',
      bloodType: 'O+',
      chronicDiseases: 'Diabetes Type 2',
      address: 'Jeddah, Saudi Arabia',
      emergencyContact: 'Ali Abdullah',
      emergencyPhone: '+966504444444',
      createdById: receptionist.id,
    },
  });

  const patient3 = await prisma.patient.upsert({
    where: { fileNumber: 'MRN-003' },
    update: {},
    create: {
      fileNumber: 'MRN-003',
      firstName: 'Youssef',
      lastName: 'Ibrahim',
      dateOfBirth: new Date('1978-11-05'),
      gender: 'male',
      phone: '+966505555555',
      nationalId: '1122334455',
      bloodType: 'B+',
      allergies: 'Aspirin, Sulfa drugs',
      chronicDiseases: 'Hypertension',
      address: 'Dammam, Saudi Arabia',
      createdById: admin.id,
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(0, 0, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient1.id,
        doctorId: doctor1.id,
        date: tomorrow,
        startTime: '09:00',
        endTime: '09:30',
        type: 'consultation',
        status: 'scheduled',
        reason: 'General checkup',
      },
      {
        patientId: patient2.id,
        doctorId: doctor2.id,
        date: tomorrow,
        startTime: '10:00',
        endTime: '10:30',
        type: 'follow_up',
        status: 'confirmed',
        reason: 'Diabetes follow-up',
      },
      {
        patientId: patient3.id,
        doctorId: doctor3.id,
        date: dayAfter,
        startTime: '11:00',
        endTime: '11:45',
        type: 'consultation',
        status: 'scheduled',
        reason: 'Cardiac evaluation',
      },
      {
        patientId: patient1.id,
        doctorId: doctor3.id,
        date: dayAfter,
        startTime: '14:00',
        endTime: '14:30',
        type: 'consultation',
        status: 'scheduled',
        reason: 'Blood pressure monitoring',
      },
    ],
  });

  await prisma.vitalSign.createMany({
    data: [
      {
        patientId: patient1.id,
        temperature: 36.8,
        bloodPressureSys: 120,
        bloodPressureDia: 80,
        heartRate: 72,
        respiratoryRate: 16,
        oxygenSaturation: 98.5,
        weight: 75,
        height: 175,
        recordedBy: nurse.name,
      },
      {
        patientId: patient2.id,
        temperature: 37.0,
        bloodPressureSys: 130,
        bloodPressureDia: 85,
        heartRate: 78,
        respiratoryRate: 18,
        oxygenSaturation: 97.0,
        weight: 62,
        height: 163,
        recordedBy: nurse.name,
      },
    ],
  });

  await prisma.medicalRecord.createMany({
    data: [
      {
        patientId: patient1.id,
        diagnosis: 'Mild upper respiratory infection',
        symptoms: 'Cough, mild fever, sore throat',
        treatment: 'Rest, fluids, over-the-counter medication',
        medications: 'Paracetamol 500mg, Vitamin C',
        doctorName: doctor1.name,
        visitDate: new Date(),
      },
      {
        patientId: patient2.id,
        diagnosis: 'Diabetes Type 2 - Controlled',
        symptoms: 'Routine follow-up, no acute symptoms',
        treatment: 'Continue current medication, dietary advice',
        medications: 'Metformin 500mg twice daily',
        doctorName: doctor2.name,
        visitDate: new Date(),
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('Test accounts (password: password123):');
  console.log('  Admin:        admin@medixpro.com');
  console.log('  Doctor 1:     dr.ahmed@medixpro.com');
  console.log('  Doctor 2:     dr.sara@medixpro.com');
  console.log('  Doctor 3:     dr.omar@medixpro.com');
  console.log('  Nurse:        nurse.fatima@medixpro.com');
  console.log('  Receptionist: reception@medixpro.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
