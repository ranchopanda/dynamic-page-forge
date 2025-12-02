import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = true 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4" role="status" aria-live="polite" aria-busy="true">
      <div 
        className={`${sizeClasses[size]} border-primary/20 border-t-primary rounded-full animate-spin`}
        aria-hidden="true"
      />
      {text && (
        <p className="text-text-primary-light/70 dark:text-text-primary-dark/70 text-sm font-medium" aria-live="polite">
          {text}
        </p>
      )}
      <span className="sr-only">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
