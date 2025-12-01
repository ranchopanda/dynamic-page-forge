import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string;
  author: string;
  views: number;
  createdAt: string;
}

interface BlogProps {
  onBack: () => void;
  onStartDesign: () => void;
  onGallery: () => void;
  onArtists: () => void;
  onSaved: () => void;
  onBooking: () => void;
  onAuth: () => void;
}

const Blog: React.FC<BlogProps> = ({ onBack, onStartDesign, onGallery, onArtists, onSaved, onBooking, onAuth }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory ? `?category=${selectedCategory}` : '';
      const response = await fetch(`/api/blog${params}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPost = async (slug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/post/${slug}`);
      const data = await response.json();
      setSelectedPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const parseTags = (tags: string): string[] => {
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  };

  // Single Post View
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Header
          onBookClick={onStartDesign}
          onSavedClick={onSaved}
          onGalleryClick={onGallery}
          onArtistsClick={onArtists}
          onProfileClick={() => {}}
          onAuthClick={onAuth}
          onLogoClick={onBack}
        />
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-primary mb-6 hover:underline"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Blog
          </button>

          {selectedPost.coverImage && (
            <img
              src={selectedPost.coverImage}
              alt={selectedPost.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8"
            />
          )}

          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4">
              {selectedPost.category}
            </span>
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
              {selectedPost.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-text-primary-light/60">
              <span>By {selectedPost.author}</span>
              <span>•</span>
              <span>{formatDate(selectedPost.createdAt)}</span>
              <span>•</span>
              <span>{selectedPost.views} views</span>
            </div>
          </div>

          <article 
            className="prose prose-lg max-w-none text-text-primary-light/80 dark:text-text-primary-dark/80"
            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
          />

          {parseTags(selectedPost.tags).length > 0 && (
            <div className="mt-8 pt-8 border-t border-primary/10">
              <h4 className="font-semibold mb-3">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {parseTags(selectedPost.tags).map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-primary to-[#a15842] rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Ready to Create Your Own Design?</h3>
            <p className="text-white/80 mb-4">Try our AI-powered mehndi design generator</p>
            <button
              onClick={onStartDesign}
              className="px-6 py-3 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-colors"
            >
              Start Designing
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Blog List View
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header
        onBookClick={onStartDesign}
        onSavedClick={onSaved}
        onGalleryClick={onGallery}
        onArtistsClick={onArtists}
        onProfileClick={() => {}}
        onAuthClick={onAuth}
        onLogoClick={onBack}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Home', onClick: onBack },
            { label: 'Blog' },
          ]}
        />

        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
            Mehndi Design Blog
          </h1>
          <p className="text-text-primary-light/70 dark:text-text-primary-dark/70 max-w-2xl mx-auto">
            Tips, trends, and inspiration for beautiful henna designs. Learn about bridal mehndi, Arabic patterns, and more.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-primary text-white'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">article</span>
            <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
            <p className="text-text-primary-light/60">Check back soon for mehndi tips and inspiration!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-background-dark/50 rounded-2xl overflow-hidden shadow-lg border border-primary/10 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => fetchPost(post.slug)}
              >
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-primary/30">article</span>
                  </div>
                )}
                <div className="p-6">
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mb-3">
                    {post.category}
                  </span>
                  <h2 className="font-headline text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-text-primary-light/60 dark:text-text-primary-dark/60 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-text-primary-light/50">
                    <span>{formatDate(post.createdAt)}</span>
                    <span>{post.views} views</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* SEO Content Section */}
        <section className="mt-16 bg-primary/5 rounded-3xl p-8 md:p-12">
          <h2 className="font-headline text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
            About Mehndi Design
          </h2>
          <div className="prose max-w-none text-text-primary-light/70 dark:text-text-primary-dark/70">
            <p>
              Welcome to Mehndi Design, your ultimate destination for AI-powered henna design generation and professional mehndi artist services in Greater Noida. 
              Our blog covers everything from traditional Indian bridal mehndi to modern Arabic patterns, helping you find the perfect design for your special occasion.
            </p>
            <p className="mt-4">
              Whether you're preparing for a wedding, Karwa Chauth, Eid, Diwali, or any festive celebration, our AI technology creates personalized mehndi designs 
              that perfectly match your hand shape and style preferences. Book our professional henna artist Himanshi for mehndi application in Greater Noida and surrounding areas.
            </p>
            <p className="mt-4">
              <strong>Service Areas:</strong> Greater Noida, Noida, Ghaziabad, Delhi NCR<br />
              <strong>Specialties:</strong> Bridal Mehndi, Arabic Mehndi, Indo-Arabic, Mandala, Festive Designs<br />
              <strong>Pricing:</strong> Starting at ₹100/hand
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
