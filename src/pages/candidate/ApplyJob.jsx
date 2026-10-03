import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, UploadCloud, X } from 'lucide-react';
import { selectJobById } from '../../store/slices/jobsSlice';
import { applyToJob, selectMyApplications } from '../../store/slices/applicationsSlice';
import { selectUser } from '../../store/slices/authSlice';
import { applicationSchema } from '../../validation/schemas';
import { MAX_RESUME_MB, NOTICE_PERIODS } from '../../utils/constants';
import { fileToDataUrl } from '../../utils/format';
import { Button, cx, EmptyState, Field, Input, Select, Spinner, Textarea } from '../../components/ui';
import NotFound from '../NotFound';

export default function ApplyJob() {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const job = useSelector(selectJobById(jobId));
  const loaded = useSelector((s) => s.jobs.status === 'succeeded');
  const existing = useSelector(selectMyApplications).find((a) => a.jobId === jobId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(applicationSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: user.name,
      email: user.email,
      phone: '',
      linkedin: '',
      experienceYears: '',
      currentCompany: '',
      expectedCtc: '',
      noticePeriod: '',
      coverLetter: '',
      resume: undefined,
      consent: false,
    },
  });

  const resumeFiles = watch('resume');
  const resume = resumeFiles?.[0];
  const coverLength = watch('coverLetter')?.length || 0;

  if (!job) return loaded ? <NotFound /> : <Spinner />;
  if (existing) return <Navigate to={`/candidate/applications/${existing.id}`} replace />;
  if (job.status !== 'Open')
    return (
      <EmptyState
        icon={FileText}
        title="Applications are closed"
        description="This position is no longer accepting applications."
        action={<Link to="/jobs"><Button variant="secondary">Browse other jobs</Button></Link>}
      />
    );

  const onSubmit = async ({ resume: files, consent: _, ...values }) => {
    const file = files[0];
    const result = await dispatch(
      applyToJob({
        ...values,
        jobId: job.id,
        candidateId: user.uid,
        resumeName: file.name,
        resumeSize: file.size,
        resumeDataUrl: await fileToDataUrl(file),
      }),
    );
    if (applyToJob.rejected.match(result)) return toast.error(result.payload);
    toast.success('Application submitted!');
    navigate(`/candidate/applications/${result.payload.id}`, { replace: true });
  };

  const resumeField = register('resume');

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/jobs/${job.id}`} className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Back to job
      </Link>

      <div className="card p-6 sm:p-8">
        <p className="text-sm text-slate-500">Applying for</p>
        <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
        <p className="text-sm text-slate-500">
          {job.department} · {job.location}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8" noValidate>
          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-900 uppercase">Personal details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.fullName?.message}>
                <Input error={errors.fullName} {...register('fullName')} />
              </Field>
              <Field label="Email" required error={errors.email?.message}>
                <Input type="email" error={errors.email} {...register('email')} />
              </Field>
              <Field label="Mobile number" required error={errors.phone?.message}>
                <Input type="tel" inputMode="numeric" maxLength={10} placeholder="9876543210" error={errors.phone} {...register('phone')} />
              </Field>
              <Field label="LinkedIn profile" error={errors.linkedin?.message}>
                <Input placeholder="https://linkedin.com/in/you" error={errors.linkedin} {...register('linkedin')} />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-900 uppercase">Experience</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Total experience (years)" required error={errors.experienceYears?.message}>
                <Input type="number" min="0" step="0.5" error={errors.experienceYears} {...register('experienceYears')} />
              </Field>
              <Field label="Current company" error={errors.currentCompany?.message}>
                <Input placeholder="Optional" error={errors.currentCompany} {...register('currentCompany')} />
              </Field>
              <Field label="Expected CTC (LPA)" error={errors.expectedCtc?.message}>
                <Input type="number" min="0" step="0.5" placeholder="Optional" error={errors.expectedCtc} {...register('expectedCtc')} />
              </Field>
              <Field label="Notice period" required error={errors.noticePeriod?.message}>
                <Select placeholder="Select…" options={NOTICE_PERIODS} error={errors.noticePeriod} {...register('noticePeriod')} />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-900 uppercase">Resume & cover letter</h2>
            <Field label="Resume (PDF)" required error={errors.resume?.message}>
              {resume ? (
                <div className={cx('flex items-center justify-between rounded-lg border p-3', errors.resume ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50')}>
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="size-8 shrink-0 text-rose-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{resume.name}</p>
                      <p className="text-xs text-slate-500">{(resume.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue('resume', undefined, { shouldValidate: true })}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    aria-label="Remove file"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={cx(
                    'flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40',
                    errors.resume ? 'border-rose-300' : 'border-slate-300',
                  )}
                >
                  <UploadCloud className="size-8 text-slate-400" />
                  <span className="mt-2 text-sm font-semibold text-brand-600">Click to upload your resume</span>
                  <span className="text-xs text-slate-500">PDF only, up to {MAX_RESUME_MB} MB</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    {...resumeField}
                    onChange={(e) => {
                      // Copy files into an array so clearing the input doesn't empty the form value.
                      setValue('resume', e.target.files ? Array.from(e.target.files) : undefined, { shouldValidate: true });
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </Field>

            <Field
              className="mt-4"
              label="Why are you a great fit?"
              required
              error={errors.coverLetter?.message}
              hint={`${coverLength}/1500 characters (minimum 50)`}
            >
              <Textarea rows={6} placeholder="Tell the hiring team about your relevant experience…" error={errors.coverLetter} {...register('coverLetter')} />
            </Field>
          </section>

          <div>
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" className="mt-0.5 size-4 rounded border-slate-300 accent-brand-600" {...register('consent')} />
              I confirm that the information provided is accurate and complete.
            </label>
            {errors.consent && <p className="mt-1 text-xs font-medium text-rose-600">{errors.consent.message}</p>}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <Link to={`/jobs/${job.id}`}>
              <Button type="button" variant="secondary" className="w-full">Cancel</Button>
            </Link>
            <Button type="submit" loading={isSubmitting}>
              Submit application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
