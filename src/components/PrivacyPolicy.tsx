import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-primary mb-8 hover:underline"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Home
        </button>
        
        <h1 className="font-headline text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none text-text-primary-light/80 dark:text-text-primary-dark/80 space-y-6">
          <p className="text-sm text-text-primary-light/60">Last updated: December 1, 2024</p>
          
          <section>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Mehndi Design ("we," "our," or "us"). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you visit our website and use our AI-powered mehndi design services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and email address (when you create an account)</li>
              <li>Phone number (for booking confirmations)</li>
              <li>Hand photographs (for AI design generation)</li>
              <li>Design preferences and saved designs</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-4 mb-2">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Usage data (pages visited, time spent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-8 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To generate personalized mehndi designs using AI</li>
              <li>To process and manage your bookings</li>
              <li>To communicate with you about your account and services</li>
              <li>To improve our AI algorithms and services</li>
              <li>To send promotional communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-8 mb-4">4. Photo Privacy</h2>
            <p>
              Your hand photographs are processed securely by our AI system. We do not share your photos with third parties.
              Photos are used solely for generating your custom mehndi designs. You can request deletion of your photos 
              at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-8 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-8 mb-4">6. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-8 mb-4">7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-none pl-0 mt-4 space-y-2">
              <li><strong>Email:</strong> himanshiparashar44@gmail.com</li>
              <li><strong>Phone/WhatsApp:</strong> +91 7011489500</li>
              <li><strong>Address:</strong> Greater Noida, Uttar Pradesh, India</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
