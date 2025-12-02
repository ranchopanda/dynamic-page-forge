import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = true,
}) => {
  const baseClasses = animation ? 'skeleton' : 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

// Card Skeleton for gallery items
export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-background-dark/50 rounded-2xl overflow-hidden shadow-md border border-primary/10">
    <Skeleton variant="rectangular" height={200} />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="40%" height={16} />
    </div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="flex items-center gap-4">
    <Skeleton variant="circular" width={48} height={48} />
    <div className="space-y-2">
      <Skeleton variant="text" width={120} height={16} />
      <Skeleton variant="text" width={80} height={14} />
    </div>
  </div>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-background-dark/50 rounded-xl">
    <Skeleton variant="rounded" width={60} height={60} />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="70%" height={18} />
      <Skeleton variant="text" width="50%" height={14} />
    </div>
    <Skeleton variant="rounded" width={80} height={36} />
  </div>
);

// Gallery Grid Skeleton
export const GalleryGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden">
        <Skeleton variant="rectangular" height="100%" />
      </div>
    ))}
  </div>
);

// Stats Skeleton
export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-background-dark/50 p-6 rounded-2xl">
        <Skeleton variant="text" width="40%" height={14} className="mb-2" />
        <Skeleton variant="text" width="60%" height={32} />
      </div>
    ))}
  </div>
);

export default Skeleton;
