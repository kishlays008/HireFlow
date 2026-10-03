export const ROLES = {
  CANDIDATE: 'candidate',
  HR: 'hr',
};

// Main hiring pipeline, in order. "Rejected" can happen at any stage.
export const PIPELINE = ['Applied', 'Screening', 'Interview', 'Hired'];
export const REJECTED = 'Rejected';
export const ALL_STATUSES = [...PIPELINE, REJECTED];

export const STATUS_STYLES = {
  Applied: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Screening: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Interview: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  Hired: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
export const WORK_MODES = ['On-site', 'Remote', 'Hybrid'];
export const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];
export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
];
export const NOTICE_PERIODS = ['Immediate', '15 days', '30 days', '60 days', '90 days'];

export const ROUND_TYPES = ['HR Screening', 'Technical', 'Coding Assessment', 'System Design', 'Managerial', 'Culture Fit'];
export const ROUND_MODES = ['Video Call', 'Phone', 'On-site'];
export const ROUND_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

export const MAX_RESUME_MB = 2;
