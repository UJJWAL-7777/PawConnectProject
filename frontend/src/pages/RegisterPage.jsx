import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { PawPrint, User, Mail, Lock, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    state: '',
    role: 'Adopter',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toastError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toastError('Password must be at least 6 characters');
      return;
    }

    if (!agreedToTerms) {
      toastError('Please accept the Animal Welfare & Platform Terms');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: {
          city: formData.city,
          state: formData.state,
          country: 'USA',
        },
      };

      const user = await register(payload);
      success(`Welcome to PawConnect, ${user.name}! 🐾`);

      if (user.role === 'Seller') {
        success('Note: Seller accounts are verified by platform admin before listing.');
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: 'Adopter',
      label: 'Adopter / Buyer',
      icon: '🏠',
      desc: 'Browse, adopt, or purchase pets',
    },
    {
      value: 'Seller',
      label: 'Verified Seller',
      icon: '🛍️',
      desc: 'List pets for sale or rehoming',
    },
    {
      value: 'Rescuer',
      label: 'Rescuer / Shelter',
      icon: '🦸',
      desc: 'Report rescues & manage shelter',
    },
  ];

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all outline-none border ${
    isDark
      ? 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDark ? 'text-slate-300' : 'text-slate-700'
  }`;

  return (
    <div className="w-full min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-lg mx-auto relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20 text-white">
            <PawPrint className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Create an Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join our caring community of pet lovers</p>
        </div>

        {/* Card Form */}
        <div className={`rounded-3xl border p-6 sm:p-8 shadow-xl space-y-6 transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Cards */}
            <div>
              <label className={labelClass}>Select Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => {
                  const isSelected = formData.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: r.value }))}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 shadow-sm'
                          : isDark
                          ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                          : 'border-stone-200 bg-stone-50 text-slate-600 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-xl block mb-1">{r.icon}</span>
                      <span className="font-bold text-xs block truncate">{r.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  className={`${inputClass} pl-10`}
                  placeholder="Taylor Swift"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  className={`${inputClass} pl-10`}
                  placeholder="taylor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="password"
                    className={`${inputClass} pl-10`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`${inputClass} pl-10`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="phone"
                    className={`${inputClass} pl-10`}
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>City, State</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="city"
                    className={`${inputClass} pl-10`}
                    placeholder="San Francisco, CA"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Ethics & Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-amber-500 hover:underline font-semibold" target="_blank">
                    Terms of Service & Animal Ethics Policy
                  </Link>
                  . I agree never to list prohibited wild or endangered species.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all text-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-500 hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
