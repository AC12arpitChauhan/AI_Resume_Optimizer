require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../backend/models/Job');
const Resume = require('../backend/models/Resume');

// Sample resume texts
const SAMPLE_RESUMES = [
  {
    baseResumeText: `JOHN DAVIS
Data Analyst

SUMMARY
Analytical professional with experience in data analysis and reporting. Proficient in working with data tools and creating reports.

EXPERIENCE

Data Analyst Intern | ABC Company | June 2022 - Present
- Analyzed data sets to identify trends
- Created reports for management
- Worked with team members on projects
- Used Excel for data manipulation

Research Assistant | University Lab | Jan 2021 - May 2022
- Collected and organized research data
- Assisted with statistical analysis
- Maintained databases

EDUCATION
Bachelor of Science in Statistics | State University | 2021

SKILLS
Excel, Python, Data Analysis, Research, Communication`,
  },
  {
    baseResumeText: `SARAH CHEN
Frontend Developer

PROFESSIONAL SUMMARY
Frontend developer with experience building web applications. Familiar with modern web technologies and frameworks.

WORK EXPERIENCE

Junior Frontend Developer | Tech Startup | March 2023 - Present
- Developed user interfaces for web applications
- Worked on React projects
- Collaborated with design team
- Fixed bugs and improved code

Freelance Web Developer | Self-Employed | Jan 2022 - Feb 2023
- Built websites for small businesses
- Worked with clients to understand requirements
- Delivered projects on time

EDUCATION
B.S. in Computer Science | Tech University | 2022

TECHNICAL SKILLS
HTML, CSS, JavaScript, React, Git, Responsive Design

PROJECTS
- Portfolio website
- E-commerce site
- Task management app`,
  },
];

// Sample job descriptions
const SAMPLE_JOBS = [
  {
    clientName: 'John Davis',
    companyName: 'Amazon',
    position: 'Data Analyst',
    jobDescription: `Amazon is seeking a Data Analyst to join our analytics team. 

Key Responsibilities:
- Perform complex data analysis using SQL, Excel, and Python
- Create compelling data visualizations using Power BI and Tableau
- Develop automated reports and dashboards
- Collaborate with cross-functional teams to drive data-driven decisions
- Extract insights from large datasets and present findings to stakeholders

Required Qualifications:
- Bachelor's degree in Statistics, Mathematics, Computer Science, or related field
- 2+ years of experience in data analysis
- Expert proficiency in Excel (pivot tables, VLOOKUP, macros)
- Strong SQL skills for data extraction and manipulation
- Experience with data visualization tools (Power BI, Tableau)
- Python or R programming for statistical analysis
- Excellent communication and presentation skills

Preferred Qualifications:
- Experience with ETL processes
- Knowledge of AWS or cloud-based analytics platforms
- Background in e-commerce or retail analytics`,
    jobApplicationLink: 'https://amazon.jobs/data-analyst-12345',
    resumeIndex: 0,
  },
  {
    clientName: 'Sarah Chen',
    companyName: 'Vercel (Startup)',
    position: 'Frontend Engineer',
    jobDescription: `We're looking for a Frontend Engineer to build the next generation of web development tools.

What You'll Do:
- Build performant, accessible React applications using Next.js 14+
- Write clean, maintainable TypeScript code
- Collaborate with designers to implement pixel-perfect UIs
- Optimize web applications for maximum speed and scalability
- Contribute to our design system and component library
- Participate in code reviews and mentor junior developers

Requirements:
- 3+ years of professional frontend development experience
- Expert knowledge of React, Next.js, and modern JavaScript/TypeScript
- Strong understanding of HTML5, CSS3, and responsive design
- Experience with state management (Redux, Zustand, or similar)
- Proficiency with Git and GitHub workflows
- Strong communication skills and ability to work in a remote-first environment

Nice to Have:
- Experience with Tailwind CSS or styled-components
- Knowledge of WebGL, Three.js, or animation libraries
- Contributions to open source projects
- Experience with server-side rendering and static site generation`,
    jobApplicationLink: 'https://vercel.com/careers/frontend-engineer',
    resumeIndex: 1,
  },
  {
    clientName: 'Sarah Chen',
    companyName: 'Notion Labs',
    position: 'Product Manager',
    jobDescription: `Notion is seeking a Product Manager to lead product strategy and development for our collaboration platform.

Responsibilities:
- Define product vision and roadmap aligned with company strategy
- Gather and prioritize requirements from customers, stakeholders, and market research
- Work closely with engineering, design, and marketing teams
- Analyze user behavior and product metrics to drive decision-making
- Lead product launches and go-to-market strategies
- Conduct user research and usability testing
- Manage stakeholder expectations and communicate product updates

Qualifications:
- 4+ years of product management experience in SaaS
- Strong technical background with ability to work closely with engineers
- Proven track record of launching successful products
- Excellent stakeholder management and communication skills
- Data-driven approach to product decisions
- Experience with agile development methodologies
- Strong analytical and problem-solving skills

Preferred:
- MBA or technical degree
- Experience with collaboration or productivity tools
- Background in B2B SaaS
- Familiarity with product analytics tools (Mixpanel, Amplitude)`,
    jobApplicationLink: 'https://notion.so/careers/product-manager',
    resumeIndex: 1,
  },
];

async function seed() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flashfire';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Job.deleteMany({});
    await Resume.deleteMany({});
    console.log('Existing data cleared');

    // Create resumes
    console.log('Creating base resumes...');
    const createdResumes = [];
    for (const resumeData of SAMPLE_RESUMES) {
      const resume = await Resume.create(resumeData);
      createdResumes.push(resume);
      console.log(`Created resume: ${resume._id}`);
    }

    // Create jobs
    console.log('Creating job cards...');
    for (const jobData of SAMPLE_JOBS) {
      const { resumeIndex, ...jobFields } = jobData;
      const job = await Job.create({
        ...jobFields,
        baseResume: createdResumes[resumeIndex]._id,
        status: 'Pending Optimization',
      });
      console.log(`Created job: ${job.position} at ${job.companyName}`);
    }

    console.log('\n✅ Seed data created successfully!');
    console.log(`Created ${createdResumes.length} resumes and ${SAMPLE_JOBS.length} job cards`);
    console.log('\nYou can now:');
    console.log('1. Start the backend server: cd backend && npm run dev');
    console.log('2. Start the frontend: cd frontend && npm run dev');
    console.log('3. Visit http://localhost:3000 to see the dashboard');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
