import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../services/db';

// Opens the stored PDF resume in a new tab (data URLs can't be opened directly,
// so it is converted to a Blob URL first).
export default function ResumeLink({ application, className = '' }) {
  const open = async () => {
    const dataUrl = db.getResume(application.id);
    if (!dataUrl) return toast.error('Resume not found');
    const blob = await (await fetch(dataUrl)).blob();
    window.open(URL.createObjectURL(blob), '_blank', 'noopener');
  };

  return (
    <button
      type="button"
      onClick={open}
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700 ${className}`}
    >
      <FileText className="size-4 text-rose-500" />
      <span className="max-w-48 truncate">{application.resumeName}</span>
      {application.resumeSize && (
        <span className="text-xs text-slate-400">{Math.max(1, Math.round(application.resumeSize / 1024))} KB</span>
      )}
    </button>
  );
}
