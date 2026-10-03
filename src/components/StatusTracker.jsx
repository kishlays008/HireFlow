import { Check, X } from 'lucide-react';
import { PIPELINE, REJECTED } from '../utils/constants';
import { formatDate } from '../utils/format';
import { cx } from './ui';

// Horizontal stepper for Applied → Screening → Interview → Hired.
// If rejected, the stage where it happened is marked with a red X.
export default function StatusTracker({ status, history = [], compact }) {
  const rejected = status === REJECTED;
  const reachedAt = Object.fromEntries(history.map((h) => [h.status, h.at]));
  // For rejected applications, find the last pipeline stage reached before rejection.
  const lastReached = rejected
    ? Math.max(0, ...history.map((h) => PIPELINE.indexOf(h.status)))
    : PIPELINE.indexOf(status);

  return (
    <ol className="flex w-full items-start">
      {PIPELINE.map((stage, i) => {
        const done = i < lastReached || (!rejected && i === lastReached);
        const isRejectedHere = rejected && i === lastReached + 1;
        const current = !rejected && i === lastReached;
        const label = isRejectedHere ? REJECTED : stage;
        return (
          <li key={stage} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                className={cx(
                  'absolute top-3.5 right-1/2 h-0.5 w-full -translate-y-1/2',
                  i <= lastReached ? 'bg-brand-600' : isRejectedHere ? 'bg-rose-300' : 'bg-slate-200',
                )}
              />
            )}
            <span
              className={cx(
                'relative z-10 flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold',
                isRejectedHere
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : done
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-400',
                current && status !== 'Hired' && 'ring-4 ring-brand-100',
              )}
            >
              {isRejectedHere ? <X className="size-3.5" /> : done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cx(
                'mt-1.5 text-xs font-semibold',
                isRejectedHere ? 'text-rose-600' : done ? 'text-slate-900' : 'text-slate-400',
              )}
            >
              {label}
            </span>
            {!compact && (
              <span className="text-[11px] text-slate-400">
                {isRejectedHere ? formatDate(reachedAt[REJECTED]) : reachedAt[stage] ? formatDate(reachedAt[stage]) : ''}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
