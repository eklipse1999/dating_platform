'use client';

import { TIER_RANGES, Tier } from '@/lib/types';

interface TierBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TierBadge({ tier, size = 'md', showLabel = true }: TierBadgeProps) {
  const tierInfo = TIER_RANGES[tier];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${tierInfo?.color}20`, 
        color: tierInfo?.color 
      }}
      title={`${tier}: ${tierInfo?.min.toLocaleString()} - ${tierInfo?.max === Infinity ? '∞' : tierInfo?.max.toLocaleString()} points`}
    >
      <span className={iconSizes[size]}>{tierInfo?.icon}</span>
      {showLabel && <span>{tier}</span>}
    </div>
  );
}
