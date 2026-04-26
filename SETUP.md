# Local Development Setup

## Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)

## Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/theplacementproject.git
cd theplacementproject
```

## Step 2: Backend Setup

### 2.1 Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2.2 Install Dependencies
```bash
pip install -r requirements.txt
```

### 2.3 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
TELEGRAM_BOT_TOKEN=...
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
CRON_SECRET=dev-secret-123
```

### 2.4 Start Backend
```bash
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`

API docs available at `http://localhost:8000/docs`

## Step 3: Frontend Setup

### 3.1 Install Dependencies
```bash
cd frontend
npm install
```

### 3.2 Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3.3 Start Frontend
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## Step 4: Database Setup

### 4.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details
4. Wait for initialization

### 4.2 Run Migrations
1. Go to SQL Editor in Supabase dashboard
2. Copy-paste `supabase/migrations/20260406_init.sql`
3. Run the query
4. Copy-paste `supabase/migrations/20260426_indexes.sql`
5. Run the query

### 4.3 Get Credentials
1. Go to Settings → API
2. Copy `Project URL` → `SUPABASE_URL`
3. Copy `Service Role Secret` → `SUPABASE_KEY`
4. Copy `Anon Public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 5: Verify Setup

### 5.1 Test Backend
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","env":"development"}
```

### 5.2 Test Frontend
1. Open http://localhost:3000
2. Click "Sign In"
3. Enter test email
4. Check email for magic link
5. Click link to verify auth works

### 5.3 Test Database
1. Go to Supabase dashboard
2. Check Tables section
3. Verify all tables exist:
   - users
   - profiles
   - schedules
   - schedule_items
   - payments

## Step 6: Create Test Data

### 6.1 Create Test User
```bash
# In Supabase dashboard, go to Authentication → Users
# Click "Add user"
# Email: test@example.com
# Password: test123456
```

### 6.2 Create Test Profile
```bash
# In Supabase dashboard, go to SQL Editor
# Run:
INSERT INTO profiles (user_id, college_tier, branch, grad_year, target_roles, weekday_hrs, weekend_hrs, preferred_windows, skill_levels, is_pro)
VALUES (
  'user-uuid-here',
  'Tier-1',
  'CSE',
  2025,
  ARRAY['SDE', 'Data Engineer'],
  6,
  8,
  ARRAY['Morning', 'Evening'],
  '{"dsa":"intermediate","web":"beginner","aptitude":"beginner"}'::jsonb,
  false
);
```

## Development Workflow

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

### Linting
```bash
# Backend
cd backend
pylint app/

# Frontend
cd frontend
npm run lint
```

### Building for Production
```bash
# Backend (no build needed, runs directly)

# Frontend
cd frontend
npm run build
npm start
```

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.11+)
- Check virtual environment is activated
- Check all dependencies installed: `pip list`
- Check .env file exists and has all required variables

### Frontend won't start
- Check Node version: `node --version` (should be 18+)
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check .env.local file exists and has all required variables
- Check port 3000 is not in use

### Database connection failed
- Check SUPABASE_URL is correct
- Check SUPABASE_KEY is the Service Role key (not anon key)
- Check Supabase project is active
- Check network connectivity

### Auth not working
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
- Check Supabase auth is enabled
- Check browser cookies are enabled
- Check browser console for errors

## IDE Setup (VS Code)

### Recommended Extensions
- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Thunder Client (rangav.vscode-thunder-client) — for API testing

### Settings (.vscode/settings.json)
```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "[python]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "ms-python.python"
  },
  "[typescript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Next Steps

1. Read [PRD.md](./PRD.md) to understand product requirements
2. Read [README.md](./README.md) for project overview
3. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
4. Start developing!

## Getting Help

- Check existing GitHub issues
- Read API documentation at http://localhost:8000/docs
- Check Supabase documentation at https://supabase.com/docs
- Ask in project discussions

---

**Happy coding! 🚀**
