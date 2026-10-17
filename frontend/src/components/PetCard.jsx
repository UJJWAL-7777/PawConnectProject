import { Link } from 'react-router-dom';
import { Heart, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Badge from './Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const PetCard = ({ pet, index = 0 }) => {
  const { isAuthenticated, favorites, toggleFavorite } = useAuth();
  const { success, info } = useToast();
  const { isDark } = useTheme();

  const isFav = favorites?.some((id) => (typeof id === 'string' ? id : id?._id) === pet._id);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      info('Please log in to save pets to your favorites');
      return;
    }

    const added = await toggleFavorite(pet._id);
    if (added) {
      success(`Added ${pet.name} to your favorites! ❤️`);
    } else {
      info(`Removed ${pet.name} from favorites`);
    }
  };

  const placeholderImg =
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600';

  const speciesEmoji = {
    Dog: '🐕',
    Cat: '🐈',
    Bird: '🐦',
    Rabbit: '🐇',
    Other: '🐾',
  };

  const isSale = pet.listingType === 'sale';
  const locationCity =
    pet.location?.city ||
    (pet.shelterId?.location?.city ? pet.shelterId.location.city : 'San Francisco, CA');

  return (
    <Link
      to={`/pets/${pet._id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 w-full h-full hover:-translate-y-1.5 hover:shadow-xl ${
        isDark
          ? 'bg-slate-900/80 border-slate-800/80 hover:border-amber-500/40 hover:shadow-amber-500/5'
          : 'bg-white border-slate-200/90 hover:border-amber-500/40 hover:shadow-slate-300/60'
      }`}
    >
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden shrink-0 bg-slate-950">
        <img
          src={pet.photos?.[0] || placeholderImg}
          alt={pet.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          loading="lazy"
          onError={(e) => {
            e.target.src = placeholderImg;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          {/* Species Emoji */}
          <div className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-sm shadow-sm">
            {speciesEmoji[pet.species] || '🐾'}
          </div>

          {/* Listing Type & Price Pill */}
          {isSale ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 shadow-md">
              For Sale • ${pet.price}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
              Adoption {pet.price > 0 ? `• $${pet.price}` : '• Free'}
            </span>
          )}
        </div>

        {/* Favorite Heart Button & Status */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <Badge status={pet.status} />

          <button
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
            className={`w-9 h-9 rounded-xl backdrop-blur-md border flex items-center justify-center transition-transform active:scale-90 ${
              isFav
                ? 'bg-rose-500/90 border-rose-400 text-white shadow-lg shadow-rose-500/30'
                : 'bg-black/50 border-white/20 text-white/80 hover:text-rose-400 hover:bg-black/70'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* City Location on photo */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs text-white/90">
          <span className="flex items-center gap-1 font-medium drop-shadow-sm truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {locationCity}
          </span>
          {pet.ownerId?.isVerified && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-lg font-bold group-hover:text-amber-500 transition-colors duration-200 truncate ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {pet.name}
            </h3>
            {pet.age !== undefined && (
              <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {pet.age} {pet.age === 1 ? 'yr' : 'yrs'} old
              </span>
            )}
          </div>

          <p className="text-slate-400 text-xs font-medium truncate mt-0.5">
            {pet.breed || 'Mixed'} • {pet.species}
          </p>
        </div>

        {/* Temperament Tags */}
        {pet.temperament?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pet.temperament.slice(0, 3).map((trait, i) => (
              <span
                key={i}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                  isDark
                    ? 'bg-slate-800/70 text-slate-300 border border-slate-700/50'
                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Footer specs */}
        <div className={`flex items-center justify-between pt-3 border-t text-xs font-medium ${
          isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
        }`}>
          <div className="flex items-center gap-3">
            <span>{pet.gender}</span>
            <span>•</span>
            <span>{pet.size}</span>
          </div>

          {pet.vaccinations?.length > 0 && (
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Vaccinated
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PetCard;
