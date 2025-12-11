# ATS Resume Tracker

AI-powered Applicant Tracking System for recruiters to efficiently manage and prioritize candidate resumes with minimal reader fatigue.

## Features

- **AI-Powered Resume Analysis**: Upload resumes (PDF, DOC, DOCX, TXT) and get instant AI analysis using Google Gemini
- **Smart Prioritization**: Automatic scoring (0-100) based on qualifications, experience, and achievements
- **Key Insights Extraction**: Skills, experience summary, education, highlights, and potential concerns
- **Status Management**: Track candidates through New, Reviewed, Shortlisted, Rejected, Hired stages
- **Filtering & Sorting**: Sort by priority score or date, filter by status
- **Dashboard Overview**: Quick stats on total applicants, average score, and status breakdown

## Architecture

```
/ATS
├── backend/                    # Express + TypeScript + Prisma
│   ├── src/
│   │   ├── config/            # Environment configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic
│   │   │   ├── gemini.service.ts    # AI resume analysis
│   │   │   └── applicant.service.ts # Database operations
│   │   ├── types/             # TypeScript type definitions
│   │   └── index.ts           # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── uploads/               # Uploaded resume storage
│
├── frontend/                   # React + TypeScript + Vite
│   └── src/
│       ├── components/
│       │   ├── atoms/         # Basic UI: Button, Badge, ScoreBar
│       │   ├── molecules/     # Combined: FileUpload, StatusBadge
│       │   └── organisms/     # Complex: ApplicantCard, ApplicantList
│       ├── services/          # API client
│       ├── types/             # TypeScript types
│       └── App.tsx            # Main dashboard
│
└── README.md
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Express 5, TypeScript, Node.js |
| Database | SQLite (via Prisma ORM) |
| AI | Google Gemini 2.0 Flash |
| Design Pattern | Atomic Design (atoms, molecules, organisms) |

### Database Schema

```
JobPosting (optional)
├── id, title, department, description, requirements, status

Applicant
├── id, name, email, phone
├── resumeFilePath, resumeText
├── priorityScore (0-100)
├── summary, keySkills[], experience, education
├── highlights[], concerns[]
├── status (new/reviewed/shortlisted/rejected/hired)
└── jobPostingId (FK)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone and install dependencies**
   ```bash
   cd /home/mortalis/Desktop/ATS

   # Install backend
   cd backend && npm install

   # Install frontend
   cd ../frontend && npm install
   ```

2. **Configure environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Initialize database**
   ```bash
   cd backend
   npx prisma db push
   ```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd /home/mortalis/Desktop/ATS/backend
npm run dev
# or: npx ts-node src/index.ts
```

**Terminal 2 - Frontend:**
```bash
cd /home/mortalis/Desktop/ATS/frontend
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applicants/upload` | Upload and analyze resume |
| GET | `/api/applicants` | List all applicants (supports sorting/filtering) |
| GET | `/api/applicants/:id` | Get single applicant details |
| PATCH | `/api/applicants/:id` | Update status/notes |
| DELETE | `/api/applicants/:id` | Delete applicant |
| GET | `/api/applicants/stats` | Get dashboard statistics |
| GET | `/api/applicants/:id/resume` | Download original resume |
| GET | `/api/health` | Health check |

### Query Parameters (GET /api/applicants)

- `sortBy`: `priorityScore` (default) or `createdAt`
- `order`: `desc` (default) or `asc`
- `status`: Filter by status (new, reviewed, shortlisted, rejected, hired)

## Priority Scoring Guidelines

| Score | Rating | Criteria |
|-------|--------|----------|
| 90-100 | Excellent | Exceptional candidate with strong relevant experience |
| 70-89 | Good | Strong candidate with good experience |
| 50-69 | Average | Meets basic requirements |
| 30-49 | Below Average | Missing key qualifications |
| 0-29 | Poor Fit | Major gaps or concerns |

## Future Enhancements

- [ ] Job posting management with requirement matching
- [ ] Bulk resume upload
- [ ] Email notifications
- [ ] Interview scheduling
- [ ] Resume comparison view
- [ ] Export to CSV/PDF
- [ ] User authentication
- [ ] PostgreSQL for production

## License

ISC
