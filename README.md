# AI Based Smart Job Portal using MERN Stack & Cloud Deployment

![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-emerald.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-sky.svg)
![AI](https://img.shields.io/badge/AI-Groq%20%7C%20OpenAI-purple.svg)
![AWS](https://img.shields.io/badge/Cloud-AWS%20EC2%20%26%20S3-orange.svg)

An enterprise-grade recruitment platform built on the **MERN stack**, augmented with **modern AI intelligence** and architected for **AWS Cloud Deployment**. It automates candidate screening, matches job seekers to relevant openings, generates custom interview questions, and enables real-time messaging between candidates and recruiters.

---

## 🌟 Key Features

### 1. 🤖 AI Highlights
* **AI Resume Screening**: Extracts text from uploaded PDF resumes, computes ATS match scores (0-100%), and evaluates skill alignment.
* **AI Job Recommendation Engine**: Dynamically matches candidate profile skills against active jobs and ranks them by compatibility percentage.
* **AI Career Coach Chatbot**: Conversational advisor for resume optimization, STAR-method interview tips, and salary negotiation.
* **AI Interview Question Generator**: Automatically generates technical, behavioral, and situational questions tailored to specific applicants and job descriptions.
* **ATS Resume Audit & Feedback**: Pinpoints resume strengths, improvement areas, and missing high-impact industry keywords.

### 2. 👥 User Modules & Roles
* **Job Seeker Portal**: Profile management, PDF resume upload with ATS analysis, job search with geo-filters, 1-click apply, application status pipeline tracking, and live recruiter chat.
* **Employer / Recruiter Portal**: Company profile management, job posting (CRUD), applicant ranking by AI match score, automated question generation, and real-time candidate chat.
* **Admin Portal**: System-wide telemetry, user management (activate/suspend), job moderation, and AI inference latency tracking.

### 3. ⚡ Advanced & Real-Time Capabilities
* **Real-time Recruiter-Candidate Chat**: Built with Socket.io with typing indicators, online presence, and message history.
* **Live Notifications**: Instant alerts when application status transitions or new applicants apply.
* **Two-Factor Authentication (2FA OTP)**: 6-digit OTP verification on login for enhanced security (logged to console in development mode).
* **Geo-location & Smart Search**: Search by keywords, city, workplace type (Remote, Hybrid, On-site), salary, and experience levels.
* **Modern Dark Mode**: Sleek dark/light theme toggle styled with Tailwind CSS.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Vite), Tailwind CSS, Lucide Icons, Axios, Socket.io-client |
| **Backend** | Node.js, Express.js, Socket.io, Multer, pdf-parse, bcryptjs, JWT |
| **Database** | MongoDB Atlas (with automatic in-memory fallback for local dev) |
| **AI Integration** | Groq AI (`llama-3.3-70b-versatile`), OpenAI (`gpt-4o-mini`), Heuristic NLP fallback |
| **Cloud & DevOps** | AWS EC2 (PM2, Nginx reverse proxy), AWS S3 (file uploads), Docker |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* **Node.js** (v18+)
* **npm** (v9+)

### 1. Start the Backend API Server
```bash
cd server
npm install
npm start
```
> **Note**: If `MONGODB_URI` is not set in `.env`, the server automatically initializes an embedded in-memory MongoDB instance. No local database installation is required!

### 2. Start the Frontend Client
In a separate terminal window:
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Ready-to-Test Demo Credentials

You can test all roles immediately using pre-configured demo accounts:

| Role | Email | Password | Features to Test |
|---|---|---|---|
| **Job Seeker** | `alex.rivera@dev.com` | `seekerpassword123` | AI Recommendations, ATS Resume Analyzer, Apply to Jobs, Career Coach |
| **Recruiter** | `sarah.jenkins@techcorp.io` | `recruiterpassword123` | Post Jobs, Review Candidates ranked by AI, Generate Interview Questions, Chat |
| **Admin** | `admin@aijobportal.com` | `adminpassword123` | System Analytics, User Moderation, AI Telemetry Logs |

To seed or reset test data at any time:
```bash
cd server
node src/seed.js
```

---

## 🧠 AI Configuration (Groq / OpenAI)

Configure your preferred LLM provider in `server/.env`:

### Option A: Groq (Recommended - High Speed & Generous Free Tier)
```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key_here
AI_MODEL=llama-3.3-70b-versatile
```

### Option B: OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_api_key_here
AI_MODEL=gpt-4o-mini
```

> **Built-in Fallback**: If no API key is provided, the platform automatically utilizes its high-precision algorithmic heuristic engine so all 5 AI features remain 100% operational offline.

---

## ☁️ Cloud Deployment Guide (AWS)

### 1. AWS S3 (Resume & Avatar Storage)
1. Create an S3 Bucket in AWS Console (e.g. `my-ai-job-portal-resumes`).
2. Attach IAM policy granting `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject`.
3. Set the following variables in `server/.env`:
   ```env
   STORAGE_TYPE=s3
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET_NAME=my-ai-job-portal-resumes
   ```

### 2. AWS EC2 (Backend & Frontend Hosting)
1. Launch an **Ubuntu 22.04 LTS** EC2 instance (t3.small or t3.medium recommended).
2. Open Security Group inbound ports: `80` (HTTP), `443` (HTTPS), `22` (SSH).
3. Connect via SSH and install Node.js & PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx git
   sudo npm install -g pm2
   ```
4. Clone the repository and configure PM2:
   ```bash
   git clone <repo_url> /var/www/ai-job-portal
   cd /var/www/ai-job-portal/server
   npm ci --production
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```
5. Build the React Frontend:
   ```bash
   cd /var/www/ai-job-portal/client
   npm ci
   npm run build
   ```
6. Copy Nginx configuration:
   ```bash
   sudo cp /var/www/ai-job-portal/server/nginx.conf.example /etc/nginx/sites-available/ai-job-portal
   sudo ln -s /etc/nginx/sites-available/ai-job-portal /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🐳 Docker Deployment

Run the complete platform (Server, Client, and MongoDB) with a single command:
```bash
docker-compose up --build
```
* **Frontend**: `http://localhost`
* **Backend API**: `http://localhost:5000`

---

## 🧪 Automated Testing

Run the integration test suite:
```bash
cd server
npm test
```
Verifies Authentication, RBAC, 2FA OTP, Job Search, AI Resume Screening, Recommendations, and Application pipelines.
