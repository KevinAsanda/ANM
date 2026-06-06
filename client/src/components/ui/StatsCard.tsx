import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
  iconBgColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  className = '',
  iconBgColor = 'bg-primary-50 text-primary-600'
}) => {
  return (
    <div className={`bg-surface p-6 rounded-lg shadow-sm border border-border flex items-center gap-4 ${className}`}>
      <div className={`p-3 rounded-lg ${iconBgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-text-muted">{label}</p>
        <p className="text-2xl font-bold text-text mt-1">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
