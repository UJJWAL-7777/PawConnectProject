const StatsChart = ({ title, data, type = 'bar', height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-dark-800/60 backdrop-blur-md border border-white/10 p-6 w-full">
        <h3 className="text-white font-black text-base mb-4 tracking-tight">{title}</h3>
        <p className="text-slate-400 text-xs">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.count || d.value || 0));

  const colors = [
    '#fbbf24', // amber
    '#2dd4bf', // teal
    '#a78bfa', // violet
    '#fb7185', // rose
    '#34d399', // emerald
    '#60a5fa', // blue
    '#f472b6', // pink
    '#c084fc', // purple
  ];

  if (type === 'donut') {
    const total = data.reduce((sum, d) => sum + (d.count || d.value || 0), 0);
    const radius = 70;
    const center = 90;
    const strokeWidth = 28;
    let cumulative = 0;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="rounded-2xl bg-dark-800/60 backdrop-blur-md border border-white/10 p-6 w-full">
        <h3 className="text-white font-black text-base mb-6 tracking-tight">{title}</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <svg width="180" height="180" className="transform -rotate-90 shrink-0">
            {data.map((item, i) => {
              const value = item.count || item.value || 0;
              const percentage = total > 0 ? value / total : 0;
              const dashLength = circumference * percentage;
              const dashOffset = circumference * cumulative;
              cumulative += percentage;

              return (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={colors[i % colors.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={-dashOffset}
                  className="transition-all duration-700 ease-out"
                />
              );
            })}
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              fill="white"
              fontSize="24"
              fontWeight="bold"
              transform={`rotate(90, ${center}, ${center})`}
            >
              {total}
            </text>
            <text
              x={center}
              y={center + 14}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
              fontWeight="600"
              transform={`rotate(90, ${center}, ${center})`}
            >
              Total
            </text>
          </svg>
          <div className="space-y-2.5 w-full max-w-xs">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  ></div>
                  <span className="text-slate-300">
                    {item.species || item.label || item._id}
                  </span>
                </div>
                <span className="text-white font-bold ml-auto">
                  {item.count || item.value || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Bar chart
  return (
    <div className="rounded-2xl bg-dark-800/60 backdrop-blur-md border border-white/10 p-6 w-full">
      <h3 className="text-white font-black text-base mb-6 tracking-tight">{title}</h3>
      <div className="flex items-end gap-3" style={{ height: `${height}px` }}>
        {data.map((item, i) => {
          const value = item.count || item.value || 0;
          const barHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
            >
              <span className="text-[10px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {value}
              </span>
              <div className="w-full relative flex-1 flex items-end">
                <div
                  className="w-full rounded-t-xl transition-all duration-700 ease-out"
                  style={{
                    height: `${Math.max(barHeight, 5)}%`,
                    background: `linear-gradient(to top, ${colors[i % colors.length]}aa, ${colors[i % colors.length]})`,
                  }}
                ></div>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold text-center truncate w-full pt-1">
                {item.month || item.species || item.label || item._id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsChart;
