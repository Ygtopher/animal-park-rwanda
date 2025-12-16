# Animal Park Rwanda - Quick Start Guide

## 🚀 Getting Started

This guide will help you set up and run the Animal Park Reservation & Management System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Docker** and Docker Compose (recommended)
- **Git**
- **PostgreSQL** 15+ (if running without Docker)

## Option 1: Quick Start with Docker (Recommended)

This is the fastest way to get the entire system running.

### Step 1: Clone and Navigate
```bash
cd C:\Users\CHRISTOPHE\OneDrive\Desktop\animalpark
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the backend directory:
```bash
cd backend
copy .env.example .env
```

Edit the `.env` file if needed (the defaults work for Docker setup).

### Step 3: Start Everything with Docker Compose

From the project root:
```bash
docker-compose up --build
```

This will:
- Start PostgreSQL database on port 5432
- Build and start the backend API on port 5000
- Build and start the frontend on port 3000

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Step 5: Seed the Database

In a new terminal, run:
```bash
docker-compose exec backend npx prisma db seed
```

This creates sample data including:
- Rwanda's parks (Akagera, Volcanoes, Nyungwe, Gishwati-Mukura)
- Animals for each park
- Test user accounts
- Pricing rules

## Option 2: Manual Setup (Without Docker)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
copy .env.example .env
```

Edit `.env` and update `DATABASE_URL` to point to your PostgreSQL instance:
```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/animal_park
```

4. **Generate Prisma Client**
```bash
npx prisma generate
```

5. **Run database migrations**
```bash
npx prisma migrate dev
```

6. **Seed the database**
```bash
npx prisma db seed
```

7. **Start the backend server**
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## 🔑 Test Accounts

After seeding, you can login with these accounts:

### Tourist Account
- **Email**: tourist@example.com
- **Password**: password123

### Park Ranger Account
- **Email**: ranger@example.com
- **Password**: password123

### Administrator Account
- **Email**: admin@example.com
- **Password**: password123

## 📋 Available Scripts

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev  # Create and apply migrations
npx prisma db seed   # Seed database with sample data
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Docker
```bash
docker-compose up           # Start all services
docker-compose up --build   # Rebuild and start
docker-compose down         # Stop all services
docker-compose logs -f      # View logs
```

## 🗄️ Database Management

### View Database with Prisma Studio
```bash
cd backend
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can view and edit database records.

### Reset Database
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

## 🧪 Testing the API

### Using curl

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\",\"phone\":\"+250788123456\"}"
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tourist@example.com\",\"password\":\"password123\"}"
```

## 🎨 Frontend Features

The frontend includes:
- ✅ Modern, premium UI design
- ✅ Dark mode support (toggle in settings)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animations and transitions
- ✅ Toast notifications
- ✅ Form validation
- ✅ Loading states

## 🔧 Troubleshooting

### Port Already in Use

If ports 3000, 5000, or 5432 are already in use:

**Option 1**: Stop the conflicting service

**Option 2**: Change ports in configuration files:
- Backend: Edit `PORT` in `backend/.env`
- Frontend: Edit `server.port` in `frontend/vite.config.ts`
- Database: Edit port mapping in `docker-compose.yml`

### Database Connection Error

1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `backend/.env`
3. Verify database credentials

### Prisma Client Not Generated

Run:
```bash
cd backend
npx prisma generate
```

### Module Not Found Errors

Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📦 Project Structure

```
animalpark/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # API controllers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities
│   │   └── app.ts          # Express app
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   └── main.tsx
│   └── package.json
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## 🌐 Next Steps

1. **Explore the API**: Check `docs/API.md` for complete API documentation
2. **Customize**: Modify parks, pricing, and features to your needs
3. **Deploy**: See `docs/DEPLOYMENT.md` for production deployment guide
4. **Extend**: Add new features like reviews, analytics, or mobile app

## 💡 Tips

- Use Prisma Studio for easy database management
- Check browser console for frontend errors
- Check terminal logs for backend errors
- Use the test accounts to explore different user roles
- Enable dark mode in the UI for a premium experience

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review error messages in terminal/console
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly

---

**Happy Coding! 🦁🌿**
