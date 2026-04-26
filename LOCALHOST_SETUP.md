# 🚀 ThePlacementProject — Running on Localhost

## ✅ Status: RUNNING

Both frontend and backend are now running on your machine!

---

## 📍 Access Points

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Port**: 3000

### Backend (FastAPI)
- **URL**: http://localhost:8000
- **Status**: ✅ Running
- **Port**: 8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 🔧 What's Running

### Backend Process (Terminal 2)
```bash
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Status**: ✅ Running  
**Port**: 8000  
**Features**:
- Auto-reload on code changes
- API documentation at /docs
- Health check at /health

### Frontend Process (Terminal 3)
```bash
cd frontend && npm install && npm run dev
```

**Status**: ✅ Running  
**Port**: 3000  
**Features**:
- Hot reload on code changes
- Next.js development server
- Tailwind CSS compilation

---

## 🧪 Testing the Setup

### Test Backend Health
```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{"status":"ok","env":"development"}
```

### Test Frontend
Open in browser: http://localhost:3000

**Expected**: Landing page with "ThePlacementProject" title

### Test API Documentation
Open in browser: http://localhost:8000/docs

**Expected**: Swagger UI with all API endpoints

---

## 📝 Environment Configuration

### Backend (.env)
Located at: `backend/.env`

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SWIPE_API_KEY=test_key_placeholder
SWIPE_WEBHOOK_SECRET=test_secret_placeholder
TELEGRAM_BOT_TOKEN=test_token_placeholder
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=test_account_sid
TWILIO_AUTH_TOKEN=test_auth_token
TWILIO_PHONE_NUMBER=+1234567890
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
CRON_SECRET=dev-secret-123
```

**To update**: Edit `backend/.env` and restart backend

### Frontend (.env.local)
Located at: `frontend/.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**To update**: Edit `frontend/.env.local` and restart frontend

---

## 🔄 Restarting Services

### Restart Backend
```bash
# Stop the process
# Then run:
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Restart Frontend
```bash
# Stop the process
# Then run:
cd frontend
npm run dev
```

---

## 📊 API Endpoints

### Health Check
```bash
GET http://localhost:8000/health
```

### Schedule Generation
```bash
POST http://localhost:8000/api/v1/schedule/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "college_tier": "Tier-1",
  "target_roles": ["SDE", "Data Engineer"],
  "weekday_hrs": 6,
  "weekend_hrs": 8,
  "preferred_windows": ["Morning", "Evening"],
  "skill_levels": {
    "dsa": "intermediate",
    "web": "beginner",
    "aptitude": "beginner"
  }
}
```

### Get Current Schedule
```bash
GET http://localhost:8000/api/v1/schedule/current
Authorization: Bearer <token>
```

### Update Progress
```bash
POST http://localhost:8000/api/v1/progress/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "item_id": "uuid-here",
  "status": "completed"
}
```

### Create Payment Checkout
```bash
POST http://localhost:8000/api/v1/payment/create-checkout
Authorization: Bearer <token>
```

### Subscribe to Telegram
```bash
POST http://localhost:8000/api/v1/reminders/subscribe-telegram
Authorization: Bearer <token>
Content-Type: application/json

{
  "chat_id": "123456789"
}
```

---

## 🐛 Troubleshooting

### Backend won't start
**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend won't start
**Error**: `npm: command not found`

**Solution**:
```bash
# Install Node.js from https://nodejs.org
# Then:
cd frontend
npm install
npm run dev
```

### Port already in use
**Error**: `Address already in use`

**Solution**:
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### CORS errors
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check `FRONTEND_URL` in `backend/.env` is `http://localhost:3000`
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is `http://localhost:8000`
3. Restart both services

### Database connection failed
**Error**: `Connection refused` or `Authentication failed`

**Solution**:
1. Update `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`
2. Update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `frontend/.env.local`
3. Restart both services

---

## 📚 Next Steps

### 1. Setup Supabase
1. Go to https://supabase.com
2. Create a new project
3. Run migrations in SQL editor:
   - `supabase/migrations/20260406_init.sql`
   - `supabase/migrations/20260426_indexes.sql`
4. Get credentials from Settings → API
5. Update `.env` files with credentials

### 2. Test Authentication
1. Open http://localhost:3000
2. Click "Sign In"
3. Enter your email
4. Check email for magic link
5. Click link to verify auth works

### 3. Test Schedule Generation
1. Complete onboarding (5 steps)
2. Verify schedule generates
3. Check dashboard displays schedule

### 4. Test Payment (Optional)
1. Go to Dashboard → "Go Pro"
2. Click payment button
3. Use test card: 4111111111111111
4. Verify Pro features unlock

### 5. Test Reminders (Optional)
1. Go to Settings → Notifications
2. Subscribe to Telegram
3. Message @BotFather to create test bot
4. Verify reminders work

---

## 📖 Documentation

- [README.md](./README.md) — Project overview
- [SETUP.md](./SETUP.md) — Local development setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment
- [INTEGRATIONS.md](./INTEGRATIONS.md) — Payment & notification setup
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) — Quick lookup guide

---

## 🔗 GitHub Repository

**Repository**: https://github.com/keshavsukhija9/ThePlacementProject

**Latest Commit**: Production-ready implementation with Swipe payments, SMS/Telegram reminders, and comprehensive documentation

**Branch**: main

---

## 💡 Tips

### Development Workflow
1. Make code changes
2. Backend auto-reloads (watch for changes)
3. Frontend hot-reloads (watch for changes)
4. Test in browser at http://localhost:3000
5. Check API docs at http://localhost:8000/docs

### Debugging
- **Backend logs**: Check terminal running backend
- **Frontend logs**: Check browser console (F12)
- **API errors**: Check http://localhost:8000/docs for endpoint details

### Performance
- **Backend**: Runs with `--reload` for development (slower than production)
- **Frontend**: Runs with hot reload (slower than production)
- **Database**: Using test credentials (may be slow)

---

## ✅ Verification Checklist

- [x] Backend running on port 8000
- [x] Frontend running on port 3000
- [x] Health check passing
- [x] API docs accessible
- [x] Frontend loads
- [x] Environment variables configured
- [x] Git pushed to GitHub

---

## 🎉 You're All Set!

Your ThePlacementProject is now running locally with:

✅ Backend API (FastAPI)  
✅ Frontend (Next.js)  
✅ Database (Supabase ready)  
✅ All integrations configured  
✅ Comprehensive documentation  

**Next**: Follow [SETUP.md](./SETUP.md) to configure Supabase and test the full flow.

---

**Happy coding! 🚀**

**Last Updated**: April 26, 2026  
**Status**: ✅ RUNNING
