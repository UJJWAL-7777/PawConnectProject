import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

const ManagePetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPets();
  }, [filter]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter) params.status = filter;
      const response = await API.get('/pets', { params });
      setPets(response.data.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await API.delete(`/pets/${id}`);
      setPets((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Manage Pets</h1>
          <p className="text-slate-400 text-sm mt-1">{pets.length} pets listed in system</p>
        </div>
        <Link
          to="/admin/pets/new"
          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-dark-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow-md shadow-amber-500/20 transition-all text-sm cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add New Pet
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up stagger-2">
        {['', 'Available', 'Pending', 'Adopted'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === s
                ? 'bg-amber-400 text-dark-900 shadow-md shadow-amber-400/20'
                : 'bg-dark-800 text-slate-300 border border-white/10 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {s || 'All Pets'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading pets..." />
      ) : pets.length === 0 ? (
        <div className="rounded-2xl bg-dark-800/40 border border-white/5 p-12 text-center">
          <div className="text-5xl mb-3">🐾</div>
          <h3 className="text-lg font-bold text-white mb-1">No pets found</h3>
          <p className="text-slate-400 text-sm">No pets match the current filter selection.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-dark-800/60 backdrop-blur-md animate-fade-in-up stagger-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-dark-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-5 py-4">Pet Info</th>
                <th className="px-5 py-4">Species</th>
                <th className="px-5 py-4">Breed</th>
                <th className="px-5 py-4">Age</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Shelter</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {pets.map((pet) => (
                <tr key={pet._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          pet.photos?.[0] ||
                          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100'
                        }
                        alt={pet.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white">{pet.name}</p>
                        <p className="text-slate-400 text-xs">{pet.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 font-medium">{pet.species}</td>
                  <td className="px-5 py-3.5 text-slate-300 font-medium">{pet.breed || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-300 font-medium">
                    {pet.age} {pet.age === 1 ? 'yr' : 'yrs'}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={pet.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs font-medium">
                    {pet.shelterId?.name || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/pets/${pet._id}/edit`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 border border-white/10 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pet._id, pet.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-200 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagePetsPage;
