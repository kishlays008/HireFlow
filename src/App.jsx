import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from './services/authService';
import { authStateChanged } from './store/slices/authSlice';
import { fetchJobs } from './store/slices/jobsSlice';
import { fetchApplications } from './store/slices/applicationsSlice';
import { GuestRoute, ProtectedRoute } from './routes/ProtectedRoute';
import { ROLES } from './utils/constants';
import Layout from './components/Layout';
import { Spinner } from './components/ui';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Jobs from './pages/candidate/Jobs';
import JobDetail from './pages/candidate/JobDetail';
import ApplyJob from './pages/candidate/ApplyJob';
import MyApplications from './pages/candidate/MyApplications';
import ApplicationDetail from './pages/candidate/ApplicationDetail';
import Dashboard from './pages/hr/Dashboard';
import ManageJobs from './pages/hr/ManageJobs';
import JobForm from './pages/hr/JobForm';
import Applicants from './pages/hr/Applicants';
import ApplicantDetail from './pages/hr/ApplicantDetail';

export default function App() {
  const dispatch = useDispatch();
  const initialized = useSelector((s) => s.auth.initialized);

  useEffect(() => {
    const unsubscribe = authService.onChange((user) => dispatch(authStateChanged(user)));
    dispatch(fetchJobs());
    dispatch(fetchApplications());
    return unsubscribe;
  }, [dispatch]);

  if (!initialized) return <Spinner label="Starting HireFlow…" className="min-h-screen" />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:jobId" element={<JobDetail />} />

        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute role={ROLES.CANDIDATE} />}>
          <Route path="jobs/:jobId/apply" element={<ApplyJob />} />
          <Route path="candidate/applications" element={<MyApplications />} />
          <Route path="candidate/applications/:applicationId" element={<ApplicationDetail />} />
        </Route>

        <Route path="hr" element={<ProtectedRoute role={ROLES.HR} />}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="jobs/new" element={<JobForm key="new" />} />
          <Route path="jobs/:jobId/edit" element={<JobForm key="edit" />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="applicants/:applicationId" element={<ApplicantDetail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
