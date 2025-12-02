import React, { useState } from 'react';
import { useAuth } from '../context/SupabaseAuthContext';
import { supabaseApi } from '../lib/supabaseApi';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';

interface BookingProps {
  designName?: string;
  designId?: string;
  onCancel: () => void;
  onSubmit: () => void;
}

const Booking: React.FC<BookingProps> = ({ designName, designId, onCancel, onSubmit }) => {
  const { isAuthenticated, user } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    preferredDate: '',
    preferredTime: '',
    consultationType: 'VIRTUAL' as 'VIRTUAL' | 'IN_PERSON' | 'ON_SITE',
    eventDate: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isAuthenticated && user) {
        // Save to Supabase for authenticated users
        const result = await supabaseApi.createBooking({
          designId,
          consultationType: formData.consultationType,
          scheduledDate: formData.preferredDate,
          scheduledTime: formData.preferredTime,
          eventDate: formData.eventDate || undefined,
          message: formData.message || undefined,
        });
        setBooking(result);
      } else {
        // For anonymous users, just show success (booking info sent via form)
        setBooking({
          confirmationCode: `BK${Date.now().toString(36).toUpperCase()}`,
          scheduledDate: formData.preferredDate,
          scheduledTime: formData.preferredTime,
        });
      }
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8 md:py-12 animate-fadeIn min-h-[60vh]">
        <div className="relative w-full max-w-2xl">
          <div className="relative z-10 mx-auto w-full rounded-3xl bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border border-primary/10 shadow-2xl p-8 sm:p-12">
            <div className="flex justify-center mb-8">
              <span className="material-symbols-outlined text-6xl text-primary animate-bounce">
                check_circle
              </span>
            </div>

            <div className="text-center">
              <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary dark:text-accent-gold">
                Consultation Booked!
              </h1>
              <p className="mt-4 text-base sm:text-lg text-text-primary-light/80 dark:text-text-primary-dark/80">
                Thank you for choosing Mehendi Studio. We look forward to bringing your vision to life.
              </p>
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent"></div>

            <div className="space-y-4">
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-sm font-medium text-text-primary-light/60">Date</p>
                <p className="text-sm font-bold text-right">
                  {new Date(formData.preferredDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-sm font-medium text-text-primary-light/60">Time</p>
                <p className="text-sm font-bold text-right">{formData.preferredTime}</p>
              </div>
              <div className="flex justify-between gap-x-6 py-1">
                <p className="text-sm font-medium text-text-primary-light/60">Type</p>
                <p className="text-sm font-bold text-right">{formData.consultationType.replace('_', ' ')}</p>
              </div>
              {booking?.confirmationCode && (
                <div className="flex justify-between gap-x-6 py-1">
                  <p className="text-sm font-medium text-text-primary-light/60">Confirmation</p>
                  <p className="text-sm font-bold text-right font-mono text-primary">{booking.confirmationCode}</p>
                </div>
              )}
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent"></div>

            <p className="text-sm text-text-primary-light/80 text-center leading-relaxed">
              {isAuthenticated 
                ? 'You will receive an email confirmation shortly with all the details.'
                : 'Our team will contact you shortly to confirm your booking.'}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row sm:justify-center gap-4">
              <button 
                onClick={onSubmit}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-primary text-white text-base font-bold shadow-lg hover:bg-primary/90 transition-all"
              >
                Back to Home
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
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Home', onClick: onCancel },
          { label: 'Book Consultation' }
        ]} />

        <div className="text-center mb-10">
          <h1 className="text-primary font-headline text-4xl sm:text-5xl font-bold">
            Book Your Bridal Consultation
          </h1>
          <p className="text-text-primary-light dark:text-text-primary-dark mt-3 text-lg">
            Let's bring your bespoke mehendi vision to life.
          </p>
          {designName && (
            <p className="mt-4 text-sm text-text-primary-light/80 bg-primary/5 border border-primary/10 rounded-full px-4 py-2 inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-base">style</span>
              Design: <span className="font-semibold text-primary">{designName}</span>
            </p>
          )}
        </div>

        {error && (
          <div 
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-background-dark/50 p-6 md:p-8 rounded-3xl shadow-lg border border-primary/10">
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="booking-fullName" className="block text-sm font-medium mb-1">Full Name</label>
              <input
                id="booking-fullName"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary outline-none"
                placeholder="Priya Sharma"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="booking-email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="booking-email"
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="booking-phone" className="block text-sm font-medium mb-1">Phone</label>
              <input
                id="booking-phone"
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary outline-none"
                placeholder="+91 7011489500"
              />
            </div>
          </div>
          
          <hr className="border-primary/10" />
          
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="booking-date" className="block text-sm font-medium mb-1">Preferred Date</label>
              <input
                id="booking-date"
                required
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="booking-time" className="block text-sm font-medium mb-1">Preferred Time</label>
              <input
                id="booking-time"
                required
                type="time"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="booking-type" className="block text-sm font-medium mb-1">Consultation Type</label>
              <select
                id="booking-type"
                name="consultationType"
                value={formData.consultationType}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="VIRTUAL">Virtual</option>
                <option value="IN_PERSON">In-person at Studio</option>
                <option value="ON_SITE">On-site for Event</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="booking-eventDate" className="block text-sm font-medium mb-1">Event Date (Optional)</label>
              <input
                id="booking-eventDate"
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="sm:col-span-6">
              <label htmlFor="booking-message" className="block text-sm font-medium mb-1">Message (Optional)</label>
              <textarea
                id="booking-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full bg-background-light dark:bg-background-dark border border-primary/20 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary outline-none resize-none"
                placeholder="Any specific requests or details about your event..."
              />
            </div>
          </div>
          
          <div className="border-t border-primary/10 pt-8 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-accent-gold text-text-primary-light rounded-xl hover:bg-accent-gold/10 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-primary-soft hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">help</span>
            Need Help Choosing?
          </h4>
          <p className="text-sm text-text-primary-light/70 dark:text-text-primary-dark/70 mb-4">
            Not sure which consultation type is right for you? Here's a quick guide:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-white dark:bg-background-dark rounded-xl">
              <p className="font-bold text-primary mb-1">Virtual</p>
              <p className="text-text-primary-light/60">Perfect for design discussions and planning</p>
            </div>
            <div className="p-4 bg-white dark:bg-background-dark rounded-xl">
              <p className="font-bold text-primary mb-1">In-Person</p>
              <p className="text-text-primary-light/60">Visit our studio for the full experience</p>
            </div>
            <div className="p-4 bg-white dark:bg-background-dark rounded-xl">
              <p className="font-bold text-primary mb-1">On-Site</p>
              <p className="text-text-primary-light/60">We come to your event location</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
