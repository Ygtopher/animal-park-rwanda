# Docker Deployment Guide - Animal Park Rwanda

## 🐳 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed (included with Docker Desktop)

### One-Command Deployment

```bash
docker-compose up --build
```

This will:
1. Build all containers (PostgreSQL, Backend, Frontend)
2. Set up networking between services
3. Run database migrations
4. Start all services

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

---

## 📋 Docker Configuration Overview

### Services

#### 1. PostgreSQL Database
- **Image:** postgres:15-alpine
- **Port:** 5432
- **Volume:** Persistent data storage
- **Health Check:** Ensures database is ready before backend starts

#### 2. Backend API
- **Build:** Multi-stage build for optimization
- **Port:** 5000
- **Features:**
  - Automatic Prisma migrations
  - Health check endpoint
  - Non-root user for security
  - Production-optimized build

#### 3. Frontend
- **Build:** Multi-stage build with Nginx
- **Port:** 3000 (mapped to 80 internally)
- **Features:**
  - Static file serving
  - React Router support
  - Gzip compression
  - Security headers
  - Asset caching

---

## 🔧 Docker Commands

### Start Services
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

### Stop Services
```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (clean slate)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs (real-time)
docker-compose logs -f backend
```

### Execute Commands in Containers
```bash
# Access backend shell
docker-compose exec backend sh

# Run Prisma commands
docker-compose exec backend npx prisma studio
docker-compose exec backend npx prisma migrate dev

# Access database
docker-compose exec postgres psql -U postgres -d animal_park
```

### Health Checks
```bash
# Check container health
docker ps

# Test backend health
curl http://localhost:5000/health

# Test frontend health
curl http://localhost:3000/health
```

---

## 🏗️ Docker Architecture

### Multi-Stage Builds

Both backend and frontend use multi-stage builds for:
- **Smaller image sizes** (only production files)
- **Faster builds** (cached layers)
- **Better security** (no build tools in production)

**Backend Dockerfile:**
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
# ... build steps ...

# Stage 2: Production
FROM node:18-alpine
COPY --from=builder /app/dist ./dist
# ... minimal runtime ...
```

**Frontend Dockerfile:**
```dockerfile
# Stage 1: Build React app
FROM node:18-alpine AS builder
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Networking

All services communicate through a custom bridge network:
- Services can reference each other by name
- Database URL: `postgresql://postgres:postgres@postgres:5432/animal_park`
- Backend URL from frontend: `http://backend:5000`

### Health Checks

**PostgreSQL:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
```

**Backend:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:5000/health"]
  interval: 30s
```

**Frontend:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:80"]
  interval: 30s
```

---

## 🔒 Security Features

### Non-Root Users
Both backend and frontend run as non-root users:
```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### Nginx Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

### Environment Variables
Sensitive data in `.env` files (not committed to Git):
- JWT secrets
- Database credentials
- API keys

---

## 🚀 Production Deployment

### Environment Variables

Create `.env` files for production:

**backend/.env:**
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_production_secret_here
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

**frontend/.env:**
```env
VITE_API_URL=https://api.your-domain.com
```

### Docker Compose Production

```yaml
version: '3.8'
services:
  backend:
    image: your-registry/animal-park-backend:latest
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
```

### Build and Push Images

```bash
# Build images
docker build -t animal-park-backend:latest ./backend
docker build -t animal-park-frontend:latest ./frontend

# Tag for registry
docker tag animal-park-backend:latest your-registry/animal-park-backend:latest

# Push to registry
docker push your-registry/animal-park-backend:latest
```

---

## 📊 Monitoring

### Container Stats
```bash
# Real-time stats
docker stats

# Specific container
docker stats animal_park_backend
```

### Disk Usage
```bash
# Show Docker disk usage
docker system df

# Clean up unused resources
docker system prune
```

### Logs Management
```bash
# Limit log size in docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Build Failures
```bash
# Clean build (no cache)
docker-compose build --no-cache

# Remove all containers and rebuild
docker-compose down
docker-compose up --build
```

### Permission Errors
```bash
# Fix volume permissions
docker-compose down -v
docker volume rm animal_park_postgres_data
docker-compose up
```

---

## ✅ Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] Environment variables configured
- [ ] `.dockerignore` files present
- [ ] Health checks working
- [ ] Database migrations run successfully
- [ ] All services start without errors
- [ ] Frontend accessible at port 3000
- [ ] Backend API responding at port 5000
- [ ] Database persisting data (test by restarting)
- [ ] Logs showing no errors

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

**Deployment Status:** ✅ Production Ready
