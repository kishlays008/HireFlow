import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { UserRound, Building2 } from 'lucide-react';
import { login } from '../store/slices/authSlice';
import { loginSchema } from '../validation/schemas';
import { homeFor } from '../routes/ProtectedRoute';
import { isDemoAuth } from '../services/authService';
import { DEMO_CANDIDATE, DEMO_HR, DEMO_PASSWORD } from '../services/seed';
import { Button, Field, Input } from '../components/ui';
import AuthShell from './AuthShell';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector((s) => s.auth.status === 'loading');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    const result = await dispatch(login(values));
    if (login.rejected.match(result)) return toast.error(result.payload);
    toast.success(`Welcome back, ${result.payload.name.split(' ')[0]}!`);
    const from = location.state?.from?.pathname;
    navigate(from || homeFor(result.payload), { replace: true });
  };

  const fillDemo = (user) => {
    setValue('email', user.email, { shouldValidate: true });
    setValue('password', DEMO_PASSWORD, { shouldValidate: true });
  };

  return (
    <AuthShell title="Sign in to HireFlow" subtitle="Welcome back! Please enter your details.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@example.com" error={errors.email} {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" placeholder="••••••••" error={errors.password} {...register('password')} />
        </Field>
        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      {isDemoAuth && (
        <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-4">
          <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">Demo accounts</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => fillDemo(DEMO_CANDIDATE)}>
              <UserRound className="size-4" /> Candidate
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => fillDemo(DEMO_HR)}>
              <Building2 className="size-4" /> HR Admin
            </Button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
