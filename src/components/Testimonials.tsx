import React, { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai, India',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'I was skeptical about AI-generated designs, but Henna Harmony blew me away! The design perfectly matched my lehenga and the preview on my hand was so accurate. My wedding mehndi was exactly what I dreamed of.',
    occasion: 'Wedding'
  },
  {
    name: 'Fatima Al-Hassan',
    location: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'The Arabic style options are incredible! I used this for my Eid celebration and received so many compliments. The AI understood exactly what I wanted - elegant and not too heavy.',
    occasion: 'Eid Celebration'
  },
  {
    name: 'Sarah Johnson',
    location: 'Los Angeles, USA',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'As someone new to henna, I loved how easy this was! The modern minimalist designs are gorgeous. I showed the generated design to my local artist and she recreated it perfectly.',
    occasion: 'Festival'
  },
  {
    name: 'Ananya Patel',
    location: 'London, UK',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Used Henna Harmony for my sister\'s sangeet. We generated designs for the whole bridal party! The ability to match designs to our outfits was a game-changer.',
    occasion: 'Sangeet'
  },
  {
    name: 'Meera Krishnan',
    location: 'Chennai, India',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'The bridal collection is stunning! I spent hours trying different styles before my wedding. The AI suggestions based on my hand shape were spot on. Highly recommend!',
    occasion: 'Wedding'
  }
];

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="px-4 lg:px-0">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl font-bold leading-tight tracking-tight md:text-5xl text-text-primary-light dark:text-text-primary-dark mb-4">
            Loved by Thousands
          </h2>
          <p className="text-base font-normal leading-relaxed max-w-2xl mx-auto text-text-primary-light/70 dark:text-text-primary-dark/70">
            Join over 10,000 happy customers who found their perfect henna design
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white dark:bg-background-dark/50 rounded-3xl p-8 md:p-12 shadow-xl border border-primary/10 relative overflow-hidden">
            {/* Quote decoration */}
            <div className="absolute top-4 left-4 text-8xl text-primary/10 font-serif leading-none">"</div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={testimonials[activeIndex].image} 
                  alt={testimonials[activeIndex].name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <h4 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                    {testimonials[activeIndex].name}
                  </h4>
                  <p className="text-sm text-text-primary-light/60 dark:text-text-primary-dark/60">
                    {testimonials[activeIndex].location}
                  </p>
                  <span className="inline-block mt-1 px-3 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {testimonials[activeIndex].occasion}
                  </span>
                </div>
                <div className="ml-auto flex gap-1">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <span key={i} className="text-accent-gold text-xl">★</span>
                  ))}
                </div>
              </div>
              
              <p className="text-lg md:text-xl text-text-primary-light/80 dark:text-text-primary-dark/80 leading-relaxed italic">
                "{testimonials[activeIndex].text}"
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial Navigation Dots */}
        <div className="flex justify-center gap-2 mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-primary w-8' 
                  : 'bg-primary/30 hover:bg-primary/50'
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Mini Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t, i) => (
            <div 
              key={i}
              className="bg-white dark:bg-background-dark/30 rounded-2xl p-6 border border-primary/10 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <span key={j} className="text-accent-gold">★</span>
                ))}
              </div>
              <p className="text-sm text-text-primary-light/70 dark:text-text-primary-dark/70 mb-4 line-clamp-3">
                "{t.text.slice(0, 120)}..."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src={t.image} 
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-text-primary-light/50">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
