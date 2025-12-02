import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does AI henna design generation work?',
    answer: 'Simply upload a photo of your hand, select your preferred style (Arabic, Indian, Modern, etc.), and our AI analyzes your hand shape to generate custom mehendi designs that perfectly fit your hand contours. The process takes less than 30 seconds.'
  },
  {
    question: 'Is Mehendi free to use?',
    answer: 'Yes! You can generate and preview henna designs for free. We offer premium features for saving unlimited designs and booking professional henna artists.'
  },
  {
    question: 'Can I use these designs for my wedding?',
    answer: 'Absolutely! Our AI specializes in bridal mehendi designs. You can generate designs, save your favorites, and even book one of our professional artists to apply the design for your special day.'
  },
  {
    question: 'What henna styles are available?',
    answer: 'We offer a wide variety including Classic Arabic, Indian Bridal, Modern Minimalist, Floral Mandala, Moroccan, Indo-Arabic fusion, and many more. You can also customize elements to create your unique design.'
  },
  {
    question: 'How accurate are the AI-generated designs?',
    answer: 'Our AI has been trained on thousands of professional henna designs and uses advanced image recognition to map designs to your specific hand shape. The preview shows exactly how the design will look on your hand.'
  },
  {
    question: 'Can I book a henna artist through the platform?',
    answer: 'Yes! Once you\'ve found your perfect design, you can book one of our verified professional henna artists to apply it. We have artists available in major cities across the US, UK, UAE, and India.'
  },
  {
    question: 'How do I save my favorite designs?',
    answer: 'Create a free account to save unlimited designs to your personal collection. You can access them anytime, share with friends, or use them when booking an artist.'
  },
  {
    question: 'Is my uploaded photo secure?',
    answer: 'Absolutely. We take privacy seriously. Your photos are processed securely, never shared with third parties, and you can delete them from our servers at any time.'
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24" id="faq">
      <div className="px-4 lg:px-0">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl font-bold leading-tight tracking-tight md:text-5xl text-text-primary-light dark:text-text-primary-dark mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base font-normal leading-relaxed max-w-2xl mx-auto text-text-primary-light/70 dark:text-text-primary-dark/70">
            Everything you need to know about creating your perfect henna design
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border-b border-primary/10 last:border-b-0"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full py-6 flex items-center justify-between text-left group"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span className="font-medium text-lg text-text-primary-light dark:text-text-primary-dark group-hover:text-primary transition-colors pr-4">
                  {faq.question}
                </span>
                <span 
                  className={`material-symbols-outlined text-primary transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>
              <div 
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
                hidden={openIndex !== index}
              >
                <p className="text-text-primary-light/80 dark:text-text-primary-dark/80 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-text-primary-light/60 dark:text-text-primary-dark/60 mb-4">
            Still have questions?
          </p>
          <a 
            href="mailto:himanshiparashar44@gmail.com"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <span className="material-symbols-outlined">mail</span>
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
