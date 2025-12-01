import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Design } from '../types';
import Breadcrumb from './Breadcrumb';
import ScrollToTop from './ScrollToTop';

interface SavedDesignsProps {
  onStartNew: () => void;
  onBack: () => void;
  onGallery?: () => void;
  onArtists?: () => void;
  onBooking?: () => void;
}

const SavedDesigns: React.FC<SavedDesignsProps> = ({ onStartNew, onBack, onGallery, onArtists, onBooking }) => {
  const { isAuthenticated } = useAuth();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    loadDesigns();
  }, [isAuthenticated]);

  const loadDesigns = async () => {
    setIsLoading(true);
    try {
      // Always use localStorage
      const stored = localStorage.getItem('henna_saved_designs');
      if (stored) {
        const localDesigns = JSON.parse(stored);
        setDesigns(localDesigns.map((d: any) => ({
          id: d.id,
          generatedImageUrl: d.imageUrl,
          style: { name: d.styleName },
          createdAt: d.date,
          isPublic: false,
        })));
      }
    } catch (error) {
      console.error('Failed to load designs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDesign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      // Always use localStorage
      const stored = localStorage.getItem('henna_saved_designs');
      if (stored) {
        const localDesigns = JSON.parse(stored).filter((d: any) => d.id !== id);
        localStorage.setItem('henna_saved_designs', JSON.stringify(localDesigns));
      }
      setDesigns(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete design:', error);
    }
  };



  const filteredDesigns = designs.filter(d => {
    if (filter === 'public') return d.isPublic;
    if (filter === 'private') return !d.isPublic;
    return true;
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden animate-fadeIn">
      <div className="flex h-full grow flex-col">
        <main className="flex flex-1 justify-center py-5 sm:py-10 md:py-16">
          <div className="flex w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
            
            {/* Breadcrumb */}
            <Breadcrumb items={[
              { label: 'Home', onClick: onBack },
              { label: 'My Designs' }
            ]} />

            {/* Page Heading */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 p-4 border-b border-primary/10">
              <div className="flex flex-col gap-2">
                <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">My Saved Designs</h1>
                <p className="text-base text-text-primary-light dark:text-text-primary-dark opacity-80">
                  Your personal collection of henna inspirations.
                </p>
              </div>
              <button 
                onClick={onStartNew}
                className="flex h-11 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-accent-gold bg-transparent px-6 text-sm font-bold transition-colors hover:bg-accent-gold/10"
              >
                Start a New Design
              </button>
            </div>



            {/* Loading */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredDesigns.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-4">
                {filteredDesigns.map((design) => (
                  <div 
                    key={design.id} 
                    className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white dark:bg-background-dark/50 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-primary/10"
                  >
                    <div 
                      className="aspect-[3/4] w-full bg-cover bg-center" 
                      style={{ backgroundImage: `url("${design.generatedImageUrl}")` }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 transition-transform group-hover:translate-y-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xl font-bold text-white font-headline">
                          {design.style?.name || 'Custom Design'}
                        </p>
                        {isAuthenticated && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            design.isPublic ? 'bg-green-500/80' : 'bg-gray-500/80'
                          } text-white`}>
                            {design.isPublic ? 'Public' : 'Private'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/80">
                        {new Date(design.createdAt).toLocaleDateString()}
                      </p>
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
              <div className="flex flex-col items-center justify-center px-4 py-24 text-center bg-white/50 dark:bg-background-dark/30 rounded-3xl border border-dashed border-primary/20 m-4">
                <div className="mb-6 w-full max-w-[200px] text-primary/20">
                  <span className="material-symbols-outlined text-9xl">collections_bookmark</span>
                </div>
                <div className="flex max-w-md flex-col items-center gap-2">
                  <h3 className="font-headline text-2xl font-bold">Your gallery is awaiting your inspiration</h3>
                  <p className="text-base text-text-primary-light/60 dark:text-text-primary-dark/60">
                    You haven't saved any designs yet. Start creating and save your beautiful henna visions here.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button 
                    onClick={onStartNew}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-primary text-white text-base font-bold shadow-primary-soft hover:bg-[#a15842] transition-colors"
                  >
                    Start Your First Design
                  </button>
                  {onGallery && (
                    <button 
                      onClick={onGallery}
                      className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 border-2 border-primary text-primary text-base font-bold hover:bg-primary/10 transition-colors"
                    >
                      Browse Gallery
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Contextual CTA Section */}
        {filteredDesigns.length > 0 && (
          <section className="py-12 px-4 bg-gradient-to-br from-primary/5 to-accent-gold/5 rounded-3xl mx-4 mb-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="font-headline text-2xl font-bold text-primary mb-3">
                Ready to Bring Your Design to Life?
              </h3>
              <p className="text-text-primary-light/70 dark:text-text-primary-dark/70 mb-6">
                Book a consultation with our expert artists to make your vision a reality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {onBooking && (
                  <button 
                    onClick={onBooking}
                    className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-[#a15842] transition-colors"
                  >
                    Book Consultation
                  </button>
                )}
                {onArtists && (
                  <button 
                    onClick={onArtists}
                    className="px-8 py-3 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary/10 transition-colors"
                  >
                    Meet Our Artists
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default SavedDesigns;
