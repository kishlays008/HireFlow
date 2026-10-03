import { Link } from 'react-router-dom';
import { Briefcase, Clock, IndianRupee, MapPin } from 'lucide-react';
import { formatSalary, timeAgo } from '../utils/format';
import { StatusBadge, Tag } from './ui';

export default function JobCard({ job, application }) {
  const daysLeft = Math.ceil((new Date(job.deadline) - Date.now()) / 86400000);
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">{job.department}</p>
          <h3 className="mt-1 truncate text-base font-semibold text-slate-900 group-hover:text-brand-700">{job.title}</h3>
        </div>
        {application ? <StatusBadge status={application.status} /> : <Tag>{job.type}</Tag>}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" /> {job.location} · {job.workMode}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="size-3.5" /> {job.experience} level
        </span>
        <span className="flex items-center gap-1">
          <IndianRupee className="size-3.5" /> {formatSalary(job.salaryMin, job.salaryMax).replace('₹', '')}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>

      <div className="mt-4 mb-4 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
        {job.skills.length > 4 && <Tag>+{job.skills.length - 4}</Tag>}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" /> Posted {timeAgo(job.createdAt)}
        </span>
        <span className={daysLeft <= 7 ? 'font-semibold text-amber-600' : ''}>
          {daysLeft > 0 ? `${daysLeft} days left` : 'Closing today'}
        </span>
      </div>
    </Link>
  );
}
