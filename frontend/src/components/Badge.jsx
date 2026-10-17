const Badge = ({ status, className = '' }) => {
  const statusClasses = {
    Available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Adopted: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    Sold: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Reported: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'In-Progress': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Rescued: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    Closed: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    Critical: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Injured: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Unknown: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  const styleClass = statusClasses[status] || statusClasses.Unknown;

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border whitespace-nowrap ${styleClass} ${className}`}
    >
      {status}
    </span>
  );
};

export default Badge;
