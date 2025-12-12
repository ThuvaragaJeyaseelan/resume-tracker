# ATS Resume Tracker

AI-powered Applicant Tracking System with recruiter authentication, job posting management, public job board, and AI-powered candidate matching.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20+%20TypeScript%20+%20Tailwind-61DAFB?logo=react)
![Backend](https://img.shields.io/badge/Backend-Django%20+%20DRF-092E20?logo=django)
![Database](<https://img.shields.io/badge/Database-Supabase%20(PostgreSQL)-3ECF8E?logo=supabase>)
![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.0-4285F4?logo=google)

## Live Demo

🚀 **[https://resume-tracker-mu.vercel.app/](https://resume-tracker-mu.vercel.app/)**

**Test Credentials for Recruiters:**

- Email: `john99@gmail.com`
- Password: `john#932`

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

## Design Decisions

### Technology Choices

- **Django**: Chosen for rapid development, excellent ORM abstraction, and strong ecosystem. Preferred over Golang/Rust for faster prototyping within assignment timeframe.
- **React + TypeScript**: Type safety reduces bugs, React's component model scales well. TypeScript catches errors at compile time.
- **Supabase**: Managed PostgreSQL with instant APIs, reduces infrastructure overhead. Real-time capabilities for future features.
- **Gemini 2.0 Flash**: Fast, cost-effective, excellent at structured resume parsing. Multimodal capabilities for future enhancements.
- **Vercel**: Zero-config deployment, serverless functions, automatic HTTPS. Fast iteration cycles.

### Architecture Decisions

- **No candidate authentication**: Reduces friction in application process. Email-based tracking is sufficient.
- **JWT tokens**: Stateless auth, scales horizontally, no session management needed.
- **Modular Django apps**: Separation of concerns (auth/jobs/applicants/core) enables independent testing and future scaling.
- **AI-first scoring**: Addresses core problem - sorting hundreds of applicants. Manual review would bottleneck recruiters.

### UX Priorities

- **AI scoring front and center**: Recruiters see relevancy scores immediately, not buried in details.
- **Public job board**: Candidates browse without signup, mimicking real job boards.
- **Status pipeline**: Visual tracking of candidates through hiring stages.

## Assumptions

- **Scale**: Designed for hundreds of applications per job
- **Resume format**: Candidates submit standard formats (PDF/DOC). No LinkedIn imports or profile builders.
- **Security**: JWT auth sufficient for MVP.
- **Storage**: Local file storage for development. Production would use Supabase Storage or S3.
- **Workflow**: Recruiters can login, post job listings, receive candidates, assess candidates
- **Compliance**: GDPR/data retention not implemented (would need in production).
- **Interview scheduling**: Out of scope. Recruiters contact candidates externally.
- **Notifications**: Email notifications not included

## AI Tools Used

- **Cursor AI**: Code generation, refactoring, debugging. Helped scaffold Django apps, React components, and API endpoints.
- **ChatGPT**: Architecture decisions, debugging complex issues, optimizing AI prompts for resume parsing.

## Feature Prioritization

### Why These Features?

**High Priority (Implemented):**

- ✅ AI-powered candidate scoring - Core value proposition for sorting hundreds of applicants
- ✅ Job posting CRUD - Basic requirement for any ATS
- ✅ Public job board - Enables candidate applications
- ✅ Resume upload & parsing - Automates data entry
- ✅ Status tracking - Essential for managing hiring pipeline

**Medium Priority (Deferred):**

- ⏳ Email notifications - Adds complexity, can be done manually initially
- ⏳ Advanced filters - Basic search is sufficient for MVP
- ⏳ Team collaboration - Solo recruiter workflow is simpler

**Low Priority (Out of Scope):**

- ❌ Interview scheduling - Integrate Calendly/external tools
- ❌ Offer management - Too complex for timeframe
- ❌ Analytics dashboard - Nice-to-have, not essential

### With More Time, I Would Add:

1. **Email notifications** - Automated updates to candidates and recruiters
2. **Bulk actions** - Reject/shortlist multiple candidates at once
3. **Resume storage in cloud** - Supabase Storage integration instead of local files
4. **Advanced search** - Filter by skills, experience years, location
5. **Team features** - Share notes, assign reviewers, collaborative hiring
6. **Interview scheduling** - Calendar integration for booking interviews
7. **Analytics dashboard** - Hiring funnel metrics, time-to-hire, source tracking
8. **Export functionality** - Download applicant lists as CSV/Excel
9. **Custom job application forms** - Per-job screening questions
10. **Mobile responsiveness** - Optimize UI for mobile recruiters

## Known Limitations

- **File storage**: Resumes stored locally on backend server. Won't persist on Vercel serverless (needs cloud storage).
- **Rate limits**: Gemini API has rate limits. Bulk resume analysis may fail with too many concurrent uploads.
- **No real-time updates**: Dashboard doesn't auto-refresh when new applicants arrive. Requires manual refresh.
- **Single recruiter context**: No multi-tenancy isolation beyond recruiter_id foreign keys.
- **Resume parsing accuracy**: AI may misinterpret non-standard resume formats or creative designs.
- **No resume preview**: Recruiters must download to view. In-browser PDF viewer would improve UX.
- **Static file serving**: Django collectstatic not configured for Vercel. Static files served differently in production.

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

| Layer        | Technology                               |
| ------------ | ---------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend**  | Django 5, Django REST Framework          |
| **Database** | Supabase (PostgreSQL)                    |
| **AI**       | Google Gemini 2.0 Flash                  |
| **Auth**     | JWT tokens, bcrypt password hashing      |

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

| Method  | Endpoint            | Description                         |
| ------- | ------------------- | ----------------------------------- |
| `POST`  | `/api/auth/signup`  | Create recruiter account            |
| `POST`  | `/api/auth/login`   | Authenticate recruiter              |
| `GET`   | `/api/auth/profile` | Get current profile (auth required) |
| `PATCH` | `/api/auth/profile` | Update profile (auth required)      |
| `POST`  | `/api/auth/refresh` | Refresh JWT token                   |

### Jobs (Authenticated)

| Method   | Endpoint                     | Description           |
| -------- | ---------------------------- | --------------------- |
| `GET`    | `/api/jobs/`                 | List recruiter's jobs |
| `POST`   | `/api/jobs/`                 | Create new job        |
| `GET`    | `/api/jobs/{id}/`            | Get job details       |
| `PATCH`  | `/api/jobs/{id}/`            | Update job            |
| `DELETE` | `/api/jobs/{id}/`            | Delete job            |
| `GET`    | `/api/jobs/{id}/applicants/` | List job applicants   |
| `GET`    | `/api/jobs/stats/`           | Get job statistics    |

### Jobs (Public)

| Method | Endpoint                 | Description        |
| ------ | ------------------------ | ------------------ |
| `GET`  | `/api/jobs/public/`      | List active jobs   |
| `GET`  | `/api/jobs/public/{id}/` | Get job details    |
| `GET`  | `/api/jobs/filters/`     | Get filter options |
| `POST` | `/api/jobs/{id}/apply/`  | Submit application |

### Applicants (Authenticated)

| Method   | Endpoint                       | Description           |
| -------- | ------------------------------ | --------------------- |
| `GET`    | `/api/applicants/`             | List all applicants   |
| `GET`    | `/api/applicants/{id}/`        | Get applicant details |
| `PATCH`  | `/api/applicants/{id}/`        | Update status/notes   |
| `DELETE` | `/api/applicants/{id}/`        | Delete applicant      |
| `GET`    | `/api/applicants/{id}/resume/` | Download resume       |
| `GET`    | `/api/applicants/stats/`       | Get statistics        |

## Scoring Guidelines

### Job Relevancy Score (0-100)

| Score  | Rating          | Meaning                                       |
| ------ | --------------- | --------------------------------------------- |
| 90-100 | Excellent Match | Has most required skills, relevant experience |
| 70-89  | Good Match      | Many required skills, some gaps fillable      |
| 50-69  | Partial Match   | Some relevant skills, significant gaps        |
| 30-49  | Weak Match      | Limited relevant experience                   |
| 0-29   | Poor Match      | Background doesn't align with requirements    |

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
