import React from 'react';

interface HeroProps {
  onStartClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <div className="py-12 md:py-24 w-full">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-8 lg:w-1/2">
          <div className="flex flex-col gap-4 text-left">
            <h1 className="font-headline text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl text-text-primary-light dark:text-text-primary-dark">
              Your Perfect Henna, <br /><span className="text-primary">Uniquely Yours.</span>
            </h1>
            <p className="text-base font-normal leading-relaxed md:text-lg max-w-lg text-text-primary-light/80 dark:text-text-primary-dark/80">
              Experience the art of mehndi like never before. Our AI-powered service designs exquisite henna that perfectly matches your hand, outfit, and personal style for a truly bridal feel.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onStartClick}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-primary-soft hover:shadow-primary-soft-hover hover:bg-[#a15842] transition-all duration-300 transform hover:-translate-y-1"
            >
              Start with my hand
            </button>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-transparent border-2 border-accent-gold text-accent-gold dark:text-accent-gold text-base font-bold leading-normal tracking-[0.015em] transition-all duration-300 hover:bg-accent-gold/10">
              Watch how it works
            </button>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
           {/* Decorative abstract blob behind image */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent-gold/20 rounded-full blur-3xl -z-10"></div>
          <div 
            className="w-full max-w-md aspect-[4/5] bg-center bg-no-repeat bg-cover rounded-[2rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3cM5HAx1CtJxF8eLNT2VKSq8h0UfcDWvzJ1K6N4_XRLkPrcYrEX-7cS94S69Ubm5GGZimqlAjLMRUYXVnDpZdNCmNchd_o3UftuDTeLV3LKeessomr5bNURCblkthnLv9Tjtzw5j0oP8njRLCnaREOPgD-qRyrcWHwlXbR6WN9V1AGVnRFDax7Z1PiB9KEUiUvQhWZFsP6iM6gNPt0Wde72unau43JIbciafvWO5BKsFHJhcZcHdr8pLRdN9tiJ8BB4jyCRrJXA")'}}
            role="img"
            aria-label="A close-up of a hand with an intricate and beautiful henna design"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
