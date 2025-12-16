# Docker Troubleshooting Guide

## Error: "The system cannot find the file specified"

This error means **Docker Desktop is not running**.

## ✅ Solution

### Step 1: Start Docker Desktop

1. **Find Docker Desktop** in your Start Menu
2. **Click to open** Docker Desktop
3. **Wait** for Docker to fully start (you'll see the whale icon in system tray)
4. **Verify** Docker is running:
   ```bash
   docker --version
   docker ps
   ```

### Step 2: Once Docker is Running

```bash
# Go to project directory
cd C:\Users\CHRISTOPHE\OneDrive\Desktop\animalpark

# Start the system
docker-compose up --build
```

---

## 🔄 Alternative: Run Without Docker

If you prefer to run without Docker, follow these steps:

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Start PostgreSQL (you need PostgreSQL installed)
# Update DATABASE_URL in .env to point to your local PostgreSQL

# 5. Run migrations
npx prisma migrate dev

# 6. Seed database
npx prisma db seed

# 7. Start backend
npm run dev
```

Backend will run on: http://localhost:5000

### Frontend Setup (New Terminal)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start frontend
npm run dev
```

Frontend will run on: http://localhost:3000

---

## 📋 Prerequisites for Manual Setup

### Required Software:
1. **Node.js 18+** - Download from nodejs.org
2. **PostgreSQL 15+** - Download from postgresql.org
3. **npm** - Comes with Node.js

### Database Setup:
```sql
-- Create database
CREATE DATABASE animal_park;

-- Update .env with your connection string
DATABASE_URL="postgresql://username:password@localhost:5432/animal_park"
```

---

## 🐳 Docker Desktop Installation

If you don't have Docker Desktop:

1. **Download**: https://www.docker.com/products/docker-desktop
2. **Install** Docker Desktop for Windows
3. **Restart** your computer
4. **Start** Docker Desktop
5. **Verify**: `docker --version`

---

## ✅ Quick Check

Before running docker-compose, verify:

```bash
# Check Docker is running
docker --version
# Should show: Docker version 24.x.x

# Check Docker daemon
docker ps
# Should show: CONTAINER ID   IMAGE   ...

# If these work, Docker is ready!
```

---

## 🚀 Recommended Approach

**Option 1: Docker (Easiest)** ⭐
- Start Docker Desktop
- Run `docker-compose up --build`
- Everything works automatically

**Option 2: Manual (More Control)**
- Install Node.js and PostgreSQL
- Run backend and frontend separately
- More setup but more control

---

## 💡 Common Issues

### Issue 1: Docker Desktop won't start
**Solution**: 
- Restart your computer
- Check Windows updates
- Reinstall Docker Desktop

### Issue 2: Port already in use
**Solution**:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

### Issue 3: Database connection failed
**Solution**:
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check username/password

---

## 📞 Need Help?

1. **Check Docker is running**: Look for whale icon in system tray
2. **Restart Docker Desktop**: Sometimes it needs a restart
3. **Check logs**: `docker-compose logs`
4. **Try manual setup**: If Docker issues persist

---

**Once Docker is running, the system will start perfectly!** 🚀
