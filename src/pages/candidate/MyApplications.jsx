import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronRight, FileSearch } from 'lucide-react';
import { selectMyApplications } from '../../store/slices/applicationsSlice';
import { selectJobs } from '../../store/slices/jobsSlice';
import { ALL_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import StatusTracker from '../../components/StatusTracker';
import { Button, cx, EmptyState, PageHeader, Spinner, StatusBadge } from '../../components/ui';

export default function MyApplications() {
  const apps = useSelector(selectMyApplications);
  const jobs = useSelector(selectJobs);
  const loading = useSelector((s) => s.applications.status !== 'succeeded');
  const [tab, setTab] = useState('All');
  const jobById = Object.fromEntries(jobs.map((j) => [j.id, j]));

  const counts = apps.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {});
  const visible = tab === 'All' ? apps : apps.filter((a) => a.status === tab);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="My applications" description="Track the progress of every job you've applied for." />

      {apps.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No applications yet"
          description="When you apply for a job, you'll be able to track its status here."
          action={<Link to="/jobs"><Button>Browse jobs</Button></Link>}
        />
      ) : (
        <>
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {['All', ...ALL_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={cx(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                  tab === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
                )}
              >
                {s} <span className="ml-1 opacity-60">{s === 'All' ? apps.length : counts[s] || 0}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState icon={FileSearch} title={`No ${tab.toLowerCase()} applications`} />
          ) : (
            <div className="space-y-4">
              {visible.map((app) => {
                const job = jobById[app.jobId];
                const nextRound = app.rounds.find((r) => r.status === 'Scheduled');
                return (
                  <Link
                    key={app.id}
                    to={`/candidate/applications/${app.id}`}
                    className="card block p-5 transition hover:border-brand-200 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{job?.title || 'Job removed'}</h3>
                        <p className="text-sm text-slate-500">
                          {job?.department} · {job?.location} · Applied {formatDate(app.appliedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={app.status} />
                        <ChevronRight className="size-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="mt-5">
                      <StatusTracker status={app.status} history={app.history} compact />
                    </div>
                    {nextRound && (
                      <p className="mt-4 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-700">
                        Upcoming: <span className="font-semibold">{nextRound.name}</span> on {formatDate(nextRound.scheduledAt)}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
