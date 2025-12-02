import React, { useState } from 'react';
import { useAuth } from '../context/SupabaseAuthContext';

interface HeaderProps {
  onBookClick: () => void;
  onSavedClick: () => void;
  onGalleryClick: () => void;
  onArtistsClick: () => void;
  onProfileClick: () => void;
  onLogoClick: () => void;
  onBlogClick?: () => void;
  onAdminClick?: () => void;
  onAuthClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onBookClick,
  onSavedClick,
  onGalleryClick,
  onArtistsClick,
  onProfileClick,
  onLogoClick,
  onBlogClick,
  onAdminClick,
  onAuthClick,
}) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between whitespace-nowrap px-6 lg:px-10 py-4 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
        <img 
          src="/logo.svg" 
          alt="Mehendi Logo" 
          className="h-10 w-auto"
        />
        <h2 className="text-xl font-bold font-headline tracking-wide" style={{ color: '#c4a574' }}>Mehendi</h2>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-1 justify-end items-center gap-4">
        <nav className="flex items-center gap-6">
          <button onClick={onGalleryClick} className="text-sm font-medium leading-normal hover:text-primary transition-colors">
            Gallery
          </button>
          <button onClick={onArtistsClick} className="text-sm font-medium leading-normal hover:text-primary transition-colors">
            Artists
          </button>
          <button onClick={onSavedClick} className="text-sm font-medium leading-normal hover:text-primary transition-colors">
            My Designs
          </button>
          {onBlogClick && (
            <button onClick={onBlogClick} className="text-sm font-medium leading-normal hover:text-primary transition-colors">
              Blog
            </button>
          )}
          {user?.role === 'ADMIN' && onAdminClick && (
            <button onClick={onAdminClick} className="text-sm font-medium leading-normal text-primary hover:text-[#a15842] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              Admin
            </button>
          )}
          {!user && onAuthClick && (
            <button onClick={onAuthClick} className="text-sm font-medium leading-normal hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-base">login</span>
              Login
            </button>
          )}
        </nav>

        {/* Show profile for logged-in users */}
        {user && (
          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
            title={`${user.name} - ${user.role}`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              )}
            </div>
            <span className="text-sm font-medium hidden lg:inline">{user.name}</span>
          </button>
        )}

        <button
          onClick={onBookClick}
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-primary-soft hover:bg-[#a15842] transition-all duration-300"
        >
          <span className="truncate">Design My Hand</span>
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden text-primary p-2"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {isMobileMenuOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav 
          id="mobile-menu"
          className="absolute top-full left-0 right-0 bg-white dark:bg-background-dark shadow-lg border-t border-primary/10 md:hidden z-50"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col p-4 gap-2">
            <button
              onClick={() => { onGalleryClick(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-medium hover:text-primary transition-colors"
            >
              Gallery
            </button>
            <button
              onClick={() => { onArtistsClick(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-medium hover:text-primary transition-colors"
            >
              Artists
            </button>
            <button
              onClick={() => { onSavedClick(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-medium hover:text-primary transition-colors"
            >
              My Designs
            </button>
            {user && (
              <button
                onClick={() => { onProfileClick(); setIsMobileMenuOpen(false); }}
                className="w-full py-3 text-left font-medium hover:text-primary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">person</span>
                Profile
              </button>
            )}
            {user?.role === 'ADMIN' && onAdminClick && (
              <button
                onClick={() => { onAdminClick(); setIsMobileMenuOpen(false); }}
                className="w-full py-3 text-left font-medium text-primary hover:text-[#a15842] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                Admin Dashboard
              </button>
            )}
            {!user && onAuthClick && (
              <button
                onClick={() => { onAuthClick(); setIsMobileMenuOpen(false); }}
                className="w-full py-3 text-left font-medium hover:text-primary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">login</span>
                Login
              </button>
            )}
            <hr className="my-2 border-primary/10" />
            <button
              onClick={() => { onBookClick(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 bg-primary text-white rounded-full font-bold text-center"
            >
              Design My Hand
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
