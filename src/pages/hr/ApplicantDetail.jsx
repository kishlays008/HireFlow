import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, CalendarPlus, CheckCircle2, Mail, Phone, Trash2, XCircle } from 'lucide-react';
import {
  assignRound,
  removeRound,
  saveHrNotes,
  selectApplicationById,
  updateApplicationStatus,
  updateRound,
} from '../../store/slices/applicationsSlice';
import { selectJobById } from '../../store/slices/jobsSlice';
import { roundSchema } from '../../validation/schemas';
import { ALL_STATUSES, PIPELINE, REJECTED, ROUND_MODES, ROUND_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import StatusTracker from '../../components/StatusTracker';
import RoundsList from '../../components/RoundsList';
import ResumeLink from '../../components/ResumeLink';
import { Avatar, Button, Field, Input, Modal, Select, Spinner, StatusBadge, Textarea } from '../../components/ui';
import NotFound from '../NotFound';

export default function ApplicantDetail() {
  const { applicationId } = useParams();
  const dispatch = useDispatch();
  const app = useSelector(selectApplicationById(applicationId));
  const job = useSelector(selectJobById(app?.jobId));
  const loaded = useSelector((s) => s.applications.status === 'succeeded');
  const [roundOpen, setRoundOpen] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [notes, setNotes] = useState(null); // null = untouched, falls back to saved notes

  if (!app) return loaded ? <NotFound /> : <Spinner />;

  const stageIndex = PIPELINE.indexOf(app.status);
  const nextStage = stageIndex > -1 && stageIndex < PIPELINE.length - 1 ? PIPELINE[stageIndex + 1] : null;
  const finished = app.status === 'Hired' || app.status === REJECTED;

  const changeStatus = async (status) => {
    if (status === app.status) return;
    await dispatch(updateApplicationStatus({ id: app.id, status }));
    toast.success(`Moved to ${status}`);
  };

  const onSaveNotes = async () => {
    await dispatch(saveHrNotes({ id: app.id, hrNotes: notes }));
    setNotes(null);
    toast.success('Notes saved');
  };

  const details = [
    ['Experience', `${app.experienceYears} years`],
    ['Current company', app.currentCompany || '—'],
    ['Expected CTC', app.expectedCtc ? `₹${app.expectedCtc} LPA` : '—'],
    ['Notice period', app.noticePeriod],
    ['Applied on', formatDate(app.appliedAt)],
  ];

  return (
    <div>
      <Link to="/hr/applicants" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Applicants
      </Link>

      <div className="card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={app.fullName} className="size-14 text-lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{app.fullName}</h1>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-sm text-slate-500">
                Applied for{' '}
                <Link to={`/jobs/${app.jobId}`} className="font-medium text-brand-600 hover:underline">
                  {job?.title}
                </Link>
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                <a href={`mailto:${app.email}`} className="flex items-center gap-1 hover:text-brand-600">
                  <Mail className="size-3.5" /> {app.email}
                </a>
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" /> {app.phone}
                </span>
                {app.linkedin && (
                  <a href={app.linkedin} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              aria-label="Change status"
              className="w-40"
              value={app.status}
              onChange={(e) => changeStatus(e.target.value)}
              options={ALL_STATUSES}
            />
            {nextStage && (
              <Button onClick={() => changeStatus(nextStage)}>
                Move to {nextStage} <ArrowRight className="size-4" />
              </Button>
            )}
            {!finished && (
              <Button variant="secondary" className="text-rose-600" onClick={() => changeStatus(REJECTED)}>
                <XCircle className="size-4" /> Reject
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <StatusTracker status={app.status} history={app.history} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Interview rounds</h2>
              <Button size="sm" onClick={() => setRoundOpen(true)} disabled={finished}>
                <CalendarPlus className="size-4" /> Assign round
              </Button>
            </div>
            <RoundsList
              rounds={app.rounds}
              renderActions={(r) => (
                <>
                  {r.status === 'Scheduled' && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setCompleting(r)}>
                        <CheckCircle2 className="size-4 text-emerald-600" /> Mark completed
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dispatch(updateRound({ id: app.id, roundId: r.id, patch: { status: 'Cancelled' } }))}
                      >
                        Cancel round
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-rose-600 hover:bg-rose-50"
                    onClick={() => {
                      if (window.confirm(`Remove "${r.name}"?`)) dispatch(removeRound({ id: app.id, roundId: r.id }));
                    }}
                  >
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </>
              )}
            />
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-semibold text-slate-900">Cover letter</h2>
            <p className="leading-relaxed whitespace-pre-line text-slate-600">{app.coverLetter}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Candidate details</h2>
            <dl className="space-y-3 text-sm">
              {details.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right font-medium text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5">
              <p className="mb-2 text-sm text-slate-500">Resume</p>
              <ResumeLink application={app} className="w-full" />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-semibold text-slate-900">Internal HR notes</h2>
            <Textarea
              rows={4}
              placeholder="Visible to HR only…"
              value={notes ?? app.hrNotes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button size="sm" className="mt-3" disabled={notes === null || notes === app.hrNotes} onClick={onSaveNotes}>
              Save notes
            </Button>
          </div>
        </div>
      </div>

      <AssignRoundModal open={roundOpen} onClose={() => setRoundOpen(false)} app={app} />
      <CompleteRoundModal round={completing} onClose={() => setCompleting(null)} appId={app.id} />
    </div>
  );
}

function AssignRoundModal({ open, onClose, app }) {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(roundSchema),
    defaultValues: { name: `Round ${app.rounds.length + 1}`, type: '', interviewer: '', scheduledAt: '', mode: 'Video Call', meetingLink: '' },
  });
  const mode = watch('mode');

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values) => {
    const result = await dispatch(
      assignRound({ id: app.id, round: { ...values, scheduledAt: values.scheduledAt.toISOString() } }),
    );
    toast.success(
      result.payload.status !== app.status ? `Round assigned · moved to ${result.payload.status}` : 'Interview round assigned',
    );
    reset({ name: `Round ${app.rounds.length + 2}`, type: '', interviewer: '', scheduledAt: '', mode: 'Video Call', meetingLink: '' });
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title={`Assign interview round · ${app.fullName}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Round name" required error={errors.name?.message}>
            <Input error={errors.name} {...register('name')} />
          </Field>
          <Field label="Round type" required error={errors.type?.message}>
            <Select placeholder="Select…" options={ROUND_TYPES} error={errors.type} {...register('type')} />
          </Field>
          <Field label="Interviewer" required error={errors.interviewer?.message}>
            <Input placeholder="e.g. Rahul Verma" error={errors.interviewer} {...register('interviewer')} />
          </Field>
          <Field label="Date & time" required error={errors.scheduledAt?.message}>
            <Input type="datetime-local" error={errors.scheduledAt} {...register('scheduledAt')} />
          </Field>
          <Field label="Mode" required error={errors.mode?.message}>
            <Select options={ROUND_MODES} error={errors.mode} {...register('mode')} />
          </Field>
          <Field label="Meeting link" required={mode === 'Video Call'} error={errors.meetingLink?.message}>
            <Input placeholder="https://meet.google.com/…" error={errors.meetingLink} {...register('meetingLink')} />
          </Field>
        </div>
        {PIPELINE.indexOf(app.status) < PIPELINE.indexOf('Interview') && (
          <p className="rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">
            The candidate will automatically be moved to the <b>Interview</b> stage.
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Assign round</Button>
        </div>
      </form>
    </Modal>
  );
}

function CompleteRoundModal({ round, onClose, appId }) {
  const dispatch = useDispatch();
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    await dispatch(updateRound({ id: appId, roundId: round.id, patch: { status: 'Completed', feedback: feedback.trim() } }));
    setSaving(false);
    setFeedback('');
    toast.success('Round marked as completed');
    onClose();
  };

  return (
    <Modal open={!!round} onClose={onClose} title={`Complete: ${round?.name}`}>
      <Field label="Interviewer feedback" hint="Shared with the candidate on their application page.">
        <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Strengths, concerns, recommendation…" />
      </Field>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={saving} onClick={submit}>Mark completed</Button>
      </div>
    </Modal>
  );
}
