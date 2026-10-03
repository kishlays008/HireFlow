import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { BriefcaseBusiness, Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { deleteJob, selectJobs, updateJob } from '../../store/slices/jobsSlice';
import { selectApplicationCountsByJob } from '../../store/slices/applicationsSlice';
import { formatDate } from '../../utils/format';
import { Button, cx, EmptyState, Modal, PageHeader, Spinner } from '../../components/ui';

export default function ManageJobs() {
  const dispatch = useDispatch();
  const jobs = useSelector(selectJobs);
  const counts = useSelector(selectApplicationCountsByJob);
  const loading = useSelector((s) => s.jobs.status !== 'succeeded');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <Spinner />;
  const visible = statusFilter === 'All' ? jobs : jobs.filter((j) => j.status === statusFilter);

  const toggleStatus = async (job) => {
    const status = job.status === 'Open' ? 'Closed' : 'Open';
    await dispatch(updateJob({ id: job.id, patch: { status } }));
    toast.success(`Job ${status === 'Open' ? 'reopened' : 'closed'}`);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    await dispatch(deleteJob(toDelete.id));
    setDeleting(false);
    setToDelete(null);
    toast.success('Job deleted');
  };

  return (
    <div>
      <PageHeader
        title="Manage jobs"
        description="Create, edit and close job postings."
        actions={
          <Link to="/hr/jobs/new">
            <Button>
              <Plus className="size-4" /> Post a job
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex gap-2">
        {['All', 'Open', 'Closed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cx(
              'rounded-full px-3.5 py-1.5 text-sm font-medium',
              statusFilter === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No jobs here"
          description="Post your first job to start receiving applications."
          action={<Link to="/hr/jobs/new"><Button>Post a job</Button></Link>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Job</th>
                <th className="px-5 py-3 font-medium">Applicants</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">
                      {job.department} · {job.location} · {job.type}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Link to={`/hr/applicants?job=${job.id}`} className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline">
                      <Users className="size-4" /> {counts[job.id] || 0}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(job.deadline)}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleStatus(job)}
                      title="Click to toggle"
                      className={cx(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                        job.status === 'Open' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-100 text-slate-600 ring-slate-500/20',
                      )}
                    >
                      {job.status}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Link to={`/jobs/${job.id}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800" title="View">
                        <Eye className="size-4" />
                      </Link>
                      <Link to={`/hr/jobs/${job.id}/edit`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800" title="Edit">
                        <Pencil className="size-4" />
                      </Link>
                      <button onClick={() => setToDelete(job)} className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Delete">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete job?">
        <p className="text-sm text-slate-600">
          This will permanently delete <span className="font-semibold">{toDelete?.title}</span> and its{' '}
          {counts[toDelete?.id] || 0} application(s). This can't be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={confirmDelete}>Delete job</Button>
        </div>
      </Modal>
    </div>
  );
}
