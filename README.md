# 🦁 Animal Park Rwanda - Smart Reservation System

A comprehensive digital solution for managing national park reservations, ticket validation, and visitor analytics in Rwanda. This project was developed as a final exam capstone project.

## 📋 Overview

**Animal Park Rwanda** is a modern full-stack application designed to solve the challenges of manual booking and capacity management in national parks.

### Key Features
- **🌍 For Tourists:** Online booking, secure payments, downloadable tickets.
- **👮 For Rangers:** Real-time dashboard, booking reference validation, capacity tracking.
- **📊 For Admins:** Advanced analytics, staff management, park capacity control.

---

## 🚀 Quick Links

- **[Quick Start Guide](./QUICKSTART.md)** - Get the app running in 5 minutes
- **[Deployment Guide](./DEPLOYMENT.md)** - Docker & production setup
- **[API Documentation](./BACKEND_API.md)** - Backend endpoints reference
- **[Testing Guide](./TESTING_GUIDE.md)** - How to run tests
- **[Project Documentation](./PROJECT_COMPLETE.md)** - Full exam report & architecture

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React, TypeScript, Redux Toolkit, Chart.js, Vite |
| **Backend** | Node.js, Express, TypeScript, Zod |
| **Database** | PostgreSQL, Prisma ORM |
| **DevOps** | Docker, Docker Compose |
| **Styling** | CSS3 (Custom Design System) |

---

## 🏃‍♂️ How to Run Locally

### Prerequisites
- Node.js (v16+)
- PostgreSQL (or Docker)

### Option 1: Using One-Click Script (Windows)
Double-click `start.bat` to install dependencies and start both servers.

### Option 2: Manual Setup

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Access the application at `http://localhost:5173`

---

## 👨‍💻 Project Structure

```
animalpark/
├── backend/            # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/# Request handlers
│   │   ├── routes/     # API Endpoints
│   │   └── services/   # Business Logic
├── frontend/           # React + TypeScript UI
│   ├── src/
│   │   ├── pages/      # Application Pages
│   │   ├── components/ # Reusable UI
│   │   └── store/      # State Management
└── docker-compose.yml  # Container orchestration
```

---

## 🎯 Exam Requirements Met

1. **Real-Life Problem:** Digitizing manual park processes
2. **Design Approach:** MVC Architecture
3. **Language:** TypeScript (Full Stack)
4. **Clean Code:** Google Standards, proper layering
5. **Version Control:** Git/GitHub
6. **Design Pattern:** MVC, Repository, Service
7. **Testing:** Comprehensive test suite
8. **Docker:** Full containerization support

---

## 📝 License
Academic Project - Final Exam Submission
