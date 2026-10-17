import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Heart,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Star,
  AlertTriangle,
  CreditCard,
  Calendar,
  CheckCircle2,
  Phone,
  Mail,
  Share2,
  FileText,
  DollarSign,
  Flag,
} from 'lucide-react';

const PetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, favorites, toggleFavorite } = useAuth();
  const { success, error: toastError, info } = useToast();
  const { isDark } = useTheme();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  // Modals state
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Adoption Form State
  const [applicantInfo, setApplicantInfo] = useState({
    phone: '',
    residenceType: 'House with Yard',
    hasYard: true,
    hasOtherPets: false,
    experienceYears: 3,
  });
  const [adoptMessage, setAdoptMessage] = useState('');
  const [submittingAdopt, setSubmittingAdopt] = useState(false);

  // Buy / Checkout Form State
  const [checkoutData, setCheckoutData] = useState({
    deliveryOption: 'Local Pickup',
    paymentMethod: 'test_mode', // or 'stripe'
    street: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });
  const [submittingBuy, setSubmittingBuy] = useState(false);

  // Report Form State
  const [reportReason, setReportReason] = useState('Suspected prohibited species or breeding policy violation');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchPet = async () => {
    try {
      const response = await API.get(`/pets/${id}`);
      setPet(response.data.data);
      if (user?.phone) {
        setApplicantInfo((prev) => ({ ...prev, phone: user.phone }));
      }
    } catch (err) {
      toastError('Pet not found or has been removed');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading pet profile and medical records..." />;
  }

  if (!pet) return null;

  const isFav = favorites?.some((f) => (typeof f === 'string' ? f : f?._id) === pet._id);
  const isSale = pet.listingType === 'sale';
  const isOwner = user && pet.ownerId && pet.ownerId._id?.toString() === user._id?.toString();

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      info('Please log in to save favorites');
      return;
    }
    const added = await toggleFavorite(pet._id);
    if (added) success(`Added ${pet.name} to favorites!`);
    else info(`Removed ${pet.name} from favorites`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Adopt ${pet.name} on PawConnect`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      info('Link copied to clipboard!');
    }
  };

  // Submit Adoption Application
  const submitAdoption = async (e) => {
    e.preventDefault();
    setSubmittingAdopt(true);
    try {
      await API.post('/adoption-requests', {
        petId: pet._id,
        message: adoptMessage,
        applicantInfo,
      });
      success(`Adoption application for ${pet.name} submitted successfully! 🎉`);
      setShowAdoptModal(false);
      fetchPet();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmittingAdopt(false);
    }
  };

  // Submit Buy / Checkout Order
  const submitBuy = async (e) => {
    e.preventDefault();
    setSubmittingBuy(true);
    try {
      const res = await API.post('/orders', {
        petId: pet._id,
        paymentMethod: checkoutData.paymentMethod,
        deliveryOption: checkoutData.deliveryOption,
        shippingAddress: {
          street: checkoutData.street,
          city: checkoutData.city,
          state: checkoutData.state,
          zipCode: checkoutData.zipCode,
        },
        notes: checkoutData.notes,
      });

      if (res.data.stripeUrl) {
        window.location.href = res.data.stripeUrl;
        return;
      }

      success(`Purchase complete! Order confirmation has been emailed to you.`);
      setShowBuyModal(false);
      fetchPet();
    } catch (err) {
      toastError(err.response?.data?.message || 'Purchase processing failed');
    } finally {
      setSubmittingBuy(false);
    }
  };

  // Submit Report
  const submitReport = async () => {
    setSubmittingReport(true);
    try {
      await API.post(`/pets/${pet._id}/report`, { reason: reportReason });
      success('Listing report submitted. Our safety team will review it.');
      setShowReportModal(false);
    } catch (err) {
      toastError('Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Submit Review for Seller
  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await API.post('/reviews', {
        sellerId: pet.ownerId?._id,
        petId: pet._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      success('Review posted successfully! Thank you for your feedback.');
      setShowReviewModal(false);
      setReviewComment('');
      fetchPet();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const photos = pet.photos?.length
    ? pet.photos
    : ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      
      {/* Top Navigation & Action Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          ← Back to Browse
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={`p-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-stone-200 text-slate-700'
            }`}
          >
            <Share2 className="w-4 h-4" /> Share
          </button>

          <button
            onClick={handleFavorite}
            className={`p-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
              isFav
                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-rose-400'
                : 'bg-white border-stone-200 text-slate-700 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            {isFav ? 'Favorited' : 'Favorite'}
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="p-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-rose-400 transition-colors text-xs flex items-center gap-1"
            title="Report this listing"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Details Grid: Gallery + Core Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Multi-photo Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Photo */}
          <div className="relative aspect-4/3 sm:aspect-16/11 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
            <img
              src={photos[activePhoto]}
              alt={pet.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            
            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <Badge status={pet.status} />
              {isSale ? (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-lg">
                  Marketplace Sale • ${pet.price}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-lg">
                  Adoption {pet.price > 0 ? `Fee: $${pet.price}` : '• Free'}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          {photos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activePhoto === idx
                      ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Temperament Badges */}
          {pet.temperament?.length > 0 && (
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Temperament & Personality
              </h4>
              <div className="flex flex-wrap gap-2">
                {pet.temperament.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  >
                    ✨ {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Story & Description */}
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <h3 className="text-xl font-bold">About {pet.name}</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line text-slate-300">
              {pet.description || 'A wonderful companion waiting to meet their new family.'}
            </p>

            {pet.rescueStory && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
                  Rescue Background
                </h4>
                <p className="text-sm leading-relaxed text-slate-400 italic">
                  "{pet.rescueStory}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Specs & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-stone-200 shadow-md'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  {pet.species} • {pet.gender}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {pet.location?.city || pet.shelterId?.location?.city || 'San Francisco, CA'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black">{pet.name}</h1>
              <p className="text-sm text-slate-400 mt-1">{pet.breed || 'Mixed Breed'}</p>
            </div>

            {/* Price display banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">
                  {isSale ? 'Marketplace Price' : 'Adoption Contribution'}
                </span>
                <span className="text-2xl font-black text-amber-500">
                  {pet.price > 0 ? `$${pet.price}` : 'Free Adoption'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 font-semibold block flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Listing
                </span>
                <span className="text-[11px] text-slate-400">Health Guarantee</span>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-xs text-slate-400 block">Age</span>
                <span className="font-bold text-sm">{pet.age} {pet.age === 1 ? 'Year' : 'Years'} Old</span>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-xs text-slate-400 block">Size</span>
                <span className="font-bold text-sm">{pet.size}</span>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-xs text-slate-400 block">Color</span>
                <span className="font-bold text-sm">{pet.color || 'Standard'}</span>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-xs text-slate-400 block">Vaccinated</span>
                <span className="font-bold text-sm text-emerald-400">
                  {pet.vaccinations?.length ? 'Up to Date ✓' : 'Scheduled'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {pet.status === 'Available' ? (
                isSale ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        info('Please log in to purchase');
                        navigate('/login');
                        return;
                      }
                      setShowBuyModal(true);
                    }}
                    className="w-full py-4 px-6 rounded-2xl font-black bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20 text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-5 h-5" /> Buy Pet (${pet.price})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        info('Please log in to apply for adoption');
                        navigate('/login');
                        return;
                      }
                      setShowAdoptModal(true);
                    }}
                    className="w-full py-4 px-6 rounded-2xl font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-5 h-5 fill-slate-950" /> Apply to Adopt {pet.name}
                  </button>
                )
              ) : (
                <div className="p-4 rounded-2xl text-center font-bold text-sm bg-slate-800/60 border border-slate-700 text-slate-300">
                  {pet.status === 'Sold' ? '🎉 This pet has been sold.' : `Status: ${pet.status}`}
                </div>
              )}

              {/* Edit pet if owner */}
              {isOwner && (
                <Link
                  to={`/pets/${pet._id}/edit`}
                  className="block w-full py-3 text-center text-sm font-bold rounded-xl border border-slate-700 hover:bg-slate-800 text-amber-400 transition-colors"
                >
                  Edit This Listing
                </Link>
              )}
            </div>
          </div>

          {/* Seller / Shelter Card */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {pet.shelterId ? 'Rescue Shelter' : 'Listed By'}
            </h4>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-amber-500/20 flex items-center justify-center font-bold text-amber-500 shrink-0">
                {pet.ownerId?.avatar ? (
                  <img src={pet.ownerId.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  pet.ownerId?.name?.charAt(0) || 'S'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base truncate">
                    {pet.shelterId?.name || pet.ownerId?.name || 'Verified Shelter'}
                  </span>
                  {pet.ownerId?.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {pet.ownerId?.role || 'Rescuer'} • Member since {new Date(pet.ownerId?.createdAt || Date.now()).getFullYear()}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-400 space-y-1.5">
              {pet.ownerId?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-500" /> {pet.ownerId.phone}
                </div>
              )}
              {pet.ownerId?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> {pet.ownerId.email}
                </div>
              )}
            </div>

            {pet.ownerId && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Rate / Review Seller
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Medical Records & Vaccinations Tabbed Section */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Medical History & Vaccinations</h3>
            <p className="text-xs text-slate-400">Verified veterinary care documentation</p>
          </div>
        </div>

        {/* Vaccinations Table */}
        {pet.vaccinations?.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/40 text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-5 py-3">Vaccine</th>
                  <th className="px-5 py-3">Date Administered</th>
                  <th className="px-5 py-3">Next Due Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pet.vaccinations.map((vax, idx) => {
                  const isOverdue = vax.nextDue && new Date(vax.nextDue) < new Date();
                  return (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="px-5 py-3.5 font-bold">{vax.name}</td>
                      <td className="px-5 py-3.5 text-slate-300">
                        {new Date(vax.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">
                        {vax.nextDue ? new Date(vax.nextDue).toLocaleDateString() : 'Lifetime'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          isOverdue ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isOverdue ? 'Due for Booster' : 'Up to Date'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Vaccination records pending shelter update.</p>
        )}

        {/* Medical Records (Clinics, diagnoses, medications) */}
        {pet.medicalRecords?.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Clinical Procedures & Vet Records
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pet.medicalRecords.map((rec) => (
                <div key={rec._id} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{rec.treatment}</span>
                    <span className="text-xs text-slate-400">{new Date(rec.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500">Vet:</span> {rec.vetName} ({rec.clinicName})
                  </div>
                  {rec.diagnosis && (
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500">Diagnosis:</span> {rec.diagnosis}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seller Reviews Section */}
      {pet.sellerReviews?.length > 0 && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Reviews & Ratings for Seller</h3>
              <p className="text-xs text-slate-400">Feedback from previous adopters and buyers</p>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-600 transition-colors"
            >
              Write Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pet.sellerReviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl bg-slate-800/20 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-xs text-amber-500">
                      {rev.reviewerId?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="font-semibold text-sm">{rev.reviewerId?.name}</span>
                  </div>
                  <div className="flex items-center text-amber-400 text-xs">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADOPTION APPLICATION --- */}
      <Modal
        isOpen={showAdoptModal}
        onClose={() => setShowAdoptModal(false)}
        title={`Adoption Application for ${pet.name}`}
      >
        <form onSubmit={submitAdoption} className="space-y-4">
          <p className="text-xs text-slate-400">
            Shelters review applications to ensure compatibility with your living situation.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              placeholder="(555) 012-3456"
              value={applicantInfo.phone}
              onChange={(e) => setApplicantInfo({ ...applicantInfo, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Housing Type</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                value={applicantInfo.residenceType}
                onChange={(e) => setApplicantInfo({ ...applicantInfo, residenceType: e.target.value })}
              >
                <option value="House with Yard">House with Yard</option>
                <option value="Apartment / Condo">Apartment / Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Farm / Rural">Farm / Rural</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Experience (Yrs)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                value={applicantInfo.experienceYears}
                onChange={(e) => setApplicantInfo({ ...applicantInfo, experienceYears: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Why would you be a great companion for {pet.name}?
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white resize-none"
              placeholder="Tell us about your daily routine, family, other pets, and living environment..."
              value={adoptMessage}
              onChange={(e) => setAdoptMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submittingAdopt}
            className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors text-sm disabled:opacity-50"
          >
            {submittingAdopt ? 'Submitting Application...' : 'Send Application'}
          </button>
        </form>
      </Modal>

      {/* --- MODAL 2: BUY / CHECKOUT MODAL (STRIPE TEST MODE) --- */}
      <Modal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        title={`Complete Purchase for ${pet.name}`}
      >
        <form onSubmit={submitBuy} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <span className="font-bold text-sm">Purchase Price:</span>
            <span className="font-black text-emerald-400 text-lg">${pet.price} USD</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Delivery / Handover Method</label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              value={checkoutData.deliveryOption}
              onChange={(e) => setCheckoutData({ ...checkoutData, deliveryOption: e.target.value })}
            >
              <option value="Local Pickup">Local Handover / In-Person Pickup</option>
              <option value="Shelter Handover">Sanctuary / Shelter Office Meeting</option>
              <option value="Pet Courier">Professional Climate-Controlled Pet Courier</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase">Contact & Handover Address</label>
            <input
              type="text"
              required
              placeholder="Street Address"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              value={checkoutData.street}
              onChange={(e) => setCheckoutData({ ...checkoutData, street: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                placeholder="City"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                value={checkoutData.city}
                onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
              />
              <input
                type="text"
                required
                placeholder="State"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                value={checkoutData.state}
                onChange={(e) => setCheckoutData({ ...checkoutData, state: e.target.value })}
              />
              <input
                type="text"
                required
                placeholder="Zip Code"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                value={checkoutData.zipCode}
                onChange={(e) => setCheckoutData({ ...checkoutData, zipCode: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Payment Simulation Mode</label>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pm"
                  value="test_mode"
                  checked={checkoutData.paymentMethod === 'test_mode'}
                  onChange={() => setCheckoutData({ ...checkoutData, paymentMethod: 'test_mode' })}
                />
                <span className="font-bold text-amber-400">Sandbox Test Payment (Instant Confirmation)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingBuy}
            className="w-full py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors text-sm disabled:opacity-50"
          >
            {submittingBuy ? 'Confirming Order...' : `Pay $${pet.price} & Reserve Pet`}
          </button>
        </form>
      </Modal>

      {/* --- MODAL 3: REPORT LISTING --- */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Pet Listing"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            PawConnect upholds strict ethics against illegal wildlife trade, puppy mills, and animal cruelty.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Reason for Flagging</label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="Prohibited or wild species listed">Prohibited or wild/endangered species listed</option>
              <option value="Suspected puppy mill or unethical breeding">Suspected puppy mill or unethical breeding</option>
              <option value="Inaccurate health or medical information">Inaccurate health or medical information</option>
              <option value="Scam, pricing fraud, or misleading photos">Scam, pricing fraud, or misleading photos</option>
              <option value="Other concern">Other violation of Terms of Service</option>
            </select>
          </div>

          <button
            onClick={submitReport}
            disabled={submittingReport}
            className="w-full py-3 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white transition-colors text-sm disabled:opacity-50"
          >
            {submittingReport ? 'Submitting Report...' : 'Submit to Moderation Team'}
          </button>
        </div>
      </Modal>

      {/* --- MODAL 4: REVIEW SELLER --- */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Leave a Review for Seller"
      >
        <form onSubmit={submitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={`p-2 rounded-xl text-xl transition-all ${
                    reviewRating >= star ? 'text-amber-400' : 'text-slate-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Your Feedback</label>
            <textarea
              required
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white resize-none"
              placeholder="Describe your communication with the seller, adoption transition, and experience..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submittingReview}
            className="w-full py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors text-sm disabled:opacity-50"
          >
            {submittingReview ? 'Posting Review...' : 'Post Review'}
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default PetDetailPage;
