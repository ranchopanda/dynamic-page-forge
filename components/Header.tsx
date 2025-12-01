
import React from 'react';

interface HeaderProps {
  onBookClick: () => void;
  onSavedClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBookClick, onSavedClick }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap px-6 lg:px-10 py-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
        <div className="size-6 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold font-headline tracking-wide">Henna Harmony</h2>
      </div>
      <div className="hidden md:flex flex-1 justify-end items-center gap-8">
        <div className="flex items-center gap-9">
          <button className="text-sm font-medium leading-normal hover:text-primary transition-colors">Styles</button>
          <button onClick={onSavedClick} className="text-sm font-medium leading-normal hover:text-primary transition-colors">Saved Designs</button>
          <button className="text-sm font-medium leading-normal hover:text-primary transition-colors">How It Works</button>
          <button className="text-sm font-medium leading-normal hover:text-primary transition-colors">Contact</button>
        </div>
        <button 
          onClick={onBookClick}
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-11 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-primary-soft hover:bg-[#a15842] transition-all duration-300"
        >
          <span className="truncate">Design My Hand</span>
        </button>
      </div>
      <div className="md:hidden">
         <button onClick={onBookClick} className="text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
         </button>
      </div>
    </header>
  );
};

export default Header;
