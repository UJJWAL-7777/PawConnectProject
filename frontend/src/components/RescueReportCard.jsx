import Badge from './Badge';

const RescueReportCard = ({ report, isAdmin, onUpdateStatus }) => {
  const conditionColors = {
    Critical: 'text-rose-400 font-bold',
    Injured: 'text-amber-400 font-bold',
    Healthy: 'text-emerald-400 font-bold',
    Unknown: 'text-slate-400 font-medium',
  };

  return (
    <div className="rounded-2xl bg-dark-800/60 backdrop-blur-md border border-white/10 p-5 hover:border-white/20 transition-all duration-200 animate-fade-in-up w-full space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-white font-extrabold text-base">
            {report.species || 'Unknown'} Rescue Report
          </h4>
          <p className="text-slate-400 text-xs font-medium">
            Reported by <span className="text-slate-200 font-semibold">{report.reporterName}</span>
          </p>
        </div>
        <Badge status={report.status} />
      </div>

      <div className="space-y-2 bg-dark-900/60 border border-white/5 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Condition:</span>
          <span className={conditionColors[report.animalCondition] || 'text-slate-300'}>
            {report.animalCondition}
          </span>
        </div>

        {report.location?.address && (
          <div className="flex items-start gap-2 text-slate-300">
            <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{report.location.address}</span>
          </div>
        )}

        {report.description && (
          <p className="text-slate-300 leading-relaxed pt-1">
            {report.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        <span className="text-slate-500 text-[11px] font-semibold">
          {new Date(report.reportedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>

        {isAdmin && report.status !== 'Closed' && (
          <div className="flex items-center gap-2">
            {report.status === 'Reported' && (
              <button
                onClick={() => onUpdateStatus(report._id, 'Rescued')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-teal-950 bg-teal-400 hover:bg-teal-300 transition-colors cursor-pointer"
              >
                Mark Rescued
              </button>
            )}
            <button
              onClick={() => onUpdateStatus(report._id, 'Closed')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 border border-white/10 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RescueReportCard;
