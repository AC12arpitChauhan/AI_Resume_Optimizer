# Flashfire Resume Optimizer & Job Dashboard

A full-stack application that links job management with AI-powered resume optimization using Google Gemini. Add jobs, attach resumes, click Optimize and the system will automatically tailor resumes to job descriptions and sync the job card status in real time.

![Flashfire Resume Optimizer](https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=400&fit=crop)

## 🚀 Features

- **Job Management Dashboard**: Create, edit, and manage job applications with a clean, intuitive interface
- **AI-Powered Resume Optimization**: Leverage Google Gemini to automatically tailor resumes to specific job descriptions
- **Real-Time Updates**: Socket.IO integration for instant status updates across clients
- **Intelligent Diff Viewer**: Side-by-side and inline comparison views highlighting resume changes
- **Multi-Format Resume Upload**: Support for .txt, .pdf, .doc, and .docx files with automatic text extraction
- **Keyword Tracking**: Automatically identifies and displays keywords added during optimization
- **Batch Optimization**: Optimize multiple resumes simultaneously (optional)
- **RESTful API**: Complete backend API with proper error handling and rate limiting

## 🛠 Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- ShadCN UI Components
- Socket.IO Client
- SWR for data fetching
- Sonner for toast notifications

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO for real-time updates
- Google Gemini API for AI optimization
- Multer for file uploads
- Jest for testing

