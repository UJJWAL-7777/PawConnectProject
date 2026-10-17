import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import StatsChart from '../components/StatsChart';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Flag,
  PawPrint,
  Check,
  Eye,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { isDark } = useTheme();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'sellers' | 'moderation' | 'users'
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [moderationPets, setModerationPets] = useState([]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, modRes] = await Promise.all([
        API.get('/admin/analytics'),
        API.get('/admin/users?limit=50'),
        API.get('/admin/moderation/pets'),
      ]);

      setAnalytics(analyticsRes.data?.data);
      setUsers(usersRes.data?.data || []);
      setModerationPets(modRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toastError('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Verify / Approve Seller
  const handleVerifySeller = async (userId, newStatus) => {
    try {
      await API.put(`/admin/users/${userId}/verify`, { isVerified: newStatus });
      success(`Seller verification ${newStatus ? 'approved' : 'revoked'}`);
      loadAdminData();
    } catch (err) {
      toastError('Verification update failed');
    }
  };

  // Toggle Ban / Unban User
  const handleToggleBan = async (userId) => {
    try {
      const res = await API.put(`/admin/users/${userId}/ban`);
      success(res.data?.message || 'User status updated');
      loadAdminData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Ban toggle failed');
    }
  };

  // Moderate Pet Listing
  const handleModeratePet = async (petId, isApproved, clearFlags = false) => {
    try {
      await API.put(`/admin/moderation/pets/${petId}`, { isApproved, clearFlags });
      success('Listing moderation updated');
      loadAdminData();
    } catch (err) {
      toastError('Moderation action failed');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading platform administration console..." />;
  }

  const summary = analytics?.summary || {};
  const pendingSellers = users.filter((u) => u.role === 'Seller' && !u.isVerified);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950">
              PLATFORM ADMIN CONSOLE
            </span>
            {pendingSellers.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {pendingSellers.length} Pending Seller Approvals
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black">PawConnect Operations & Governance</h1>
          <p className="text-sm text-slate-400">
            Real-time analytics, ethical moderation, seller KYC verification, and user management.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all self-start md:self-auto shrink-0"
        >
          Refresh Live Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'analytics', label: 'Aggregation Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'sellers', label: `Seller Approvals (${pendingSellers.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'moderation', label: `Pet Moderation (${moderationPets.length})`, icon: <Flag className="w-4 h-4" /> },
          { id: 'users', label: `User Management (${users.length})`, icon: <Users className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: ANALYTICS & INSIGHTS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'}`}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>TOTAL PETS</span>
                <PawPrint className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black">{summary.totalPets || 0}</div>
              <div className="text-xs text-emerald-400 font-semibold mt-1">
                {summary.availablePets || 0} Available • {summary.adoptedPets || 0} Adopted • {summary.soldPets || 0} Sold
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'}`}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>MARKETPLACE REVENUE</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">${summary.totalRevenue || 0}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">
                {summary.paidOrdersCount || 0} processed sales
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'}`}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>AVG TIME TO ADOPT</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-3xl font-black">{summary.avgTimeToAdoptionDays || 4.5} Days</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">
                From application to home
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'}`}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>COMMUNITY RESCUES</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-black">{summary.totalRescues || 0}</div>
              <div className="text-xs text-slate-400 font-semibold mt-1">
                Emergency reports dispatched
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsChart
              title="Adoptions & Listings by Species"
              data={analytics?.adoptionsBySpecies || []}
              type="donut"
            />
            <StatsChart
              title="Monthly Rescue Intakes (Last 12 Months)"
              data={analytics?.monthlyRescues || []}
              type="bar"
            />
          </div>

          {/* Ratio Breakdown */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'
          }`}>
            <h3 className="font-bold text-base">Adoption Application Outcomes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {analytics?.requestStatusRatio?.map((r) => (
                <div key={r.status} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-semibold">{r.status}</div>
                  <div className="text-2xl font-black mt-1">{r.count} Applications</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: SELLER KYC APPROVALS --- */}
      {activeTab === 'sellers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 text-xs text-slate-300">
            Sellers must be approved by Platform Admins before they can publish pet listings.
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs font-bold uppercase">
                <tr>
                  <th className="px-5 py-4">Seller Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Phone & City</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users
                  .filter((u) => u.role === 'Seller' || u.role === 'Rescuer')
                  .map((seller) => (
                    <tr key={seller._id} className="hover:bg-slate-800/20">
                      <td className="px-5 py-4 font-bold flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-xs text-amber-500">
                          {seller.name.charAt(0)}
                        </div>
                        {seller.name}
                      </td>
                      <td className="px-5 py-4 text-slate-300">{seller.email}</td>
                      <td className="px-5 py-4 text-slate-400">
                        {seller.phone || 'N/A'} • {seller.address?.city || 'CA'}
                      </td>
                      <td className="px-5 py-4">
                        {seller.isVerified ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Approved ✓
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {seller.isVerified ? (
                          <button
                            onClick={() => handleVerifySeller(seller._id, false)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifySeller(seller._id, true)}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-600 transition-colors"
                          >
                            Approve Seller
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: PET MODERATION --- */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs font-bold uppercase">
                <tr>
                  <th className="px-5 py-4">Pet Listing</th>
                  <th className="px-5 py-4">Listing Type</th>
                  <th className="px-5 py-4">Flags Count</th>
                  <th className="px-5 py-4">Approval Status</th>
                  <th className="px-5 py-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {moderationPets.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/20">
                    <td className="px-5 py-4 font-bold flex items-center gap-3">
                      <img
                        src={p.photos?.[0] || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200'}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div>{p.name}</div>
                        <div className="text-xs text-slate-400 font-normal">
                          {p.breed} • {p.species}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="capitalize font-semibold text-xs text-amber-500">
                        {p.listingType} {p.price > 0 && `($${p.price})`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {p.flags?.length > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {p.flags.length} Flags
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Clean</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {p.isApproved ? (
                        <span className="text-xs font-bold text-emerald-400">Approved ✓</span>
                      ) : (
                        <span className="text-xs font-bold text-rose-400">Hidden / Blocked</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleModeratePet(p._id, !p.isApproved, true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          p.isApproved
                            ? 'bg-slate-800 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                        }`}
                      >
                        {p.isApproved ? 'Hide Listing' : 'Approve & Clear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: USER MANAGEMENT --- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs font-bold uppercase">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Account Status</th>
                  <th className="px-5 py-4 text-right">Ban Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/20">
                    <td className="px-5 py-4 font-bold">{u.name}</td>
                    <td className="px-5 py-4 text-slate-300">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-amber-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.isBanned ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {u.role !== 'Admin' && (
                        <button
                          onClick={() => handleToggleBan(u._id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            u.isBanned
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/30'
                          }`}
                        >
                          {u.isBanned ? 'Unban Account' : 'Suspend / Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
