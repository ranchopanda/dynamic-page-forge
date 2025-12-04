import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../lib/supabaseApi';

interface Style {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  promptModifier: string;
  category: string;
  complexity: string;
  coverage: string;
  isActive: boolean;
  _count?: {
    designs: number;
  };
}

const AdminStyleManager: React.FC = () => {
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    promptModifier: '',
    category: 'Traditional',
    complexity: 'Medium',
    coverage: 'Full',
  });

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    setLoading(true);
    try {
      const data = await supabaseApi.getAdminStyles();
      setStyles(data);
    } catch (error) {
      console.error('Failed to load styles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // For now, create a local URL
      // In production, you'd upload to a cloud storage service
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Style name is required');
      return;
    }
    if (!formData.description.trim()) {
      alert('Description is required');
      return;
    }
    if (!formData.imageUrl.trim()) {
      alert('Image is required');
      return;
    }
    if (!formData.promptModifier.trim()) {
      alert('AI Prompt Modifier is required');
      return;
    }
    
    try {
      console.log('Submitting style:', editingStyle ? 'UPDATE' : 'CREATE', formData);
      
      if (editingStyle) {
        const result = await supabaseApi.updateStyle(editingStyle.id, formData);
        console.log('Style updated:', result);
      } else {
        const result = await supabaseApi.createStyle(formData);
        console.log('Style created:', result);
      }
      
      setShowAddModal(false);
      setEditingStyle(null);
      resetForm();
      await loadStyles();
    } catch (error: any) {
      console.error('Failed to save style:', error);
      alert(`Failed to save style: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEdit = (style: Style) => {
    setEditingStyle(style);
    setFormData({
      name: style.name || '',
      description: style.description || '',
      imageUrl: style.imageUrl || '',
      promptModifier: style.promptModifier || '',
      category: style.category || 'Traditional',
      complexity: style.complexity || 'Medium',
      coverage: style.coverage || 'Full',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (styleId: string) => {
    if (!confirm('Are you sure you want to delete this style?')) return;
    
    try {
      await supabaseApi.deleteStyle(styleId);
      loadStyles();
    } catch (error) {
      console.error('Failed to delete style:', error);
      alert('Failed to delete style');
    }
  };

  const toggleActive = async (style: Style) => {
    try {
      await supabaseApi.updateStyle(style.id, { isActive: !style.isActive });
      loadStyles();
    } catch (error) {
      console.error('Failed to toggle style:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      promptModifier: '',
      category: 'Traditional',
      complexity: 'Medium',
      coverage: 'Full',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Mehendi Style Library</h2>
          <p className="text-sm text-text-primary-light/70">
            Upload and manage stock mehendi photos that users can apply to their hands
          </p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setEditingStyle(null); resetForm(); }}
          className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-[#a15842] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add New Style
        </button>
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {styles.map(style => (
          <div
            key={style.id}
            className={`bg-white dark:bg-background-dark/50 rounded-2xl overflow-hidden shadow-md border transition-all ${
              style.isActive ? 'border-primary/20' : 'border-gray-300 opacity-60'
            }`}
          >
            {/* Image */}
            <div className="aspect-[3/4] bg-cover bg-center relative" style={{ backgroundImage: `url("${style.imageUrl}")` }}>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => toggleActive(style)}
                  className={`p-2 rounded-full backdrop-blur-md ${
                    style.isActive ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'
                  }`}
                  title={style.isActive ? 'Active' : 'Inactive'}
                >
                  <span className="material-symbols-outlined text-sm">
                    {style.isActive ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {style._count && style._count.designs > 0 && (
                <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-md">
                  {style._count.designs} designs
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-primary mb-1">{style.name}</h3>
              <p className="text-sm text-text-primary-light/70 mb-3 line-clamp-2">{style.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{style.category}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{style.complexity}</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{style.coverage}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(style)}
                  className="flex-1 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(style.id)}
                  className="flex-1 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-background-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-primary">
                {editingStyle ? 'Edit Style' : 'Add New Style'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingStyle(null); }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Stock Mehendi Photo</label>
                <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 text-center">
                  {formData.imageUrl ? (
                    <div className="relative">
                      <img src={formData.imageUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="material-symbols-outlined text-4xl text-primary/50 mb-2">upload_file</span>
                      <p className="text-sm text-text-primary-light/70 mb-2">Upload a clear photo of mehendi design</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-[#a15842]"
                      >
                        {uploading ? 'Uploading...' : 'Choose File'}
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-primary-light/60 mt-1">
                  This photo will be used as a template to apply onto user's hands
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Style Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g., Royal Mandala"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                  rows={3}
                  placeholder="Describe the style..."
                />
              </div>

              {/* Prompt Modifier */}
              <div>
                <label className="block text-sm font-medium mb-1">AI Prompt Modifier</label>
                <input
                  type="text"
                  required
                  value={formData.promptModifier}
                  onChange={e => setFormData(prev => ({ ...prev, promptModifier: e.target.value }))}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g., intricate mandala pattern, detailed floral design"
                />
                <p className="text-xs text-text-primary-light/60 mt-1">
                  Keywords to help AI apply this pattern accurately
                </p>
              </div>

              {/* Category, Complexity, Coverage */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option>Traditional</option>
                    <option>Modern</option>
                    <option>Minimalist</option>
                    <option>Arabic</option>
                    <option>Indo-Arabic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Complexity</label>
                  <select
                    value={formData.complexity}
                    onChange={e => setFormData(prev => ({ ...prev, complexity: e.target.value }))}
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Simple">Simple</option>
                    <option value="Medium">Medium</option>
                    <option value="Complex">Complex</option>
                    <option value="Intricate">Intricate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Coverage</label>
                  <select
                    value={formData.coverage}
                    onChange={e => setFormData(prev => ({ ...prev, coverage: e.target.value }))}
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Minimal">Minimal</option>
                    <option value="Partial">Partial</option>
                    <option value="Full">Full</option>
                    <option value="Extended">Extended</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingStyle(null); }}
                  className="flex-1 py-3 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.imageUrl || uploading}
                  className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-[#a15842] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingStyle ? 'Update Style' : 'Add Style'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStyleManager;
