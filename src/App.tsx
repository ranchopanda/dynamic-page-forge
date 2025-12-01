import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import DesignFlow from './components/DesignFlow';
import SavedDesigns from './components/SavedDesigns';
import Booking from './components/Booking';
import AuthModal from './components/AuthModal';
import Profile from './components/Profile';
import Gallery from './components/Gallery';
import Artists from './components/Artists';
import AdminDashboard from './components/AdminDashboard';
import QuickNav from './components/QuickNav';
import DebugAuth from './components/DebugAuth';
import SocialProof from './components/SocialProof';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Blog from './components/Blog';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { AppView } from './types';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [bookingDesign, setBookingDesign] = useState<string | undefined>(undefined);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const startFlow = () => {
    setView(AppView.GENERATOR);
    scrollToTop();
  };

  const goHome = () => {
    setView(AppView.LANDING);
    scrollToTop();
  };

  const goToSaved = () => {
    setView(AppView.SAVED);
    scrollToTop();
  };

  const goToBooking = (designName?: string) => {
    setBookingDesign(designName);
    setView(AppView.BOOKING);
    scrollToTop();
  };

  const goToProfile = () => {
    setView(AppView.PROFILE);
    scrollToTop();
  };

  const goToGallery = () => {
    setView(AppView.GALLERY);
    scrollToTop();
  };

  const goToArtists = () => {
    setView(AppView.ARTISTS);
    scrollToTop();
  };

  const goToAdmin = () => {
    setView(AppView.ADMIN);
    scrollToTop();
  };

  const goToBlog = () => {
    setView(AppView.BLOG);
    scrollToTop();
  };

  const goToPrivacy = () => {
    setView(AppView.PRIVACY);
    scrollToTop();
  };

  const goToTerms = () => {
    setView(AppView.TERMS);
    scrollToTop();
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-display">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-7xl px-4 md:px-8 lg:px-0">
            
            {view === AppView.LANDING && (
              <>
                <Header
                  onBookClick={startFlow}
                  onSavedClick={goToSaved}
                  onGalleryClick={goToGallery}
                  onArtistsClick={goToArtists}
                  onProfileClick={goToProfile}
                  onAuthClick={() => openAuth('login')}
                  onLogoClick={goHome}
                  onAdminClick={goToAdmin}
                />
                <main className="w-full">
                  <Hero onStartClick={startFlow} />
                  
                  {/* How it Works */}
                  <section className="py-16 md:py-24 bg-background-light dark:bg-background-dark/50 rounded-3xl mx-4 lg:mx-0">
                    <div className="flex flex-col gap-12 px-4 md:px-10">
                      <div className="flex flex-col gap-4 text-center items-center">
                        <h2 className="font-headline text-4xl font-bold leading-tight tracking-tight md:text-5xl max-w-2xl text-text-primary-light dark:text-text-primary-dark">
                          A Seamless Journey to Your Dream Design
                        </h2>
                        <p className="text-base font-normal leading-relaxed max-w-2xl text-text-primary-light/70 dark:text-text-primary-dark/70">
                          In just a few simple steps, discover the henna that was always meant for you.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { icon: 'cloud_upload', title: '1. Upload Your Hand', desc: 'Begin with a simple photo. Our AI analyzes the unique contours of your hand.' },
                          { icon: 'auto_awesome', title: '2. Define Your Style', desc: 'Our Style Wizard helps you choose preferences, from traditional to modern aesthetics.' },
                          { icon: 'image', title: '3. Receive Your Design', desc: 'Receive a curated gallery of stunning henna designs, ready to be previewed on your hand.' }
                        ].map((item, i) => (
                          <div key={i} className="flex flex-col flex-1 gap-4 rounded-2xl border border-primary/20 bg-white dark:bg-background-dark p-8 text-center items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/40">
                            <span className="material-symbols-outlined text-5xl text-primary">{item.icon}</span>
                            <div className="flex flex-col gap-2">
                              <h3 className="text-xl font-bold font-sub-headline text-primary">{item.title}</h3>
                              <p className="text-sm font-normal leading-normal text-text-primary-light/70 dark:text-text-primary-dark/70">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Styles Gallery */}
                  <section className="py-16 md:py-24 overflow-hidden">
                    <div className="flex flex-col gap-4 px-4 lg:px-0">
                      <h2 className="font-headline text-4xl font-bold leading-tight tracking-tight md:text-5xl text-text-primary-light dark:text-text-primary-dark">Featured Mehndi Styles</h2>
                      <p className="text-base font-normal leading-relaxed max-w-2xl text-text-primary-light/80 dark:text-text-primary-dark/80">
                        Explore a curated collection of our most beloved designs.
                      </p>
                    </div>
                    <div className="mt-12 flex space-x-6 overflow-x-auto pb-8 -mx-4 px-8 no-scrollbar snap-x">
                      {[
                        { title: 'Classic Arabic', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZHUtxqE9fyKP4kQcIltd0bv_Fb7wAO65O5vuW4YyrQmPRl6dA9lc5jNTesjoC7EjwmfpqY27WSA-jxh3o3pc6W2TkBwZBoK7u0YXHoy0xFX-8FxZlUkbD320uD6Gh2IIIeeK6ZpqPvk4RzaXx_FBqNVmX_1m9_lh4J9H4IpJFyoKszRuPLPZsK1rjgwVngmiF0PTfUdpcUzt4zpc_bdlwvchcU4CVoh-BKsw7vET6hY74Cpoa7ocnjdjR6LQQ3e2iaqcVtCYpIg' },
                        { title: 'Indian Bridal', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhmn1IMdg3DcAL7mPaoPm2CmEHUFbY9_BnE2CA8zL8GAjI8MxQujyMyPL8UbAEoSG2JT7qq6XPBWeJXISX6NTtmOBRL7kOFJK9SCWEMM4F8MjCmt0x4nns5DeGMx4hFVyjBbpTk73PeT0DxVRW9FHMW_DSgWAN_XlbZABbYUH_56XBsrfTIUBKCxgO8KINX306w8VnVkgN0591i9s7DbI1ECKCKAs7oAiMXnyCH8evHoE74MPSHP7eW_4XUFVDRMw2NaMag6cPJQ' },
                        { title: 'Modern Minimalist', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHbAM6BsAsgjwxAvEOawdaQcNzDU3rdKg4Jy_tox7j5Uc1JeiGfsKubEhXPQDhXNQ2edLZXa8tZNnrrSLK40Gysc6kVUyOKawQT3l3m53ZUED4aVTfQf5TdMZHqUp6lteU2otF2ceNbMzSOu2s4XPvIj2lo9bKdp6Zf81GfduhC-HKF2kxA_dmkZ5tT6fuNYgbGcNcOZbi4T-uqaCZMsosBSsUQbu-7f6tqytMj3hP2ZPMo_4s-t3iUZi9c6oJ_NdkpHQjhgBUrw' },
                        { title: 'Floral Mandala', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaEyI1blgdYGHF0OMi0s4fhJkPusxg7eTdtBQlOup12yEBbCLS0kltwgr61LzA8t9vcj_IC0AVY5_DqCPA6G2lXYqNc5mPtz8MUzvksTEoaI4N9NP6inOMWHEzw5YZPc0PIAjIfKvovpXU8tLQC_wYS6CxeWbdoBV1ELIiA7v1yTsZHJFax-F-vCFtGdEbzpIUyUCCPY36HDaLSMSk4Tl3g-k5nwSRwZyAnqmv9Ngi-SwyRoC0cuY5yiX3ktfqWxeXAAng3hu93Q' }
                      ].map((style, i) => (
                        <div key={i} className="flex-shrink-0 w-80 bg-white dark:bg-background-dark/50 rounded-3xl shadow-lg border border-primary/10 p-4 flex flex-col gap-4 snap-center hover:scale-[1.02] transition-transform duration-300">
                          <div className="w-full aspect-square bg-cover bg-center rounded-2xl" style={{backgroundImage: `url("${style.img}")`}}></div>
                          <h3 className="font-sub-headline text-2xl font-bold text-primary">{style.title}</h3>
                          <button onClick={startFlow} className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary text-white text-sm font-bold shadow-primary-soft hover:bg-[#a15842] transition-colors duration-300">
                            Preview on my hand
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Social Proof Stats */}
                  <SocialProof />

                  {/* Testimonials */}
                  <Testimonials />

                  {/* FAQ Section */}
                  <FAQ />

                  {/* CTA Section */}
                  <section className="py-16 md:py-24">
                    <div className="bg-gradient-to-br from-primary to-[#a15842] rounded-3xl p-8 md:p-16 text-center text-white">
                      <h2 className="font-headline text-3xl md:text-5xl font-bold mb-4">
                        Ready to Create Your Perfect Design?
                      </h2>
                      <p className="text-white/80 max-w-2xl mx-auto mb-8">
                        Join thousands of brides who have discovered their dream henna with our AI-powered design studio.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={startFlow}
                          className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-colors"
                        >
                          Start Designing
                        </button>
                        <button
                          onClick={goToArtists}
                          className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors"
                        >
                          Meet Our Artists
                        </button>
                      </div>
                    </div>
                  </section>
                </main>
                <Footer />
              </>
            )}

            {view === AppView.GENERATOR && (
              <DesignFlow 
                onBack={goHome} 
                onViewSaved={goToSaved} 
                onBookConsultation={goToBooking}
                onGallery={goToGallery}
                onArtists={goToArtists}
              />
            )}

            {view === AppView.SAVED && (
              <>
                <Header
                  onBookClick={startFlow}
                  onSavedClick={goToSaved}
                  onGalleryClick={goToGallery}
                  onArtistsClick={goToArtists}
                  onProfileClick={goToProfile}
                  onAuthClick={() => openAuth('login')}
                  onLogoClick={goHome}
                  onAdminClick={goToAdmin}
                />
                <SavedDesigns 
                  onStartNew={startFlow} 
                  onBack={goHome}
                  onGallery={goToGallery}
                  onArtists={goToArtists}
                  onBooking={goToBooking}
                />
              </>
            )}

            {view === AppView.BOOKING && (
              <>
                <Header
                  onBookClick={startFlow}
                  onSavedClick={goToSaved}
                  onGalleryClick={goToGallery}
                  onArtistsClick={goToArtists}
                  onProfileClick={goToProfile}
                  onAuthClick={() => openAuth('login')}
                  onLogoClick={goHome}
                  onAdminClick={goToAdmin}
                />
                <Booking 
                  designName={bookingDesign} 
                  onCancel={goHome} 
                  onSubmit={() => { goHome(); }} 
                />
              </>
            )}

            {view === AppView.PROFILE && (
              <Profile 
                onBack={goHome} 
                onViewDesign={(id) => console.log('View design:', id)}
                onStartDesign={startFlow}
                onGallery={goToGallery}
                onArtists={goToArtists}
                onSaved={goToSaved}
                onBooking={goToBooking}
                onAuth={() => openAuth('login')}
              />
            )}

            {view === AppView.GALLERY && (
              <>
                <Header
                  onBookClick={startFlow}
                  onSavedClick={goToSaved}
                  onGalleryClick={goToGallery}
                  onArtistsClick={goToArtists}
                  onProfileClick={goToProfile}
                  onAuthClick={() => openAuth('login')}
                  onLogoClick={goHome}
                  onAdminClick={goToAdmin}
                />
                <Gallery 
                  onBack={goHome} 
                  onStartDesign={startFlow}
                  onBooking={goToBooking}
                />
              </>
            )}

            {view === AppView.ARTISTS && (
              <>
                <Header
                  onBookClick={startFlow}
                  onSavedClick={goToSaved}
                  onGalleryClick={goToGallery}
                  onArtistsClick={goToArtists}
                  onProfileClick={goToProfile}
                  onAuthClick={() => openAuth('login')}
                  onLogoClick={goHome}
                  onAdminClick={goToAdmin}
                />
                <Artists 
                  onBack={goHome} 
                  onBookArtist={(artistId) => goToBooking()}
                  onStartDesign={startFlow}
                  onGallery={goToGallery}
                />
              </>
            )}

            {view === AppView.ADMIN && (
              <AdminDashboard 
                onBack={goHome}
                onStartDesign={startFlow}
                onGallery={goToGallery}
                onArtists={goToArtists}
                onSaved={goToSaved}
                onBooking={goToBooking}
                onAuth={() => openAuth('login')}
              />
            )}

            {view === AppView.BLOG && (
              <Blog
                onBack={goHome}
                onStartDesign={startFlow}
                onGallery={goToGallery}
                onArtists={goToArtists}
                onSaved={goToSaved}
                onBooking={goToBooking}
                onAuth={() => openAuth('login')}
              />
            )}

            {view === AppView.PRIVACY && (
              <PrivacyPolicy onBack={goHome} />
            )}

            {view === AppView.TERMS && (
              <TermsOfService onBack={goHome} />
            )}

          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      {/* Quick Navigation FAB */}
      {view !== AppView.LANDING && (
        <QuickNav
          onHome={goHome}
          onDesign={startFlow}
          onSaved={goToSaved}
          onGallery={goToGallery}
          onArtists={goToArtists}
        />
      )}

      {/* Debug Auth Info */}
      <DebugAuth />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
