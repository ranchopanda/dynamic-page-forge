import React from 'react';
import { Link } from 'react-router-dom';

interface NotFoundProps {
  onBack?: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onBack }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <span 
            className="material-symbols-outlined text-9xl text-primary/30"
            aria-hidden="true"
          >
            search_off
          </span>
        </div>
        <h1 className="font-headline text-6xl font-bold text-primary mb-4">
          404
        </h1>
        <h2 className="font-headline text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
          Page Not Found
        </h2>
        <p className="text-text-primary-light/70 dark:text-text-primary-dark/70 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-[#a15842] transition-colors inline-flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" aria-hidden="true">home</span>
            Go to Home
          </Link>
          <Link
            to="/design"
            className="px-8 py-4 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary/10 transition-colors inline-flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" aria-hidden="true">palette</span>
            Start Designing
          </Link>
        </div>
        
        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-primary/10">
          <p className="text-sm text-text-primary-light/60 dark:text-text-primary-dark/60 mb-4">
            Or try one of these pages:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/gallery" className="text-primary hover:underline">Gallery</Link>
            <Link to="/artists" className="text-primary hover:underline">Artists</Link>
            <Link to="/blog" className="text-primary hover:underline">Blog</Link>
            <Link to="/booking" className="text-primary hover:underline">Book Consultation</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
