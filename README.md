# Medix Pro - Hospital Management System

A comprehensive hospital management mobile application built with React Native (Expo) and Node.js.

## Architecture

```
Application_hospital/
├── backend/              # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/    # Auth & validation middleware
│   │   ├── controllers/  # Business logic
│   │   └── utils/        # Helpers & Prisma client
│   └── prisma/           # Database schema & migrations
├── mobile/               # React Native (Expo) app
│   ├── src/
│   │   ├── screens/      # App screens (auth, dashboard, patients, appointments, etc.)
│   │   ├── components/   # Reusable UI components
│   │   ├── navigation/   # React Navigation setup
│   │   ├── services/     # API service layer (Axios)
│   │   ├── context/      # React Context (Auth, Theme)
│   │   └── theme/        # Light & Dark theme colors
│   └── App.js            # Entry point
└── README.md
```

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Mobile App | React Native (Expo)                 |
| Backend    | Node.js + Express                   |
| Database   | SQLite (dev) / PostgreSQL (prod)    |
| ORM        | Prisma                              |
| Auth       | JWT + bcrypt                        |
| State      | React Context API                   |
| Navigation | React Navigation 6                  |
| UI Icons   | @expo/vector-icons (Ionicons)       |

## Phase 1 Features (Current)

### Authentication
- Email/password login & registration
- JWT-based authentication
- Role-based access control (Admin, Doctor, Nurse, Receptionist, Patient)
- Secure password hashing (bcrypt)

### Patient Management
- Create, view, update, and delete patient records
- Patient search by name, file number, phone, or national ID
- Medical record number (MRN) auto-generation
- Record vital signs (temperature, BP, heart rate, SpO2, etc.)
- Add medical records with diagnosis, treatment, medications
- Document uploads support
- Emergency contact information

### Appointments
- Book, modify, and cancel appointments
- Doctor schedule view
- Time slot conflict detection
- Status workflow: Scheduled → Confirmed → In Progress → Completed
- Appointment type support (Consultation, Follow-up, Emergency)
- Automatic notifications on booking

### Dashboard
- Role-specific statistics and overview
- Recent appointments display
- Quick action shortcuts
- Pull-to-refresh

### Additional Features
- Dark/Light mode toggle
- Push notification system
- Responsive modern UI design
- Pagination support

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # Configure environment variables
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run database migrations
node prisma/seed.js     # Seed demo data
npm run dev             # Start development server (port 3000)
```

### Mobile App Setup

```bash
cd mobile
npm install
npx expo start          # Start Expo development server
```

Then scan the QR code with Expo Go app or press `a` for Android / `i` for iOS.

### API Base URL Configuration

Edit `mobile/src/services/api.js` and update the `API_URL`:
- Android Emulator: `http://10.0.2.2:3000/api`
- iOS Simulator: `http://localhost:3000/api`
- Physical Device: Use your machine's IP address (e.g., `http://192.168.1.100:3000/api`)

## Demo Accounts

All accounts use password: `password123`

| Role         | Email                        |
|--------------|------------------------------|
| Admin        | admin@medixpro.com           |
| Doctor       | dr.ahmed@medixpro.com        |
| Doctor       | dr.sara@medixpro.com         |
| Doctor       | dr.omar@medixpro.com         |
| Nurse        | nurse.fatima@medixpro.com    |
| Receptionist | reception@medixpro.com       |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password

### Patients
- `GET /api/patients` - List patients (paginated, searchable)
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (admin only)
- `POST /api/patients/:id/vital-signs` - Record vital signs
- `POST /api/patients/:id/medical-records` - Add medical record

### Appointments
- `GET /api/appointments` - List appointments (filtered by role)
- `GET /api/appointments/:id` - Get appointment details
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/cancel` - Cancel appointment
- `GET /api/appointments/doctor/:id/schedule` - Get doctor's schedule

### Users
- `GET /api/users` - List users (admin only)
- `GET /api/users/doctors` - List available doctors
- `PUT /api/users/:id/toggle-active` - Activate/deactivate user

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Dashboard
- `GET /api/dashboard/stats` - Get role-specific statistics

## Roadmap

### Phase 2 (Planned)
- Electronic Health Records (EHR) - full module
- Laboratory System (lab orders, results)
- Pharmacy Management (drug database, prescriptions, inventory)

### Phase 3 (Future)
- Reports & Analytics
- AI-assisted diagnosis
- Telemedicine (video consultations)
- Wearable device integration

## User Roles & Permissions

| Feature           | Admin | Doctor | Nurse | Receptionist | Patient |
|-------------------|-------|--------|-------|--------------|---------|
| View Dashboard    | Full  | Own    | Basic | Full         | Own     |
| Manage Users      | Yes   | No     | No    | No           | No      |
| View Patients     | Yes   | Yes    | Yes   | Yes          | Own     |
| Create Patients   | Yes   | Yes    | No    | Yes          | No      |
| Delete Patients   | Yes   | No     | No    | No           | No      |
| Book Appointments | Yes   | Yes    | No    | Yes          | Yes     |
| Medical Records   | No    | Yes    | No    | No           | View    |
| Vital Signs       | No    | Yes    | Yes   | No           | View    |
| Notifications     | Yes   | Yes    | Yes   | Yes          | Yes     |

## Security

- JWT token authentication with configurable expiration
- Password hashing with bcrypt (12 rounds)
- Role-based access control middleware
- Input validation with express-validator
- CORS protection
- Helmet.js security headers
- HTTPS-ready (configure in production)
