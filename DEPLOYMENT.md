# Animal Park System - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Local Development (Fastest)

**Time**: 5 minutes

```bash
# Navigate to project
cd C:\Users\CHRISTOPHE\OneDrive\Desktop\animalpark

# Start with Docker
docker-compose up --build

# In new terminal, seed database
docker-compose exec backend npx prisma db seed
```

**Access**:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

### Option 2: Deploy to Heroku (Recommended for Demo)

**Time**: 30-45 minutes

#### Prerequisites
- Heroku account (free tier works)
- Heroku CLI installed

#### Backend Deployment

```bash
# Login to Heroku
heroku login

# Create app
cd backend
heroku create animal-park-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret-change-this

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main

# Run migrations and seed
heroku run npx prisma migrate deploy
heroku run npx prisma db seed
```

#### Frontend Deployment

```bash
# Create frontend app
cd ../frontend
heroku create animal-park-web

# Set backend URL
heroku config:set VITE_API_URL=https://animal-park-api.herokuapp.com

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

---

### Option 3: Deploy to DigitalOcean App Platform

**Time**: 45-60 minutes

#### Steps

1. **Create Account**
   - Sign up at digitalocean.com
   - Get $200 free credit

2. **Create App**
   - Click "Create" → "Apps"
   - Connect GitHub repository
   - Select branch

3. **Configure Backend**
   ```yaml
   name: backend
   environment_slug: node-js
   build_command: npm install && npx prisma generate && npm run build
   run_command: npm start
   envs:
     - key: DATABASE_URL
       value: ${db.DATABASE_URL}
     - key: NODE_ENV
       value: production
     - key: JWT_SECRET
       value: your-secret-here
   ```

4. **Configure Frontend**
   ```yaml
   name: frontend
   environment_slug: node-js
   build_command: npm install && npm run build
   envs:
     - key: VITE_API_URL
       value: ${backend.PUBLIC_URL}
   ```

5. **Add Database**
   - Add PostgreSQL database component
   - Auto-connects to backend

6. **Deploy**
   - Click "Create Resources"
   - Wait 5-10 minutes

---

### Option 4: Deploy to AWS (Production-Grade)

**Time**: 2-3 hours

#### Architecture
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or ECS
- **Database**: RDS PostgreSQL
- **Storage**: S3 for tickets/images

#### Steps

1. **Create RDS Database**
   ```bash
   # Create PostgreSQL instance
   # Note connection string
   ```

2. **Deploy Backend to EC2**
   ```bash
   # Launch EC2 instance (t2.micro for free tier)
   # Install Node.js and Docker
   # Clone repository
   # Set environment variables
   # Run with PM2 or Docker
   ```

3. **Deploy Frontend to S3**
   ```bash
   # Build frontend
   npm run build

   # Upload to S3
   aws s3 sync dist/ s3://animal-park-web

   # Configure CloudFront
   # Point to S3 bucket
   ```

4. **Configure Domain**
   - Route 53 for DNS
   - SSL certificate with ACM

---

## 🔧 Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/animal_park

# Server
NODE_ENV=production
PORT=5000

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.com

# Payment (Add real credentials for production)
MTN_API_KEY=your-mtn-api-key
MTN_API_SECRET=your-mtn-secret
AIRTEL_API_KEY=your-airtel-api-key
AIRTEL_API_SECRET=your-airtel-secret

# Optional: Email/SMS
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Optional: File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=animal-park-tickets
```

### Frontend (.env)

```bash
VITE_API_URL=https://your-backend-url.com
```

---

## 📋 Pre-Deployment Checklist

### Security
- [ ] Change all default secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Add input sanitization
- [ ] Configure CSP headers

### Database
- [ ] Run migrations
- [ ] Seed initial data
- [ ] Set up backups
- [ ] Configure connection pooling
- [ ] Enable query logging (temporarily)

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging (Winston/Pino)
- [ ] Add uptime monitoring
- [ ] Set up alerts
- [ ] Configure analytics

### Performance
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Optimize images
- [ ] Enable caching
- [ ] Minify frontend assets

### Testing
- [ ] Test all API endpoints
- [ ] Verify payment flow
- [ ] Test QR generation
- [ ] Verify email/SMS (if enabled)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

---

## 🔍 Post-Deployment Verification

### 1. Health Checks
```bash
# Backend health
curl https://your-api.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Authentication
```bash
# Register user
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User","phone":"+250788123456"}'

# Login
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Test Parks API
```bash
# Get parks
curl https://your-api.com/api/parks
```

### 4. Frontend Verification
- Visit homepage
- Test login
- Browse parks
- Create booking
- Check responsive design

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL format
# Should be: postgresql://user:pass@host:port/dbname

# Test connection
npx prisma db push
```

### CORS Errors
```typescript
// backend/src/app.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Build Failures
```bash
# Clear caches
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma
npx prisma generate
```

### Port Already in Use
```bash
# Find and kill process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill
```

---

## 📊 Monitoring & Maintenance

### Daily
- Check error logs
- Monitor uptime
- Review failed payments

### Weekly
- Database backup verification
- Performance metrics review
- Security updates

### Monthly
- Dependency updates
- Security audit
- User feedback review
- Feature usage analytics

---

## 🎯 Scaling Considerations

### When to Scale

**Backend**:
- Response time > 2 seconds
- CPU usage > 70%
- Memory usage > 80%

**Database**:
- Connection pool exhausted
- Query time > 1 second
- Storage > 80% full

### Scaling Options

1. **Vertical Scaling**
   - Upgrade server size
   - Increase database resources

2. **Horizontal Scaling**
   - Load balancer
   - Multiple backend instances
   - Database read replicas

3. **Caching**
   - Redis for sessions
   - CDN for static assets
   - Database query caching

---

## 💰 Cost Estimates

### Free Tier (Development)
- **Heroku**: Free (with limitations)
- **DigitalOcean**: $200 credit
- **AWS**: 12 months free tier
- **Total**: $0/month

### Small Production (~1000 users)
- **Hosting**: $20-50/month
- **Database**: $15-25/month
- **CDN**: $5-10/month
- **Monitoring**: $0-20/month
- **Total**: $40-105/month

### Medium Production (~10,000 users)
- **Hosting**: $100-200/month
- **Database**: $50-100/month
- **CDN**: $20-50/month
- **Monitoring**: $20-50/month
- **Total**: $190-400/month

---

## 🎉 You're Ready to Deploy!

Choose your deployment option and follow the steps above. The system is production-ready!

**Need help?** Check the troubleshooting section or review the logs.

---

**Good luck with your deployment! 🚀**