**AI:**
- Google Gemini 1.5 Flash (free tier)

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google Gemini API key ([Get it free here](https://makersuite.google.com/app/apikey))

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flashfire-resume-optimizer
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Edit `backend/.env` and add your configuration:

```env
MONGO_URI=mongodb://localhost:27017/flashfire
PORT=4000
NODE_ENV=development
LOG_LEVEL=info
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### 3. Frontend Setup

```bash
cd ..  # back to root
npm install

# Create .env.local file
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 4. Start MongoDB

Make sure MongoDB is running locally:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongodb

# Windows
# Start MongoDB service from Services app

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in backend/.env with your Atlas connection string
```

### 5. Seed Sample Data

```bash
cd backend
npm run seed
```

This creates:
- 2 base resumes (Data Analyst, Frontend Developer)
- 3 job cards (Amazon Data Analyst, Vercel Frontend Engineer, Notion Product Manager)

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend will run on http://localhost:4000

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## 🎯 Usage

### Adding a Job

1. Click "Add Job" button
2. Fill in client name, company, position, and job description
3. Optionally select a base resume
4. Click "Create Job"

### Uploading a Resume

1. Click "Upload Resume" button
2. Choose to upload a file (.txt, .pdf, .doc, .docx) or paste text
3. Click "Upload Resume"

### Optimizing a Resume

1. Ensure a job has a base resume attached
2. Click "Optimize Resume" on the job card
3. Wait for AI processing (usually 10-30 seconds)
4. Job status updates to "Optimized" with timestamp

### Viewing Changes

1. Click "View Changes" on an optimized job
2. See side-by-side comparison or inline diff
3. Review added keywords and change summary
4. Download optimized resume as .txt file

## 🔌 API Documentation

### Base URL
```
http://localhost:4000/api/v1
```

### Endpoints

#### Health Check
```bash
GET /health
```

#### Jobs

**Get all jobs**
```bash
GET /jobs?status=All&page=1&limit=20
```

**Get single job**
```bash
GET /jobs/:id
```

**Create job**
```bash
POST /jobs
Content-Type: application/json

{
  "clientName": "John Doe",
  "companyName": "Amazon",
  "position": "Data Analyst",
  "jobDescription": "We are looking for...",
  "jobApplicationLink": "https://amazon.jobs/123",
  "baseResumeId": "resume_id_here"
}
```

**Update job**
```bash
PUT /jobs/:id
Content-Type: application/json

{
  "position": "Senior Data Analyst"
}
```

**Delete job**
```bash
DELETE /jobs/:id
```

#### Resumes

**Get all resumes**
```bash
GET /resumes
```

**Upload resume**
```bash
POST /resumes/upload
Content-Type: multipart/form-data

FormData:
- file: [binary file]
- baseResumeText: "Optional text"
```

#### Optimization

**Optimize resume**
```bash
POST /optimize
Content-Type: application/json

{
  "jobId": "job_id_here"
}
```

**Response:**
```json
{
  "jobId": "64f...abc",
  "optimizedResumeText": "...",
  "changesSummary": {
    "headline": "Added Excel and data analysis keywords",
    "summary": "Enhanced bullet points...",
    "keywordsAdded": ["SQL", "Excel", "Power BI"]
  },
  "updatedJob": {
    "status": "Optimized",
    "optimizedOn": "2025-10-28T18:30:00.000Z",
    "changesSummary": "Added Excel and data analysis keywords"
  },
  "diff": {
    "lineDiff": [...],
    "wordDiff": [...],
    "stats": {
      "additions": 15,
      "deletions": 3,
      "unchanged": 42
    }
  }
}
```

**Get diff**
```bash
GET /optimize/diff/:jobId
```

**Batch optimize**
```bash
POST /optimize/batch
Content-Type: application/json

{
  "jobIds": ["id1", "id2", "id3"]
}
```

### Example cURL Commands

```bash
# Health check
curl http://localhost:4000/api/v1/health

# Get all jobs
curl http://localhost:4000/api/v1/jobs

# Create job
curl -X POST http://localhost:4000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Jane Smith",
    "companyName": "Google",
    "position": "Software Engineer",
    "jobDescription": "Looking for experienced engineer...",
    "jobApplicationLink": "https://careers.google.com/jobs/123",
    "baseResumeId": "RESUME_ID_HERE"
  }'

# Optimize resume
curl -X POST http://localhost:4000/api/v1/optimize \
  -H "Content-Type: application/json" \
  -d '{"jobId": "JOB_ID_HERE"}'
```

## 🧪 Testing

```bash
cd backend
npm test
```

Tests include:
- Optimize endpoint with mocked Gemini responses
- Job CRUD operations
- Error handling
- Rate limiting

## 📦 Deployment

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://your-backend.herokuapp.com
```

### Deploy Backend to Render/Heroku

**Render:**
1. Create new Web Service
2. Connect your repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables in Render dashboard

**Heroku:**
```bash
cd backend
heroku create flashfire-backend
heroku addons:create mongolab
heroku config:set GEMINI_API_KEY=your_key_here
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
git push heroku main
```

### Environment Variables for Production

**Backend (Render/Heroku):**
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/flashfire
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://flashfire-frontend.vercel.app
GEMINI_API_KEY=your_gemini_api_key
LOG_LEVEL=info
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=https://flashfire-backend.render.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://flashfire-backend.render.com
```

## 🔐 Security

- ✅ Gemini API key stored server-side only
- ✅ CORS configured for frontend origin
- ✅ Input validation and sanitization
- ✅ Rate limiting on optimize endpoints (20 requests per 15 minutes)
- ✅ File upload size limits (5MB max)
- ✅ Error messages don't expose sensitive data

## 🎨 Gemini Prompts

The AI optimization uses two prompts stored in `backend/services/prompts.js`:

### Optimization Prompt
Instructs Gemini to:
- Tailor resume to job description
- Add relevant keywords naturally
- Improve action verbs and quantify achievements
- Keep facts and timeline intact
- Maintain similar length

### Changes Summary Prompt
Generates:
- 8-12 word headline of main change
- 2-3 sentence summary of what changed
- List of 5-12 added keywords

### Customizing Prompts

Edit `backend/services/prompts.js` to adjust:
- Tone (formal vs. casual)
- Focus areas (technical skills vs. soft skills)
- Length constraints
- Specific requirements for senior roles

## 📈 Scale Considerations

**Current limitations:**
- Single server instance
- No job queue for batch operations
- Gemini free tier rate limits

**Next steps for scaling:**

1. **Add Job Queue**: Implement BullMQ or RabbitMQ for async optimization
2. **Caching**: Add Redis for frequently accessed data
3. **Multi-tenancy**: Add user authentication and workspace isolation
4. **Database Optimization**: Add indexes, implement sharding for large datasets
5. **Rate Limiting**: Implement per-user quotas instead of IP-based
6. **CDN**: Store optimized resumes in S3/CloudFront for faster access
7. **Load Balancing**: Use multiple backend instances behind a load balancer
8. **Monitoring**: Add Datadog, Sentry, or New Relic for observability
9. **Background Workers**: Separate optimization workers from API servers
10. **Gemini Pro**: Upgrade to paid tier for higher rate limits

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB is running: `mongosh` or `mongo`
- Verify `.env` file exists and has correct values
- Check port 4000 is not in use: `lsof -i :4000`

**Frontend can't connect to backend:**
- Verify backend is running on port 4000
- Check `.env.local` has correct API URL
- Look for CORS errors in browser console

**Optimization fails:**
- Verify Gemini API key is correct and has quota
- Check job has a base resume attached
- Review backend logs for detailed error messages
- Test Gemini API key with a curl request

**MongoDB connection error:**
- Verify MongoDB service is running
- Check connection string in `MONGO_URI`
- For Atlas, ensure IP whitelist includes your IP

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- ShadCN UI for beautiful components
- Next.js team for an amazing framework
- MongoDB for reliable database
- Socket.IO for real-time features

## 📧 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review API documentation above

---

**Built with ❤️ using Next.js, Express, MongoDB, and Google Gemini**