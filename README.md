# AI Resume Optimizer for FlashFire 

This is a full-stack AI-powered platform that helps users enhance their resumes and job applications with intelligent suggestions.  
Built with modern web technologies, it ensures a seamless experience from profile creation to job optimization.

## Live link
### [click here](https://ai-resume-optimizer-z9pa.vercel.app/)
---

## Tech Stack

**Frontend:** Next.js 15, React 19, Tailwind CSS, ShadCN UI 

**Backend:** Node.js, Express.js, Socket.IO, Multer, MongoDB, Mongoose  

**AI Integration:** Gemini 2.0 Flash API  
  

---

## Features

- AI-driven resume optimization, job specific
- PDF Resume upload & parsing  
- Job management dashboard
- Diff inline view on changes
- Clean modern UI with ShadCN  
- Responsive design  

---

## Local Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AC12arpitChauhan/AI_Resume_Optimizer.git
    ```

2.  **Backend setup**
    ```bash
    cd backend
    npm install
    cp .env.example .env   # Add your MongoDB URI & Gemini API key
    npm run dev
    ```

3.  **Frontend setup**
    ```bash
    cd ..
    npm install
    npm run dev
    ```

4.  **Access the app**
    * **Frontend:** `http://localhost:3000`
    * **Backend API:** `http://localhost:4000`
