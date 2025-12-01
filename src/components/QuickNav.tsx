import React, { useState } from 'react';

interface QuickNavProps {
  onHome: () => void;
  onDesign: () => void;
  onSaved: () => void;
  onGallery: () => void;
  onArtists: () => void;
}

const QuickNav: React.FC<QuickNavProps> = ({ onHome, onDesign, onSaved, onGallery, onArtists }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Quick Links */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2 animate-slideUp">
          <button
            onClick={() => { onHome(); setIsOpen(false); }}
            className="flex items-center gap-3 bg-white dark:bg-background-dark shadow-lg rounded-full px-4 py-3 hover:bg-primary/5 transition-all group"
          >
            <span className="material-symbols-outlined text-primary">home</span>
            <span className="font-medium text-sm whitespace-nowrap">Home</span>
          </button>
          <button
            onClick={() => { onDesign(); setIsOpen(false); }}
            className="flex items-center gap-3 bg-white dark:bg-background-dark shadow-lg rounded-full px-4 py-3 hover:bg-primary/5 transition-all group"
          >
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <span className="font-medium text-sm whitespace-nowrap">Design</span>
          </button>
          <button
            onClick={() => { onSaved(); setIsOpen(false); }}
            className="flex items-center gap-3 bg-white dark:bg-background-dark shadow-lg rounded-full px-4 py-3 hover:bg-primary/5 transition-all group"
          >
            <span className="material-symbols-outlined text-primary">collections_bookmark</span>
            <span className="font-medium text-sm whitespace-nowrap">My Designs</span>
          </button>
          <button
            onClick={() => { onGallery(); setIsOpen(false); }}
            className="flex items-center gap-3 bg-white dark:bg-background-dark shadow-lg rounded-full px-4 py-3 hover:bg-primary/5 transition-all group"
          >
            <span className="material-symbols-outlined text-primary">photo_library</span>
            <span className="font-medium text-sm whitespace-nowrap">Gallery</span>
          </button>
          <button
            onClick={() => { onArtists(); setIsOpen(false); }}
            className="flex items-center gap-3 bg-white dark:bg-background-dark shadow-lg rounded-full px-4 py-3 hover:bg-primary/5 transition-all group"
          >
            <span className="material-symbols-outlined text-primary">person</span>
            <span className="font-medium text-sm whitespace-nowrap">Artists</span>
          </button>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full bg-primary text-white shadow-2xl hover:bg-[#a15842] transition-all flex items-center justify-center ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <span className="material-symbols-outlined text-3xl">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>
    </div>
  );
};

export default QuickNav;
