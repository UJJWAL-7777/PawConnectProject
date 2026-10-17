import { useState, useEffect } from 'react';
import API from '../api/axios';
import RescueReportCard from '../components/RescueReportCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ManageRescuesPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const response = await API.get('/rescue-reports', { params });
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, status) => {
    try {
      await API.put(`/rescue-reports/${reportId}`, { status });
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-black text-white tracking-tight">Manage Rescues</h1>
        <p className="text-slate-400 text-sm mt-1">Review and action reported rescue cases</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up stagger-2">
        {['', 'Reported', 'Rescued', 'Closed'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === s
                ? 'bg-amber-400 text-dark-900 shadow-md shadow-amber-400/20'
                : 'bg-dark-800 text-slate-300 border border-white/10 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {s || 'All Reports'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading rescue reports..." />
      ) : reports.length === 0 ? (
        <div className="rounded-2xl bg-dark-800/40 border border-white/5 p-12 text-center animate-fade-in-up">
          <div className="text-5xl mb-3">🚨</div>
          <h3 className="text-lg font-bold text-white mb-1">No reports found</h3>
          <p className="text-slate-400 text-sm">
            {filter
              ? `No rescue reports with status "${filter}"`
              : 'No rescue reports have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {reports.map((report, i) => (
            <div key={report._id} className={`stagger-${(i % 6) + 1} animate-fade-in-up w-full`}>
              <RescueReportCard
                report={report}
                isAdmin={true}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageRescuesPage;
