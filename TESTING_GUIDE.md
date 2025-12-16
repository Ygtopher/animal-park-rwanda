# Animal Park System - Testing Guide

## 🧪 Complete Testing Checklist

This guide will help you test all features of the Animal Park system.

## 📋 Pre-Testing Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start with Docker (Recommended)

```bash
# From project root
docker-compose up --build
```

Wait for all services to start:
- ✅ PostgreSQL: Ready on port 5432
- ✅ Backend: Ready on port 5000
- ✅ Frontend: Ready on port 3000

### 3. Seed the Database

```bash
# In a new terminal
docker-compose exec backend npx prisma db seed
```

You should see:
- ✅ 4 parks created
- ✅ 20+ animals added
- ✅ 3 test users created
- ✅ Pricing rules configured

---

## 🔍 Testing Scenarios

### Scenario 1: Tourist Registration & Login

**Steps:**
1. Open http://localhost:3000
2. Click "Login" button
3. Click "Register here"
4. Fill in registration form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: +250788123456
   - Password: password123
   - Confirm Password: password123
5. Click "Create Account"

**Expected Result:**
- ✅ Success message appears
- ✅ Redirected to home page
- ✅ User is logged in

**Alternative: Use Demo Account**
- Email: tourist@example.com
- Password: password123

---

### Scenario 2: Browse Parks

**Steps:**
1. From home page, click "Explore Parks"
2. View parks listing
3. Use search: type "Akagera"
4. Use filter: select "EASTERN" province
5. Click on a park card

**Expected Result:**
- ✅ Parks grid displays 4 parks
- ✅ Search filters results
- ✅ Province filter works
- ✅ Park details page loads

---

### Scenario 3: View Park Details

**Steps:**
1. On park details page, scroll through:
   - Park description
   - Opening hours and capacity
   - Wildlife section
   - Amenities
2. Check availability:
   - Select tomorrow's date
   - Click "Check Availability"

**Expected Result:**
- ✅ All park information displays
- ✅ Animals show with images
- ✅ Availability check shows slots
- ✅ "Book Now" button enabled

---

### Scenario 4: Create a Booking

**Steps:**
1. On park details, select a future date
2. Click "Book Now"
3. On booking page:
   - Verify date is pre-filled
   - Set visitors: 2
   - Select visitor type: "Foreign Adult"
   - Add special request: "Vegetarian meals"
4. Review booking summary
5. Click "Proceed to Payment"

**Expected Result:**
- ✅ Booking form validates
- ✅ Price calculates correctly
- ✅ Summary shows all details
- ✅ Reservation created
- ✅ Redirected to payment page

---

### Scenario 5: View My Bookings

**Steps:**
1. Navigate to "My Bookings" (add link to navbar)
2. View booking list
3. Check booking details:
   - Booking reference
   - Visit date
   - Number of visitors
   - Total amount
   - Status
4. Try filters:
   - Click "Upcoming"
   - Click "All Bookings"

**Expected Result:**
- ✅ Bookings list displays
- ✅ All details visible
- ✅ Filters work correctly
- ✅ Status badges show correctly

---

### Scenario 6: Cancel a Booking

**Steps:**
1. On "My Bookings" page
2. Find a confirmed booking
3. Click "Cancel Booking"
4. Confirm cancellation
5. Check refund amount

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Booking status changes to "CANCELLED"
- ✅ Refund amount calculated correctly:
  - 7+ days: 90% refund
  - 3-6 days: 50% refund
  - < 3 days: No refund
- ✅ Success message shows

---

### Scenario 7: Download Ticket (After Payment)

**Steps:**
1. Find a confirmed booking
2. Click "Download Ticket"
3. Check PDF content

**Expected Result:**
- ✅ PDF downloads
- ✅ Contains booking reference
- ✅ Shows QR code
- ✅ Park details included
- ✅ Visit date and visitors shown

---

## 🔧 API Testing

### Test Backend Endpoints

**1. Health Check**
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"ok","timestamp":"..."}`

**2. Get All Parks**
```bash
curl http://localhost:5000/api/parks
```
Expected: JSON array with 4 parks

**3. Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\",\"phone\":\"+250788123456\"}"
```
Expected: User object with JWT tokens

