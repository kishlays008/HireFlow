import { CalendarClock, Link2, MessageSquareText, Phone, UserRound, Video, Building } from 'lucide-react';
import { formatDateTime } from '../utils/format';
import { cx } from './ui';

const MODE_ICON = { 'Video Call': Video, Phone, 'On-site': Building };
const ROUND_STATUS_STYLE = {
  Scheduled: 'bg-violet-50 text-violet-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-slate-100 text-slate-500 line-through',
};

// Shared between the candidate view (read-only) and HR view (with actions).
export default function RoundsList({ rounds, renderActions }) {
  if (!rounds.length)
    return <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No interview rounds scheduled yet.</p>;

  const sorted = [...rounds].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  return (
    <ul className="space-y-3">
      {sorted.map((r, i) => {
        const ModeIcon = MODE_ICON[r.mode] || Video;
        return (
          <li key={r.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-400">ROUND {i + 1} · {r.type.toUpperCase()}</p>
                <p className="font-semibold text-slate-900">{r.name}</p>
              </div>
              <span className={cx('rounded-full px-2.5 py-0.5 text-xs font-semibold', ROUND_STATUS_STYLE[r.status])}>{r.status}</span>
            </div>
            <div className="mt-3 grid gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-4 text-slate-400" /> {formatDateTime(r.scheduledAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <ModeIcon className="size-4 text-slate-400" /> {r.mode}
              </span>
              <span className="flex items-center gap-1.5">
                <UserRound className="size-4 text-slate-400" /> {r.interviewer}
              </span>
              {r.meetingLink && r.status === 'Scheduled' && (
                <a href={r.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-medium text-brand-600 hover:underline">
                  <Link2 className="size-4" /> Join meeting
                </a>
              )}
            </div>
            {r.feedback && (
              <p className="mt-3 flex gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <MessageSquareText className="mt-0.5 size-4 shrink-0 text-slate-400" /> {r.feedback}
              </p>
            )}
            {renderActions && <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">{renderActions(r)}</div>}
          </li>
        );
      })}
    </ul>
  );
}
