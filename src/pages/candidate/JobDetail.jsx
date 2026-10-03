import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Briefcase, CalendarDays, CheckCircle2, IndianRupee, MapPin, Users } from 'lucide-react';
import { selectJobById } from '../../store/slices/jobsSlice';
import { selectMyApplications } from '../../store/slices/applicationsSlice';
import { selectUser } from '../../store/slices/authSlice';
import { ROLES } from '../../utils/constants';
import { formatDate, formatSalary, timeAgo } from '../../utils/format';
import { Button, Spinner, StatusBadge, Tag } from '../../components/ui';
import NotFound from '../NotFound';

export default function JobDetail() {
  const { jobId } = useParams();
  const job = useSelector(selectJobById(jobId));
  const user = useSelector(selectUser);
  const application = useSelector(selectMyApplications).find((a) => a.jobId === jobId);
  const loaded = useSelector((s) => s.jobs.status === 'succeeded');

  if (!job) return loaded ? <NotFound /> : <Spinner />;

  const closed = job.status !== 'Open';
  const facts = [
    { icon: MapPin, label: 'Location', value: `${job.location} · ${job.workMode}` },
    { icon: Briefcase, label: 'Type / Level', value: `${job.type} · ${job.experience}` },
    { icon: IndianRupee, label: 'Salary', value: formatSalary(job.salaryMin, job.salaryMax) },
    { icon: Users, label: 'Openings', value: job.openings },
    { icon: CalendarDays, label: 'Apply by', value: formatDate(job.deadline) },
  ];

  const applyAction = () => {
    if (user?.role === ROLES.HR) return <p className="text-sm text-slate-500">You are signed in as HR. Candidates apply from here.</p>;
    if (application)
      return (
        <Link to={`/candidate/applications/${application.id}`} className="block">
          <Button variant="secondary" className="w-full">
            <CheckCircle2 className="size-4 text-emerald-600" /> Applied · View status
          </Button>
        </Link>
      );
    if (closed) return <Button className="w-full" disabled>Applications closed</Button>;
    return (
      <Link to={`/jobs/${job.id}/apply`} className="block">
        <Button className="w-full" size="lg">
          {user ? 'Apply now' : 'Sign in to apply'}
        </Button>
      </Link>
    );
  };

  return (
    <div>
      <Link to="/jobs" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> All jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">{job.department}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              {closed && <Tag className="bg-rose-50 text-rose-700">Closed</Tag>}
              {application && <StatusBadge status={application.status} />}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Posted {timeAgo(job.createdAt)} by {job.postedByName}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">About the role</h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-slate-600">{job.description}</p>
            <h2 className="mt-6 text-lg font-semibold text-slate-900">Requirements</h2>
            <ul className="mt-2 space-y-2">
              {job.requirements.map((r) => (
                <li key={r} className="flex gap-2 text-slate-600">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-500" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <dl className="space-y-4">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="text-sm font-semibold text-slate-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-6">{applyAction()}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
