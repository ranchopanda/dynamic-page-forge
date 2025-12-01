import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-footer-bg dark:bg-background-dark/80 mt-16 rounded-t-3xl">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-lg font-bold font-headline text-primary">Henna Harmony</h2>
            <p className="mt-2 text-sm text-text-primary-light/70 dark:text-text-primary-dark/70">Creating timeless beauty, one design at a time.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Styles</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Bookings</a></li>
            </ul>
          </div>
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Stay Updated</h3>
            <p className="mt-4 text-sm">Join our newsletter for exclusive designs and offers.</p>
            <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                className="w-full rounded-md border border-primary/20 bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-sm px-3 py-2" 
                placeholder="Your email" 
                type="email" 
              />
              <button className="flex-shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-[#a15842] transition-colors" type="submit">
                Sign Up
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-primary/20 pt-8 text-center text-sm text-text-primary-light/60 dark:text-text-primary-dark/60">
          <p>© 2024 Henna Harmony Studio. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
