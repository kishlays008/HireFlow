import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronRight, Search, Users } from 'lucide-react';
import { selectApplications } from '../../store/slices/applicationsSlice';
import { selectJobs } from '../../store/slices/jobsSlice';
import { ALL_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import { Avatar, cx, EmptyState, PageHeader, Select, Spinner, StatusBadge } from '../../components/ui';

export default function Applicants() {
  const apps = useSelector(selectApplications);
  const jobs = useSelector(selectJobs);
  const loading = useSelector((s) => s.applications.status !== 'succeeded');
  // Filters live in the URL so dashboard/job links can deep-link into them.
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const jobId = params.get('job') || '';
  const q = params.get('q') || '';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  if (loading) return <Spinner />;

  const jobById = Object.fromEntries(jobs.map((j) => [j.id, j]));
  const byJob = jobId ? apps.filter((a) => a.jobId === jobId) : apps;
  const statusCounts = byJob.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {});
  const query = q.trim().toLowerCase();
  const visible = byJob.filter(
    (a) =>
      (!status || a.status === status) &&
      (!query || a.fullName.toLowerCase().includes(query) || a.email.toLowerCase().includes(query)),
  );

  return (
    <div>
      <PageHeader
        title="Applicants"
        description={jobId ? `Showing applicants for ${jobById[jobId]?.title}` : 'Review candidates across all jobs.'}
      />

      <div className="card mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name or email…" value={q} onChange={(e) => setParam('q', e.target.value)} />
          </div>
          <Select
            className="sm:w-72"
            value={jobId}
            onChange={(e) => setParam('job', e.target.value)}
            placeholder="All jobs"
            options={jobs.map((j) => ({ value: j.id, label: j.title }))}
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {['', ...ALL_STATUSES].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setParam('status', s)}
              className={cx(
                'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium',
                status === s ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100',
              )}
            >
              {s || 'All'} <span className="ml-1 opacity-60">{s ? statusCounts[s] || 0 : byJob.length}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Users} title="No applicants found" description="Try changing the filters above." />
      ) : (
        <div className="card divide-y divide-slate-100">
          {visible.map((a) => {
            const job = jobById[a.jobId];
            const scheduled = a.rounds.filter((r) => r.status === 'Scheduled').length;
            return (
              <Link key={a.id} to={`/hr/applicants/${a.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                <Avatar name={a.fullName} />
                <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-3 sm:items-center sm:gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{a.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{a.email}</p>
                  </div>
                  <div className="min-w-0 text-sm">
                    <p className="truncate text-slate-700">{job?.title}</p>
                    <p className="text-xs text-slate-500">
                      {a.experienceYears} yrs exp · Applied {formatDate(a.appliedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    {scheduled > 0 && (
                      <span className="text-xs font-medium text-violet-600">{scheduled} round{scheduled > 1 ? 's' : ''} scheduled</span>
                    )}
                    <StatusBadge status={a.status} />
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-slate-400" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
