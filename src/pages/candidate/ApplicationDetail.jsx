import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, PartyPopper } from 'lucide-react';
import { selectApplicationById } from '../../store/slices/applicationsSlice';
import { selectJobById } from '../../store/slices/jobsSlice';
import { selectUser } from '../../store/slices/authSlice';
import { formatDate, formatDateTime } from '../../utils/format';
import StatusTracker from '../../components/StatusTracker';
import ResumeLink from '../../components/ResumeLink';
import RoundsList from '../../components/RoundsList';
import { Spinner, StatusBadge } from '../../components/ui';
import NotFound from '../NotFound';

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const user = useSelector(selectUser);
  const app = useSelector(selectApplicationById(applicationId));
  const job = useSelector(selectJobById(app?.jobId));
  const loaded = useSelector((s) => s.applications.status === 'succeeded');

  if (!app) return loaded ? <NotFound /> : <Spinner />;
  // Candidates may only view their own applications.
  if (app.candidateId !== user.uid) return <NotFound />;

  const details = [
    ['Email', app.email],
    ['Phone', app.phone],
    ['Experience', `${app.experienceYears} years`],
    ['Current company', app.currentCompany || '—'],
    ['Expected CTC', app.expectedCtc ? `₹${app.expectedCtc} LPA` : '—'],
    ['Notice period', app.noticePeriod],
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/candidate/applications" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> My applications
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{job?.title || 'Job removed'}</h1>
            <p className="text-sm text-slate-500">
              {job?.department} · {job?.location} · Applied {formatDate(app.appliedAt)}
            </p>
          </div>
          <StatusBadge status={app.status} className="text-sm" />
        </div>
        <div className="mt-8">
          <StatusTracker status={app.status} history={app.history} />
        </div>
        {app.status === 'Hired' && (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <PartyPopper className="size-6" />
            <p className="text-sm font-medium">Congratulations! You've been selected for this role. HR will reach out with next steps.</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-5">
        <div className="space-y-6 md:col-span-3">
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Interview rounds</h2>
            <RoundsList rounds={app.rounds} />
          </div>
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Timeline</h2>
            <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
              {[...app.history].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-brand-500 ring-4 ring-white" />
                  <p className="text-sm font-medium text-slate-900">Moved to {h.status}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="card h-fit p-6 md:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-900">Your submission</h2>
          <dl className="space-y-3 text-sm">
            {details.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5">
            <ResumeLink application={app} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
