import { Link } from 'react-router-dom';
import { PawPrint, Heart, Mail, MapPin, Shield, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer className={`mt-auto border-t transition-colors duration-300 relative z-10 ${
      isDark
        ? 'bg-[#0a0c10] border-slate-800/80 text-slate-300'
        : 'bg-stone-100 border-stone-200 text-stone-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <PawPrint className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight">
                <span className="text-amber-500">Paw</span>
                <span className={isDark ? 'text-white' : 'text-slate-900'}>Connect</span>
              </span>
            </Link>
            <p className="text-sm max-w-md leading-relaxed text-slate-400">
              Connecting rescue animals and verified sellers with loving forever homes.
              PawConnect powers transparent pet adoptions, verified ethical breeding,
              medical history tracking, and rapid community rescue reports.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" /> 100% Ethical & Verified Shelters
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Platform Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-amber-500 transition-colors">
                  Browse Available Pets
                </Link>
              </li>
              <li>
                <Link to="/rescues" className="text-slate-400 hover:text-amber-500 transition-colors">
                  Rescue Tracker & Reports
                </Link>
              </li>
              <li>
                <Link to="/report-rescue" className="text-slate-400 hover:text-amber-500 transition-colors">
                  Report Stray / Injured Animal
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Terms & Ethics Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Community & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                support@pawconnect.org
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                San Francisco, CA & Nationwide
              </li>
              <li className="pt-2 text-xs text-slate-400 leading-normal">
                Emergency Animal Poison Hotline: <br />
                <span className="font-bold text-amber-400">(888) 426-4435</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-400">
          <p>© {new Date().getFullYear()} PawConnect MERN Platform. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for pets everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
