import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import PetCard from '../components/PetCard';
import FilterSidebar from '../components/FilterSidebar';
import { useTheme } from '../context/ThemeContext';
import {
  PawPrint,
  Heart,
  ShieldCheck,
  Search,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  CreditCard,
  ChevronRight,
  Filter,
} from 'lucide-react';

const HomePage = () => {
  const { isDark } = useTheme();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [filters, setFilters] = useState({
    species: '',
    breed: '',
    status: '',
    listingType: '',
    size: '',
    gender: '',
    minAge: '',
    maxAge: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: '-createdAt',
    page: 1,
  });

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page || 1, limit: 12 };
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          params[key] = value;
        }
      });

      const response = await API.get('/pets', { params });
      setPets(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPets();
    }, 250); // Debounced query
    return () => clearTimeout(timer);
  }, [fetchPets]);

  // Fetch quick live stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await API.get('/stats/dashboard');
        if (res.data?.data) {
          setDashboardStats(res.data.data.overview);
        }
      } catch (err) {
        // Fallback default
      }
    };
    loadStats();
  }, []);

  const handleSpeciesPill = (species) => {
    setFilters((prev) => ({
      ...prev,
      species: prev.species === species ? '' : species,
      page: 1,
    }));
  };

  const speciesOptions = [
    { label: 'All Pets', value: '', icon: '🐾' },
    { label: 'Dogs', value: 'Dog', icon: '🐕' },
    { label: 'Cats', value: 'Cat', icon: '🐈' },
    { label: 'Birds', value: 'Bird', icon: '🐦' },
    { label: 'Rabbits', value: 'Rabbit', icon: '🐇' },
    { label: 'Other Friends', value: 'Other', icon: '🐢' },
  ];

  const stats = [
    {
      label: 'Available Now',
      value: dashboardStats?.availablePets || pagination.total || '29',
      icon: <PawPrint className="w-5 h-5 text-amber-500" />,
      sub: 'Dogs, Cats & Small Pets',
    },
    {
      label: 'Happy Adoptions',
      value: (dashboardStats?.adoptedPets || 12) + '+',
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      sub: 'Forever homes matched',
    },
    {
      label: 'Verified Shelters',
      value: '18+',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      sub: 'Licensed ethical rescues',
    },
    {
      label: 'Community Rescues',
      value: dashboardStats?.totalRescues || '35+',
      icon: <AlertTriangle className="w-5 h-5 text-sky-500" />,
      sub: 'Animals saved from streets',
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className={`relative overflow-hidden w-full border-b transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-slate-800'
          : 'bg-gradient-to-b from-amber-50/60 via-stone-50 to-stone-100/40 border-stone-200'
      } py-16 sm:py-24`}>
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Pet Adoption & Ethical Marketplace
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
            Connecting Hearts with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700">
              Forever Paws
            </span>
          </h1>

          <p className={`text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Adopt from verified rescues or explore trusted marketplace listings.
            Complete medical records, secure test payments, and real-time community rescue reporting.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
            <a
              href="#browse"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 transition-all text-base flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Explore 30+ Pets
            </a>
            <Link
              to="/report-rescue"
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold border transition-all text-base flex items-center justify-center gap-2 hover:-translate-y-0.5 ${
                isDark
                  ? 'border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-stone-50 shadow-sm'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Report Stray Animal
            </Link>
          </div>

          {/* Species Category Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mb-12">
            {speciesOptions.map((opt) => {
              const isSelected = filters.species === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => handleSpeciesPill(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                      : isDark
                      ? 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      : 'bg-white border border-stone-200 text-slate-700 hover:text-slate-900 shadow-xs'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    : 'bg-white/80 border-stone-200 hover:border-stone-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black">{s.value}</span>
                  <div className="p-2 rounded-xl bg-slate-800/20">{s.icon}</div>
                </div>
                <div>
                  <div className="font-bold text-sm">{s.label}</div>
                  <div className="text-xs text-slate-400">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className={`w-full border-b py-8 ${
        isDark ? 'bg-slate-950 border-slate-800/60' : 'bg-stone-50 border-stone-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Verified Medical Records</h4>
              <p className="text-xs text-slate-400">Vaccinations, vet checks, and transparent health history.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Safe & Transparent Payments</h4>
              <p className="text-xs text-slate-400">Stripe checkout test mode for marketplace purchases.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Strict Ethical Standards</h4>
              <p className="text-xs text-slate-400">Zero tolerance for prohibited species and puppy mills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Browse Section */}
      <section id="browse" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Browse Available Pets & Marketplace
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Showing {pets.length} of {pagination.total || 0} pet profiles
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`lg:hidden px-4 py-2.5 rounded-xl text-sm font-semibold border flex items-center gap-2 ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-stone-200'
            }`}
          >
            <Filter className="w-4 h-4 text-amber-500" />
            {showFilters ? 'Hide Filters' : 'Filter Pets'}
          </button>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0`}>
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </aside>

          {/* Pets Grid */}
          <main className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className={`h-96 rounded-2xl border animate-pulse ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-stone-100 border-stone-200'
                    }`}
                  />
                ))}
              </div>
            ) : pets.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border text-center p-8 ${
                isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-stone-200 shadow-sm'
              }`}>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mb-4">
                  🐾
                </div>
                <h3 className="text-xl font-bold mb-2">No pets found matching criteria</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-6">
                  Try clearing your search terms or expanding your species and price filters.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      species: '',
                      breed: '',
                      status: '',
                      listingType: '',
                      size: '',
                      gender: '',
                      minAge: '',
                      maxAge: '',
                      minPrice: '',
                      maxPrice: '',
                      search: '',
                      sort: '-createdAt',
                      page: 1,
                    })
                  }
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 transition-all text-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full items-stretch">
                  {pets.map((pet, idx) => (
                    <PetCard key={pet._id} pet={pet} index={idx} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12 w-full">
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="px-3.5 py-2 rounded-xl text-sm font-semibold border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-500 hover:text-slate-950 transition-all"
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.pages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setFilters((prev) => ({ ...prev, page: i + 1 }))}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          filters.page === i + 1
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : isDark
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                            : 'bg-white border border-stone-200 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      disabled={filters.page >= pagination.pages}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="px-3.5 py-2 rounded-xl text-sm font-semibold border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-500 hover:text-slate-950 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>

      {/* Community Rescues Quick CTA banner */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border border-rose-900/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="w-3.5 h-3.5" /> Emergency Community Network
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Spotted a stray, lost, or injured animal?
            </h3>
            <p className="text-sm text-slate-300">
              Use our location-based reporting tool to alert community rescuers, shelters, and volunteers instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/rescues"
              className="px-6 py-3.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-sm transition-all"
            >
              View Rescue Tracker
            </Link>
            <Link
              to="/report-rescue"
              className="px-6 py-3.5 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 text-sm transition-all flex items-center gap-2"
            >
              Report Rescue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
