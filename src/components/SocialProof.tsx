import React, { useState, useEffect, useRef } from 'react';

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ end, duration = 2000, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const SocialProof: React.FC = () => {
  const stats = [
    { 
      value: 10000, 
      suffix: '+', 
      label: 'Designs Created',
      icon: 'palette'
    },
    { 
      value: 4.8, 
      suffix: '/5', 
      label: 'Average Rating',
      icon: 'star',
      isDecimal: true
    },
    { 
      value: 50, 
      suffix: '+', 
      label: 'Henna Styles',
      icon: 'brush'
    },
    { 
      value: 98, 
      suffix: '%', 
      label: 'Happy Customers',
      icon: 'favorite'
    }
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 mx-4 lg:mx-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-2xl text-primary">{stat.icon}</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.isDecimal ? (
                  <span>{stat.value}{stat.suffix}</span>
                ) : (
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <p className="text-sm text-text-primary-light/70 dark:text-text-primary-dark/70 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="mt-10 pt-8 border-t border-primary/10">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-2 text-text-primary-light/60 dark:text-text-primary-dark/60">
              <span className="material-symbols-outlined text-green-500">verified</span>
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 text-text-primary-light/60 dark:text-text-primary-dark/60">
              <span className="material-symbols-outlined text-green-500">lock</span>
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 text-text-primary-light/60 dark:text-text-primary-dark/60">
              <span className="material-symbols-outlined text-green-500">speed</span>
              <span className="text-sm font-medium">30-Second Generation</span>
            </div>
            <div className="flex items-center gap-2 text-text-primary-light/60 dark:text-text-primary-dark/60">
              <span className="material-symbols-outlined text-green-500">support_agent</span>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
