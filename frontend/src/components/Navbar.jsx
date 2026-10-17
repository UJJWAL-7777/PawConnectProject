import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  PawPrint,
  Heart,
  Sun,
  Moon,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  User,
  LogOut,
  ShoppingBag,
} from 'lucide-react';

const Navbar = () => {
  const {
    isAuthenticated,
    user,
    logout,
    isAdmin,
    isSeller,
    isRescuer,
    isShelterAdmin,
    canListPets,
    favorites,
  } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3.5 py-2 text-sm font-semibold transition-all duration-200 rounded-xl flex items-center gap-2 ${
      isActive(path)
        ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20 font-bold'
        : isDark
        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300 ${
      isDark
        ? 'bg-[#0f1218]/90 border-slate-800 shadow-lg shadow-black/20 text-slate-100'
        : 'bg-white/90 border-slate-200 shadow-sm text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform duration-300">
              <PawPrint className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight leading-none">
                <span className="text-amber-500">Paw</span>
                <span className={isDark ? 'text-white' : 'text-slate-900'}>Connect</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                Adoption & Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link to="/" className={navLinkClass('/')}>
              <PawPrint className="w-4 h-4 text-amber-500" />
              Browse Pets
            </Link>

            <Link to="/rescues" className={navLinkClass('/rescues')}>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Rescue Tracker
            </Link>

            {isAuthenticated && (
              <>
                {/* Seller / Rescuer / Shelter link */}
                {canListPets && (
                  <Link to="/seller/dashboard" className={navLinkClass('/seller/dashboard')}>
                    <ClipboardList className="w-4 h-4 text-emerald-400" />
                    Seller Hub
                  </Link>
                )}

                {/* Adopter dashboard link */}
                <Link to="/adopter/dashboard" className={navLinkClass('/adopter/dashboard')}>
                  <Heart className="w-4 h-4 text-rose-400" />
                  My Applications
                  {favorites?.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </Link>

                {/* Platform Admin Console */}
                {isAdmin && (
                  <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Admin Console
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                isDark
                  ? 'border-slate-800 bg-slate-800/60 text-amber-400 hover:bg-slate-800 hover:text-amber-300'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Post Pet Button (Quick Action for Sellers/Rescuers/Admins) */}
            {isAuthenticated && canListPets && (
              <Link
                to="/pets/new"
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:brightness-110 shadow-md shadow-amber-500/20 transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4" />
                List a Pet
              </Link>
            )}

            {/* User Profile / Auth Actions */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                    isDark
                      ? 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-500/20 flex items-center justify-center font-bold text-amber-500">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-semibold truncate max-w-[100px]">
                      {user?.name?.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-amber-500 font-medium">
                      {user?.role}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border p-2 z-50 animate-toast ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="px-3 py-2 border-b border-slate-800/40 mb-1">
                      <div className="font-bold text-sm truncate">{user?.name}</div>
                      <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <Link
                      to="/adopter/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      Applications & Favorites
                    </Link>

                    {canListPets && (
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Manage Listings & Orders
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Console
                      </Link>
                    )}

                    <div className="border-t border-slate-800/40 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition-all"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="p-2 rounded-xl text-amber-500"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t px-4 pt-3 pb-6 space-y-2 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium"
          >
            Browse Pets
          </Link>
          <Link
            to="/rescues"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-rose-400"
          >
            Rescue Tracker
          </Link>
          <Link
            to="/report-rescue"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-amber-400"
          >
            Report Stray or Injured Animal
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/adopter/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium"
              >
                My Applications & Favorites ({favorites?.length || 0})
              </Link>
              {canListPets && (
                <Link
                  to="/seller/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium"
                >
                  Seller Dashboard & Listings
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-amber-400"
                >
                  Admin Console
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium"
              >
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-base font-medium text-rose-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center font-bold rounded-xl border border-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center font-bold rounded-xl bg-amber-500 text-slate-950"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
