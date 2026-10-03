import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { Building2, UserRound } from 'lucide-react';
import { register as registerUser } from '../store/slices/authSlice';
import { registerSchema } from '../validation/schemas';
import { homeFor } from '../routes/ProtectedRoute';
import { ROLES } from '../utils/constants';
import { Button, cx, Field, Input } from '../components/ui';
import AuthShell from './AuthShell';

const ROLE_OPTIONS = [
  { value: ROLES.CANDIDATE, label: 'Candidate', text: 'Find and apply for jobs', icon: UserRound },
  { value: ROLES.HR, label: 'HR / Recruiter', text: 'Post jobs and hire', icon: Building2 },
];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((s) => s.auth.status === 'loading');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { name: '', email: '', role: ROLES.CANDIDATE, password: '', confirmPassword: '' },
  });
  const role = watch('role');

  const onSubmit = async ({ confirmPassword: _, ...values }) => {
    const result = await dispatch(registerUser(values));
    if (registerUser.rejected.match(result)) return toast.error(result.payload);
    toast.success('Account created!');
    navigate(homeFor(result.payload), { replace: true });
  };

  return (
    <AuthShell title="Create your account" subtitle="Join HireFlow as a candidate or a recruiter.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="I am a" error={errors.role?.message}>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map(({ value, label, text, icon: Icon }) => (
              <label
                key={value}
                className={cx(
                  'flex cursor-pointer flex-col rounded-xl border p-3 transition',
                  role === value ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300',
                )}
              >
                <input type="radio" value={value} className="sr-only" {...register('role')} />
                <Icon className={cx('size-5', role === value ? 'text-brand-600' : 'text-slate-400')} />
                <span className="mt-2 text-sm font-semibold text-slate-900">{label}</span>
                <span className="text-xs text-slate-500">{text}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label="Full name" error={errors.name?.message}>
          <Input placeholder="Aarav Mehta" autoComplete="name" error={errors.name} {...register('name')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="you@example.com" autoComplete="email" error={errors.email} {...register('email')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" error={errors.password?.message}>
            <Input type="password" autoComplete="new-password" error={errors.password} {...register('password')} />
          </Field>
          <Field label="Confirm password" error={errors.confirmPassword?.message}>
            <Input type="password" autoComplete="new-password" error={errors.confirmPassword} {...register('confirmPassword')} />
          </Field>
        </div>
        <p className="text-xs text-slate-500">Use 8+ characters with at least one letter and one number.</p>
        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
