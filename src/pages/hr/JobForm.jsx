import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { createJob, selectJobById, updateJob } from '../../store/slices/jobsSlice';
import { selectUser } from '../../store/slices/authSlice';
import { jobSchema } from '../../validation/schemas';
import { DEPARTMENTS, EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES } from '../../utils/constants';
import { Button, Field, Input, Select, Spinner, Textarea } from '../../components/ui';
import NotFound from '../NotFound';

const EMPTY = {
  title: '',
  department: '',
  location: '',
  workMode: '',
  type: '',
  experience: '',
  salaryMin: '',
  salaryMax: '',
  openings: 1,
  deadline: '',
  skills: '',
  description: '',
  requirements: '',
  status: 'Open',
};

// Converts a stored job into form values (arrays → text, ISO date → yyyy-mm-dd).
const toFormValues = (job) => ({
  ...EMPTY,
  ...job,
  salaryMin: job.salaryMin ?? '',
  salaryMax: job.salaryMax ?? '',
  deadline: job.deadline?.slice(0, 10) || '',
  skills: job.skills.join(', '),
  requirements: job.requirements.join('\n'),
});

export default function JobForm() {
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const job = useSelector(selectJobById(jobId));
  const loaded = useSelector((s) => s.jobs.status === 'succeeded');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: yupResolver(jobSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (job) reset(toFormValues(job));
  }, [job, reset]);

  if (isEdit && !job) return loaded ? <NotFound /> : <Spinner />;

  const onSubmit = async (v) => {
    const payload = {
      ...v,
      title: v.title.trim(),
      location: v.location.trim(),
      salaryMin: v.salaryMin ?? null,
      salaryMax: v.salaryMax ?? null,
      deadline: new Date(v.deadline).toISOString(),
      skills: v.skills.split(',').map((s) => s.trim()).filter(Boolean),
      requirements: v.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    if (isEdit) {
      await dispatch(updateJob({ id: jobId, patch: payload }));
      toast.success('Job updated');
    } else {
      await dispatch(createJob({ ...payload, postedBy: user.uid, postedByName: user.name }));
      toast.success('Job posted!');
    }
    navigate('/hr/jobs');
  };

  const e = errors;
  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/hr/jobs" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Manage jobs
      </Link>

      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit job' : 'Post a new job'}</h1>
        <p className="mt-1 text-sm text-slate-500">Fields marked * are required.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
          <Field label="Job title" required error={e.title?.message}>
            <Input placeholder="e.g. Frontend Developer" error={e.title} {...register('title')} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Department" required error={e.department?.message}>
              <Select placeholder="Select…" options={DEPARTMENTS} error={e.department} {...register('department')} />
            </Field>
            <Field label="Location" required error={e.location?.message}>
              <Input placeholder="e.g. Bengaluru" error={e.location} {...register('location')} />
            </Field>
            <Field label="Work mode" required error={e.workMode?.message}>
              <Select placeholder="Select…" options={WORK_MODES} error={e.workMode} {...register('workMode')} />
            </Field>
            <Field label="Job type" required error={e.type?.message}>
              <Select placeholder="Select…" options={JOB_TYPES} error={e.type} {...register('type')} />
            </Field>
            <Field label="Experience level" required error={e.experience?.message}>
              <Select placeholder="Select…" options={EXPERIENCE_LEVELS} error={e.experience} {...register('experience')} />
            </Field>
            <Field label="Openings" required error={e.openings?.message}>
              <Input type="number" min="1" error={e.openings} {...register('openings')} />
            </Field>
            <Field label="Min salary (LPA)" error={e.salaryMin?.message}>
              <Input type="number" min="0" step="0.5" placeholder="Optional" error={e.salaryMin} {...register('salaryMin')} />
            </Field>
            <Field label="Max salary (LPA)" error={e.salaryMax?.message}>
              <Input type="number" min="0" step="0.5" placeholder="Optional" error={e.salaryMax} {...register('salaryMax')} />
            </Field>
            <Field label="Application deadline" required error={e.deadline?.message}>
              <Input type="date" error={e.deadline} {...register('deadline')} />
            </Field>
            <Field label="Status" required error={e.status?.message}>
              <Select options={['Open', 'Closed']} error={e.status} {...register('status')} />
            </Field>
          </div>

          <Field label="Skills" required error={e.skills?.message} hint="Comma separated, e.g. React, Redux, Tailwind CSS">
            <Input placeholder="React, Redux, Tailwind CSS" error={e.skills} {...register('skills')} />
          </Field>
          <Field label="Job description" required error={e.description?.message}>
            <Textarea rows={5} placeholder="Describe the role, team and impact…" error={e.description} {...register('description')} />
          </Field>
          <Field label="Requirements" required error={e.requirements?.message} hint="One requirement per line">
            <Textarea rows={5} placeholder={'3+ years of React experience\nStrong communication skills'} error={e.requirements} {...register('requirements')} />
          </Field>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <Link to="/hr/jobs">
              <Button type="button" variant="secondary" className="w-full">Cancel</Button>
            </Link>
            <Button type="submit" loading={isSubmitting} disabled={isEdit && !isDirty}>
              {isEdit ? 'Save changes' : 'Publish job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
