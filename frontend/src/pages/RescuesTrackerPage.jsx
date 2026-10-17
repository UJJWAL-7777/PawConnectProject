import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AlertTriangle,
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Filter,
} from 'lucide-react';

const RescuesTrackerPage = () => {
  const { user, isRescuer, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark } = useTheme();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (speciesFilter) params.species = speciesFilter;

      const res = await API.get('/rescue-reports', { params });
      setReports(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, speciesFilter]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await API.put(`/rescue-reports/${reportId}`, { status: newStatus });
      success(`Rescue status updated to ${newStatus}`);
      fetchReports();
    } catch (err) {
      toastError('Failed to update status');
    }
  };

  const canManage = isRescuer || isAdmin;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="p-6 sm:p-10 rounded-3xl border bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border-rose-900/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Live Community Alert Network
          </div>
          <h1 className="text-3xl font-black text-white">Rescue Reports & Dispatch Tracker</h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Real-time feed of stray, lost, and injured animals reported by our community.
            Volunteers and shelters coordinate care and emergency medical transport here.
          </p>
        </div>

        <Link
          to="/report-rescue"
          className="px-6 py-3.5 rounded-2xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 transition-all text-sm shrink-0 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Report an Animal
        </Link>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['', 'Reported', 'In-Progress', 'Rescued', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-white border-stone-200 text-slate-700'
              }`}
            >
              {st === '' ? 'All Reports' : st}
            </button>
          ))}
        </div>

        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-stone-200 text-slate-700'
          }`}
        >
          <option value="">All Species</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
          <option value="Rabbit">Rabbits</option>
          <option value="Bird">Birds</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <LoadingSpinner size="lg" text="Fetching rescue reports..." />
      ) : reports.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold">No active reports matching criteria</h3>
          <p className="text-xs text-slate-400">All animals in this category are accounted for or rescued.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report._id}
              className={`rounded-3xl border p-5 space-y-4 flex flex-col justify-between transition-all ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              {/* Photo & Badges */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={report.photos?.[0] || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600'}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 z-10">
                  <Badge status={report.animalCondition} />
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <Badge status={report.status} />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-500">
                    {report.species || 'Animal'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3">
                  "{report.description || 'No description provided'}"
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{report.location?.address || 'GPS Location'}</span>
                </div>

                <div className="text-xs text-slate-400 pt-1">
                  Reported by: <span className="text-slate-200 font-semibold">{report.reporterName}</span>
                  {report.reporterPhone && ` • ${report.reporterPhone}`}
                </div>
              </div>

              {/* Volunteer actions */}
              {canManage && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  {report.status === 'Reported' && (
                    <button
                      onClick={() => handleUpdateStatus(report._id, 'In-Progress')}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-slate-950 transition-colors"
                    >
                      Dispatch / In Progress
                    </button>
                  )}
                  {report.status === 'In-Progress' && (
                    <button
                      onClick={() => handleUpdateStatus(report._id, 'Rescued')}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
                    >
                      Mark Rescued ✓
                    </button>
                  )}
                  {report.status === 'Rescued' && (
                    <button
                      onClick={() => handleUpdateStatus(report._id, 'Closed')}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Archive / Close
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default RescuesTrackerPage;
