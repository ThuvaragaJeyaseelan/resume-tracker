# ATS Resume Tracker

AI-powered Applicant Tracking System for recruiters to efficiently manage and prioritize candidate resumes with minimal reader fatigue.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-61DAFB?logo=react)
![Backend](https://img.shields.io/badge/Backend-Django%20+%20DRF-092E20?logo=django)
![Database](https://img.shields.io/badge/Database-Supabase%20(PostgreSQL)-3ECF8E?logo=supabase)
![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.0-4285F4?logo=google)

## Features

- **AI-Powered Resume Analysis**: Upload resumes (PDF, DOC, DOCX, TXT) and get instant AI analysis using Google Gemini 2.0 Flash
- **Smart Prioritization**: Automatic scoring (0-100) based on qualifications, experience, and achievements
- **Key Insights Extraction**: Skills, experience summary, education, highlights, and potential concerns
- **Status Management**: Track candidates through New, Reviewed, Shortlisted, Rejected, Hired stages
- **Filtering & Sorting**: Sort by priority score or date, filter by status
- **Dashboard Overview**: Quick stats on total applicants, average score, and status breakdown
- **Standardized API Responses**: Consistent error handling and response structure across all endpoints

## Architecture

```
/resume-tracker
├── backend/                        # Django + Django REST Framework
│   ├── manage.py                   # Django management script
│   ├── requirements.txt            # Python dependencies
│   ├── env.example                 # Environment variables template
│   ├── ats_backend/                # Django project settings
│   │   ├── settings.py             # Configuration (CORS, DRF, Supabase)
│   │   ├── urls.py                 # Root URL routing
│   │   └── wsgi.py / asgi.py       # WSGI/ASGI entry points
│   ├── core/                       # Shared utilities
│   │   ├── responses.py            # Standardized API response builders
│   │   ├── supabase.py             # Supabase client singleton
│   │   ├── middleware.py           # Request ID middleware
│   │   └── exceptions.py           # Custom exception handlers
│   ├── applicants/                 # Applicant management app
│   │   ├── views.py                # API endpoints
│   │   ├── services.py             # Supabase database operations
│   │   ├── ai_service.py           # Gemini AI resume analysis
│   │   ├── models.py               # Data models (dataclasses)
│   │   ├── serializers.py          # DRF serializers
│   │   └── urls.py                 # Applicant URL routing
│   ├── supabase/
│   │   └── schema.sql              # Database schema
│   └── uploads/                    # Resume file storage
│
├── frontend/                       # React + TypeScript + Vite
│   └── src/
│       ├── components/
│       │   ├── atoms/              # Button, Badge, ScoreBar
│       │   ├── molecules/          # FileUpload, StatusBadge
│       │   └── organisms/          # ApplicantCard, ApplicantList
│       ├── services/
│       │   └── api.ts              # API client with error handling
│       ├── types/
│       │   └── index.ts            # TypeScript types + API response types
│       └── App.tsx                 # Main dashboard
│
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Backend** | Django 5, Django REST Framework |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Gemini 2.0 Flash |
| **Design Pattern** | Atomic Design (atoms, molecules, organisms) |

## Design Patterns

### Backend Architecture

1. **Service Layer Pattern**: Business logic separated from views
   - `services.py` - Database operations via Supabase
   - `ai_service.py` - AI integration with Gemini
   - `views.py` - HTTP request/response handling

2. **Standardized API Responses**: All endpoints return consistent structure
   ```json
   {
     "success": true,
     "message": "Applicants retrieved successfully",
     "data": { "applicants": [...] },
     "meta": {
       "timestamp": "2024-01-15T10:30:00Z",
       "requestId": "uuid-here"
     },
     "errors": null
   }
   ```

3. **Singleton Pattern**: Supabase client initialized once and reused

4. **Middleware**: Request ID tracking for debugging and logging

### Frontend Architecture

1. **Atomic Design Pattern**:
   - **Atoms**: Basic UI components (`Button`, `Badge`, `ScoreBar`)
   - **Molecules**: Combined components (`FileUpload`, `StatusBadge`)
   - **Organisms**: Complex features (`ApplicantCard`, `ApplicantList`)

2. **Type-Safe API Client**: Custom error handling with `ApiResponseError` class

3. **State Management**: React hooks (`useState`, `useEffect`, `useCallback`)

## Database Schema

```sql
job_postings
├── id (UUID, primary key)
├── title, department, description, requirements
├── status (active/closed/draft)
└── created_at, updated_at

applicants
├── id (UUID, primary key)
├── name, email, phone
├── resume_file_path, resume_text
├── priority_score (0-100)
├── summary, key_skills (JSONB), experience, education
├── highlights (JSONB), concerns (JSONB)
├── status (new/reviewed/shortlisted/rejected/hired)
├── notes
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
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver 3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Usage Guide

### Uploading Resumes

1. Click the upload area or drag-and-drop a resume file
2. Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
3. Click "Upload & Analyze Resume"
4. AI will automatically:
   - Extract candidate information (name, email, phone)
   - Generate a priority score (0-100)
   - Create a professional summary
   - List key skills and qualifications
   - Identify highlights and potential concerns

### Managing Applicants

1. **View Details**: Click on any applicant card to expand
2. **Change Status**: Use the status dropdown to update:
   - `New` → `Reviewed` → `Shortlisted` → `Hired`
   - Or mark as `Rejected` at any stage
3. **Download Resume**: Click "Download Resume" to get the original file
4. **Delete**: Remove applicant and their resume permanently

### Filtering & Sorting

- **Sort by Score**: Highest priority candidates first
- **Sort by Date**: Most recent uploads first
- **Filter by Status**: View only candidates in a specific stage

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/applicants/upload` | Upload and analyze resume |
| `GET` | `/api/applicants/` | List all applicants |
| `GET` | `/api/applicants/stats/` | Get dashboard statistics |
| `GET` | `/api/applicants/{id}/` | Get single applicant details |
| `PATCH` | `/api/applicants/{id}/` | Update status/notes |
| `DELETE` | `/api/applicants/{id}/` | Delete applicant |
| `GET` | `/api/applicants/{id}/resume/` | Download original resume |
| `GET` | `/api/health/` | Health check |

### Query Parameters (GET /api/applicants/)

| Parameter | Values | Default |
|-----------|--------|---------|
| `sortBy` | `priorityScore`, `createdAt` | `priorityScore` |
| `order` | `asc`, `desc` | `desc` |
| `status` | `new`, `reviewed`, `shortlisted`, `rejected`, `hired` | (all) |

### Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": "Human-readable message",
  "data": { ... },
  "meta": {
    "timestamp": "ISO 8601 timestamp",
    "requestId": "UUID for tracking"
  },
  "errors": [
    { "field": "email", "message": "Invalid format", "code": "VALIDATION_ERROR" }
  ]
}
```

## Priority Scoring Guidelines

| Score | Rating | Criteria |
|-------|--------|----------|
| 90-100 | Excellent | Exceptional candidate with strong relevant experience |
| 70-89 | Good | Strong candidate with good experience |
| 50-69 | Average | Meets basic requirements |
| 30-49 | Below Average | Missing key qualifications |
| 0-29 | Poor Fit | Major gaps or concerns |

## Project Structure Details

### Core Module (`backend/core/`)

| File | Purpose |
|------|---------|
| `responses.py` | Standardized success/error response builders |
| `supabase.py` | Supabase client singleton |
| `middleware.py` | Request ID generation for tracking |
| `exceptions.py` | Custom exception handlers for DRF |

### Applicants App (`backend/applicants/`)

| File | Purpose |
|------|---------|
| `views.py` | API endpoint handlers (CRUD operations) |
| `services.py` | Database operations via Supabase |
| `ai_service.py` | Gemini AI resume analysis |
| `models.py` | Dataclass definitions |
| `serializers.py` | Request validation |
| `urls.py` | URL routing |

## Future Enhancements

- [ ] Job posting management with requirement matching
- [ ] Bulk resume upload
- [ ] Email notifications
- [ ] Interview scheduling
- [ ] Resume comparison view
- [ ] Export to CSV/PDF
- [ ] User authentication with Supabase Auth
- [ ] Resume storage in Supabase Storage

## Troubleshooting

### Common Issues

1. **"Supabase credentials not configured"**
   - Ensure `.env` file exists with `SUPABASE_URL` and `SUPABASE_KEY`

2. **"Failed to analyze resume"**
   - Check your `GEMINI_API_KEY` is valid
   - Ensure the file is not corrupted

3. **CORS errors in browser**
   - Backend must be running on port 3001
   - Frontend must be running on port 5173

4. **File upload fails**
   - Max file size is 10MB
   - Only PDF, DOC, DOCX, TXT are supported

## License

ISC
