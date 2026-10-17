import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import {
  PlusCircle,
  ClipboardList,
  ShoppingBag,
  Heart,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Clock,
} from 'lucide-react';

const SellerDashboardPage = () => {
  const { user, isDark } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'requests' | 'orders'
  const [loading, setLoading] = useState(true);

  const [myPets, setMyPets] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);

  // Rejection note modal
  const [rejectModal, setRejectModal] = useState({ open: false, requestId: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [petsRes, reqsRes, ordersRes] = await Promise.all([
        API.get(`/pets?ownerId=${user._id}&limit=100`),
        API.get('/adoption-requests/received'),
        API.get('/orders/received'),
      ]);

      setMyPets(petsRes.data?.data || []);
      setReceivedRequests(reqsRes.data?.data || []);
      setReceivedOrders(ordersRes.data?.data || []);
    } catch (err) {
      console.error('Error loading seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Handle pet status change
  const handleMarkStatus = async (petId, newStatus) => {
    try {
      await API.put(`/pets/${petId}`, { status: newStatus });
      success(`Pet status marked as ${newStatus}`);
      loadDashboardData();
    } catch (err) {
      toastError('Failed to update status');
    }
  };

  // Delete pet listing
  const handleDeletePet = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await API.delete(`/pets/${petId}`);
      success('Pet listing removed');
      loadDashboardData();
    } catch (err) {
      toastError('Failed to remove listing');
    }
  };

  // Handle request Approve
  const handleApproveRequest = async (requestId) => {
    setActionLoading(true);
    try {
      await API.put(`/adoption-requests/${requestId}/status`, { status: 'Approved' });
      success('Adoption request approved! Congratulations to the adopter! 🐾');
      loadDashboardData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle request Reject
  const handleRejectRequest = async () => {
    if (!rejectModal.requestId) return;
    setActionLoading(true);
    try {
      await API.put(`/adoption-requests/${rejectModal.requestId}/status`, {
        status: 'Rejected',
        rejectionReason: rejectModal.reason,
      });
      success('Adoption request declined.');
      setRejectModal({ open: false, requestId: null, reason: '' });
      loadDashboardData();
    } catch (err) {
      toastError('Failed to decline request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading Seller Dashboard..." />;
  }

  const isVerified = user?.isVerified;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black">Seller & Rescuer Hub</h1>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Seller
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" /> Pending Verification
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Manage your pet listings, adoption requests, and sale orders in one place.
          </p>
        </div>

        <Link
          to="/pets/new"
          className="px-6 py-3.5 rounded-2xl font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Add New Pet Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          My Listings ({myPets.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          Incoming Adoption Requests ({receivedRequests.length})
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
          Marketplace Orders ({receivedOrders.length})
        </button>
      </div>

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {myPets.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="text-4xl">🐾</div>
              <h3 className="text-lg font-bold">You haven't listed any pets yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                List a rescued pet for adoption or list a pet for verified marketplace sale.
              </p>
              <Link
                to="/pets/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Create First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPets.map((pet) => (
                <div
                  key={pet._id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <img
                      src={pet.photos?.[0] || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'}
                      alt={pet.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-black"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base truncate">{pet.name}</h4>
                        <Badge status={pet.status} />
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {pet.breed} • {pet.species}
                      </p>
                      <div className="text-xs font-semibold text-amber-500">
                        {pet.listingType === 'sale' ? `For Sale: $${pet.price}` : `Adoption Fee: $${pet.price}`}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      to={`/pets/${pet._id}`}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                      title="View public page"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>

                    <Link
                      to={`/pets/${pet._id}/edit`}
                      className="p-2 rounded-xl bg-slate-800 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1"
                      title="Edit pet details"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>

                    {pet.status === 'Available' && (
                      <button
                        onClick={() =>
                          handleMarkStatus(
                            pet._id,
                            pet.listingType === 'sale' ? 'Sold' : 'Adopted'
                          )
                        }
                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold"
                      >
                        Mark as {pet.listingType === 'sale' ? 'Sold' : 'Adopted'}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeletePet(pet._id)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Incoming Adoption Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40">
              <Heart className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold">No incoming adoption requests yet</h3>
              <p className="text-xs text-slate-400">Applications from potential adopters will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-500 text-sm">
                        {req.userId?.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          {req.userId?.name} applying for{' '}
                          <span className="text-amber-400">{req.petId?.name}</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          {req.userId?.email} • {req.applicantInfo?.phone || req.userId?.phone}
                        </p>
                      </div>
                      <Badge status={req.status} className="ml-auto md:ml-2" />
                    </div>

                    <div className="text-xs text-slate-300 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                      <span className="font-semibold text-slate-400">Applicant note:</span> "{req.message || 'No additional note'}"
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      <span>🏠 {req.applicantInfo?.residenceType || 'House'}</span>
                      <span>🌿 Yard: {req.applicantInfo?.hasYard ? 'Yes' : 'No'}</span>
                      <span>⭐ Experience: {req.applicantInfo?.experienceYears || 0} yrs</span>
                      <span>🕒 {new Date(req.requestedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveRequest(req._id)}
                        disabled={actionLoading}
                        className="px-4 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectModal({ open: true, requestId: req._id, reason: '' })}
                        disabled={actionLoading}
                        className="px-4 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Marketplace Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {receivedOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40">
              <ShoppingBag className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold">No orders received yet</h3>
              <p className="text-xs text-slate-400">Completed purchases for your sale listings will show here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-400 text-lg">${ord.amount}</span>
                      <Badge status={ord.paymentStatus} />
                      <span className="text-xs text-slate-400">Order #{ord._id.slice(-6)}</span>
                    </div>
                    <div className="text-sm font-bold">
                      Pet: {ord.petId?.name} ({ord.petId?.breed})
                    </div>
                    <div className="text-xs text-slate-400">
                      Buyer: {ord.buyerId?.name} ({ord.buyerId?.email}) • Handover: {ord.deliveryOption}
                    </div>
                    <div className="text-xs text-slate-400">
                      Address: {ord.shippingAddress?.street}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 text-right">
                    <span>Date: {new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Decline Reason Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, requestId: null, reason: '' })}
        title="Decline Adoption Application"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Provide a kind reason for declining this request (optional, sent via notification).
          </p>
          <textarea
            rows={3}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white resize-none"
            placeholder="e.g. This pet requires a home without cats, or another applicant was selected..."
            value={rejectModal.reason}
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
          />
          <div className="flex gap-3">
            <button
              onClick={() => setRejectModal({ open: false, requestId: null, reason: '' })}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectRequest}
              disabled={actionLoading}
              className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-sm"
            >
              Confirm Decline
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default SellerDashboardPage;
