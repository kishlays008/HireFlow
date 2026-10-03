import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BriefcaseBusiness, CalendarClock, FileUser, Plus, Trophy } from 'lucide-react';
import { selectJobs } from '../../store/slices/jobsSlice';
import { selectApplications } from '../../store/slices/applicationsSlice';
import { selectUser } from '../../store/slices/authSlice';
import { ALL_STATUSES } from '../../utils/constants';
import { formatDateTime, timeAgo } from '../../utils/format';
import { Avatar, Button, PageHeader, Spinner, StatusBadge } from '../../components/ui';

const BAR_COLORS = {
  Applied: 'bg-sky-500',
  Screening: 'bg-amber-500',
  Interview: 'bg-violet-500',
  Hired: 'bg-emerald-500',
  Rejected: 'bg-rose-400',
};

export default function Dashboard() {
  const user = useSelector(selectUser);
  const jobs = useSelector(selectJobs);
  const apps = useSelector(selectApplications);
  const loading = useSelector((s) => s.applications.status !== 'succeeded' || s.jobs.status !== 'succeeded');
  if (loading) return <Spinner />;

  const jobById = Object.fromEntries(jobs.map((j) => [j.id, j]));
  const counts = Object.fromEntries(ALL_STATUSES.map((s) => [s, apps.filter((a) => a.status === s).length]));
  const upcoming = apps
    .flatMap((a) => a.rounds.filter((r) => r.status === 'Scheduled').map((r) => ({ ...r, app: a })))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 5);

  const stats = [
    { label: 'Open jobs', value: jobs.filter((j) => j.status === 'Open').length, icon: BriefcaseBusiness, tone: 'text-brand-600 bg-brand-50' },
    { label: 'Total applicants', value: apps.length, icon: FileUser, tone: 'text-sky-600 bg-sky-50' },
    { label: 'Interviews scheduled', value: apps.reduce((n, a) => n + a.rounds.filter((r) => r.status === 'Scheduled').length, 0), icon: CalendarClock, tone: 'text-violet-600 bg-violet-50' },
    { label: 'Hired', value: counts.Hired, icon: Trophy, tone: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div>
      <PageHeader
        title={`Hello, ${user.name.split(' ')[0]} 👋`}
        description="Here's what's happening with your hiring today."
        actions={
          <Link to="/hr/jobs/new">
            <Button>
              <Plus className="size-4" /> Post a job
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <div className={`rounded-xl p-3 ${tone}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h2 className="font-semibold text-slate-900">Hiring pipeline</h2>
          <p className="text-sm text-slate-500">Applicants by stage</p>
          <div className="mt-5 space-y-4">
            {ALL_STATUSES.map((s) => (
              <Link key={s} to={`/hr/applicants?status=${s}`} className="block">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{s}</span>
                  <span className="text-slate-500">{counts[s]}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${BAR_COLORS[s]}`} style={{ width: `${apps.length ? (counts[s] / apps.length) * 100 : 0}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent applicants</h2>
            <Link to="/hr/applicants" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {apps.slice(0, 6).map((a) => (
              <li key={a.id}>
                <Link to={`/hr/applicants/${a.id}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-slate-50">
                  <Avatar name={a.fullName} className="size-9 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{a.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{jobById[a.jobId]?.title} · {timeAgo(a.appliedAt)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-semibold text-slate-900">Upcoming interviews</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No interviews scheduled.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs text-slate-500 uppercase">
                <tr>
                  <th className="pb-2 font-medium">Candidate</th>
                  <th className="pb-2 font-medium">Round</th>
                  <th className="pb-2 font-medium">Interviewer</th>
                  <th className="pb-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcoming.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5">
                      <Link to={`/hr/applicants/${r.app.id}`} className="font-medium text-slate-900 hover:text-brand-600">{r.app.fullName}</Link>
                      <p className="text-xs text-slate-500">{jobById[r.app.jobId]?.title}</p>
                    </td>
                    <td className="py-2.5 text-slate-600">{r.name}</td>
                    <td className="py-2.5 text-slate-600">{r.interviewer}</td>
                    <td className="py-2.5 text-slate-600">{formatDateTime(r.scheduledAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
