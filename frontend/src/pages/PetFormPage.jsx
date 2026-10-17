import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PawPrint,
  PlusCircle,
  Trash2,
  Upload,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

const PetFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { isDark } = useTheme();

  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shelters, setShelters] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: 1,
    gender: 'Male',
    size: 'Medium',
    color: '',
    listingType: 'adoption',
    price: 0,
    status: 'Available',
    shelterId: '',
    description: '',
    rescueStory: '',
    temperament: ['Friendly', 'Playful'],
    healthNotes: 'Vaccinated and checked by veterinarian',
    city: 'San Francisco',
    state: 'CA',
    photos: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'],
    vaccinations: [{ name: 'Rabies', date: '2025-10-01', nextDue: '2026-10-01' }],
  });

  const [temperamentInput, setTemperamentInput] = useState('');

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const res = await API.get('/shelters');
        setShelters(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching shelters:', err);
      }
    };
    fetchShelters();

    if (isEditing) {
      const fetchPet = async () => {
        try {
          const res = await API.get(`/pets/${id}`);
          const p = res.data.data;
          setFormData({
            name: p.name || '',
            species: p.species || 'Dog',
            breed: p.breed || '',
            age: p.age ?? 1,
            gender: p.gender || 'Male',
            size: p.size || 'Medium',
            color: p.color || '',
            listingType: p.listingType || 'adoption',
            price: p.price ?? 0,
            status: p.status || 'Available',
            shelterId: p.shelterId?._id || '',
            description: p.description || '',
            rescueStory: p.rescueStory || '',
            temperament: p.temperament?.length ? p.temperament : ['Friendly'],
            healthNotes: p.healthNotes || '',
            city: p.location?.city || 'San Francisco',
            state: p.location?.state || 'CA',
            photos: p.photos?.length ? p.photos : [''],
            vaccinations: p.vaccinations?.map((v) => ({
              name: v.name,
              date: v.date ? v.date.split('T')[0] : '',
              nextDue: v.nextDue ? v.nextDue.split('T')[0] : '',
            })) || [],
          });
        } catch (err) {
          toastError('Error loading pet details');
          navigate('/');
        } finally {
          setLoading(false);
        }
      };
      fetchPet();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (idx, value) => {
    const next = [...formData.photos];
    next[idx] = value;
    setFormData((prev) => ({ ...prev, photos: next }));
  };

  const addPhotoField = () => {
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ''] }));
  };

  const removePhotoField = (idx) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', files[0]);

      const res = await API.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url) {
        success('Image uploaded successfully!');
        setFormData((prev) => ({
          ...prev,
          photos: [res.data.url, ...prev.photos.filter((p) => p !== '')],
        }));
      }
    } catch (err) {
      toastError('File upload failed. Ensure image is PNG, JPG, or WEBP under 5MB.');
    } finally {
      setUploading(false);
    }
  };

  const addTemperamentTag = () => {
    if (!temperamentInput.trim()) return;
    if (!formData.temperament.includes(temperamentInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        temperament: [...prev.temperament, temperamentInput.trim()],
      }));
    }
    setTemperamentInput('');
  };

  const removeTemperamentTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      temperament: prev.temperament.filter((t) => t !== tag),
    }));
  };

  const addVaccinationRow = () => {
    setFormData((prev) => ({
      ...prev,
      vaccinations: [...prev.vaccinations, { name: '', date: '', nextDue: '' }],
    }));
  };

  const updateVaccination = (idx, field, val) => {
    const next = [...formData.vaccinations];
    next[idx][field] = val;
    setFormData((prev) => ({ ...prev, vaccinations: next }));
  };

  const removeVaccination = (idx) => {
    setFormData((prev) => ({
      ...prev,
      vaccinations: prev.vaccinations.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        age: Number(formData.age),
        gender: formData.gender,
        size: formData.size,
        color: formData.color,
        listingType: formData.listingType,
        price: Number(formData.price || 0),
        status: formData.status,
        shelterId: formData.shelterId || undefined,
        description: formData.description,
        rescueStory: formData.rescueStory,
        temperament: formData.temperament,
        healthNotes: formData.healthNotes,
        location: {
          city: formData.city,
          state: formData.state,
          lat: 37.7749,
          lng: -122.4194,
        },
        photos: formData.photos.filter((p) => p.trim() !== ''),
        vaccinations: formData.vaccinations.filter((v) => v.name && v.date),
      };

      if (isEditing) {
        await API.put(`/pets/${id}`, payload);
        success(`${formData.name}'s listing updated!`);
      } else {
        await API.post('/pets', payload);
        success(`New listing for ${formData.name} published successfully! 🐾`);
      }

      if (user?.role === 'Admin') {
        navigate('/admin/pets');
      } else {
        navigate('/seller/dashboard');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading pet details..." />;
  }

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all outline-none border ${
    isDark
      ? 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDark ? 'text-slate-300' : 'text-slate-700'
  }`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 animate-fade-in-up">
      
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">
          {isEditing ? 'Edit Mode' : 'New Listing'}
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-black">
          {isEditing ? `Edit ${formData.name}` : 'Create a New Pet Listing'}
        </h1>
        <p className="text-sm text-slate-400">
          Provide accurate health information, vaccinations, and photos to connect with responsible adopters and buyers.
        </p>
      </div>

      {/* Ethics Warning Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-bold">Animal Welfare Policy:</span> All listings are reviewed for compliance.
          Listing prohibited wild/endangered species or animals from puppy mills is strictly forbidden and results in immediate account suspension.
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-stone-200'
      }`}>
        
        {/* Listing Type & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/60">
          <div>
            <label className={labelClass}>Listing Classification</label>
            <select
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="adoption">Adoption (Shelter / Rescuer)</option>
              <option value="sale">Marketplace Sale (Verified Breeder/Seller)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {formData.listingType === 'sale' ? 'Sale Price ($ USD)' : 'Adoption Fee ($ USD, 0 for free)'}
            </label>
            <input
              type="number"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={inputClass}
              placeholder="0"
              required
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Pet Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Buddy"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Species</label>
            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other Domestic Pet</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Breed</label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="e.g. Golden Retriever Mix"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Age (Years)</label>
            <input
              type="number"
              min="0"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Size</label>
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Small">Small (under 20 lbs)</option>
              <option value="Medium">Medium (20-50 lbs)</option>
              <option value="Large">Large (50-90 lbs)</option>
              <option value="Extra Large">Extra Large (90+ lbs)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Adopted">Adopted</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>

        {/* Location & Color */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Color / Coat Marking</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g. Golden Cream, Tricolor"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="San Francisco"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="CA"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Shelter Assignment (Optional) */}
        {shelters.length > 0 && (
          <div>
            <label className={labelClass}>Partner Shelter (Optional)</label>
            <select
              name="shelterId"
              value={formData.shelterId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">None / Private Rescuer</option>
              {shelters.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.location?.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Temperament Tags */}
        <div className="space-y-2">
          <label className={labelClass}>Temperament Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={temperamentInput}
              onChange={(e) => setTemperamentInput(e.target.value)}
              placeholder="e.g. Kid-friendly, Gentle, High Energy, Cuddly..."
              className={inputClass}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTemperamentTag();
                }
              }}
            />
            <button
              type="button"
              onClick={addTemperamentTag}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold text-white shrink-0"
            >
              Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {formData.temperament.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTemperamentTag(tag)}
                  className="hover:text-rose-400 ml-1 text-sm font-black"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Description & Health Notes */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Description & Bio</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Personality, behavior with other animals, training history, favorite toys..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>Health Notes & Medical Summary</label>
            <input
              type="text"
              name="healthNotes"
              value={formData.healthNotes}
              onChange={handleChange}
              placeholder="e.g. Spayed/Neutered, microchipped, negative FeLV/FIV test..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Photos (File Upload & URL) */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Pet Photos (URLs or Upload)</label>
            <label className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload Image File'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {formData.photos.map((url, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={url}
                onChange={(e) => handlePhotoChange(idx, e.target.value)}
                className={inputClass}
              />
              {formData.photos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhotoField(idx)}
                  className="p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addPhotoField}
            className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Another Photo URL
          </button>
        </div>

        {/* Vaccinations */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Vaccinations & Preventive Care</label>
            <button
              type="button"
              onClick={addVaccinationRow}
              className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add Vaccine Record
            </button>
          </div>

          {formData.vaccinations.map((vax, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
              <input
                type="text"
                placeholder="Vaccine Name (e.g. Rabies)"
                value={vax.name}
                onChange={(e) => updateVaccination(idx, 'name', e.target.value)}
                className={inputClass}
              />
              <input
                type="date"
                value={vax.date}
                onChange={(e) => updateVaccination(idx, 'date', e.target.value)}
                className={inputClass}
                title="Date Given"
              />
              <input
                type="date"
                value={vax.nextDue}
                onChange={(e) => updateVaccination(idx, 'nextDue', e.target.value)}
                className={inputClass}
                title="Next Due Date"
              />
              <button
                type="button"
                onClick={() => removeVaccination(idx)}
                className="p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center justify-center sm:w-12"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3.5 rounded-xl border border-slate-700 text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl font-black bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving Listing...' : isEditing ? 'Save Changes' : 'Publish Listing'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default PetFormPage;
