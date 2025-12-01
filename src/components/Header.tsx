import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onBookClick: () => void;
  onSavedClick: () => void;
  onGalleryClick: () => void;
  onArtistsClick: () => void;
  onProfileClick: () => void;
  onAuthClick: () => void;
  onLogoClick: () => void;
  onAdminClick?: () => void;
  onBlogClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onBookClick,
  onSavedClick,
  onGalleryClick,
  onArtistsClick,
  onProfileClick,
  onAuthClick,
  onLogoClick,
  onAdminClick,
  onBlogClick,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between whitespace-nowrap px-6 lg:px-10 py-4 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onLogoClick}>
        <div className="size-6 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold font-headline tracking-wide">Mehndi Design</h2>
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
            <button onClick={onAdminClick} className="text-sm font-medium leading-normal hover:text-primary transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span className="hidden xl:inline">Admin</span>
            </button>
          )}
        </nav>

        {!user ? (
          <button
            onClick={onAuthClick}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-6 border-2 border-primary text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/10 transition-all duration-300"
          >
            <span className="truncate">Login</span>
          </button>
        ) : (
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
      >
        <span className="material-symbols-outlined">
          {isMobileMenuOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-background-dark shadow-lg border-t border-primary/10 md:hidden z-50">
          <nav className="flex flex-col p-4 gap-2">
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
            {user?.role === 'ADMIN' && onAdminClick && (
              <button
                onClick={() => { onAdminClick(); setIsMobileMenuOpen(false); }}
                className="w-full py-3 text-left font-medium hover:text-primary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                Admin
              </button>
            )}
            <hr className="my-2 border-primary/10" />
            {!user ? (
              <button
                onClick={() => { onAuthClick(); setIsMobileMenuOpen(false); }}
                className="w-full py-3 border-2 border-primary text-primary rounded-full font-bold text-center"
              >
                Login
              </button>
            ) : null}
            <button
              onClick={() => { onBookClick(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 bg-primary text-white rounded-full font-bold text-center"
            >
              Design My Hand
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
