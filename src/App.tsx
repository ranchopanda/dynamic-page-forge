import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
// Use Supabase auth - switch to './context/AuthContext' for Express backend
import { SupabaseAuthProvider as AuthProvider, useAuth } from './context/SupabaseAuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import QuickNav from './components/QuickNav';
import SocialProof from './components/SocialProof';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTopOnRoute from './components/ScrollToTopOnRoute';

// Lazy load components for better performance
const DesignFlow = lazy(() => import('./components/DesignFlow'));
const SavedDesigns = lazy(() => import('./components/SavedDesigns'));
const Booking = lazy(() => import('./components/Booking'));
const Profile = lazy(() => import('./components/Profile'));
const Gallery = lazy(() => import('./components/Gallery'));
const Artists = lazy(() => import('./components/Artists'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Blog = lazy(() => import('./components/Blog'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));

// Only import DebugAuth in development
const DebugAuth = import.meta.env.DEV 
  ? lazy(() => import('./components/DebugAuth'))
  : () => null;



const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <Header
        onBookClick={() => navigate('/design')}
        onSavedClick={() => navigate('/saved')}
        onGalleryClick={() => navigate('/gallery')}
        onArtistsClick={() => navigate('/artists')}
        onProfileClick={() => navigate('/profile')}
        onLogoClick={() => navigate('/')}
        onBlogClick={() => navigate('/blog')}
        onAdminClick={() => navigate('/admin')}
        onAuthClick={() => openAuth('login')}
      />
      <main id="main-content" className="w-full">
        <Hero onStartClick={() => navigate('/design')} />
        
        {/* How it Works */}
        <section className="py-16 md:py-24 bg-background-light dark:bg-background-dark/50 rounded-3xl mx-4 lg:mx-0">
          <div className="flex flex-col gap-12 px-4 md:px-10">
            <div className="flex flex-col gap-4 text-center items-center">
              <h2 className="font-headline text-4xl font-bold leading-tight tracking-tight md:text-5xl max-w-2xl text-text-primary-light dark:text-text-primary-dark">
                A Seamless Journey to Your Dream Design
              </h2>
              <p className="text-base font-normal leading-relaxed max-w-2xl text-text-primary-light/80 dark:text-text-primary-dark/80">
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
                  <span className="material-symbols-outlined text-5xl text-primary" aria-hidden="true">{item.icon}</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold font-sub-headline text-primary">{item.title}</h3>
                    <p className="text-sm font-normal leading-normal text-text-primary-light/80 dark:text-text-primary-dark/80">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Styles Gallery */}
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="flex flex-col gap-4 px-4 lg:px-0">
            <h2 className="font-headline text-4xl font-bold leading-tight tracking-tight md:text-5xl text-text-primary-light dark:text-text-primary-dark">Featured Mehendi Styles</h2>
            <p className="text-base font-normal leading-relaxed max-w-2xl text-text-primary-light/80 dark:text-text-primary-dark/80">
              Explore a curated collection of our most beloved designs.
            </p>
          </div>
          <div className="mt-12 flex space-x-6 overflow-x-auto pb-8 -mx-4 px-8 no-scrollbar snap-x" role="list" aria-label="Featured mehendi styles">
            {[
              { title: 'Classic Arabic', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZHUtxqE9fyKP4kQcIltd0bv_Fb7wAO65O5vuW4YyrQmPRl6dA9lc5jNTesjoC7EjwmfpqY27WSA-jxh3o3pc6W2TkBwZBoK7u0YXHoy0xFX-8FxZlUkbD320uD6Gh2IIIeeK6ZpqPvk4RzaXx_FBqNVmX_1m9_lh4J9H4IpJFyoKszRuPLPZsK1rjgwVngmiF0PTfUdpcUzt4zpc_bdlwvchcU4CVoh-BKsw7vET6hY74Cpoa7ocnjdjR6LQQ3e2iaqcVtCYpIg' },
              { title: 'Indian Bridal', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhmn1IMdg3DcAL7mPaoPm2CmEHUFbY9_BnE2CA8zL8GAjI8MxQujyMyPL8UbAEoSG2JT7qq6XPBWeJXISX6NTtmOBRL7kOFJK9SCWEMM4F8MjCmt0x4nns5DeGMx4hFVyjBbpTk73PeT0DxVRW9FHMW_DSgWAN_XlbZABbYUH_56XBsrfTIUBKCxgO8KINX306w8VnVkgN0591i9s7DbI1ECKCKAs7oAiMXnyCH8evHoE74MPSHP7eW_4XUFVDRMw2NaMag6cPJQ' },
              { title: 'Modern Minimalist', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHbAM6BsAsgjwxAvEOawdaQcNzDU3rdKg4Jy_tox7j5Uc1JeiGfsKubEhXPQDhXNQ2edLZXa8tZNnrrSLK40Gysc6kVUyOKawQT3l3m53ZUED4aVTfQf5TdMZHqUp6lteU2otF2ceNbMzSOu2s4XPvIj2lo9bKdp6Zf81GfduhC-HKF2kxA_dmkZ5tT6fuNYgbGcNcOZbi4T-uqaCZMsosBSsUQbu-7f6tqytMj3hP2ZPMo_4s-t3iUZi9c6oJ_NdkpHQjhgBUrw' },
              { title: 'Floral Mandala', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaEyI1blgdYGHF0OMi0s4fhJkPusxg7eTdtBQlOup12yEBbCLS0kltwgr61LzA8t9vcj_IC0AVY5_DqCPA6G2lXYqNc5mPtz8MUzvksTEoaI4N9NP6inOMWHEzw5YZPc0PIAjIfKvovpXU8tLQC_wYS6CxeWbdoBV1ELIiA7v1yTsZHJFax-F-vCFtGdEbzpIUyUCCPY36HDaLSMSk4Tl3g-k5nwSRwZyAnqmv9Ngi-SwyRoC0cuY5yiX3ktfqWxeXAAng3hu93Q' }
            ].map((style, i) => (
              <article key={i} className="flex-shrink-0 w-80 bg-white dark:bg-background-dark/50 rounded-3xl shadow-lg border border-primary/10 p-4 flex flex-col gap-4 snap-center hover:scale-[1.02] transition-transform duration-300" role="listitem">
                <img 
                  src={style.img} 
                  alt={`${style.title} mehendi design example`}
                  className="w-full aspect-square object-cover rounded-2xl"
                  loading="lazy"
                />
                <h3 className="font-sub-headline text-2xl font-bold text-primary">{style.title}</h3>
                <button 
                  onClick={() => navigate('/design')} 
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary text-white text-sm font-bold shadow-primary-soft hover:bg-[#a15842] transition-colors duration-300"
                  aria-label={`Preview ${style.title} design on your hand`}
                >
                  Preview on my hand
                </button>
              </article>
            ))}
          </div>
        </section>

        <SocialProof />
        <Testimonials />
        <FAQ />

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="bg-gradient-to-br from-primary to-[#a15842] rounded-3xl p-8 md:p-16 text-center text-white">
            <h2 className="font-headline text-3xl md:text-5xl font-bold mb-4">
              Ready to Create Your Perfect Design?
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8">
              Join thousands of brides who have discovered their dream henna with our AI-powered design studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/design')}
                className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-colors"
              >
                Start Designing
              </button>
              <button
                onClick={() => navigate('/artists')}
                className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors"
              >
                Meet Our Artists
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer 
        onPrivacyClick={() => navigate('/privacy')}
        onTermsClick={() => navigate('/terms')}
        onGalleryClick={() => navigate('/gallery')}
        onArtistsClick={() => navigate('/artists')}
        onBookingClick={() => navigate('/booking')}
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [bookingDesign, setBookingDesign] = useState<string | undefined>(undefined);

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const goToBooking = (designName?: string) => {
    setBookingDesign(designName);
    navigate('/booking');
  };

  const isLandingPage = location.pathname === '/';

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-display">
      <ScrollToTopOnRoute />
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-7xl px-4 md:px-8 lg:px-0">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                
                <Route path="/design" element={
                  <DesignFlow 
                    onBack={() => navigate('/')} 
                    onViewSaved={() => navigate('/saved')} 
                    onBookConsultation={goToBooking}
                    onGallery={() => navigate('/gallery')}
                    onArtists={() => navigate('/artists')}
                  />
                } />
                
                <Route path="/saved" element={
                  <>
                    <Header
                      onBookClick={() => navigate('/design')}
                      onSavedClick={() => navigate('/saved')}
                      onGalleryClick={() => navigate('/gallery')}
                      onArtistsClick={() => navigate('/artists')}
                      onProfileClick={() => navigate('/profile')}
                      onLogoClick={() => navigate('/')}
                      onAdminClick={() => navigate('/admin')}
                      onAuthClick={() => openAuth('login')}
                    />
                    <main id="main-content">
                      <SavedDesigns 
                        onStartNew={() => navigate('/design')} 
                        onBack={() => navigate('/')}
                        onGallery={() => navigate('/gallery')}
                        onArtists={() => navigate('/artists')}
                        onBooking={goToBooking}
                      />
                    </main>
                  </>
                } />
                
                <Route path="/booking" element={
                  <>
                    <Header
                      onBookClick={() => navigate('/design')}
                      onSavedClick={() => navigate('/saved')}
                      onGalleryClick={() => navigate('/gallery')}
                      onArtistsClick={() => navigate('/artists')}
                      onProfileClick={() => navigate('/profile')}
                      onLogoClick={() => navigate('/')}
                      onAdminClick={() => navigate('/admin')}
                      onAuthClick={() => openAuth('login')}
                    />
                    <main id="main-content">
                      <Booking 
                        designName={bookingDesign} 
                        onCancel={() => navigate('/')} 
                        onSubmit={() => navigate('/')} 
                      />
                    </main>
                  </>
                } />
                
                <Route path="/profile" element={
                  <main id="main-content">
                    <Profile 
                      onBack={() => navigate('/')} 
                      onViewDesign={(id) => console.log('View design:', id)}
                      onStartDesign={() => navigate('/design')}
                      onGallery={() => navigate('/gallery')}
                      onArtists={() => navigate('/artists')}
                      onSaved={() => navigate('/saved')}
                      onBooking={goToBooking}
                      onAuth={() => openAuth('login')}
                      onAdmin={() => navigate('/admin')}
                    />
                  </main>
                } />
                
                <Route path="/gallery" element={
                  <>
                    <Header
                      onBookClick={() => navigate('/design')}
                      onSavedClick={() => navigate('/saved')}
                      onGalleryClick={() => navigate('/gallery')}
                      onArtistsClick={() => navigate('/artists')}
                      onProfileClick={() => navigate('/profile')}
                      onLogoClick={() => navigate('/')}
                      onAdminClick={() => navigate('/admin')}
                      onAuthClick={() => openAuth('login')}
                    />
                    <main id="main-content">
                      <Gallery 
                        onBack={() => navigate('/')} 
                        onStartDesign={() => navigate('/design')}
                        onBooking={goToBooking}
                      />
                    </main>
                  </>
                } />
                
                <Route path="/artists" element={
                  <>
                    <Header
                      onBookClick={() => navigate('/design')}
                      onSavedClick={() => navigate('/saved')}
                      onGalleryClick={() => navigate('/gallery')}
                      onArtistsClick={() => navigate('/artists')}
                      onProfileClick={() => navigate('/profile')}
                      onLogoClick={() => navigate('/')}
                      onAdminClick={() => navigate('/admin')}
                      onAuthClick={() => openAuth('login')}
                    />
                    <main id="main-content">
                      <Artists 
                        onBack={() => navigate('/')} 
                        onBookArtist={() => navigate('/booking')}
                        onStartDesign={() => navigate('/design')}
                        onGallery={() => navigate('/gallery')}
                      />
                    </main>
                  </>
                } />
                
                <Route path="/admin" element={
                  <main id="main-content">
                    <AdminDashboard 
                      onBack={() => navigate('/')}
                      onStartDesign={() => navigate('/design')}
                      onGallery={() => navigate('/gallery')}
                      onArtists={() => navigate('/artists')}
                      onSaved={() => navigate('/saved')}
                      onBooking={goToBooking}
                      onAuth={() => openAuth('login')}
                    />
                  </main>
                } />
                
                <Route path="/blog" element={
                  <main id="main-content">
                    <Blog
                      onBack={() => navigate('/')}
                      onStartDesign={() => navigate('/design')}
                      onGallery={() => navigate('/gallery')}
                      onArtists={() => navigate('/artists')}
                      onSaved={() => navigate('/saved')}
                      onBooking={goToBooking}
                      onAuth={() => openAuth('login')}
                    />
                  </main>
                } />
                
                <Route path="/privacy" element={
                  <main id="main-content">
                    <PrivacyPolicy onBack={() => navigate('/')} />
                  </main>
                } />
                
                <Route path="/terms" element={
                  <main id="main-content">
                    <TermsOfService onBack={() => navigate('/')} />
                  </main>
                } />
                
                {/* 404 Not Found */}
                <Route path="*" element={<NotFound onBack={() => navigate('/')} />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      {/* Quick Navigation FAB - show on non-landing pages */}
      {!isLandingPage && (
        <QuickNav
          onHome={() => navigate('/')}
          onDesign={() => navigate('/design')}
          onSaved={() => navigate('/saved')}
          onGallery={() => navigate('/gallery')}
          onArtists={() => navigate('/artists')}
        />
      )}

      {/* Debug Auth Info - only in development */}
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <DebugAuth />
        </Suspense>
      )}


    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
