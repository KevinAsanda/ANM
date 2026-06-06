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
  iconBgColor = 'bg-primary/10 text-primary'
}) => {
  return (
    <div className={`premium-card premium-card-hover p-6 flex items-center gap-4 border-l-4 border-l-transparent hover:border-l-primary transition-all duration-300 ${className}`}>
      <div className={`p-3 rounded-lg flex items-center justify-center ${iconBgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="font-display text-3xl font-semibold text-primary mt-1">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
