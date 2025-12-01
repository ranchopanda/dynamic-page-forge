import React, { useState, useEffect } from 'react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-8 z-30 w-12 h-12 rounded-full bg-white dark:bg-background-dark shadow-lg border border-primary/20 flex items-center justify-center hover:bg-primary/5 transition-all hover:scale-110"
      aria-label="Scroll to top"
    >
      <span className="material-symbols-outlined text-primary">arrow_upward</span>
    </button>
  );
};

export default ScrollToTop;
