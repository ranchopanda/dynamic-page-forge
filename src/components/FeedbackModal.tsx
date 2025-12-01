import React, { useState } from 'react';
import api from '../lib/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  designId: string;
  designImage: string;
  onSubmit?: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, designId, designImage, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitDesignFeedback(designId, { rating, feedback });
      setSubmitted(true);
      setTimeout(() => {
        onSubmit?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-background-dark rounded-2xl p-8 max-w-md w-full text-center animate-fadeIn">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-2">Thank You!</h3>
          <p className="text-text-primary-light/70">
            Your feedback helps us improve our AI and create better designs for everyone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-background-dark rounded-2xl max-w-lg w-full overflow-hidden animate-slideUp">
        <div className="p-6 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary">How was your design?</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-sm text-text-primary-light/70 mt-1">
            Your feedback helps us improve our AI
          </p>
        </div>

        <div className="p-6">
          {/* Design Preview */}
          <div className="mb-6">
            <img
              src={designImage}
              alt="Your design"
              className="w-32 h-40 object-cover rounded-xl mx-auto shadow-lg"
            />
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-center">Rate this design</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <span
                    className={`material-symbols-outlined text-4xl transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    style={{ fontVariationSettings: star <= (hoverRating || rating) ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-text-primary-light/60 mt-2">
              {rating === 0 && 'Click to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent!'}
            </p>
          </div>

          {/* Feedback Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Tell us more (optional)
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="w-full px-4 py-3 border border-primary/20 rounded-xl resize-none focus:ring-2 focus:ring-primary outline-none"
              rows={3}
              placeholder="What did you like? What could be improved?"
            />
          </div>

          {/* Quick Feedback Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quick feedback</label>
            <div className="flex flex-wrap gap-2">
              {['Loved the pattern', 'Great detail', 'Perfect placement', 'Needs more detail', 'Too simple', 'Too complex'].map(option => (
                <button
                  key={option}
                  onClick={() => setFeedback(prev => prev ? `${prev}, ${option}` : option)}
                  className="px-3 py-1.5 text-sm border border-primary/20 rounded-full hover:bg-primary/10 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-[#a15842] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Submit Feedback
              </>
            )}
          </button>

          <p className="text-xs text-text-primary-light/50 text-center mt-4">
            Your design will be reviewed by our team and may be featured in our gallery
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
