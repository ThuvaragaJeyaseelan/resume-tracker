# ATS Resume Tracker

AI-powered Applicant Tracking System with recruiter authentication, job posting management, public job board, and AI-powered candidate matching.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20+%20TypeScript%20+%20Tailwind-61DAFB?logo=react)
![Backend](https://img.shields.io/badge/Backend-Django%20+%20DRF-092E20?logo=django)
![Database](https://img.shields.io/badge/Database-Supabase%20(PostgreSQL)-3ECF8E?logo=supabase)
![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.0-4285F4?logo=google)

## Features

### For Recruiters
- **Authentication**: Secure email/password signup and login with JWT tokens
- **Job Management**: Create, edit, and manage job postings with draft/active/closed status
- **AI-Powered Matching**: View candidates ranked by job-specific relevancy score
- **Dashboard**: Overview of jobs, applicants, and hiring pipeline
- **Applicant Management**: Review, shortlist, reject, or hire candidates
- **Resume Downloads**: Download original resume files

### For Candidates
- **Public Job Board**: Browse active job listings with search and filters
- **Easy Application**: Apply to jobs with resume upload (no account needed)
- **AI Analysis**: Automatic skill matching against job requirements

### AI Features
- **Resume Analysis**: Extract skills, experience, education, and contact info
- **Job Matching**: Score candidates (0-100) based on job requirements
- **Match Insights**: Identify matching skills and skill gaps
- **Smart Prioritization**: Rank applicants by relevancy

## Architecture

```
/resume-tracker
├── backend/                        # Django + Django REST Framework
│   ├── ats_backend/                # Django project settings
│   │   ├── settings.py             # Configuration
│   │   └── urls.py                 # Root URL routing
│   ├── auth/                       # Authentication module
│   │   ├── views.py                # Login, signup, profile endpoints
│   │   ├── services.py             # Auth business logic (JWT, bcrypt)
│   │   ├── middleware.py           # JWT token validation
│   │   └── decorators.py           # @require_auth decorator
│   ├── jobs/                       # Job posting module
│   │   ├── views.py                # Job CRUD + public endpoints
│   │   ├── services.py             # Job database operations
│   │   └── urls.py                 # Job routing
│   ├── applicants/                 # Applicant management
│   │   ├── views.py                # Applicant endpoints + job applications
│   │   ├── services.py             # Database operations
│   │   └── ai_service.py           # Gemini AI resume + job matching
│   ├── core/                       # Shared utilities
│   │   ├── responses.py            # Standardized API responses
│   │   ├── supabase.py             # Supabase client
│   │   └── middleware.py           # Request ID tracking
│   └── supabase/
│       └── schema.sql              # Database schema
│
├── frontend/                       # React + TypeScript + Vite + Tailwind
│   └── src/
│       ├── contexts/
│       │   └── AuthContext.tsx     # Authentication state management
│       ├── pages/
│       │   ├── auth/               # Login, Signup pages
│       │   ├── recruiter/          # Dashboard, Jobs, Applicants
│       │   └── public/             # Job Board, Job Details
│       ├── components/
│       │   ├── layout/             # Navbar
│       │   ├── auth/               # ProtectedRoute
│       │   └── ui/                 # LoadingSpinner, Modal, Toast
│       ├── services/
│       │   └── api.ts              # API client with auth interceptors
│       └── types/
│           └── index.ts            # TypeScript interfaces
│
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Django 5, Django REST Framework |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Gemini 2.0 Flash |
| **Auth** | JWT tokens, bcrypt password hashing |

## Database Schema

```sql
recruiters
├── id (UUID, primary key)
├── email (unique, not null)
├── password_hash
├── full_name
├── company_name
└── created_at, updated_at

job_postings
├── id (UUID, primary key)
├── recruiter_id (FK to recruiters)
├── title, department, description, requirements
├── location, employment_type, salary_range
├── status (draft/active/closed)
└── created_at, updated_at

applicants
├── id (UUID, primary key)
├── name, email, phone
├── resume_file_path
├── priority_score (0-100, general score)
├── summary, key_skills, experience, education
├── highlights, concerns
├── job_relevancy_score (0-100, job-specific)
├── job_match_summary
├── skill_matches, skill_gaps
├── status (new/reviewed/shortlisted/rejected/hired)
├── job_posting_id (FK)
└── created_at, updated_at
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn
- Supabase account ([Sign up free](https://supabase.com))
- Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### 1. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `backend/supabase/schema.sql` and run it
4. Go to **Settings > API** and note your:
   - Project URL (e.g., `https://xxx.supabase.co`)
   - Anon/Public Key

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
```

Edit `.env` with your credentials:
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

GEMINI_API_KEY=your-gemini-api-key

JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION_HOURS=24
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## User Guide

### As a Recruiter

1. **Sign Up**: Create an account at `/signup`
2. **Create Job**: Navigate to Jobs → Create Job
   - Fill in title, description, requirements
   - Requirements are used for AI matching - be specific!
   - Save as draft or publish immediately
3. **View Applicants**: Click on a job to see all applicants
   - Sorted by Job Relevancy Score (highest first)
   - View matching skills and skill gaps
   - Download resumes, change status, add notes
4. **Manage Pipeline**: Use status to track candidates through hiring process

### As a Candidate

1. **Browse Jobs**: Visit the home page to see all active positions
2. **Apply**: Click a job → Apply Now
   - Fill in name, email, phone
   - Upload your resume (PDF, DOC, DOCX, TXT)
   - Submit and wait for contact from recruiter

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Create recruiter account |
| `POST` | `/api/auth/login` | Authenticate recruiter |
| `GET` | `/api/auth/profile` | Get current profile (auth required) |
| `PATCH` | `/api/auth/profile` | Update profile (auth required) |
| `POST` | `/api/auth/refresh` | Refresh JWT token |

### Jobs (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs/` | List recruiter's jobs |
| `POST` | `/api/jobs/` | Create new job |
| `GET` | `/api/jobs/{id}/` | Get job details |
| `PATCH` | `/api/jobs/{id}/` | Update job |
| `DELETE` | `/api/jobs/{id}/` | Delete job |
| `GET` | `/api/jobs/{id}/applicants/` | List job applicants |
| `GET` | `/api/jobs/stats/` | Get job statistics |

### Jobs (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs/public/` | List active jobs |
| `GET` | `/api/jobs/public/{id}/` | Get job details |
| `GET` | `/api/jobs/filters/` | Get filter options |
| `POST` | `/api/jobs/{id}/apply/` | Submit application |

### Applicants (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/applicants/` | List all applicants |
| `GET` | `/api/applicants/{id}/` | Get applicant details |
| `PATCH` | `/api/applicants/{id}/` | Update status/notes |
| `DELETE` | `/api/applicants/{id}/` | Delete applicant |
| `GET` | `/api/applicants/{id}/resume/` | Download resume |
| `GET` | `/api/applicants/stats/` | Get statistics |

## Scoring Guidelines

### Job Relevancy Score (0-100)
| Score | Rating | Meaning |
|-------|--------|---------|
| 90-100 | Excellent Match | Has most required skills, relevant experience |
| 70-89 | Good Match | Many required skills, some gaps fillable |
| 50-69 | Partial Match | Some relevant skills, significant gaps |
| 30-49 | Weak Match | Limited relevant experience |
| 0-29 | Poor Match | Background doesn't align with requirements |

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "uuid-for-tracking"
  },
  "errors": null
}
```

## Troubleshooting

### Common Issues

1. **"Supabase credentials not configured"**
   - Ensure `.env` file exists with `SUPABASE_URL` and `SUPABASE_KEY`

2. **"Failed to analyze resume"**
   - Check your `GEMINI_API_KEY` is valid
   - Ensure the file is not corrupted

3. **CORS errors in browser**
   - Backend must be running on port 8000
   - Frontend must be running on port 5173

4. **"Authentication required"**
   - Token may have expired (24h default)
   - Login again to get a new token

5. **File upload fails**
   - Max file size is 10MB
   - Only PDF, DOC, DOCX, TXT are supported

## License

ISC
