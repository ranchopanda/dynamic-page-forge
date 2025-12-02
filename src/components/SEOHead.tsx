import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
}

const BASE_URL = 'https://henna-harmony-him1.vercel.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Mehendi';

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = 'Create stunning, personalized mehendi designs in seconds with AI. Book professional henna artist in Greater Noida.',
  keywords = 'mehendi design, henna design, AI mehendi generator, bridal mehendi, Greater Noida',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author = 'Mehendi by Himanshi',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | AI-Powered Custom Henna Design Generator`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('author', author);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', fullImage, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);

    // Twitter
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', fullImage);

    // Article specific
    if (type === 'article') {
      if (publishedTime) setMeta('article:published_time', publishedTime, true);
      if (modifiedTime) setMeta('article:modified_time', modifiedTime, true);
      if (section) setMeta('article:section', section, true);
      if (author) setMeta('article:author', author, true);
      tags.forEach((tag, i) => {
        setMeta(`article:tag:${i}`, tag, true);
      });
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Cleanup function
    return () => {
      document.title = `${SITE_NAME} | AI-Powered Custom Henna Design Generator`;
    };
  }, [fullTitle, description, keywords, fullImage, fullUrl, type, author, publishedTime, modifiedTime, section, tags, noindex]);

  return null; // This component only manages document head
};

export default SEOHead;

// Pre-defined SEO configs for common pages
export const SEO_CONFIGS = {
  home: {
    title: undefined, // Uses default
    description: 'Create stunning, personalized mehendi designs in seconds with AI. Upload your hand photo, choose your style, and get custom henna patterns. Book artist in Greater Noida - ₹100/hand.',
    keywords: 'mehendi design, henna design, AI mehendi generator, bridal mehendi, custom henna, Indian wedding mehendi, Arabic mehendi, Greater Noida henna artist',
  },
  design: {
    title: 'AI Design Studio',
    description: 'Upload your hand photo and let our AI create personalized mehendi designs. Choose from Arabic, Indian Bridal, Modern, and more styles.',
    keywords: 'AI mehendi design, custom henna generator, personalized mehendi, hand design tool',
    url: '/design',
  },
  gallery: {
    title: 'Mehendi Design Gallery',
    description: 'Browse our collection of stunning mehendi designs. Find inspiration for bridal henna, Arabic patterns, modern minimalist, and traditional Indian designs.',
    keywords: 'mehendi gallery, henna designs, bridal mehendi photos, Arabic henna patterns, Indian mehendi designs',
    url: '/gallery',
  },
  artists: {
    title: 'Professional Henna Artists',
    description: 'Meet our verified professional henna artists in Greater Noida. Book experienced mehendi artists for weddings, festivals, and special occasions.',
    keywords: 'henna artist Greater Noida, mehendi artist booking, professional henna service, wedding mehendi artist',
    url: '/artists',
  },
  booking: {
    title: 'Book Henna Artist',
    description: 'Book a professional henna artist in Greater Noida. Starting at ₹100/hand. Available for weddings, Karwa Chauth, Eid, and all occasions.',
    keywords: 'book mehendi artist, henna booking Greater Noida, wedding mehendi service, mehendi appointment',
    url: '/booking',
  },
  blog: {
    title: 'Mehendi Design Blog',
    description: 'Tips, trends, and inspiration for beautiful henna designs. Learn about bridal mehendi, Arabic patterns, care tips, and more.',
    keywords: 'mehendi blog, henna tips, bridal mehendi guide, mehendi trends, henna care',
    url: '/blog',
  },
  saved: {
    title: 'My Saved Designs',
    description: 'View and manage your saved mehendi designs. Access your favorite henna patterns anytime.',
    url: '/saved',
    noindex: true,
  },
  profile: {
    title: 'My Profile',
    description: 'Manage your Mehendi account, view booking history, and access saved designs.',
    url: '/profile',
    noindex: true,
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Privacy policy for Mehendi - AI-powered henna design generator. Learn how we protect your data.',
    url: '/privacy',
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms of service for using Mehendi - AI-powered henna design generator.',
    url: '/terms',
  },
};
