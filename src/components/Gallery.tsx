import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Design, HennaStyle } from '../types';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';
import ScrollToTop from './ScrollToTop';

interface GalleryProps {
  onBack: () => void;
  onStartDesign?: () => void;
  onBooking?: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ onBack, onStartDesign, onBooking }) => {
  const { isAuthenticated } = useAuth();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [styles, setStyles] = useState<HennaStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  useEffect(() => {
    loadStyles();
  }, []);

  useEffect(() => {
    setPage(1);
    setDesigns([]);
    loadDesigns(1);
  }, [selectedStyle, sortBy]);

  const loadStyles = async () => {
    try {
      const data = await api.getStyles();
      setStyles(data);
    } catch (error) {
      console.error('Failed to load styles:', error);
    }
  };

  const loadDesigns = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const { designs: newDesigns, pagination } = await api.getDesignGallery({
        page: pageNum,
        limit: 12,
        style: selectedStyle || undefined,
        sort: sortBy,
      });
      
      if (pageNum === 1) {
        setDesigns(newDesigns);
      } else {
        setDesigns(prev => [...prev, ...newDesigns]);
      }
      setHasMore(pageNum < pagination.pages);
    } catch (error) {
      console.error('Failed to load designs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (designId: string) => {
    if (!isAuthenticated) return;
    try {
      const { likes } = await api.likeDesign(designId);
      setDesigns(prev => prev.map(d => d.id === designId ? { ...d, likes } : d));
      if (selectedDesign?.id === designId) {
        setSelectedDesign(prev => prev ? { ...prev, likes } : null);
      }
    } catch (error) {
      console.error('Failed to like design:', error);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadDesigns(nextPage);
  };

  return (
    <div className="min-h-screen py-8 px-4 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[
          { label: 'Home', onClick: onBack },
          { label: 'Gallery' }
        ]} />

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">
            Design Gallery
          </h1>
          <p className="text-text-primary-light/70 dark:text-text-primary-dark/70 max-w-2xl mx-auto">
            Explore beautiful henna designs created by our community. Get inspired for your next look.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <select
            value={selectedStyle}
            onChange={e => setSelectedStyle(e.target.value)}
            className="px-4 py-2 rounded-full border border-primary/20 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Styles</option>
            {styles.map(style => (
              <option key={style.id} value={style.id}>{style.name}</option>
            ))}
          </select>

          <div className="flex rounded-full border border-primary/20 overflow-hidden">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                sortBy === 'recent' ? 'bg-primary text-white' : 'bg-white dark:bg-background-dark hover:bg-primary/10'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                sortBy === 'popular' ? 'bg-primary text-white' : 'bg-white dark:bg-background-dark hover:bg-primary/10'
              }`}
            >
              Popular
            </button>
          </div>
        </div>

        {/* Grid */}
        {designs.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">image</span>
            <p className="text-text-primary-light/50">No designs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {designs.map(design => (
              <div
                key={design.id}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedDesign(design)}
              >
                <img
                  src={design.generatedImageUrl}
                  alt={design.style?.name || 'Henna Design'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                  <p className="text-white font-bold">{design.style?.name || 'Custom'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-white/80 text-sm">favorite</span>
                    <span className="text-white/80 text-sm">{design.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Load More */}
        {hasMore && !isLoading && designs.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-primary/10 text-primary rounded-full font-medium hover:bg-primary/20 transition-colors"
            >
              Load More
            </button>
          </div>
        )}

        {/* Design Modal */}
        {selectedDesign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedDesign(null)} />
            <div className="relative max-w-4xl w-full bg-white dark:bg-background-dark rounded-3xl overflow-hidden shadow-2xl animate-slideUp">
              <button
                onClick={() => setSelectedDesign(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/3">
                  <img
                    src={selectedDesign.generatedImageUrl}
                    alt={selectedDesign.style?.name || 'Design'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-1/3 p-6">
                  <h3 className="font-headline text-2xl font-bold text-primary mb-2">
                    {selectedDesign.style?.name || 'Custom Design'}
                  </h3>
                  {selectedDesign.style && (
                    <p className="text-text-primary-light/70 dark:text-text-primary-dark/70 mb-4">
                      {selectedDesign.style.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => handleLike(selectedDesign.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary">favorite</span>
                      <span className="font-medium">{selectedDesign.likes}</span>
                    </button>
                    <button className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-primary">share</span>
                    </button>
                  </div>

                  {selectedDesign.user && (
                    <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {selectedDesign.user.avatar ? (
                          <img src={selectedDesign.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-primary">person</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{selectedDesign.user.name}</p>
                        <p className="text-sm text-text-primary-light/50">
                          {new Date(selectedDesign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <section className="py-16 mt-12">
          <div className="bg-gradient-to-br from-primary to-[#a15842] rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
              Inspired? Create Your Own Design
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Use our AI-powered design studio to create a personalized henna design that's uniquely yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {onStartDesign && (
                <button
                  onClick={onStartDesign}
                  className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-colors"
                >
                  Start Designing
                </button>
              )}
              {onBooking && (
                <button
                  onClick={onBooking}
                  className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors"
                >
                  Book Consultation
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Gallery;