**4. Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tourist@example.com\",\"password\":\"password123\"}"
```
Expected: User object with JWT tokens

**5. Get Park Details**
```bash
curl http://localhost:5000/api/parks/{parkId}
```
Expected: Park object with animals and reviews

**6. Check Availability**
```bash
curl "http://localhost:5000/api/parks/{parkId}/availability?date=2024-12-15"
```
Expected: Availability object with slots

**7. Create Reservation (Authenticated)**
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d "{\"parkId\":\"{parkId}\",\"visitDate\":\"2024-12-15\",\"numberOfVisitors\":2}"
```
Expected: Reservation object

---

## 🎨 UI/UX Testing

### Responsive Design

**Desktop (1920x1080):**
- ✅ Full layout displays
- ✅ Sidebar visible
- ✅ Grid shows 3 columns

**Tablet (768x1024):**
- ✅ Layout adjusts
- ✅ Grid shows 2 columns
- ✅ Navigation responsive

**Mobile (375x667):**
- ✅ Single column layout
- ✅ Touch-friendly buttons
- ✅ Readable text
- ✅ Forms work well

### Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Performance

- ✅ Page load < 3 seconds
- ✅ API response < 500ms
- ✅ Smooth animations
- ✅ No console errors

---

## 🐛 Common Issues & Solutions

### Issue 1: Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# Or change port in .env
PORT=5001
```

### Issue 2: Database Connection Failed

**Error:** `Can't reach database server`

**Solution:**
```bash
# Check Docker is running
docker ps

# Restart containers
docker-compose down
docker-compose up
```

### Issue 3: Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
cd backend
npx prisma generate
```

### Issue 4: CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solution:**
- Check FRONTEND_URL in backend/.env
- Should match frontend URL (http://localhost:3000)

### Issue 5: Login Not Working

**Check:**
1. Backend is running (http://localhost:5000/health)
2. Database is seeded
3. JWT_SECRET is set in .env
4. Check browser console for errors

---

## ✅ Testing Checklist

### Backend
- [ ] Health endpoint responds
- [ ] Database connection works
- [ ] Prisma migrations applied
- [ ] Seed data loaded
- [ ] All API endpoints respond
- [ ] Authentication works
- [ ] JWT tokens generated
- [ ] Rate limiting active

### Frontend
- [ ] Home page loads
- [ ] Login works
- [ ] Registration works
- [ ] Parks listing displays
- [ ] Park details show
- [ ] Booking form works
- [ ] My bookings displays
- [ ] Responsive on mobile
- [ ] No console errors

### Features
- [ ] User can register
- [ ] User can login
- [ ] User can browse parks
- [ ] User can view park details
- [ ] User can check availability
- [ ] User can create booking
- [ ] User can view bookings
- [ ] User can cancel booking
- [ ] Pricing calculates correctly
- [ ] Refunds calculate correctly

### Data
- [ ] 4 parks seeded
- [ ] Animals display
- [ ] Pricing rules work
- [ ] Demo accounts work
- [ ] Schedules created

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

BACKEND TESTS:
[ ] Health check - PASS/FAIL
[ ] Authentication - PASS/FAIL
[ ] Parks API - PASS/FAIL
[ ] Reservations API - PASS/FAIL
[ ] Payments API - PASS/FAIL

FRONTEND TESTS:
[ ] Registration - PASS/FAIL
[ ] Login - PASS/FAIL
[ ] Park browsing - PASS/FAIL
[ ] Booking flow - PASS/FAIL
[ ] User dashboard - PASS/FAIL

ISSUES FOUND:
1. ___________
2. ___________
3. ___________

NOTES:
___________
```

---

## 🎯 Success Criteria

The system is ready for deployment when:

✅ All backend endpoints respond correctly
✅ All frontend pages load without errors
✅ User can complete full booking flow
✅ Database operations work correctly
✅ No critical console errors
✅ Responsive on all devices
✅ Demo accounts work

---

## 📞 Need Help?

If tests fail:
1. Check error messages in console
2. Review terminal logs
3. Verify environment variables
4. Check database connection
5. Restart Docker containers

**Common Commands:**
```bash
# View logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart

# Clean restart
docker-compose down
docker-compose up --build
```

---

**Happy Testing! 🧪**
