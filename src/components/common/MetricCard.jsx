import React from 'react';

export const MetricCard = ({
  title,
  value,
  trend,
  trendPositive = true,
  trendLabel = 'vs last mo',
  icon,
  badgeText,
  badgeColor = 'bg-secondary-fixed text-on-secondary-fixed',
  accentColor = 'primary',
  progressPercent = null,
  isCritical = false,
  sparkline = null,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-outline-variant/30 ${
        isCritical ? 'border-t-4 border-t-error' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between text-secondary">
        <span className="font-label-md text-label-md font-medium text-on-surface-variant truncate">
          {title}
        </span>
        {icon && (
          <span
            className={`material-symbols-outlined text-xl ${
              isCritical
                ? 'text-error animate-bounce'
                : accentColor === 'primary'
                ? 'text-primary'
                : accentColor === 'tertiary'
                ? 'text-tertiary'
                : 'text-secondary'
            }`}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="my-space-sm">
        <div
          className={`font-headline text-metric-display font-bold tracking-tight ${
            isCritical ? 'text-error' : 'text-on-surface'
          }`}
        >
          {value}
        </div>

        {trend && (
          <div className="flex items-center gap-1 mt-1 font-mono text-label-sm">
            <span
              className={`material-symbols-outlined text-sm font-bold ${
                trendPositive ? 'text-emerald-600' : 'text-error'
              }`}
            >
              {trendPositive ? 'trending_up' : 'trending_down'}
            </span>
            <span
              className={`font-semibold ${
                trendPositive ? 'text-emerald-700' : 'text-error'
              }`}
            >
              {trend}
            </span>
            {trendLabel && (
              <span className="text-secondary font-body text-[11px] ml-1">
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {progressPercent !== null && (
        <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden mt-1">
          <div
            className={`h-full rounded-full ${
              isCritical
                ? 'bg-error'
                : accentColor === 'tertiary'
                ? 'bg-tertiary'
                : 'bg-primary'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}

      {badgeText && (
        <div className="flex items-center justify-between pt-1">
          <span
            className={`px-2 py-0.5 rounded-full font-mono text-label-sm ${badgeColor}`}
          >
            {badgeText}
          </span>
        </div>
      )}

      {sparkline && (
        <div className="w-full h-8 pt-1">
          <svg className="w-full h-full overflow-visible text-primary" viewBox="0 0 100 24">
            <path
              d="M0,18 Q15,16 30,12 T60,14 T85,6 T100,2"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.2"
            />
            <path
              d="M0,18 Q15,16 30,12 T60,14 T85,6 T100,2 L100,24 L0,24 Z"
              fill="currentColor"
              opacity="0.08"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

