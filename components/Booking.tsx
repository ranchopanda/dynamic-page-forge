
import React, { useState } from 'react';

interface BookingProps {
  designName?: string;
  onCancel: () => void;
  onSubmit: (formData: any) => void;
}

const Booking: React.FC<BookingProps> = ({ designName, onCancel, onSubmit }) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
    }, 500);
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8 md:py-12 animate-fadeIn min-h-[60vh]">
        <div className="relative w-full max-w-2xl">
          {/* Decorative Background for Success Card */}
          <div className="absolute inset-0 -z-10 transform scale-105 opacity-50 dark:opacity-20">
             <svg className="h-full w-full object-contain" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#D8A85B" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,85.8,-8.3C81.5,3.8,70.2,13.7,60.8,22.2C51.4,30.7,43.9,37.8,35.5,44.9C27.1,52,17.8,59.1,6.6,63.1C-4.6,67.1,-17.7,68,-28.9,64.3C-40.1,60.6,-49.4,52.3,-58.5,42.8C-67.6,33.3,-76.5,22.6,-80.7,10.2C-84.9,-2.2,-84.4,-16.3,-77.8,-28.4C-71.2,-40.5,-58.5,-50.6,-45.5,-58.3C-32.5,-66,-19.2,-71.3,-5.2,-72.9C8.8,-74.5,22.8,-72.4,30.5,-83.6" transform="translate(100 100) scale(1.1)" style={{opacity: 0.1}} />
             </svg>
          </div>

          <div className="relative z-10 mx-auto w-full rounded-3xl bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border border-primary/10 shadow-2xl p-8 sm:p-12">
            <div className="flex justify-center mb-8">
              <span className="material-symbols-outlined text-6xl text-primary animate-bounce-short">
                check_circle
              </span>
            </div>

            {/* PageHeading */}
            <div className="text-center">
              <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary dark:text-accent-gold">Consultation Booked!</h1>
              <p className="mt-4 text-base sm:text-lg text-text-primary-light/80 dark:text-text-primary-dark/80">
                Thank you for choosing Henna Harmony Studio. We look forward to bringing your vision to life.
              </p>
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent"></div>

            {/* DescriptionList */}
            <div className="space-y-4">
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-sm font-medium text-text-primary-light/60 dark:text-text-primary-dark/60">Date</p>
                <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark text-right">October 26, 2024</p>
              </div>
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-sm font-medium text-text-primary-light/60 dark:text-text-primary-dark/60">Time</p>
                <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark text-right">2:00 PM PST</p>
              </div>
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-sm font-medium text-text-primary-light/60 dark:text-text-primary-dark/60">Consultation Type</p>
                <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark text-right">Virtual</p>
              </div>
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-sm font-medium text-text-primary-light/60 dark:text-text-primary-dark/60">Confirmation ID</p>
                <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark text-right font-mono">HHS-C8X7B3</p>
              </div>
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent"></div>

            {/* BodyText */}
            <p className="text-sm text-text-primary-light/80 dark:text-text-primary-dark/80 text-center leading-relaxed">
              You will receive an email confirmation shortly with all the details and a calendar invite. Please have your outfit details and any inspirations ready for our session.
            </p>

            {/* ButtonGroup */}
            <div className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-4">
              <button 
                onClick={onCancel} // Navigate back/home
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-primary text-white text-base font-bold leading-normal shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40"
              >
                <span className="truncate">View My Consultations</span>
              </button>
              <button 
                onClick={onCancel} // Navigate back/home
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-transparent text-primary dark:text-accent-gold border-2 border-accent-gold text-base font-bold leading-normal transition-colors hover:bg-accent-gold/10"
              >
                <span className="truncate">Explore More Designs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 md:py-12 animate-fadeIn">
      <div className="px-4 md:px-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-primary font-headline text-4xl sm:text-5xl font-bold">Book Your Bridal Consultation</h1>
          <p className="text-text-primary-light dark:text-text-primary-dark mt-3 text-lg">Let's bring your bespoke mehndi vision to life.</p>
          {designName && (
            <p className="mt-4 text-sm text-text-primary-light/80 dark:text-text-primary-dark/80 bg-primary/5 border border-primary/10 rounded-full px-4 py-2 inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-base">style</span>
              Consultation for design: <span className="font-semibold text-primary">{designName}</span>
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-background-dark/50 p-6 md:p-8 rounded-3xl shadow-lg border border-primary/10">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-text-primary-light dark:text-text-primary-dark" htmlFor="full-name">Full Name</label>
              <div className="mt-2">
                <input required autoComplete="name" className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-text-primary-light dark:text-text-primary-dark placeholder:text-text-primary-light/40 focus:ring-primary focus:border-primary transition-all outline-none" id="full-name" name="full-name" placeholder="e.g. Priya Sharma" type="text" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-text-primary-light dark:text-text-primary-dark" htmlFor="email">Email Address</label>
              <div className="mt-2">
                <input required autoComplete="email" className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-text-primary-light dark:text-text-primary-dark placeholder:text-text-primary-light/40 focus:ring-primary focus:border-primary transition-all outline-none" id="email" name="email" placeholder="you@example.com" type="email" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-text-primary-light dark:text-text-primary-dark" htmlFor="phone-number">Phone Number</label>
              <div className="mt-2">
                <input required autoComplete="tel" className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-text-primary-light dark:text-text-primary-dark placeholder:text-text-primary-light/40 focus:ring-primary focus:border-primary transition-all outline-none" id="phone-number" name="phone-number" placeholder="+1 (555) 987-6543" type="tel" />
              </div>
            </div>
          </div>
          
          <div className="border-b border-primary/10 my-4"></div>
          
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-text-primary-light dark:text-text-primary-dark" htmlFor="preferred-dates">Preferred Date(s)</label>
              <div className="mt-2">
                <input required className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-text-primary-light dark:text-text-primary-dark focus:ring-primary focus:border-primary transition-all outline-none" id="preferred-dates" name="preferred-dates" type="date" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-text-primary-light dark:text-text-primary-dark" htmlFor="preferred-times">Preferred Time(s)</label>
              <div className="mt-2">
                <input className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-text-primary-light dark:text-text-primary-dark focus:ring-primary focus:border-primary transition-all outline-none" id="preferred-times" name="preferred-times" type="time" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-text-primary-light dark:text-text-primary-dark" htmlFor="consultation-type">Consultation Type</label>
              <div className="mt-2">
                <select className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-text-primary-light dark:text-text-primary-dark focus:ring-primary focus:border-primary transition-all outline-none" id="consultation-type" name="consultation-type">
                  <option>Virtual</option>
                  <option>In-person at Studio</option>
                  <option>On-site for Event</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-text-primary-light dark:text-text-primary-dark" htmlFor="event-date">Event Date (Optional)</label>
              <div className="mt-2">
                <input className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-text-primary-light dark:text-text-primary-dark focus:ring-primary focus:border-primary transition-all outline-none" id="event-date" name="event-date" type="date" />
              </div>
            </div>
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-text-primary-light dark:text-text-primary-dark" htmlFor="message">Brief Message</label>
              <div className="mt-2">
                <textarea className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 text-text-primary-light dark:text-text-primary-dark placeholder:text-text-primary-light/40 focus:ring-primary focus:border-primary transition-all outline-none" id="message" name="message" placeholder="Add any specific requests or details about your event..." rows={4}></textarea>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary/10 pt-8 mt-4">
            <div className="flex items-center justify-end gap-x-4">
              <button onClick={onCancel} className="flex w-full sm:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-transparent text-text-primary-light dark:text-text-primary-dark border border-accent-gold hover:bg-accent-gold/10 transition-colors text-base font-bold" type="button">
                Cancel
              </button>
              <button className="flex w-full sm:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-primary text-white text-base font-bold shadow-primary-soft hover:bg-primary/90 transition-all" type="submit">
                Confirm Booking
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
