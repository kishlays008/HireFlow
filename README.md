# HireFlow — Smart HR Interview & Hiring Portal

A hiring portal with a **candidate panel** (browse, filter and apply for jobs, then track status) and an **HR admin panel** (post jobs, review applicants, assign interview rounds).

**Tech:** React 19 · Redux Toolkit · Tailwind CSS v4 · React Hook Form + Yup · React Router v7 · Firebase Auth · Vite

## Features

### Candidate
- Browse open jobs with search plus filters for department, location, work mode, job type and experience, with sorting
- Job detail page with requirements, salary, openings and deadline
- Validated application form (React Hook Form + Yup): phone, LinkedIn URL, experience, notice period, cover letter length, **PDF resume upload (PDF only, max 2 MB)** and a consent checkbox
- Status tracking through **Applied → Screening → Interview → Hired** (or Rejected) with a stepper, timeline and interview rounds

### HR Admin
- Dashboard with stats, a pipeline breakdown, recent applicants and upcoming interviews
- Post, edit, open/close and delete jobs (validated form, including a cross-field check on min/max salary)
- Review applicants: filter by job or status, search, view the resume PDF, read the cover letter and keep internal notes
- Move candidates through the pipeline or reject them
- Assign interview rounds (type, interviewer, date/time, mode, meeting link). The first round moves the candidate to *Interview* automatically. Rounds can be marked completed with feedback, cancelled or removed.

### Auth & routing
- Protected routes split by role (`ProtectedRoute role="candidate" | "hr"`). The wrong role is redirected; signed-out users go to login and come back to the page they wanted.
- Firebase Auth (email/password) when configured; otherwise a built-in **demo auth** so the app runs with zero setup.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Demo accounts (demo mode)
| Role | Email | Password |
|---|---|---|
| Candidate | candidate@hireflow.dev | demo1234 |
| HR Admin | hr@hireflow.dev | demo1234 |

The login page also has one-click buttons to fill these in. Use **Reset demo data** in the footer to restore the seed data.

### Enabling Firebase Auth
1. Create a Firebase project, add a **Web app**, and enable **Authentication → Email/Password**.
2. Copy `.env.example` to `.env` and paste your config values.
3. Restart `npm run dev`. The demo banner disappears and sign-up/login use Firebase.

## Project structure

```
src/
  firebase/config.js        Firebase init (only when env keys exist)
  services/
    authService.js          Firebase or demo auth behind one API
    db.js                   Async data layer (localStorage); swap for Firestore/API
    seed.js                 Demo jobs, applicants and users
  store/                    Redux Toolkit store + slices (auth, jobs, applications)
  validation/schemas.js     All Yup schemas
  routes/ProtectedRoute.jsx Role-based route guards
  components/               UI kit, Navbar, JobCard, StatusTracker, RoundsList, ResumeLink
  pages/
    candidate/              Jobs, JobDetail, ApplyJob, MyApplications, ApplicationDetail
    hr/                     Dashboard, ManageJobs, JobForm, Applicants, ApplicantDetail
```

## Notes
- Jobs, applications and resumes are stored in the browser's `localStorage`, so data does not sync across browsers or devices. `services/db.js` is fully async, so moving it to Firestore and Firebase Storage only requires changing that one file.
- Scripts: `npm run dev`, `npm run build`, `npm run preview`.
