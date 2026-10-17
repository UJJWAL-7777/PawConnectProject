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
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Edit2,
  Save,
  Check,
  Heart,
  Calendar,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark } = useTheme();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    avatar: '',
  });

  const fetchProfile = async () => {
    try {
      const response = await API.get('/auth/me');
      const data = response.data.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        street: data.address?.street || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        zipCode: data.address?.zipCode || '',
        avatar: data.avatar || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        avatar: formData.avatar,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
      });
      success('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading user profile..." />;
  }

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
    isDark
      ? 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500'
      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500'
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1 ${
    isDark ? 'text-slate-300' : 'text-slate-700'
  }`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 animate-fade-in">
      
      {/* Profile Header Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-stone-200'
      }`}>
        <div className="w-24 h-24 rounded-3xl overflow-hidden bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-3xl font-black text-amber-500 shrink-0 shadow-lg">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            profile?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-black">{profile?.name}</h1>
            {profile?.isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Member
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">{profile?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 pt-1">
            <span className="font-semibold text-amber-500">{profile?.role} Role</span>
            <span>•</span>
            <span>Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 transition-colors flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSave} className={`p-6 sm:p-8 rounded-3xl border space-y-4 shadow-xl ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <h3 className="font-bold text-lg mb-2">Update Personal Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                required
                className={inputClass}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="text"
                className={inputClass}
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Avatar Image URL</label>
            <input
              type="text"
              className={inputClass}
              placeholder="https://images.unsplash.com/..."
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Street Address</label>
              <input
                type="text"
                className={inputClass}
                placeholder="123 Oak St"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                className={inputClass}
                placeholder="San Francisco"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input
                type="text"
                className={inputClass}
                placeholder="CA"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        /* Summary Grid */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-5 rounded-2xl border text-center ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <span className="text-3xl font-black text-amber-500">{profile?.adoptedPets?.length || 0}</span>
            <span className="text-xs text-slate-400 font-semibold block mt-1">Adopted Pets</span>
          </div>

          <div className={`p-5 rounded-2xl border text-center ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <span className="text-3xl font-black text-emerald-400">{profile?.favorites?.length || 0}</span>
            <span className="text-xs text-slate-400 font-semibold block mt-1">Saved to Wishlist</span>
          </div>

          <div className={`p-5 rounded-2xl border text-center ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <span className="text-3xl font-black">{profile?.role}</span>
            <span className="text-xs text-slate-400 font-semibold block mt-1">User Account Type</span>
          </div>
        </div>
      )}

      {/* Adopted Pets Showcase */}
      {profile?.adoptedPets?.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            My Adopted Pets ({profile.adoptedPets.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.adoptedPets.map((pet, idx) => (
              <PetCard key={pet._id || idx} pet={pet} index={idx} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
