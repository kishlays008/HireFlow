import { Logo } from '../components/Navbar';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex justify-center py-6 sm:py-10">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
