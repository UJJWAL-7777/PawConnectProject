import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import PetCard from '../components/PetCard';
import {
  Heart,
  FileText,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const AdopterDashboardPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'favorites' | 'orders'
  const [loading, setLoading] = useState(true);

  const [myRequests, setMyRequests] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqsRes, favsRes, ordersRes] = await Promise.all([
        API.get('/adoption-requests/mine'),
        API.get('/pets/favorites/mine'),
        API.get('/orders/mine'),
      ]);

      setMyRequests(reqsRes.data?.data || []);
      setMyFavorites(favsRes.data?.data || []);
      setMyOrders(ordersRes.data?.data || []);
    } catch (err) {
      console.error('Error loading adopter data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your applications & favorites..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-gradient-to-r from-rose-500/10 via-slate-900 to-slate-900 border-rose-500/20 shadow-xl space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black">Adopter & Buyer Hub</h1>
        <p className="text-sm text-slate-400">
          Track your adoption applications, wishlist of favorite pets, and order receipts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          My Applications ({myRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          Saved Wishlist ({myFavorites.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Purchases ({myOrders.length})
        </button>
      </div>

      {/* Tab 1: Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="text-4xl">🐾</div>
              <h3 className="text-base font-bold">No active adoption applications</h3>
              <p className="text-xs text-slate-400">
                Found a pet you love? Click "Adopt" on any pet profile to submit an application.
              </p>
              <Link
                to="/"
                className="inline-flex px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 transition-all"
              >
                Browse Pets Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex gap-4 items-start">
                    <img
                      src={req.petId?.photos?.[0] || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300'}
                      alt=""
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-black"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">{req.petId?.name || 'Pet'}</h4>
                        <Badge status={req.status} />
                      </div>
                      <p className="text-xs text-slate-400">
                        {req.petId?.breed} • {req.petId?.species}
                      </p>
                      <p className="text-xs text-slate-300">
                        <span className="text-slate-500">Your note:</span> "{req.message}"
                      </p>
                      {req.rejectionReason && (
                        <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                          Rescuer note: {req.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                    <div className="text-right">
                      <div>Submitted: {new Date(req.requestedAt).toLocaleDateString()}</div>
                      {req.resolvedAt && (
                        <div>Updated: {new Date(req.resolvedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                    {req.petId && (
                      <Link
                        to={`/pets/${req.petId._id}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1"
                      >
                        Pet Info <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {myFavorites.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-3">
              <Heart className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold">No saved pets in your wishlist</h3>
              <p className="text-xs text-slate-400">
                Click the heart icon on any pet card to bookmark pets you're interested in.
              </p>
              <Link
                to="/"
                className="inline-flex px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 transition-all"
              >
                Find Pets to Favorite
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myFavorites.map((pet, idx) => (
                <PetCard key={pet._id} pet={pet} index={idx} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold">No purchases yet</h3>
              <p className="text-xs text-slate-400">Marketplace pet sales with Stripe receipts will be shown here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-400 text-lg">${ord.amount}</span>
                      <Badge status={ord.paymentStatus} />
                      <span className="text-xs text-slate-400">Order #{ord._id.slice(-6)}</span>
                    </div>
                    <div className="font-bold text-sm">
                      Pet: {ord.petId?.name} ({ord.petId?.breed})
                    </div>
                    <div className="text-xs text-slate-400">
                      Seller: {ord.sellerId?.name} • Handover Method: {ord.deliveryOption}
                    </div>
                    <div className="text-xs text-slate-400">
                      Address: {ord.shippingAddress?.street}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 text-right space-y-2">
                    <div>Date: {new Date(ord.createdAt).toLocaleDateString()}</div>
                    {ord.petId && (
                      <Link
                        to={`/pets/${ord.petId._id}`}
                        className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                      >
                        View Pet
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdopterDashboardPage;
