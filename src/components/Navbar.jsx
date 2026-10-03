import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BriefcaseBusiness, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { logout, selectUser } from '../store/slices/authSlice';
import { ROLES } from '../utils/constants';
import { Avatar, Button, cx } from './ui';

const LINKS = {
  guest: [{ to: '/jobs', label: 'Browse Jobs' }],
  [ROLES.CANDIDATE]: [
    { to: '/jobs', label: 'Browse Jobs' },
    { to: '/candidate/applications', label: 'My Applications' },
  ],
  [ROLES.HR]: [
    { to: '/hr', label: 'Dashboard', end: true },
    { to: '/hr/jobs', label: 'Manage Jobs' },
    { to: '/hr/applicants', label: 'Applicants' },
  ],
};

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <BriefcaseBusiness className="size-4.5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Hire<span className="text-brand-600">Flow</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = LINKS[user?.role || 'guest'];

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Signed out');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    cx(
      'rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2.5">
                <Avatar name={user.name} className="size-8 text-xs" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role === ROLES.HR ? 'HR Admin' : 'Candidate'}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="size-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                Sign in
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button className="rounded-md p-2 text-slate-600 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" onClick={() => setOpen(false)}>
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 border-t border-slate-200 pt-3">
            {user ? (
              <Button variant="secondary" className="w-full" onClick={handleLogout}>
                <LogOut className="size-4" /> Logout ({user.name})
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1">
                  <Button variant="secondary" className="w-full">Sign in</Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button className="w-full">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
