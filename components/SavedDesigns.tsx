
import React, { useEffect, useState } from 'react';
import { SavedDesign } from '../types';

interface SavedDesignsProps {
  onStartNew: () => void;
}

const SavedDesigns: React.FC<SavedDesignsProps> = ({ onStartNew }) => {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('henna_saved_designs');
      if (stored) {
        setDesigns(JSON.parse(stored).reverse()); // Newest first
      }
    } catch (e) {
      console.error("Failed to load saved designs", e);
    }
  }, []);

  const deleteDesign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this design?")) {
      const updated = designs.filter(d => d.id !== id);
      setDesigns(updated);
      localStorage.setItem('henna_saved_designs', JSON.stringify(updated.reverse())); // Store in original order (oldest first) implies reverse back, but simple JSON.stringify(updated) works if we maintain order in state. 
      // Actually let's just save the updated state as is if we want to persist the 'newest first' view or reverse it back. 
      // Standard practice: just save the filtered array.
      localStorage.setItem('henna_saved_designs', JSON.stringify(updated));
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden animate-fadeIn">
      <div className="flex h-full grow flex-col">
        <main className="flex flex-1 justify-center py-5 sm:py-10 md:py-16">
          <div className="flex w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
            
            {/* Page Heading */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 p-4 border-b border-primary/10">
              <div className="flex flex-col gap-2">
                <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">My Saved Designs</h1>
                <p className="text-base text-text-primary-light dark:text-text-primary-dark opacity-80">Relive your inspirations and tailor your bridal vision.</p>
              </div>
              <button 
                onClick={onStartNew}
                className="flex h-11 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-accent-gold bg-transparent px-6 text-sm font-bold text-text-primary-light dark:text-text-primary-dark transition-colors hover:bg-accent-gold/10"
              >
                <span className="truncate">Start a New Design</span>
              </button>
            </div>

            {/* Chips / Filters */}
            <div className="mb-6 flex gap-3 overflow-x-auto p-4 no-scrollbar">
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/10 px-4 py-2 hover:bg-primary/20 transition-colors">
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Date Saved</p>
                <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/10 px-4 py-2 hover:bg-primary/20 transition-colors">
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Style</p>
                <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
              </button>
            </div>

            {/* Image Grid */}
            {designs.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-4">
                {designs.map((design) => (
                  <div key={design.id} className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white dark:bg-background-dark/50 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-primary/10">
                    <div 
                      className="aspect-[3/4] w-full bg-cover bg-center" 
                      style={{ backgroundImage: `url("${design.imageUrl}")` }}
                    ></div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 transition-transform group-hover:translate-y-0">
                      <p className="text-xl font-bold text-white font-headline">{design.styleName}</p>
                      <p className="text-xs text-white/80 mt-1">{design.date}</p>
                    </div>

                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/40" title="Share">
                        <span className="material-symbols-outlined text-sm">share</span>
                      </button>
                      <button 
                        onClick={(e) => deleteDesign(design.id, e)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-red-500/80" 
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center px-4 py-24 text-center bg-white/50 dark:bg-background-dark/30 rounded-3xl border border-dashed border-primary/20 m-4">
                <div className="mb-6 w-full max-w-[200px] text-primary/20">
                   <span className="material-symbols-outlined text-9xl">collections_bookmark</span>
                </div>
                <div className="flex max-w-md flex-col items-center gap-2">
                  <h3 className="font-headline text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Your gallery is awaiting your inspiration</h3>
                  <p className="text-base text-text-primary-light/60 dark:text-text-primary-dark/60">You haven't saved any designs yet. Start creating and save your beautiful henna visions here.</p>
                </div>
                <button 
                  onClick={onStartNew}
                  className="mt-8 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-primary text-white text-base font-bold shadow-primary-soft hover:bg-[#a15842] transition-colors"
                >
                  <span className="truncate">Start Your First Design</span>
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default SavedDesigns;
