import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  AlertTriangle,
  MapPin,
  Camera,
  Navigation,
  CheckCircle2,
  Phone,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const ReportRescuePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError, info } = useToast();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  const [formData, setFormData] = useState({
    reporterName: user?.name || '',
    reporterPhone: user?.phone || '',
    species: 'Dog',
    animalCondition: 'Injured',
    description: '',
    photo: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800',
    address: 'Near Golden Gate Park entrance, San Francisco',
    lat: '37.7749',
    lng: '-122.4194',
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toastError('Geolocation is not supported by your browser');
      return;
    }

    setDetectingGps(true);
    info('Detecting your GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          address: `GPS Location: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }));
        setDetectingGps(false);
        toastSuccess('GPS coordinates captured!');
      },
      (err) => {
        setDetectingGps(false);
        toastError('Unable to retrieve location. Please enter address manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        reporterName: formData.reporterName,
        reporterPhone: formData.reporterPhone,
        species: formData.species,
        animalCondition: formData.animalCondition,
        description: formData.description,
        photos: formData.photo ? [formData.photo] : [],
        lat: Number(formData.lat) || 37.7749,
        lng: Number(formData.lng) || -122.4194,
        address: formData.address,
      };

      await API.post('/rescue-reports', payload);
      setSuccess(true);
      toastSuccess('Rescue report dispatched! Volunteer networks alerted.');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all outline-none border ${
    isDark
      ? 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDark ? 'text-slate-300' : 'text-slate-700'
  }`;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in-up space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-4xl shadow-xl">
          ✓
        </div>
        <h1 className="text-3xl font-black">Report Dispatched Successfully</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Thank you for looking out for vulnerable animals. Nearby partner shelters, volunteers, and rescue units have been alerted with your location notes.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/rescues"
            className="px-6 py-3.5 rounded-xl font-bold bg-amber-500 text-slate-950 text-sm shadow-lg shadow-amber-500/25"
          >
            View Live Tracker
          </Link>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-3.5 rounded-xl font-semibold border border-slate-700 text-sm hover:bg-slate-800"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <AlertTriangle className="w-3.5 h-3.5" /> Emergency Community Reporting
        </div>
        <h1 className="text-3xl font-black">Report a Stray, Lost, or Injured Animal</h1>
        <p className="text-sm text-slate-400">
          Provide accurate details and photos to help dispatch nearby volunteers and medical transports.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-stone-200'
      }`}>
        
        {/* Reporter info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Your Name</label>
            <input
              type="text"
              required
              className={inputClass}
              placeholder="e.g. Maria Santos"
              value={formData.reporterName}
              onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Contact Phone (for Rescuers)</label>
            <input
              type="text"
              required
              className={inputClass}
              placeholder="(555) 000-0000"
              value={formData.reporterPhone}
              onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
            />
          </div>
        </div>

        {/* Species & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Animal Species</label>
            <select
              className={inputClass}
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
            >
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other Animal</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Animal Condition</label>
            <select
              className={inputClass}
              value={formData.animalCondition}
              onChange={(e) => setFormData({ ...formData, animalCondition: e.target.value })}
            >
              <option value="Critical">🚨 Critical (Urgent Emergency Care Needed)</option>
              <option value="Injured">⚠️ Injured (Limping, Bleeding, Visible Pain)</option>
              <option value="Healthy">🐾 Healthy / Stray (Lost or Abandoned)</option>
              <option value="Unknown">❓ Unknown Condition</option>
            </select>
          </div>
        </div>

        {/* Location with GPS Auto-detect */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Animal Location & Address</label>
            <button
              type="button"
              onClick={detectLocation}
              disabled={detectingGps}
              className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              {detectingGps ? 'Detecting...' : 'Detect GPS Location'}
            </button>
          </div>

          <input
            type="text"
            required
            className={inputClass}
            placeholder="Street address, landmarks, park trail, or intersection..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <input
              type="text"
              placeholder="Latitude"
              className={inputClass}
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            />
            <input
              type="text"
              placeholder="Longitude"
              className={inputClass}
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Condition & Situation Details</label>
          <textarea
            required
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Describe the animal's behavior, collar, proximity to roads, friendliness, whether food/water has been offered..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Photo URL */}
        <div>
          <label className={labelClass}>Photo URL of Animal (Recommended)</label>
          <div className="relative">
            <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              className={`${inputClass} pl-10`}
              placeholder="https://images.unsplash.com/... or uploaded photo link"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl font-black bg-rose-500 hover:bg-rose-600 text-white text-base shadow-xl shadow-rose-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? 'Transmitting Report...' : 'Broadcast Emergency Rescue Report'}
          <ArrowRight className="w-4 h-4" />
        </button>

      </form>
    </div>
  );
};

export default ReportRescuePage;
