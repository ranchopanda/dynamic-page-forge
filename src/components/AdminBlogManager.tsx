import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../lib/supabaseApi';

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
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  scheduledAt?: string;
  createdAt: string;
}

const AdminBlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'Bridal Mehendi',
    tags: '',
    isPublished: false,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    scheduledAt: '',
  });

  const categories = [
    'Bridal Mehendi',
    'Arabic Designs',
    'Festive Mehendi',
    'Modern Minimalist',
    'Tips & Tutorials',
    'Mehendi Care',
    'Design Inspiration',
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await supabaseApi.getAdminBlogPosts();
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: tagsArray,
        coverImage: formData.coverImage,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
      };

      if (editingPost) {
        await supabaseApi.updateBlogPost(editingPost.id, payload);
      } else {
        await supabaseApi.createBlogPost(payload);
      }

      setShowEditor(false);
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    const tags = JSON.parse(post.tags || '[]');
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || '',
      category: post.category,
      tags: tags.join(', '),
      isPublished: post.isPublished,
      isFeatured: post.isFeatured,
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      keywords: post.keywords || '',
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
    });
    setShowEditor(true);
  };

  // Blog post templates for quick creation
  const blogTemplates = [
    {
      name: 'Bridal Mehendi Post',
      title: 'Beautiful Bridal Mehendi Designs for [Occasion]',
      excerpt: 'Discover stunning bridal mehendi designs perfect for your special day. From traditional to modern styles.',
      category: 'Bridal Mehendi',
      tags: 'bridal, wedding, dulhan, traditional',
      keywords: 'bridal mehendi Greater Noida, wedding henna, dulhan mehendi design',
      content: `<h2>Introduction</h2>
<p>Your wedding day deserves the most beautiful <strong>bridal mehendi</strong>. Here are our top picks for [year].</p>

<h2>Top Bridal Mehendi Designs</h2>
<h3>1. [Design Name]</h3>
<p>Description of the design and why it's perfect for brides.</p>

<h3>2. [Design Name]</h3>
<p>Description of the design.</p>

<h2>Tips for Bridal Mehendi</h2>
<ul>
<li>Apply mehendi 2-3 days before the wedding</li>
<li>Keep it on for 6-8 hours for dark color</li>
<li>Avoid water for 24 hours</li>
</ul>

<h2>Book Your Bridal Mehendi</h2>
<p>Looking for a professional <strong>mehendi artist in Greater Noida</strong>? Contact us at +91 7011489500.</p>`
    },
    {
      name: 'Festival Mehendi Post',
      title: '[Festival Name] Mehendi Designs: Beautiful Patterns for Celebration',
      excerpt: 'Celebrate [festival] with beautiful mehendi designs. Traditional and modern patterns for the festive season.',
      category: 'Festive Mehendi',
      tags: 'festival, celebration, traditional, festive',
      keywords: 'festival mehendi, [festival] henna design, festive mehendi Greater Noida',
      content: `<h2>Celebrate [Festival] with Mehendi</h2>
<p><strong>[Festival]</strong> is a time for joy and celebration. Beautiful mehendi adds to the festive spirit.</p>

<h2>Popular [Festival] Mehendi Designs</h2>
<h3>1. Traditional Design</h3>
<p>Classic patterns that never go out of style.</p>

<h3>2. Modern Fusion</h3>
<p>Contemporary designs with traditional elements.</p>

<h2>Book Festival Mehendi</h2>
<p>Make your [festival] special! Book mehendi at +91 7011489500. Available in Greater Noida.</p>`
    },
    {
      name: 'Design Tutorial Post',
      title: 'How to [Topic]: Step-by-Step Mehendi Guide',
      excerpt: 'Learn [topic] with our easy step-by-step guide. Perfect for beginners and professionals.',
      category: 'Tips & Tutorials',
      tags: 'tutorial, guide, tips, how-to, learning',
      keywords: 'mehendi tutorial, henna guide, learn mehendi, mehendi tips',
      content: `<h2>Introduction to [Topic]</h2>
<p>In this guide, you'll learn <strong>[topic]</strong> with easy-to-follow steps.</p>

<h2>What You'll Need</h2>
<ul>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
</ul>

<h2>Step-by-Step Guide</h2>
<h3>Step 1: [First Step]</h3>
<p>Detailed instructions for the first step.</p>

<h3>Step 2: [Second Step]</h3>
<p>Detailed instructions for the second step.</p>

<h2>Pro Tips</h2>
<ul>
<li>Tip 1</li>
<li>Tip 2</li>
</ul>

<h2>Need Professional Help?</h2>
<p>Book a professional mehendi artist at +91 7011489500.</p>`
    }
  ];

  const applyTemplate = (template: typeof blogTemplates[0]) => {
    setFormData({
      ...formData,
      title: template.title,
      excerpt: template.excerpt,
      category: template.category,
      tags: template.tags,
      keywords: template.keywords,
      content: template.content,
    });
    setShowTemplates(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await supabaseApi.deleteBlogPost(id);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      await supabaseApi.updateBlogPost(post.id, {
        isPublished: !post.isPublished,
      });
      fetchPosts();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      coverImage: '',
      category: 'Bridal Mehendi',
      tags: '',
      isPublished: false,
      isFeatured: false,
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    });
  };

  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{editingPost ? 'Edit Post' : 'New Blog Post'}</h2>
          <button
            onClick={() => { setShowEditor(false); setEditingPost(null); resetForm(); }}
            className="text-primary hover:underline"
          >
            ← Back to Posts
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
                placeholder="e.g., Top 10 Bridal Mehendi Designs for 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cover Image URL</label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Excerpt (Short Description) *</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary"
                rows={2}
                required
                placeholder="Brief description for blog listing..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Content (HTML supported) *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary font-mono text-sm"
                rows={12}
                required
                placeholder="<p>Your blog content here...</p>"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;img&gt;
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary"
                placeholder="bridal, wedding, 2025, trending"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SEO Keywords</label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary"
                placeholder="bridal mehendi Greater Noida, wedding henna"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Title (SEO)</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary"
                placeholder="Leave empty to use post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Description (SEO)</label>
              <input
                type="text"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary"
                placeholder="Leave empty to use excerpt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">📅 Schedule Publish Date (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to publish immediately when "Publish" is checked</p>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 rounded border-primary/20 text-primary focus:ring-primary"
                />
                <span>Publish {formData.scheduledAt ? 'on scheduled date' : 'immediately'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-5 h-5 rounded border-primary/20 text-primary focus:ring-primary"
                />
                <span>Featured post</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-[#a15842] transition-colors"
            >
              {editingPost ? 'Update Post' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={() => { setShowEditor(false); setEditingPost(null); resetForm(); }}
              className="px-6 py-3 border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📝 Blog Posts</h2>
        <button
          onClick={() => setShowEditor(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-[#a15842] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          New Post
        </button>
      </div>

      <p className="text-text-primary-light/60">
        Create SEO-optimized blog posts to rank higher on Google. Focus on keywords like "mehendi design Greater Noida", "bridal henna", etc.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-primary/5 rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">article</span>
          <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
          <p className="text-text-primary-light/60 mb-4">Create your first blog post to improve SEO</p>
          <button
            onClick={() => setShowEditor(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-background-dark/50 rounded-xl p-4 border border-primary/10 flex items-center gap-4"
            >
              {post.coverImage ? (
                <img src={post.coverImage} alt="" className="w-20 h-20 object-cover rounded-lg" />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary/30">article</span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{post.title}</h3>
                  {post.isFeatured && (
                    <span className="px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-xs rounded-full">Featured</span>
                  )}
                </div>
                <p className="text-sm text-text-primary-light/60 truncate">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-primary-light/50">
                  <span className="px-2 py-0.5 bg-primary/10 rounded">{post.category}</span>
                  <span>{post.views} views</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(post)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    post.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {post.isPublished ? 'Published' : 'Draft'}
                </button>
                <button
                  onClick={() => handleEdit(post)}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-primary">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-red-500">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEO Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mt-8">
        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3">💡 SEO Tips for Blog Posts</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
          <li>• Use keywords like "mehendi design Greater Noida", "bridal henna Noida", "wedding mehendi artist"</li>
          <li>• Write at least 500+ words per post for better ranking</li>
          <li>• Include location-specific content (Greater Noida, Noida, Delhi NCR)</li>
          <li>• Add images with descriptive alt text</li>
          <li>• Link to your design generator and booking page</li>
          <li>• Post regularly (at least 2-4 posts per month)</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminBlogManager;
