const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 w-full">
      <div className={`${sizeMap[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin"></div>
      </div>
      {text && (
        <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
