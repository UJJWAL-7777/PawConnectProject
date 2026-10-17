import { Search, RotateCcw, Filter, DollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const FilterSidebar = ({ filters, setFilters }) => {
  const { isDark } = useTheme();

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      species: '',
      breed: '',
      status: '',
      listingType: '',
      size: '',
      gender: '',
      minAge: '',
      maxAge: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: '-createdAt',
      page: 1,
    });
  };

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl text-sm transition-all outline-none border ${
    isDark
      ? 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
      : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDark ? 'text-slate-300' : 'text-slate-700'
  }`;

  return (
    <div
      className={`rounded-2xl border p-5 space-y-5 w-full shadow-sm transition-colors duration-300 ${
        isDark
          ? 'bg-slate-900/70 border-slate-800'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-500" />
          Filter Listings
        </h3>
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-400 hover:text-amber-500 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className={labelClass}>Search</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            className={`${inputClass} pl-9`}
            placeholder="Name, breed, temperament..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Listing Type: All, Adoption, Sale */}
      <div>
        <label className={labelClass}>Listing Type</label>
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-800/40 border border-slate-700/50">
          {[
            { label: 'All', value: '' },
            { label: 'Adoption', value: 'adoption' },
            { label: 'For Sale', value: 'sale' },
          ].map((type) => {
            const isSelected = (filters.listingType || '') === type.value;
            return (
              <button
                key={type.label}
                type="button"
                onClick={() => handleChange('listingType', type.value)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Species */}
      <div>
        <label className={labelClass}>Species</label>
        <select
          className={inputClass}
          value={filters.species || ''}
          onChange={(e) => handleChange('species', e.target.value)}
        >
          <option value="">All Species (Dogs, Cats, Birds...)</option>
          <option value="Dog">🐕 Dogs</option>
          <option value="Cat">🐈 Cats</option>
          <option value="Bird">🐦 Birds</option>
          <option value="Rabbit">🐇 Rabbits</option>
          <option value="Other">🐾 Other Pets</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className={labelClass}>Availability Status</label>
        <select
          className={inputClass}
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Available">Available Now</option>
          <option value="Pending">Adoption Pending</option>
          <option value="Adopted">Adopted</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      {/* Price Range (especially for marketplace sale listings) */}
      <div>
        <label className={labelClass}>Price Range ($)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            className={inputClass}
            placeholder="Min $"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            min="0"
            className={inputClass}
            placeholder="Max $"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className={labelClass}>Gender</label>
        <select
          className={inputClass}
          value={filters.gender || ''}
          onChange={(e) => handleChange('gender', e.target.value)}
        >
          <option value="">Any Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      {/* Size */}
      <div>
        <label className={labelClass}>Pet Size</label>
        <select
          className={inputClass}
          value={filters.size || ''}
          onChange={(e) => handleChange('size', e.target.value)}
        >
          <option value="">Any Size</option>
          <option value="Small">Small (under 20 lbs)</option>
          <option value="Medium">Medium (20-50 lbs)</option>
          <option value="Large">Large (50-90 lbs)</option>
          <option value="Extra Large">Extra Large (90+ lbs)</option>
        </select>
      </div>

      {/* Age Range */}
      <div>
        <label className={labelClass}>Age Range (Years)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            className={inputClass}
            placeholder="Min Age"
            value={filters.minAge || ''}
            onChange={(e) => handleChange('minAge', e.target.value)}
          />
          <input
            type="number"
            min="0"
            className={inputClass}
            placeholder="Max Age"
            value={filters.maxAge || ''}
            onChange={(e) => handleChange('maxAge', e.target.value)}
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className={labelClass}>Sort By</label>
        <select
          className={inputClass}
          value={filters.sort || '-createdAt'}
          onChange={(e) => handleChange('sort', e.target.value)}
        >
          <option value="-createdAt">Newest Additions</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="age">Age: Youngest First</option>
          <option value="-age">Age: Oldest First</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSidebar;
