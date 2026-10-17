import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { PawPrint, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, password);
      success(`Welcome back, ${userData.name}! 👋`);

      if (userData.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'Seller' || userData.role === 'Rescuer') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all outline-none border ${
    isDark
      ? 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDark ? 'text-slate-300' : 'text-slate-700'
  }`;

  const demoAccounts = [
    { label: 'Platform Admin', email: 'admin@pawconnect.com', pass: 'admin123', color: 'text-amber-400 border-amber-500/30' },
    { label: 'Verified Seller', email: 'seller@pawconnect.com', pass: 'seller123', color: 'text-emerald-400 border-emerald-500/30' },
    { label: 'Rescue Volunteer', email: 'rescuer@pawconnect.com', pass: 'rescuer123', color: 'text-sky-400 border-sky-500/30' },
    { label: 'Adopter / Buyer', email: 'adopter@pawconnect.com', pass: 'adopter123', color: 'text-rose-400 border-rose-500/30' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md mx-auto relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20 text-white">
            <PawPrint className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your PawConnect account</p>
        </div>

        {/* Card Form */}
        <div className={`rounded-3xl border p-6 sm:p-8 shadow-xl space-y-6 transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  className={`${inputClass} pl-10`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  className={`${inputClass} pl-10`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all text-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-amber-500 hover:underline font-bold">
              Join PawConnect
            </Link>
          </div>

          {/* One-Click Demo Credentials */}
          <div className="pt-5 border-t border-slate-700/50">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider text-center mb-2.5">
              One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((cred) => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.pass);
                  }}
                  className={`text-xs font-semibold py-2 px-2.5 rounded-xl border bg-slate-800/40 hover:bg-slate-800 transition-all text-left flex items-center justify-between ${cred.color}`}
                >
                  <span>{cred.label}</span>
                  <span className="text-[10px] opacity-70">Fill →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
