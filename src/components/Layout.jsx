import { Outlet } from 'react-router-dom';
import { Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
import { isDemoAuth } from '../services/authService';
import { db } from '../services/db';

export default function Layout() {
  const resetDemo = () => {
    if (!window.confirm('Reset all jobs and applications to the original demo data?')) return;
    db.reset();
    toast.success('Demo data reset');
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {isDemoAuth && (
        <div className="bg-brand-900 px-4 py-1.5 text-center text-xs text-brand-100">
          <Info className="mr-1 inline size-3.5 -translate-y-px" />
          Demo mode: data is stored in your browser. Add Firebase keys in <code>.env</code> to enable Firebase Auth.
        </div>
      )}
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} HireFlow · Smart HR Interview & Hiring Portal</p>
          <button onClick={resetDemo} className="font-medium hover:text-slate-700">
            Reset demo data
          </button>
        </div>
      </footer>
    </div>
  );
}
