# Flashfire Resume Optimizer - Quick Start Guide

This guide will get you up and running in 5 minutes.

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check npm
npm --version

# Check MongoDB (or skip if using Atlas)
mongosh --version
```

## Quick Setup (Local Development)

### 1. Get Gemini API Key (Free)

1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key (starts with `AI...`)

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### 3. Configure Environment

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/flashfire
PORT=4000
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend (.env.local):**
```bash
cd ..
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows
# Start from Services app
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 Free tier)
4. Get connection string
5. Update `MONGO_URI` in `backend/.env`

### 5. Seed Sample Data

```bash
cd backend
npm run seed
```

Expected output:
```
✅ Seed data created successfully!
Created 2 resumes and 3 job cards
```

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
{"timestamp":"...","level":"INFO","message":"Connected to MongoDB"}
{"timestamp":"...","level":"INFO","message":"Server started","port":4000}
```

**Terminal 2 - Frontend:**
```bash
# From project root
npm run dev
```

You should see:
```
  ▲ Next.js 15.0.3
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

### 7. Open Application

Visit: **http://localhost:3000**

You should see:
- 3 job cards (Amazon, Vercel, Notion)
- "Add Job" and "Upload Resume" buttons
- Status filter dropdown

## Test the Optimization Flow

1. **View a Job Card**: You'll see "Data Analyst at Amazon" (and others)
2. **Click "Optimize Resume"**: Wait 10-20 seconds
3. **See Status Change**: Card updates to "Optimized" with timestamp
4. **Click "View Changes"**: See side-by-side comparison with highlighted changes

## Common Quick Fixes

**Port already in use:**
```bash
# Kill process on port 4000
lsof -i :4000
kill -9 <PID>

# Or use different port in backend/.env
PORT=4001
```

**MongoDB connection failed:**
```bash
# Check if MongoDB is running
mongosh
# If it works, MongoDB is running

# If not, start it:
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

**Gemini API error:**
- Verify key is correct (no extra spaces)
- Check quota at https://makersuite.google.com/
- Wait a minute and try again (rate limit)

## Next Steps

1. ✅ Add more job cards
2. ✅ Upload your own resume
3. ✅ Optimize and compare
4. ✅ Explore the API with Postman (see `postman_collection.json`)
5. ✅ Read full docs in `README.md`

## Production Deployment

See `README.md` for Vercel + Render deployment instructions.

## Need Help?

- Check `README.md` for detailed documentation
- Review backend logs in Terminal 1
- Check browser console for frontend errors
- Test API health: `curl http://localhost:4000/api/v1/health`

---

**You're ready to go! 🚀**
