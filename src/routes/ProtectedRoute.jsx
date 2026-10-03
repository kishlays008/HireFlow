import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { ROLES } from '../utils/constants';

export const homeFor = (user) => (user?.role === ROLES.HR ? '/hr' : '/jobs');

// Guards a group of routes. Unauthenticated users go to /login (and come back
// afterwards); users with the wrong role are sent to their own home page.
export function ProtectedRoute({ role }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

// Keeps signed-in users away from the login/register pages.
export function GuestRoute() {
  const user = useSelector(selectUser);
  const location = useLocation();
  const from = location.state?.from?.pathname;
  return user ? <Navigate to={from || homeFor(user)} replace /> : <Outlet />;
}
