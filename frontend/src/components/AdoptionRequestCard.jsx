import Badge from './Badge';

const AdoptionRequestCard = ({ request, isAdmin, onUpdateStatus }) => {
  const pet = request.petId;
  const user = request.userId;

  return (
    <div className="rounded-2xl bg-dark-800/60 backdrop-blur-md border border-white/10 p-5 hover:border-white/20 transition-all duration-200 animate-fade-in-up w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Pet Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-dark-900 border border-white/10">
          <img
            src={
              pet?.photos?.[0] ||
              'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200'
            }
            alt={pet?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 w-full space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-white font-extrabold text-base truncate">
              {pet?.name || 'Unknown Pet'}
            </h4>
            <Badge status={request.status} />
          </div>

          <p className="text-slate-400 text-xs font-semibold">
            {pet?.species} • {pet?.breed || 'Unknown Breed'}
          </p>

          {isAdmin && user && (
            <p className="text-slate-400 text-xs pt-1">
              Requested by:{' '}
              <span className="text-teal-400 font-bold">{user.name}</span> ({user.email})
            </p>
          )}

          {request.message && (
            <p className="text-slate-300 text-xs italic bg-slate-900/60 border border-white/5 rounded-xl p-2.5 mt-2">
              "{request.message}"
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 mt-3">
            <span className="text-slate-500 text-[11px] font-semibold">
              Requested on{' '}
              {new Date(request.requestedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>

            {isAdmin && request.status === 'Pending' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateStatus(request._id, 'Approved')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm cursor-pointer"
                >
                  Approve
                </button>
                <button
                  onClick={() => onUpdateStatus(request._id, 'Rejected')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-200 bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 transition-colors cursor-pointer"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionRequestCard;
