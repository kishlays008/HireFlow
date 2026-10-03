import { useDispatch, useSelector } from 'react-redux';
import { Search, SearchX, SlidersHorizontal } from 'lucide-react';
import {
  defaultJobFilters,
  resetJobFilters,
  selectFilteredOpenJobs,
  selectJobFilters,
  selectJobLocations,
  setJobFilter,
} from '../../store/slices/jobsSlice';
import { selectMyApplications } from '../../store/slices/applicationsSlice';
import { DEPARTMENTS, EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES } from '../../utils/constants';
import JobCard from '../../components/JobCard';
import { Button, EmptyState, PageHeader, Select, Spinner } from '../../components/ui';

export default function Jobs() {
  const dispatch = useDispatch();
  const jobs = useSelector(selectFilteredOpenJobs);
  const filters = useSelector(selectJobFilters);
  const locations = useSelector(selectJobLocations);
  const myApps = useSelector(selectMyApplications);
  const loading = useSelector((s) => s.jobs.status === 'loading' || s.jobs.status === 'idle');
  const appByJob = Object.fromEntries(myApps.map((a) => [a.jobId, a]));

  const set = (key) => (e) => dispatch(setJobFilter({ [key]: e.target.value }));
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'sort' && k !== 'search' && v !== defaultJobFilters[k],
  ).length;

  const filterFields = [
    { key: 'department', label: 'Department', all: 'All departments', options: DEPARTMENTS },
    { key: 'location', label: 'Location', all: 'All locations', options: locations },
    { key: 'workMode', label: 'Work mode', all: 'Any work mode', options: WORK_MODES },
    { key: 'type', label: 'Job type', all: 'Any job type', options: JOB_TYPES },
    { key: 'experience', label: 'Experience', all: 'Any level', options: EXPERIENCE_LEVELS },
  ];

  return (
    <div>
      <PageHeader title="Find your next role" description="Browse open positions and apply in a few minutes." />

      <div className="card mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by title, department or skill…"
              value={filters.search}
              onChange={set('search')}
            />
          </div>
          <Select
            className="sm:w-48"
            value={filters.sort}
            onChange={set('sort')}
            options={[
              { value: 'newest', label: 'Newest first' },
              { value: 'salary', label: 'Highest salary' },
              { value: 'deadline', label: 'Closing soon' },
            ]}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          {filterFields.map((f) => (
            <Select
              key={f.key}
              aria-label={f.label}
              value={filters[f.key]}
              onChange={set(f.key)}
              placeholder={f.all}
              options={f.options}
            />
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          <span className="font-semibold text-slate-900">{jobs.length}</span> open {jobs.length === 1 ? 'position' : 'positions'}
        </span>
        {(activeCount > 0 || filters.search) && (
          <button onClick={() => dispatch(resetJobFilters())} className="flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700">
            <SlidersHorizontal className="size-4" /> Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading jobs…" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No jobs match your filters"
          description="Try removing some filters or searching for something else."
          action={<Button variant="secondary" onClick={() => dispatch(resetJobFilters())}>Clear filters</Button>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} application={appByJob[job.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
