import { useState, useEffect } from 'react';
import API from '../api/axios';
import AdoptionRequestCard from '../components/AdoptionRequestCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const response = await API.get('/adoption-requests', { params });
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusFilters = ['', 'Pending', 'Approved', 'Rejected'];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-black text-white tracking-tight">My Adoption Requests</h1>
        <p className="text-slate-400 text-sm mt-1">Track the progress of your pet adoption applications</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up stagger-2">
        {statusFilters.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === s
                ? 'bg-amber-400 text-dark-900 shadow-md shadow-amber-400/20'
                : 'bg-dark-800 text-slate-300 border border-white/10 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {s || 'All Requests'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your requests..." />
      ) : requests.length === 0 ? (
        <div className="rounded-2xl bg-dark-800/40 border border-white/5 p-12 text-center animate-fade-in-up">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="text-lg font-bold text-white mb-1">No requests yet</h3>
          <p className="text-slate-400 text-sm">
            Browse available pets and submit your first adoption request!
          </p>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {requests.map((request, i) => (
            <div key={request._id} className={`stagger-${(i % 6) + 1} animate-fade-in-up w-full`}>
              <AdoptionRequestCard request={request} isAdmin={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequestsPage;
