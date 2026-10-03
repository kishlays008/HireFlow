import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, CalendarCheck, FileCheck2, Search, ShieldCheck, Users, Workflow } from 'lucide-react';
import { selectUser } from '../store/slices/authSlice';
import { homeFor } from '../routes/ProtectedRoute';
import { Button } from '../components/ui';
import { PIPELINE } from '../utils/constants';

const FEATURES = [
  { icon: Search, title: 'Smart job search', text: 'Filter roles by department, location, work mode, type and experience.' },
  { icon: FileCheck2, title: 'Validated applications', text: 'Clean forms with instant validation and PDF resume upload.' },
  { icon: Workflow, title: 'Live status tracking', text: 'Candidates see every step from Applied to Hired in real time.' },
  { icon: Users, title: 'Applicant review', text: 'HR teams review profiles, resumes and notes in one place.' },
  { icon: CalendarCheck, title: 'Interview rounds', text: 'Assign interviewers, schedule rounds and capture feedback.' },
  { icon: ShieldCheck, title: 'Role-based access', text: 'Separate, protected panels for candidates and HR admins.' },
];

export default function Landing() {
  const user = useSelector(selectUser);
  return (
    <div className="-mt-8">
      <section className="relative overflow-hidden py-20 text-center">
        <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(ellipse_at_top,var(--color-brand-100),transparent_65%)]" />
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
          Smart HR Interview & Hiring Portal
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Hiring that <span className="text-brand-600">flows</span>, from first click to offer.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Candidates discover and apply for jobs in minutes. HR teams post roles, review applicants and run interview
          rounds, all from one simple dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {user ? (
            <Link to={homeFor(user)}>
              <Button size="lg">
                Go to {user.role === 'hr' ? 'dashboard' : 'jobs'} <ArrowRight className="size-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/jobs">
                <Button size="lg">
                  Browse jobs <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="secondary">
                  I'm hiring
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-sm font-semibold">
          {PIPELINE.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className="rounded-full bg-white px-4 py-1.5 text-slate-700 shadow-sm ring-1 ring-slate-200">{s}</span>
              {i < PIPELINE.length - 1 && <ArrowRight className="size-4 text-slate-400" />}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-5 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-600">
              <Icon className="size-5" />
            </div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
