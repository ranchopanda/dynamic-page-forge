import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../lib/supabaseApi';
import { ArtistProfile, Review } from '../types';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';
import ScrollToTop from './ScrollToTop';
import SEOHead, { SEO_CONFIGS } from './SEOHead';

interface ArtistsProps {
  onBack: () => void;
  onBookArtist: (artistId: string) => void;
  onStartDesign?: () => void;
  onGallery?: () => void;
}

const Artists: React.FC<ArtistsProps> = ({ onBack, onBookArtist, onStartDesign, onGallery }) => {
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<(ArtistProfile & { reviews?: Review[] }) | null>(null);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      const data = await supabaseApi.getArtists(true);
      setArtists(data);
    } catch (error) {
      console.error('Failed to load artists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewArtist = async (artist: ArtistProfile) => {
    try {
      const fullData = await supabaseApi.getArtist(artist.id);
      setSelectedArtist(fullData);
    } catch (error) {
      console.error('Failed to load artist details:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`material-symbols-outlined text-lg ${
          i < Math.round(rating) ? 'text-accent-gold' : 'text-gray-300'
        }`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        star
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 animate-fadeIn">
      <SEOHead {...SEO_CONFIGS.artists} />
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={[
          { label: 'Home', onClick: onBack },
          { label: 'Artists' }
        ]} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">
            Our Artists
          </h1>
          <p className="text-text-primary-light/70 dark:text-text-primary-dark/70 max-w-2xl mx-auto">
            Meet our talented henna artists. Each brings years of experience and a unique artistic vision.
          </p>
        </div>

        {/* Artists Grid */}
        {artists.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">person_search</span>
            <p className="text-text-primary-light/50">No artists available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map(artist => (
              <div
                key={artist.id}
                className="bg-white dark:bg-background-dark/50 rounded-3xl overflow-hidden shadow-lg border border-primary/10 hover:shadow-xl transition-all group"
              >
                {/* Portfolio Preview */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent-gold/20 relative overflow-hidden">
                  {artist.portfolio.length > 0 && (
                    <div className="absolute inset-0 flex">
                      {artist.portfolio.slice(0, 3).map((img, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-cover bg-center"
                          style={{ backgroundImage: `url("${img}")` }}
                        />
                      ))}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Info */}
                <div className="p-6 -mt-12 relative">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-background-dark border-4 border-white dark:border-background-dark shadow-lg flex items-center justify-center mb-4">
                    {artist.user.avatar ? (
                      <img src={artist.user.avatar} alt={artist.user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-primary">person</span>
                    )}
                  </div>

                  <h3 className="font-headline text-xl font-bold text-primary">{artist.user.name}</h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">{renderStars(artist.rating)}</div>
                    <span className="text-sm text-text-primary-light/70">
                      ({artist.reviewCount} reviews)
                    </span>
                  </div>

                  <p className="text-sm text-text-primary-light/70 dark:text-text-primary-dark/70 mt-3 line-clamp-2">
                    {artist.bio || 'Professional henna artist'}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {artist.specialties.slice(0, 3).map(specialty => (
                      <span
                        key={specialty}
                        className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => viewArtist(artist)}
                      className="flex-1 py-2 border border-primary/20 text-primary rounded-full hover:bg-primary/5 transition-colors text-sm font-medium"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => onBookArtist(artist.id)}
                      className="flex-1 py-2 bg-primary text-white rounded-full hover:bg-[#a15842] transition-colors text-sm font-medium"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Artist Detail Modal */}
        {selectedArtist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedArtist(null)} />
            <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-background-dark rounded-3xl shadow-2xl animate-slideUp">
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              {/* Header */}
              <div className="h-64 bg-gradient-to-br from-primary/20 to-accent-gold/20 relative">
                {selectedArtist.portfolio.length > 0 && (
                  <div className="absolute inset-0 flex">
                    {selectedArtist.portfolio.slice(0, 4).map((img, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-cover bg-center"
                        style={{ backgroundImage: `url("${img}")` }}
                      />
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="p-8 -mt-16 relative">
                <div className="flex items-end gap-6 mb-6">
                  <div className="w-28 h-28 rounded-full bg-white dark:bg-background-dark border-4 border-white shadow-lg flex items-center justify-center">
                    {selectedArtist.user.avatar ? (
                      <img src={selectedArtist.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-primary">person</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-headline text-3xl font-bold text-primary">{selectedArtist.user.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(selectedArtist.rating)}</div>
                      <span className="text-text-primary-light/70">
                        {selectedArtist.rating.toFixed(1)} ({selectedArtist.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary/5 rounded-xl">
                    <p className="text-2xl font-bold text-primary">{selectedArtist.experience}</p>
                    <p className="text-sm text-text-primary-light/70">Years Experience</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-xl">
                    <p className="text-2xl font-bold text-primary">{selectedArtist.reviewCount}</p>
                    <p className="text-sm text-text-primary-light/70">Reviews</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-xl">
                    <p className="text-2xl font-bold text-primary">{selectedArtist.specialties.length}</p>
                    <p className="text-sm text-text-primary-light/70">Specialties</p>
                  </div>
                </div>

                {selectedArtist.bio && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2">About</h4>
                    <p className="text-text-primary-light/70 dark:text-text-primary-dark/70">
                      {selectedArtist.bio}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="font-bold mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtist.specialties.map(s => (
                      <span key={s} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                {selectedArtist.reviews && selectedArtist.reviews.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-4">Recent Reviews</h4>
                    <div className="space-y-4">
                      {selectedArtist.reviews.map(review => (
                        <div key={review.id} className="p-4 bg-background-light dark:bg-background-dark/50 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-sm text-primary">person</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{review.user.name}</p>
                              <div className="flex">{renderStars(review.rating)}</div>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-text-primary-light/70">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedArtist(null);
                    onBookArtist(selectedArtist.id);
                  }}
                  className="w-full py-4 bg-primary text-white rounded-full font-bold hover:bg-[#a15842] transition-colors"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <section className="py-16 mt-12">
          <div className="bg-gradient-to-br from-primary to-[#a15842] rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
              Ready to Work with Our Artists?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Start by creating your perfect design with our AI studio, then book a consultation with your favorite artist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {onStartDesign && (
                <button
                  onClick={onStartDesign}
                  className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-colors"
                >
                  Design Your Henna
                </button>
              )}
              {onGallery && (
                <button
                  onClick={onGallery}
                  className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors"
                >
                  View Gallery
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

export default Artists;
